import { db } from "@/drizzle/db";
import { UserNotificationsSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotificationSettings";

export async function insertUserNotificationSettings(settings: typeof UserNotificationsSettingsTable.$inferInsert) {
    await db.insert(UserNotificationsSettingsTable).values(settings).onConflictDoNothing();
    revalidateUserNotificationSettingsCache(settings.userId)
}
export async function updateUserNotificationSettings(userId: string, settings: Partial<Omit<typeof UserNotificationsSettingsTable.$inferInsert, "userId">>) {
    await db.insert(UserNotificationsSettingsTable).values({ ...settings, userId }).onConflictDoUpdate({
        target: UserNotificationsSettingsTable.userId,
        set: settings,
    });
    revalidateUserNotificationSettingsCache(userId)

}