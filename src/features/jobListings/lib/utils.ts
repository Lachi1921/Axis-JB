import { JobListingStatuses } from "@/drizzle/schema";

export function getNextJobListingStatus(currentStatus: JobListingStatuses) {
    switch (currentStatus) {
        case "draft":
        case "delisted":
            return "published"
        case "published":
            return "delisted"
        default:
            throw new Error(`Unknown job listing status: ${currentStatus satisfies never}`)
    }
}

export function sortJobListingsByStatus(a: JobListingStatuses, b: JobListingStatuses) {
    return JOB_LISTING_STATUS_SORT_ORDER[a] - JOB_LISTING_STATUS_SORT_ORDER[b]
}

const JOB_LISTING_STATUS_SORT_ORDER: Record<JobListingStatuses, number> = {
    "published": 0,
    "delisted": 1,
    "draft": 2
}