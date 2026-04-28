import { revalidateTag } from "next/cache"
import { getGlobalTag, getIdTag } from "../../../../lib/dataCache"

export function getOrgUserSettingsGlobalTag() {
    return getGlobalTag("organizationUserSettings")
}

export function getOrgUserSettingsIdTag({ userId, organizationId }: { userId: string, organizationId: string }) {
    return getIdTag("organizationUserSettings", `${userId}-${organizationId}`)
}

export function revalidateOrgUserSettingsCache(id: { userId: string, organizationId: string }) {
    revalidateTag(getOrgUserSettingsGlobalTag())
    revalidateTag(getOrgUserSettingsIdTag(id))
}