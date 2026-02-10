import { ExpierenceLevel, JobType, locationRequirement, WageInterval } from "@/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
    switch (interval) {
        case "hourly":
            return "Hour"
        case "monthly":
            return "Month"
        case "yearly":
            return "year"
        default:
            throw new Error(`Invalid wage interval: ${interval satisfies never}`)
    }
}


export function formatLocationRequirement(lr: locationRequirement) {
    switch (lr) {
        case "on-site":
            return "In office"
        case "hybrid":
            return "Hybrid"
        case "remote":
            return "Remote"
        default:
            throw new Error(`Invalid location type: ${lr satisfies never}`)
    }
}


export function formatJobType(type: JobType) {
    switch (type) {
        case "internship":
            return "Internship"
        case "part-time":
            return "Part-time"
        case "full-time":
            return "Full-time"
        case "contract":
            return "Contract"
        default:
            throw new Error(`Invalid Job Type: ${type satisfies never}`)
    }
}

export function formatExpierenceLevels(exp: ExpierenceLevel) {
    switch (exp) {
        case "junior":
            return "Junior"
        case "mid level":
            return "Mid level"
        case "senior":
            return "Senior"

        default:
            throw new Error(`Invalid Job Type: ${exp satisfies never}`)
    }
}