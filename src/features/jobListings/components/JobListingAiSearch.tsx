"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { jobListingAiSearchSchema } from "../actions/schemas"
import z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/LoadingSwap"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { getAiJobListingSearchResults } from "../actions/actions"

export default function JobListingAiSearchForm() {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(jobListingAiSearchSchema),
        defaultValues: { query: "" }
    })

    async function onSubmit(values: z.infer<typeof jobListingAiSearchSchema>) {
        const results = await getAiJobListingSearchResults(values)

        if (results.error) {
            toast.error(results.message)
            return
        }

        const params = new URLSearchParams()
        results.jobIds.forEach(id => params.append("jobIds", id))
        router.push(`/?${params.toString()}`)
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField name="query" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Query</FormLabel>
                    <FormControl>
                        <Textarea {...field} className="min-h-32" />
                    </FormControl>
                    <FormDescription>
                        Describe the type of job listing you are looking for. You can be as specific as you like. For example, you could say "I'm looking for a remote software engineering job that requires 3+ years of experience and pays at least $100,000 per year."
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )} />

            <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Search
                </LoadingSwap>
            </Button>
        </form>
    </Form>
}