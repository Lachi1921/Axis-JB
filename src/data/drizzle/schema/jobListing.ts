import { boolean, index, integer, pgEnum, pgTable, PgVarchar, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../SchemeHelpers";
import { OrganizationTable } from "./organizations";
import { relations } from "drizzle-orm";
import { jobListingApplicationsTable } from "./jobListingApplication";

export const wageIntervals = ["hourly", "monthly", "yearly"] as const
export type WageInterval = typeof wageIntervals[number]
export const wageIntervalEnum = pgEnum("job_listings_wage_interval", wageIntervals)

export const locationRequirment = ["on-site", "hybrid", "remote"] as const
export type LocationRequirment = typeof locationRequirment[number]
export const locationRequirmentEnum = pgEnum("job_listings_location_req", locationRequirment)

export const expierenceLevel = ["junior", "mid level", "senior"] as const
export type ExpierenceLevel = typeof expierenceLevel[number]
export const expierenceLevelEnum = pgEnum("job_listings_expierence_level", expierenceLevel)

export const jobListingStatuses = ["draft", "published", "delisted"] as const
export type JobListingStatuses = typeof jobListingStatuses[number]
export const jobListingStatusesEnum = pgEnum("job_listings_status", jobListingStatuses)

export const jobType = ["internship", "part-time", "full-time", "contract"] as const
export type JobType = typeof jobType[number]
export const jobTypeEnum = pgEnum("job_listings_types", jobType)

export const jobListingTable = pgTable("job_listings", {
    id,
    organizationId: varchar().references(() => OrganizationTable.id, { onDelete: 'cascade' }).notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    stateAberviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirment: locationRequirmentEnum().notNull(),
    expierenceLevel: expierenceLevelEnum().notNull(),
    status: jobListingStatusesEnum().notNull().default("draft"),
    type: locationRequirmentEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,

}, table => [index().on(table.stateAberviation)])


export const joblistingReferences = relations(jobListingTable, ({ one, many }) => ({
    organizations: one(OrganizationTable, {
        fields: [jobListingTable.organizationId],
        references: [OrganizationTable.id]
    }),
    applications: many(jobListingApplicationsTable)
}))