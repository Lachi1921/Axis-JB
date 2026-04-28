import z from "zod";

export const orgUserSettingsSchema = z.object({
    newApplicationEmailNotifications: z.boolean(),
    minimumRating: z.number().int().positive().min(1).max(5).nullable(),
})