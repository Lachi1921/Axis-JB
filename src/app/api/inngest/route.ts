import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import { clerkCreateOrganization, clerkCreateOrgMembership, clerkCreateUser, clerkDeleteOrganization, clerkDeleteOrgMembership, clerkDeleteUser, clerkUpdateOrganization, clerkUpdateUser } from "@/services/inngest/functions/clerk";
import { createAiSummaryOfUploadedResume } from "@/services/inngest/functions/resume";
import { rankApplication } from "@/services/inngest/functions/jobListingApplications";
import { prepareDailyJobListingNotifications, prepareDailyOrgUserApplicationNotifications, sendDailyOrgUserApplicationEmail, sendDailyUserJobListingEmails } from "@/services/inngest/functions/email";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        clerkCreateUser,
        clerkUpdateUser,
        clerkDeleteUser,
        clerkCreateOrganization,
        clerkUpdateOrganization,
        clerkDeleteOrganization,
        createAiSummaryOfUploadedResume,
        rankApplication,
        prepareDailyJobListingNotifications,
        sendDailyUserJobListingEmails,
        clerkCreateOrgMembership,
        clerkDeleteOrgMembership,
        prepareDailyOrgUserApplicationNotifications,
        sendDailyOrgUserApplicationEmail,
    ],
});
