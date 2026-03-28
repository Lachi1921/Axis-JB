import { boolean, index, integer, pgEnum, pgTable, PgVarchar, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../SchemeHelpers";
import { OrganizationTable } from "./organizations";
import { relations } from "drizzle-orm";
import { jobListingApplicationsTable } from "./jobListingApplication";

export const wageIntervals = ["hourly", "monthly", "yearly"] as const
export type WageInterval = typeof wageIntervals[number]
export const wageIntervalEnum = pgEnum("job_listings_wage_interval", wageIntervals)

export const locationRequirement = ["on-site", "hybrid", "remote"] as const
export type LocationRequirement = typeof locationRequirement[number]
export const locationRequirementEnum = pgEnum("job_listings_location_req", locationRequirement)

export const expierenceLevels = ["junior", "mid level", "senior"] as const
export type ExpierenceLevel = typeof expierenceLevels[number]
export const expierenceLevelEnum = pgEnum("job_listings_expierence_level", expierenceLevels)

export const jobListingStatuses = ["draft", "published", "delisted"] as const
export type JobListingStatuses = typeof jobListingStatuses[number]
export const jobListingStatusesEnum = pgEnum("job_listings_status", jobListingStatuses)

export const jobType = ["internship", "part-time", "full-time", "contract"] as const
export type JobType = typeof jobType[number]
export const jobTypeEnum = pgEnum("job_listings_types", jobType)

export const JobListingTable = pgTable("job_listings", {
    id,
    organizationId: varchar().references(() => OrganizationTable.id, { onDelete: 'cascade' }).notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    expierenceLevel: expierenceLevelEnum().notNull(),
    status: jobListingStatusesEnum().notNull().default("draft"),
    type: jobTypeEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,

}, table => [index().on(table.stateAbbreviation)])


export const joblistingReferences = relations(JobListingTable, ({ one, many }) => ({
    organizations: one(OrganizationTable, {
        fields: [JobListingTable.organizationId],
        references: [OrganizationTable.id]
    }),
    applications: many(jobListingApplicationsTable)
}))