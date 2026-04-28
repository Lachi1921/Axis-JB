import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { JobListingTable, UserNotificationsSettingsTable, OrganizationUserSettingsTable, jobListingApplicationsTable } from "@/drizzle/schema";
import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { GetEvents } from "inngest";
import { getMatchingJobListings } from "../ai/getMatchingJobListings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/DailyJobListingEmail";
import { env } from "@/data/env/server";
import DailyApplicationEmail from "@/services/resend/components/DailyApplicationEmail";

export const prepareDailyJobListingNotifications = inngest.createFunction({
    id: "prepare-daily-job-listing-notifications",
    name: "Prepare Daily Job Listing Notifications",
}, {
    cron: "TZ=America/Chicago 0 7 * * *"
}, async ({ step, event }) => {
    const getUsers = step.run("get-users", async () => {
        return await db.query.UserNotificationsSettingsTable.findMany({
            where: eq(UserNotificationsSettingsTable.newJobEmailNotifications, true),
            columns: {
                userId: true,
                newJobEmailNotifications: true,
                aiPrompt: true,
            },
            with: {
                userId: {
                    columns: {
                        email: true,
                        name: true,
                    }
                }
            }
        })
    })

    const getJobListings = step.run("get-recent-job-listings", async () => {
        return await db.query.JobListingTable.findMany({
            where: and(
                gte(JobListingTable.postedAt, subDays(new Date(event.ts ?? Date.now()), 1)),
                eq(JobListingTable.status, "published")
            ),
            columns: {
                createdAt: false,
                postedAt: false,
                updatedAt: false,
                organizationId: false
            },
            with: {
                organizations: {
                    columns: {
                        name: true
                    }
                }
            }
        })
    })

    const [userNotifications, jobListings] = await Promise.all([getUsers, getJobListings])

    if (jobListings.length === 0 || userNotifications.length === 0) return

    const events = userNotifications.map(notification => {
        return {
            name: "app/email.daily-user-job-listings",
            user: {
                email: notification.userId.email,
                name: notification.userId.name,
            },
            data: {
                aiPrompt: notification.aiPrompt ?? undefined,
                jobListings: jobListings.map(listing => {
                    return {
                        ...listing, organizationName: listing.organizations.name
                    }
                })
            },
        } as const satisfies GetEvents<typeof inngest>["app/email.daily-user-job-listings"]
    })

    await step.sendEvent("send-emails", events)
})

export const sendDailyUserJobListingEmails = inngest.createFunction({
    id: "send-daily-user-job-listing-emails",
    name: "Send Daily User Job Listing Emails",
    throttle: {
        limit: 10,
        period: "2m"
    }
}, { event: "app/email.daily-user-job-listings" }, async ({ event, step }) => {
    const { jobListings, aiPrompt } = event.data
    const { user } = event

    if (jobListings.length === 0) return null

    let matchingJobListings: typeof jobListings = []
    if (aiPrompt == null || aiPrompt.trim() === "") {
        matchingJobListings = jobListings
    } else {
        const matchedIds = await getMatchingJobListings(aiPrompt, jobListings)
        matchingJobListings = jobListings.filter(listing => matchedIds.includes(listing.id))
    }

    if (matchingJobListings.length === 0) return null


    await step.run("send-email", async () => {
        await resend.emails.send({
            from: "Axis <onboarding@resend.dev>",
            to: user.email,
            subject: "Daily New Job Listings",
            react: DailyJobListingEmail({
                jobListings,
                userName: user.name,
                serverUrl: env.SERVER_URL
            })
        })
    })
})

export const prepareDailyOrgUserApplicationNotifications =
    inngest.createFunction(
        {
            id: "prepare-daily-org-user-application-notifications",
            name: "Prepare Daily Org User Application Notifications",
        },
        { cron: "TZ=America/Chicago 0 7 * * *" },
        async ({ step, event }) => {
            const getUsers = step.run("get-user-settings", async () => {
                return await db.query.OrganizationUserSettingsTable.findMany({
                    where: eq(
                        OrganizationUserSettingsTable.newApplicationEmailNotifications,
                        true
                    ),
                    columns: {
                        userId: true,
                        organizationId: true,
                        newApplicationEmailNotifications: true,
                        minimumRating: true,
                    },
                    with: {
                        user: {
                            columns: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                })
            })

            const getApplications = step.run("get-recent-applications", async () => {
                return await db.query.jobListingApplicationsTable.findMany({
                    where: and(
                        gte(
                            jobListingApplicationsTable.createdAt,
                            subDays(new Date(event.ts ?? Date.now()), 1)
                        )
                    ),
                    columns: {
                        rating: true,
                    },
                    with: {
                        user: {
                            columns: {
                                name: true,
                            },
                        },
                        jobListings: {
                            columns: {
                                id: true,
                                title: true,
                            },
                            with: {
                                organizations: {
                                    columns: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                })
            })

            const [userNotifications, applications] = await Promise.all([
                getUsers,
                getApplications,
            ])

            if (applications.length === 0 || userNotifications.length === 0) return

            const groupedNotifications = Object.groupBy(
                userNotifications,
                n => n.userId
            )

            const events = Object.entries(groupedNotifications)
                .map(([, settings]) => {
                    if (settings == null || settings.length === 0) return null
                    const userName = settings[0].user.name
                    const userEmail = settings[0].user.email

                    const filteredApplications = applications
                        .filter(a => {
                            return settings.find(
                                s =>
                                    s.organizationId === a.jobListings.organizations.id &&
                                    (s.minimumRating == null || a.rating == null || a.rating >= s.minimumRating)
                            )
                        })
                        .map(a => ({
                            organizationId: a.jobListings.organizations.id,
                            organizationName: a.jobListings.organizations.name,
                            jobListingId: a.jobListings.id,
                            jobListingTitle: a.jobListings.title,
                            userName: a.user.name,
                            rating: a.rating,
                        }))

                    if (filteredApplications.length === 0) return null

                    return {
                        name: "app/email.daily-organization-user-applications",
                        user: {
                            name: userName,
                            email: userEmail,
                        },
                        data: { applications: filteredApplications },
                    } as const satisfies GetEvents<
                        typeof inngest
                    >["app/email.daily-organization-user-applications"]
                })
                .filter(v => v != null)
            console.log("EVENTS:", events)
            await step.sendEvent("send-emails", events)
        }
    )

export const sendDailyOrgUserApplicationEmail = inngest.createFunction(
    {
        id: "send-daily-organization-user-application-email",
        name: "Send Daily Organization User Application Email",
        throttle: {
            limit: 1000,
            period: "1m",
        },
    },
    { event: "app/email.daily-organization-user-applications" },
    async ({ event, step }) => {
        const { applications } = event.data
        const user = event.user
        if (applications.length === 0) return

        await step.run("send-email", async () => {
            await resend.emails.send({
                from: "Job Board <onboarding@resend.dev>",
                to: user.email,
                subject: "Daily Job Listing Applications",
                react: DailyApplicationEmail({
                    applications,
                    userName: user.name,
                }),
            })
        })
    }
)