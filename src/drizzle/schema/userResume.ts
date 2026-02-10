import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";
import { jobListingApplicationsTable } from "./jobListingApplication";


export const userResumeTable = pgTable("user_resume_table", {
    userId: varchar().primaryKey().references(() => UserTable.id, { onDelete: 'cascade' }),
    resumeFileUrl: varchar().notNull(),
    resumeFileKey: varchar().notNull(),
    aiSummary: varchar(),
    createdAt,
    updatedAt,
})

export const userResumeTableReferences = relations(userResumeTable, ({ one }) => ({
    userId: one(UserTable, {
        fields: [userResumeTable.userId],
        references: [UserTable.id],
    }),
}))