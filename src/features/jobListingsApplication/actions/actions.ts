"use server"

import z from "zod"
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getUserResumeIdTag } from "../../users/db/cache/userResume"
import { db } from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { userResumeTable } from "@/drizzle/schema/userResume"
import { applicationStage, ApplicationStage, JobListingTable } from '@/drizzle/schema';
import { insertJobListingApplication, updateJobListingApplication } from "../db/jobListingApplications"
import { newJobListingApplicationSchema } from "./schema"
import { inngest } from "@/services/inngest/client"
import { hasOrgUserPermission } from "@/services/clerk/lib/orgPermissions"
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings"
import { RATING_OPTIONS } from './../../organizations/data/constants';

export async function createJobListingApplication(jobListingId: string, unsafeData: z.infer<typeof newJobListingApplicationSchema>) {
    const permissionError = {
        error: true,
        message: "You don't have permission to submit an application"
    }
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return permissionError
    }

    const [userResume, jobListing] = await Promise.all([
        getUserResume(userId),
        getPublicJobListing(jobListingId)
    ])

    if (userResume == null || jobListing == null) return permissionError

    const { success, data } = newJobListingApplicationSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: "Invalid data"
        }
    }

    await insertJobListingApplication({
        jobListingId,
        userId,
        ...data
    })

    await inngest.send({
        name: "app/jobListingApplication.created",
        data: { jobListingId, userId }
    })

    return {
        error: false,
        message: "Application submitted successfully"
    }
}

export async function updateJobListingApplicationStage({ jobListingId, userId }: { jobListingId: string, userId: string }, unsafeStage: ApplicationStage) {
    const { success, data: stage } = z.enum(applicationStage).safeParse(unsafeStage)

    if (!success) {
        return {
            error: true,
            message: "Invalid stage"
        }
    }

    if (!(await hasOrgUserPermission("org:job_listing_applications:change_stage"))) {
        return {
            error: true,
            message: "You don't have permission to update application stages"
        }
    }

    const { orgId } = await getCurrentOrganization()
    const jobListing = await getJobListing(jobListingId)

    if (orgId == null || jobListing == null || orgId !== jobListing.organizationId) {
        return {
            error: true,
            message: "You don't have permission to update stages"
        }
    }

    await updateJobListingApplication({ jobListingId, userId }, { stage })
}

export async function updateJobListingApplicationRating({ jobListingId, userId }: { jobListingId: string, userId: string }, unsafeRating: number | null) {
    const { success, data: rating } = z.number().min(1).max(5).nullish().safeParse(unsafeRating)

    if (!success) {
        return {
            error: true,
            message: "Invalid rating"
        }
    }

    if (!(await hasOrgUserPermission("org:job_listing_applications:change_rating"))) {
        return {
            error: true,
            message: "You don't have permission to update application ratings"
        }
    }

    const { orgId } = await getCurrentOrganization()
    const jobListing = await getJobListing(jobListingId)

    if (orgId == null || jobListing == null || orgId !== jobListing.organizationId) {
        return {
            error: true,
            message: "You don't have permission to update ratings"
        }
    }

    await updateJobListingApplication({ jobListingId, userId }, { rating })
}


async function getUserResume(userId: string) {
    "use cache"
    cacheTag(getUserResumeIdTag(userId))

    return await db.query.userResumeTable.findFirst({
        where: eq(userResumeTable.userId, userId),
        columns: {
            userId: true,
        }
    });
}

async function getPublicJobListing(jobListingId: string) {
    "use cache"
    cacheTag(getJobListingIdTag(jobListingId))

    return await db.query.JobListingTable.findFirst({
        where: and(eq(JobListingTable.id, jobListingId), eq(JobListingTable.status, "published")),
        columns: {
            id: true,

        }
    })
}


async function getJobListing(jobListingId: string) {
    "use cache"
    cacheTag(getJobListingIdTag(jobListingId))

    return await db.query.JobListingTable.findFirst({
        where: eq(JobListingTable.id, jobListingId),
        columns: {
            organizationId: true,
        }
    })
}

