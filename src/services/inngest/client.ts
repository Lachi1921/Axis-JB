import { jobListingApplicationsTable, JobListingTable } from "@/drizzle/schema";
import { DeletedObjectJSON, OrganizationJSON, OrganizationMembershipJSON, UserJSON } from "@clerk/nextjs/server";
import { EventSchemas, Inngest } from "inngest";

type ClerkWebhookData<T> = {
    data: {
        data: T,
        raw: string,
        headers: Record<string, string>
    }
}

type Events = {
    // Users

    "clerk/user.created": ClerkWebhookData<UserJSON>,
    "clerk/user.updated": ClerkWebhookData<UserJSON>,
    "clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>,

    // Organization
    "clerk/organization.created": ClerkWebhookData<OrganizationJSON>,
    "clerk/organization.updated": ClerkWebhookData<OrganizationJSON>,
    "clerk/organization.deleted": ClerkWebhookData<DeletedObjectJSON>,
    "clerk/orgMembership.created": ClerkWebhookData<OrganizationMembershipJSON>,
    "clerk/orgMembership.deleted": ClerkWebhookData<OrganizationMembershipJSON>,

    // Custom events
    "app/jobListingApplication.created": {
        data: {
            jobListingId: string,
            userId: string,
        }
    },
    "app/resume.uploaded": {
        user: {
            id: string,
        }
    },
    "app/email.daily-user-job-listings": {
        data: {
            aiPrompt?: string,
            jobListings: (Omit<typeof JobListingTable.$inferSelect, "createdAt" | "postedAt" | "updatedAt" | "organizationId"> & { organizationName: string })[]
        },
        user: {
            email: string
            name: string
        }
    },
    "app/email.daily-organization-user-applications": {
        data: {
            applications: (Pick<typeof jobListingApplicationsTable.$inferSelect, "rating"> & {
                userName: string,
                organizationId: string,
                organizationName: string,
                jobListingId: string,
                jobListingTitle: string,
            })[]
        },
        user: {
            email: string
            name: string
        },

    }
}

export const inngest = new Inngest({ id: "axis", schemas: new EventSchemas().fromRecord<Events>() });