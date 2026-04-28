import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { UserNotificationsSettingsTable } from "@/drizzle/schema";
import NotificationSettingsForm from "@/features/users/components/NotificationSettingsForm";
import { getUserNotificationSettingsIdTag } from "@/features/users/db/cache/userNotificationSettings";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function MotificationsPage() {
    return (
        <Suspense>
            <SuspendedComponent />
        </Suspense>
    )
}

async function SuspendedComponent() {
    const { userId } = await getCurrentUser()
    if (userId == null) return notFound()

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
            <Card>
                <CardContent>
                    <Suspense>
                        <SuspendedForm userId={userId} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function SuspendedForm({ userId }: { userId: string }) {
    const notificationSettings = await getNotficiationSettings(userId)
    return <NotificationSettingsForm notificationSettings={notificationSettings} />
}

async function getNotficiationSettings(userId: string) {
    "use cache"
    cacheTag(getUserNotificationSettingsIdTag(userId))

    return db.query.UserNotificationsSettingsTable.findFirst({
        where: eq(UserNotificationsSettingsTable.userId, userId),
        columns: {
            newJobEmailNotifications: true,
            aiPrompt: true,
        }
    })
}