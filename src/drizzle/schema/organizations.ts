import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { relations } from "drizzle-orm"
import { UserTable } from "./user";
import { jobListingApplicationsTable } from "./jobListingApplication";

export const OrganizationTable = pgTable("organizations", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    imageUrl: varchar(),
    createdAt,
    updatedAt,

})

export const OrganizationTableReferences = relations(OrganizationTable, ({ many }) => ({
    userId: many(UserTable, { relationName: "users" }),
    jobListingsId: many(jobListingApplicationsTable)
}))