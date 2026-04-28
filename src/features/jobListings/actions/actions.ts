"use server"

import z from "zod";
import { jobListingAiSearchSchema, jobListingSchema } from "./schemas";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updateJobListingDB, deleteJobListing as deleteJobListingDB } from "../db/jobListing";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingGlobalTag, getJobListingIdTag } from "../db/cache/jobListings";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgPermissions";
import { getNextJobListingStatus } from './../lib/utils';
import { hasReachedMaxFeaturedListings, hasReachedMaxJobListings } from "../lib/planFeaturesHelper";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingJobListings";

export async function createJobListing(unsafeData: z.infer<typeof jobListingSchema>) {
    const FAILED_CREATING_ERROR_MESSAGE = "There was an error creating your job listing"
    const NO_EDIT_PERMISSION_ERROR_MESSAGE = "You don't have permission to create a job listing"
    const { orgId } = await getCurrentOrganization()

    if (orgId == null || !(await hasOrgUserPermission("org:job_listings:create"))) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }

    const { success, data } = jobListingSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: FAILED_CREATING_ERROR_MESSAGE
        }
    }

    const jobListing = await insertJobListing({
        ...data,
        organizationId: orgId,
        status: "draft"
    })

    redirect(`/employer/job-listings/${jobListing.id}`)

}

export async function updateJobListing(id: string, unsafeData: z.infer<typeof jobListingSchema>) {
    const FAILED_UPDATING_ERROR_MESSAGE = "There was an error updating your job listing"
    const NO_EDIT_PERMISSION_ERROR_MESSAGE = "You don't have permission to edit a job listing"
    const { orgId } = await getCurrentOrganization()

    if (orgId == null || !(await hasOrgUserPermission("org:job_listings:update"))) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }

    const { success, data } = jobListingSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: FAILED_UPDATING_ERROR_MESSAGE
        }
    }
    const jobListing = await getJobListing(id, orgId)

    if (jobListing == null) {
        return {
            error: true,
            message: FAILED_UPDATING_ERROR_MESSAGE
        }
    }

    const updatedJobListing = await updateJobListingDB(id, data)

    redirect(`/employer/job-listings/${updatedJobListing.id}`)

}

async function getJobListing(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListingIdTag(id))

    return await db.query.JobListingTable.findFirst({
        where: and(
            eq(JobListingTable.id, id),
            eq(JobListingTable.organizationId, orgId)
        ),
    });
}

export async function toggleJobListingStatus(id: string) {
    const FAILED_UPDATING_ERROR_MESSAGE = "There was an error updating your job listing status"
    const NO_EDIT_PERMISSION_ERROR_MESSAGE = "You don't have permission to edit this job listing status"

    const { orgId } = await getCurrentOrganization()

    if (orgId == null) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }
    const jobListing = await getJobListing(id, orgId)

    if (jobListing == null) {
        return {
            error: true,
            message: FAILED_UPDATING_ERROR_MESSAGE
        }
    }

    const newStatus = getNextJobListingStatus(jobListing.status)

    if (!await hasOrgUserPermission(`org:job_listings:change_status`) || (newStatus === "published" && (await hasReachedMaxJobListings()))) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }

    await updateJobListingDB(id, {
        status: newStatus,
        isFeatured: newStatus === "published" ? undefined : false,
        postedAt: newStatus === "published" && jobListing.postedAt == null ? new Date() : undefined,
    })

    return {
        error: false
    }
}

export async function toggleJobListingFeatured(id: string) {
    const FAILED_UPDATING_ERROR_MESSAGE = "There was an error updating your job listing to featured"
    const NO_EDIT_PERMISSION_ERROR_MESSAGE = "You don't have permission to edit this job listing to featured"
    const { orgId } = await getCurrentOrganization()

    if (orgId == null) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }
    const jobListing = await getJobListing(id, orgId)

    if (jobListing == null) {
        return {
            error: true,
            message: FAILED_UPDATING_ERROR_MESSAGE
        }
    }

    if (!await hasOrgUserPermission(`org:job_listings:change_status`) || (!jobListing.isFeatured && (await hasReachedMaxFeaturedListings()))) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }

    await updateJobListingDB(id, {
        isFeatured: !jobListing.isFeatured,
    })
    return {
        error: false
    }
}

export async function getAiJobListingSearchResults(
    unsafeData: z.infer<typeof jobListingAiSearchSchema>
): Promise<{ error: true, message: string } | { error: false, jobIds: string[] }> {
    const { success, data } = jobListingAiSearchSchema.safeParse(unsafeData)

    if (!success) {
        return {
            error: true,
            message: "An unexpected error occurred processing your search."
        }
    }

    const { userId } = await getCurrentUser()

    if (userId == null) {
        return {
            error: true,
            message: "You need an account to use AI job search"
        }
    }

    const listings = await getPublicJobListing()

    const matchedListings = await getMatchingJobListings(data.query, listings, { max: 5 })

    if (matchedListings.length === 0) {
        return {
            error: true,
            message: "No jobs match your search criteria"
        }
    }

    return { error: false, jobIds: matchedListings }

}


export async function deleteJobListing(id: string) {
    const FAILED_UPDATING_ERROR_MESSAGE = "There was an error deleting your job listing"
    const NO_EDIT_PERMISSION_ERROR_MESSAGE = "You don't have permission to delete this job listing"
    const { orgId } = await getCurrentOrganization()

    if (orgId == null) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }
    const jobListing = await getJobListing(id, orgId)

    if (jobListing == null) {
        return {
            error: true,
            message: FAILED_UPDATING_ERROR_MESSAGE
        }
    }

    if (!await hasOrgUserPermission(`org:job_listings:delete`)) {
        return {
            error: true,
            message: NO_EDIT_PERMISSION_ERROR_MESSAGE
        }
    }

    await deleteJobListingDB(id)
    return redirect(`/employer/`)
}


async function getPublicJobListing() {
    "use cache"
    cacheTag(getJobListingGlobalTag())
    return await db.query.JobListingTable.findMany({
        where: eq(JobListingTable.status, "published"),
    });
}