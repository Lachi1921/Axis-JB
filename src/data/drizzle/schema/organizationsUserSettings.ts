import { boolean, index, integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../SchemeHelpers";
import { UserTable } from "./user";
import { OrganizationTable } from "./organizations";
import { relations } from "drizzle-orm"

export const OrganizationUserSettingsTable = pgTable("organization_user_settings", {
  userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
  organizationId: varchar().references(() => OrganizationTable.id, { onDelete: 'cascade' }).notNull(),
  newApplicationEmailNotifications: boolean().notNull().default(true),
  minimumRating: integer(),
  createdAt,
  updatedAt,

}, (table) => ({
  pk: primaryKey(table.userId, table.organizationId)
})
)

export const OrganizationUserSettingsReferences = relations(OrganizationUserSettingsTable, ({ one }) => ({
  userId: one(UserTable, {
    fields: [OrganizationUserSettingsTable.userId],
    references: [UserTable.id],
  }),
  organizationId: one(OrganizationTable, {
    fields: [OrganizationUserSettingsTable.organizationId],
    references: [OrganizationTable.id]
  })
}))