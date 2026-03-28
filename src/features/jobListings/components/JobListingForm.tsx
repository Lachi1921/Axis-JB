"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { jobListingSchema } from "../actions/schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expierenceLevels, jobType, locationRequirement, wageIntervals } from "@/drizzle/schema";
import { formatExpierenceLevels, formatJobType, formatLocationRequirement, formatWageInterval } from "../lib/formatters";
import { StateSelectItems } from "./StateSelectItems"
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { createJobListing, updateJobListing } from "../actions/actions";
import { toast } from "sonner";
import { LoadingSwap } from "@/components/LoadingSwap";
import { JobListingTable } from "@/drizzle/schema"


export function JobListingForm({ jobListing }: {
    jobListing: Pick<typeof JobListingTable.$inferSelect,
        "title" |
        "description" |
        "expierenceLevel" |
        "id" |
        "stateAbbreviation" |
        "type" |
        "wage" |
        "wageInterval" |
        "city" |
        "locationRequirement">
}) {
    const NONE_SELECT_VALUE = "None"

    const form = useForm({
        resolver: zodResolver(jobListingSchema),
        defaultValues: jobListing ?? {
            title: "",
            description: "",
            stateAbbreviation: null,
            city: null,
            wage: null,
            wageInterval: "yearly",
            expierenceLevel: "junior",
            type: "full-time",
            locationRequirement: "on-site",
        }
    })

    async function onSubmit(data: z.infer<typeof jobListingSchema>) {
        const action = jobListing ? updateJobListing.bind(null, jobListing.id) : createJobListing
        const res = await action(data)

        if (res.error) {
            toast.error(res.message)
        }
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 @container">
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                <FormField name="title" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="wage" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Wage</FormLabel>
                        <div className="flex">
                            <FormControl>
                                <Input {...field} type="number" value={field.value ?? ""} className="rounded-r-none" onChange={e => field.onChange(isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber)} />
                            </FormControl>
                            <FormField name="wageInterval" control={form.control} render={({ field: intervalField }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select value={intervalField.value ?? ""} onValueChange={intervalField.onChange}>
                                            <SelectTrigger className="rounded-l-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wageIntervals.map(interval => (
                                                    <SelectItem key={interval} value={interval}>
                                                        {formatWageInterval(interval)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
                    <FormField name="city" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>)} />
                    <FormField name="stateAbbreviation" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select value={field.value ?? ""} onValueChange={val => field.onChange(val === NONE_SELECT_VALUE ? null : val)}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {field.value != null &&
                                        <SelectItem value={NONE_SELECT_VALUE} className="text-muted-foreground">
                                            Clear
                                        </SelectItem>
                                    }
                                    <StateSelectItems />
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
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
            </div>
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
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
            </div>
            <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <MarkdownEditor {...field} markdown={field.value} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <Button disabled={form.formState.isSubmitting} type="submit" className="w-full cursor-pointer">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Save Draft
                </LoadingSwap>
            </Button>
        </form>
    </Form >
}   