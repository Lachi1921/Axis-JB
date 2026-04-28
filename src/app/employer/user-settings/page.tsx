import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { EmployerUserSettingsForm } from "@/features/organizations/components/OrgUserSettingsForm";
import { getOrgUserSettingsIdTag } from "@/features/organizations/db/cache/userSettings";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EmployerUserSettingsPage() {
    return (
        <Suspense>
            <SuspendedComponent />
        </Suspense>
    )
}

async function SuspendedComponent() {
    const { userId } = await getCurrentUser()
    const { orgId } = await getCurrentOrganization()
    if (userId == null || orgId == null) return notFound()

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">User Settings</h1>
            <Card>
                <CardContent>
                    <Suspense>
                        <SuspendedForm userId={userId} organizationId={orgId} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function SuspendedForm({ userId, organizationId }: { userId: string, organizationId: string }) {
    const userSettings = await getOrgUserSettings({ userId, organizationId })
    return <EmployerUserSettingsForm userSettings={userSettings} />
}

async function getOrgUserSettings({ userId, organizationId }: { userId: string, organizationId: string }) {
    "use cache"
    cacheTag(getOrgUserSettingsIdTag({ userId, organizationId }))

    return db.query.OrganizationUserSettingsTable.findFirst({
        where: and(
            eq(OrganizationUserSettingsTable.userId, userId),
            eq(OrganizationUserSettingsTable.userId, userId)
        ),
        columns: {
            newApplicationEmailNotifications: true,
            minimumRating: true,
        }
    })
}