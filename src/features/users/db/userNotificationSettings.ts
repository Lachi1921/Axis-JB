import { db } from "@/drizzle/db";
import { UserNotificationsSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotificationSettings";

export async function insertUserNotificationSettings(settings: typeof UserNotificationsSettingsTable.$inferInsert) {
    await db.insert(UserNotificationsSettingsTable).values(settings).onConflictDoNothing();
    revalidateUserNotificationSettingsCache(settings.userId)
}
export async function updateUserNotificationSettings(settings: typeof UserNotificationsSettingsTable.$inferInsert) {
    await db.update(UserNotificationsSettingsTable).set(settings);
    revalidateUserNotificationSettingsCache(settings.userId)

}