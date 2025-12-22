import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { relations } from "drizzle-orm";
import { UserNotificationsSettingsTable } from "./userNotificationSettings";
import { OrganizationTable } from "./organizations";
import { OrganizationUserSettingsTable } from "./organizationsUserSettings";
import { userResumeTable } from "./userResume";

export const UserTable = pgTable("users", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    imageUrl: varchar().notNull(),
    email: varchar().notNull().unique(),
    createdAt,
    updatedAt,

})


export const userReferences = relations(UserTable, ({ one, many }) => ({
    userNotificationsSettings: one(UserNotificationsSettingsTable),
    // userResumes: many(userResumeTable),
    organization: one(OrganizationTable),
    organizationUserSettings: many(OrganizationUserSettingsTable),


})

)