"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { toast } from "sonner";
import { createJobListingApplication } from "@/features/jobListingsApplication/actions/actions";
import { newJobListingApplicationSchema } from "../actions/schema";

export function NewJobListingApplicationForm({ jobListingId }: { jobListingId: string }) {
    const form = useForm({
        resolver: zodResolver(newJobListingApplicationSchema),
        defaultValues: {
            coverLetter: "",
        }
    })

    async function onSubmit(data: z.infer<typeof newJobListingApplicationSchema>) {
        const res = await createJobListingApplication(
            jobListingId,
            data,
        )

        if (res?.error) {
            toast.error(res.message)
            return
        }

        toast.success(res?.message)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 @container">
                <FormField name="coverLetter" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cover Letter</FormLabel>
                        <FormControl>
                            <MarkdownEditor {...field} markdown={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>Optional.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button disabled={form.formState.isSubmitting} type="submit" className="w-full cursor-pointer">
                    <LoadingSwap isLoading={form.formState.isSubmitting}>
                        Submit Application
                    </LoadingSwap>
                </Button>
            </form>
        </Form >
    )
}