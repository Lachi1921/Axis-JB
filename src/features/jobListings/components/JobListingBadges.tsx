import { Badge } from "@/components/ui/badge";
import { JobListingTable, jobType } from "@/drizzle/schema";
import { ComponentProps } from "react";
import { formatExpierenceLevels, formatJobListingLocation, formatJobType, formatLocationRequirement, formatWage } from "../lib/formatters";
import { BanknoteIcon, Building2, GraduationCap, Hourglass, MapPin, PinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function JobListingBadges({ jobListing: {
    wage,
    wageInterval,
    stateAbbreviation,
    city,
    type,
    expierenceLevel,
    locationRequirement,
    isFeatured,
}, className }: {
    jobListing: Pick<typeof JobListingTable.$inferSelect, | "wage" | "wageInterval" | "stateAbbreviation" | "city" | "type" | "expierenceLevel" | "locationRequirement" | "isFeatured">,
    className?: string
}) {
    const badgeProps = {
        variant: "outline",
        className: className
    } satisfies ComponentProps<typeof Badge>

    return <>
        {isFeatured && (
            <Badge {...badgeProps} className={cn(className, "border-feature bg-featured/50 text-featured-foreground")}>Featured</Badge>
        )}

        {wage != null && wageInterval != null && (
            <Badge {...badgeProps}>
                <BanknoteIcon />
                {formatWage(wage, wageInterval)}
            </Badge>
        )
        }
        {(stateAbbreviation != null || city != null) && (
            <Badge {...badgeProps}>
                <MapPin />
                {formatJobListingLocation({ stateAbbreviation, city })}
            </Badge>
        )}
        <Badge {...badgeProps}>
            <Building2 />
            {formatLocationRequirement(locationRequirement)}
        </Badge>
        <Badge {...badgeProps}>
            <Hourglass />
            {formatJobType(type)}
        </Badge>
        <Badge {...badgeProps}>
            <GraduationCap />
            {formatExpierenceLevels(expierenceLevel)}
        </Badge>
    </>
}