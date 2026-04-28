import { ExpierenceLevel, JobListingStatuses, JobType, LocationRequirement, locationRequirement, WageInterval } from "@/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
    switch (interval) {
        case "hourly":
            return "Hour"
        case "monthly":
            return "Month"
        case "yearly":
            return "Year"
        default:
            throw new Error(`Invalid wage interval: ${interval satisfies never}`)
    }
}


export function formatLocationRequirement(lr: LocationRequirement) {
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
            return "Mid-level"
        case "senior":
            return "Senior"

        default:
            throw new Error(`Invalid Expierence Level: ${exp satisfies never}`)
    }
}

export function formatJobListingStatus(status: JobListingStatuses) {
    switch (status) {
        case "draft":
            return "Draft"
        case "published":
            return "Published"
        case "delisted":
            return "Delisted"

        default:
            throw new Error(`Invalid Job Status: ${status}`)
    }
}

export function formatWage(wage: number, wageInterval: WageInterval) {
    const wageFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    })

    switch (wageInterval) {
        case "hourly": {
            return `${wageFormatter.format(wage)} / hr`
        }
        case "monthly": {
            return `${wageFormatter.format(wage)} / mo`
        }
        case "yearly": {
            return wageFormatter.format(wage)
        }
        default:
            throw new Error(`Invalid wage interval: ${wageInterval satisfies never}`)
    }
}

export function formatJobListingLocation({ stateAbbreviation, city }: { stateAbbreviation: string | null, city: string | null }) {
    if (stateAbbreviation == null && city == null) return "None"

    const locationParts = []

    if (stateAbbreviation != null) locationParts.push(stateAbbreviation.toUpperCase())
    if (city != null) locationParts.push(city)
    return locationParts.join(", ")
} 