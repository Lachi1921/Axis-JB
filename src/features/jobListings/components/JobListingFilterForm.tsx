"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpierenceLevel, expierenceLevels, jobType, JobType, LocationRequirement, locationRequirement } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { formatExpierenceLevels, formatJobType, formatLocationRequirement } from "../lib/formatters";
import { StateSelectItems } from "./StateSelectItems";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { useSidebar } from "@/components/ui/sidebar";

const ANY_VALUE = "any"

const jobListingFilterSchema = z.object({
    title: z.string().optional(),
    city: z.string().optional(),
    stateAbbreviation: z.string().optional().or(z.literal(ANY_VALUE)),
    expierenceLevel: z.enum(expierenceLevels).optional().or(z.literal(ANY_VALUE)),
    type: z.enum(jobType).optional().or(z.literal(ANY_VALUE)),
    locationRequirement: z.enum(locationRequirement).optional().or(z.literal(ANY_VALUE)),
})

export default function JobListingFilterForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const { setOpenMobile } = useSidebar()

    const form = useForm({
        resolver: zodResolver(jobListingFilterSchema),
        defaultValues: {
            title: searchParams.get("title") ?? "",
            city: searchParams.get("city") ?? "",
            stateAbbreviation: searchParams.get("state") ?? ANY_VALUE,
            expierenceLevel: (searchParams.get("expierenceLevel")) as ExpierenceLevel ?? ANY_VALUE,
            locationRequirement: (searchParams.get("locationRequirement")) as LocationRequirement ?? ANY_VALUE,
            type: (searchParams.get("type")) as JobType ?? ANY_VALUE,
        }
    })

    function onSubmit(values: z.infer<typeof jobListingFilterSchema>) {
        const newParams = new URLSearchParams()

        Object.entries(values).forEach(([key, value]) => {
            if (value && value !== ANY_VALUE) {
                newParams.set(key, value)
            }
        })

        router.push(`/${pathname}?${newParams.toString()}`)
        setOpenMobile(false)
    }

    return <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField name="stateAbbreviation" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={ANY_VALUE} className="text-muted-foreground">Any</SelectItem>
                            <StateSelectItems />
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="expierenceLevel" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Expierence Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={ANY_VALUE} className="text-muted-foreground">Any</SelectItem>

                            {expierenceLevels.map(exp => (
                                <SelectItem key={exp} value={exp}>
                                    {formatExpierenceLevels(exp)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="locationRequirement" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Location Requirement</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={ANY_VALUE} className="text-muted-foreground">Any</SelectItem>
                            {locationRequirement.map(lr => (
                                <SelectItem key={lr} value={lr}>
                                    {formatLocationRequirement(lr)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={ANY_VALUE} className="text-muted-foreground">Any</SelectItem>
                            {jobType.map(type => (
                                <SelectItem key={type} value={type}>
                                    {formatJobType(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <Button disabled={form.formState.isSubmitting} type="submit" className="w-full cursor-pointer">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Apply Filters
                </LoadingSwap>
            </Button>
        </form>
    </Form >
}