"use server"
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import z from "zod";
import { orgUserSettingsSchema } from "./schema";
import { updateOrgUserSettings as updateOrgUserSettingsDB } from "../db/organizationUserSettings";

export async function updateOrgUserSettings(
    unsafeData: z.infer<typeof orgUserSettingsSchema>
) {
    const { userId } = await getCurrentUser()
    const { orgId } = await getCurrentOrganization()
    if (userId == null || orgId == null) {
        return {
            error: true,
            message: "You must be signed in to update notification settings",
        }
    }

    const { success, data } = orgUserSettingsSchema.safeParse(unsafeData)
    if (!success) {
        return {
            error: true,
            message: "There was an error updating your notification settings",
        }
    }

    await updateOrgUserSettingsDB(
        {
            userId,
            organizationId: orgId,
        },
        data
    )

    return {
        error: false,
        message: "Successfully updated your notification settings",
    }
}