import { index, integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { jobListingTable } from "./jobListing";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";

export const applicationStage = ["denied", "applied", "interested", "interviewed", "hired"] as const
export type ApplicationStage = typeof applicationStage[number]
export const applicationStageEnum = pgEnum("job_listings_application_stage", applicationStage)

export const jobListingApplicationsTable = pgTable("job_listings_applications", {
    jobListingId: uuid().references(() => jobListingTable.id, { onDelete: 'cascade' }).notNull(),
    userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
    coverLetter: text(),
    rating: integer(),
    stage: applicationStageEnum().notNull().default("applied"),
    createdAt,
    updatedAt,

}, (table) => ({
    pk: primaryKey(table.jobListingId, table.userId)
})
)

export const jobListingApplicationsReferences = relations(jobListingApplicationsTable, ({ one }) => ({
    jobListings: one(jobListingTable, {
        fields: [jobListingApplicationsTable.jobListingId],
        references: [jobListingTable.id],
    }),
    userId: one(UserTable, {
        fields: [jobListingApplicationsTable.userId],
        references: [UserTable.id],
    }),
}))