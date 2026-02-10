import { db } from "@/drizzle/db";
import { OrganizationTable, UserTable } from "@/drizzle/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function getCurrentUser({ allData = false } = {}) {
    const { userId } = await auth()
    console.log(userId)
    return {
        userId,
        user: (allData && userId != null) ? await getUser(userId) : undefined
    }

}


export async function getCurrentOrganization({ allData = false } = {}) {
    const { orgId } = await auth()
    return {
        orgId,
        organization: (allData && orgId != null) ? await getOrgannization(orgId) : undefined
    }

}

async function getOrgannization(id: string) {
    "use cache"
    cacheTag(getOrganizationIdTag(id))
    const org = db.query.OrganizationTable.findFirst({
        where: eq(OrganizationTable.id, id),
    })
    // console.log(user)
    return org
}


async function getUser(id: string) {
    "use cache"
    cacheTag(getUserIdTag(id))
    const user = db.query.UserTable.findFirst({
        where: eq(UserTable.id, id),
    })
    // console.log(user)
    return user
}