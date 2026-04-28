import { and, eq } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/drizzle/db";
import { jobListingApplicationsTable, JobListingTable, userResumeTable } from "@/drizzle/schema";
import { ApplicationRankingAgent } from "../ai/ApplicationRankingAgent";

export const rankApplication = inngest.createFunction({
    id: "rank-job-application",
    name: "Rank Job Application"
}, {
    event: "app/jobListingApplication.created",
}, async ({ step, event }) => {
    const { userId, jobListingId } = event.data

    const getCoverLetter = step.run("get-cover-letter", async () => {
        const application = await db.query.jobListingApplicationsTable.findFirst({
            where: and(eq(jobListingApplicationsTable.userId, userId), eq(jobListingApplicationsTable.jobListingId, jobListingId)),
            columns: {
                coverLetter: true,
            }
        })

        return application?.coverLetter
    })

    const getResume = step.run("get-resume", async () => {
        const resume = await db.query.userResumeTable.findFirst({
            where: eq(userResumeTable.userId, userId),
            columns: {
                aiSummary: true,
            }
        })

        return resume?.aiSummary
    })

    const getJobListing = step.run("get-job-listing", async () => {
        return db.query.JobListingTable.findFirst({
            where: eq(JobListingTable.id, jobListingId),
            columns: {
                id: true,
                city: true,
                description: true,
                expierenceLevel: true,
                locationRequirement: true,
                stateAbbreviation: true,
                title: true,
                wage: true,
                wageInterval: true,
                type: true,
            }
        })
    })

    const [coverLetter, resumeSummary, jobListing] = await Promise.all([
        getCoverLetter, getResume, getJobListing
    ])

    if (resumeSummary == null || jobListing == null) return

    await ApplicationRankingAgent.run(JSON.stringify({ coverLetter, resumeSummary, jobListing, userId }))
})