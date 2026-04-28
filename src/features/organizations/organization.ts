import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { OrganizationTable, OrganizationUserSettingsTable } from "@/drizzle/schema";
import { revalidateOrganizationCache } from "./db/cache/organizations";

export async function insertOrg(org: typeof OrganizationTable.$inferInsert) {
    await db.insert(OrganizationTable).values(org).onConflictDoNothing();

    revalidateOrganizationCache(org.id)
}

export async function updateOrg(id: string, org: Partial<typeof OrganizationTable.$inferInsert>) {
    await db.update(OrganizationTable).set(org).where(eq(OrganizationTable.id, id));
    revalidateOrganizationCache(id)
}

export async function deleteOrg(id: string) {
    await db.delete(OrganizationTable).where(eq(OrganizationTable.id, id));
    revalidateOrganizationCache(id)
}

