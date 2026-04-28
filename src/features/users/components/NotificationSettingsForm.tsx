"use client"

import { UserNotificationsSettingsTable } from '@/drizzle/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { userNotificationSettingsSchema } from '../actions/schema';
import z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSwap } from '@/components/LoadingSwap';
import { toast } from 'sonner';
import { updateUserNotificationSettings } from '../actions/updateUserNotificationSettings';

export default function NotificationSettingsForm({ notificationSettings }: {
    notificationSettings: Pick<typeof UserNotificationsSettingsTable.$inferSelect, "newJobEmailNotifications" | "aiPrompt">
}) {

    const form = useForm({
        resolver: zodResolver(userNotificationSettingsSchema),
        defaultValues: notificationSettings ?? {
            newJobEmailNotifications: true,
            aiPrompt: ""
        }
    })

    async function onSubmit(data: z.infer<typeof userNotificationSettingsSchema>) {
        const result = await updateUserNotificationSettings(data)

        if (result.error) {
            toast.error(result.message)
        } else {
            toast.success(result.message)
        }
    }

    const newJobEmailNotifications = form.watch("newJobEmailNotifications")

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='border rounded-lg p-4 shadow-sm space-y-6'>
                <FormField name="newJobEmailNotifications" control={form.control} render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel>Daily Email Notifications</FormLabel>
                                <FormDescription>Recieve emails about new job listings that match your interests</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </div>
                    </FormItem>
                )} />
                {newJobEmailNotifications && (
                    <FormField name="aiPrompt" control={form.control} render={({ field }) => (
                        <FormItem>
                            <div className='space-y-0.5'>
                                <FormLabel>Filter Prompt</FormLabel>
                                <FormDescription>
                                    Our AI will use this prompt to filter out job listings and send you notifications for the jobs that match your criteria.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ""} className="min-h-32" placeholder="Descri" />
                            </FormControl>
                            <FormDescription>
                                Leave blank to recieve all klinds of job listings notifications.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                )}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Save Notification Settings
                </LoadingSwap>
            </Button>
        </form>
    </Form>

}