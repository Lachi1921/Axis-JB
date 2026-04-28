import { db } from "@/drizzle/db"
import { OrganizationUserSettingsTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { revalidateOrgUserSettingsCache } from "./cache/userSettings"

export async function insertOrgUserSettings(
    settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
    await db
        .insert(OrganizationUserSettingsTable)
        .values(settings)
        .onConflictDoNothing()

    revalidateOrgUserSettingsCache(settings)
}

export async function updateOrgUserSettings(
    {
        userId,
        organizationId,
    }: {
        userId: string
        organizationId: string
    },
    settings: Partial<
        Omit<
            typeof OrganizationUserSettingsTable.$inferInsert,
            "userId" | "organizationId"
        >
    >
) {
    await db
        .insert(OrganizationUserSettingsTable)
        .values({ ...settings, userId, organizationId })
        .onConflictDoUpdate({
            target: [
                OrganizationUserSettingsTable.userId,
                OrganizationUserSettingsTable.organizationId,
            ],
            set: settings,
        })

    revalidateOrgUserSettingsCache({ userId, organizationId })
}

export async function deleteOrgUserSettings({
    userId,
    organizationId,
}: {
    userId: string
    organizationId: string
}) {
    await db
        .delete(OrganizationUserSettingsTable)
        .where(
            and(
                eq(OrganizationUserSettingsTable.userId, userId),
                eq(OrganizationUserSettingsTable.organizationId, organizationId)
            )
        )

    revalidateOrgUserSettingsCache({ userId, organizationId })
}