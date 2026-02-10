import { expierenceLevels, jobType, locationRequirement, wageIntervals } from "@/drizzle/schema";
import z from "zod";

export const jobListingSchema = z.object({
    title: z.string().min(1, "Job title is required"),
    description: z.string().min(1, "Description is required"),
    expierenceLevel: z.enum(expierenceLevels, "Experience level is required"),
    locationRequirement: z.enum(locationRequirement, "Location requirement is required"),
    type: z.enum(jobType, "Job type is required"),
    wage: z.number().int().positive().min(1).nullable(),
    wageInterval: z.enum(wageIntervals,).nullable(),
    stateAbbreviation: z.string().transform(val => (val.trim() === "" ? null : val)).nullable(),
    city: z.string().transform(val => (val.trim() === "" ? null : val)).nullable()
}).refine(
    listing => {
        return listing.locationRequirement === "remote" || listing.city != null
    },
    {
        message: "Required for non-remote listings",
        path: ["city"],
    }
).refine(
    listing => {
        return (
            listing.locationRequirement === "remote" || listing.stateAbbreviation != null
        )
    },
    {
        message: "Required for non-remote listings",
        path: ["stateAbbreviation"],
    }
)