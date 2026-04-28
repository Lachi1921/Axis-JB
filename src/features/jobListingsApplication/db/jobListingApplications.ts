import { db } from "@/drizzle/db";
import { jobListingApplicationsTable } from "@/drizzle/schema";
import { revalidateJobApplicationCache } from "./cache/jobListingApplications";
import { and, eq } from "drizzle-orm";

export async function insertJobListingApplication(application: typeof jobListingApplicationsTable.$inferInsert) {
    await db.insert(jobListingApplicationsTable).values(application)
    revalidateJobApplicationCache(application)
}

export async function updateJobListingApplication(
    {
        userId,
        jobListingId
    }: {
        userId: string,
        jobListingId: string
    }, data: Partial<typeof jobListingApplicationsTable.$inferInsert>
) {
    await db.update(jobListingApplicationsTable)
        .set(data)
        .where(
            and(
                eq(jobListingApplicationsTable.userId, userId),
                eq(jobListingApplicationsTable.jobListingId, jobListingId)
            )
        )
    revalidateJobApplicationCache({ userId, jobListingId })

}