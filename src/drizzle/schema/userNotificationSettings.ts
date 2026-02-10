import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { UserTable } from "./user";
import { relations } from "drizzle-orm"

export const UserNotificationsSettingsTable = pgTable("user_notifications_settings", {
    userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
    newJobEmailNotifications: boolean().notNull().default(true),
    aiPrompt: varchar(),
    createdAt,
    updatedAt,
})


export const UserNotificationsSettingsReferences = relations(UserNotificationsSettingsTable, ({ one }) => ({
    userId: one(UserTable, {
        fields: [UserNotificationsSettingsTable.userId],
        references: [UserTable.id],
    }),
}))