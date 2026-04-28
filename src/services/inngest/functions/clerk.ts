import { env } from "@/data/env/server";
import { inngest } from "../client";
import { Webhook } from "svix"
import { NonRetriableError } from "inngest";
import { deleteUser, insertUser, updateUser } from "@/features/users/db/user";
import { insertUserNotificationSettings, updateUserNotificationSettings } from "@/features/users/db/userNotificationSettings";
import { deleteOrg, insertOrg, updateOrg } from "@/features/organizations/organization";
import { insertOrgUserSettings } from "@/features/organizations/db/organizationUserSettings";

function verifyWebhook({
    raw,
    headers,
}: {
    raw: string
    headers: Record<string, string>
}) {
    return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, headers)
}

export const clerkCreateUser = inngest.createFunction(
    { id: 'clerk/create-db-user', name: 'Clerk - Create DB User' },
    { event: 'clerk/user.created' },
    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })
        const userId = await step.run('create-user', async () => {
            const userData = event.data.data
            const email = userData.email_addresses.find(email => email.id === userData.primary_email_address_id)

            if (email === undefined) {
                throw new NonRetriableError('No Primary Email found for user')
            }

            await insertUser({
                id: userData.id,
                name: `${userData.first_name} ${userData.last_name}`,
                imageUrl: userData.image_url,
                email: email.email_address,
                createdAt: new Date(userData.created_at),
                updatedAt: new Date(userData.updated_at),
            })

            return userData.id
        })


        await step.run('create-user-notification-settings', async () => {
            await insertUserNotificationSettings({ userId })
        })

    }
)

export const clerkUpdateUser = inngest.createFunction(
    { id: 'clerk/update-db-user', name: 'Clerk - Update DB User' },
    { event: 'clerk/user.updated' },
    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })
        const userId = await step.run('update-user', async () => {
            const userData = event.data.data
            const email = userData.email_addresses.find(email => email.id === userData.primary_email_address_id)

            if (email === undefined) {
                throw new NonRetriableError('No Primary Email found for user')
            }

            await updateUser(userData.id,
                {
                    name: `${userData.first_name} ${userData.last_name}`,
                    imageUrl: userData.image_url,
                    email: email.email_address,
                    updatedAt: new Date(userData.updated_at)
                }
            )

            return userData.id
        })

    }
)

export const clerkDeleteUser = inngest.createFunction(
    { id: 'clerk/delete-db-user', name: 'Clerk - Delete DB User' },
    { event: 'clerk/user.deleted' },
    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })
        const userId = await step.run('delete-user', async () => {
            const { id } = event.data.data

            if (id === undefined) {
                throw new NonRetriableError("Invalid payload.")
            }

            await deleteUser(id)

        })


    }
)

export const clerkCreateOrganization = inngest.createFunction(
    { id: 'clerk/create-db-organization', name: 'Clerk - Create DB Organization' },
    { event: 'clerk/organization.created' },

    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })

        await step.run('create-organization', async () => {
            const orgData = event.data.data

            await insertOrg({
                name: orgData.name,
                id: orgData.id,
                imageUrl: orgData.image_url,
                createdAt: new Date(orgData.created_at),
                updatedAt: new Date(orgData.updated_at),
            })

            return orgData.id
        })
    }
)

export const clerkUpdateOrganization = inngest.createFunction(
    { id: 'clerk/update-db-organization', name: 'Clerk - Update DB Organization' },
    { event: 'clerk/organization.updated' },
    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })
        await step.run('update-organization', async () => {
            const orgData = event.data.data

            await updateOrg(orgData.id,
                {
                    name: orgData.name,
                    imageUrl: orgData.image_url,
                    createdAt: new Date(orgData.created_at),
                    updatedAt: new Date(orgData.updated_at),
                }
            )

            return orgData.id
        })


    }
)

export const clerkDeleteOrganization = inngest.createFunction(
    { id: 'clerk/delete-db-organization', name: 'Clerk - Delete DB Organization' },
    { event: 'clerk/organization.deleted' },
    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })
        await step.run('delete-organization', async () => {
            const { id } = event.data.data

            if (id === undefined) {
                throw new NonRetriableError("Invalid payload.")
            }

            await deleteOrg(id)

        })


    }
)

export const clerkCreateOrgMembership = inngest.createFunction(
    { id: 'clerk/create-db-org-membership', name: 'Clerk - Create DB Org Membership' },
    { event: 'clerk/orgMembership.created' },

    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })

        await step.run('create-org-user-settings', async () => {
            const userId = event.data.data.public_user_data.user_id
            const orgId = event.data.data.organization.id

            await insertOrgUserSettings({
                userId,
                organizationId: orgId,

            })

        })
    }
)

export const clerkDeleteOrgMembership = inngest.createFunction(
    { id: 'clerk/delete-db-org-membership', name: 'Clerk - Delete DB Org Membership' },
    { event: 'clerk/orgMembership.deleted' },

    async ({ event, step }) => {
        await step.run('verify-webhook', async () => {
            try {
                verifyWebhook(event.data)
            } catch (error) {
                throw new NonRetriableError(`Failed to verify webhook: ${error}`)
            }
        })

        await step.run('delete-org-user-settings', async () => {
            const userId = event.data.data.public_user_data.user_id
            const orgId = event.data.data.organization.id

            await insertOrgUserSettings({
                userId,
                organizationId: orgId,

            })

        })
    }
)


