import { AsyncIf } from "@/components/AsyncIf";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { db } from "@/drizzle/db";
import { jobListingApplicationsTable, JobListingStatuses, JobListingTable } from "@/drizzle/schema";
import { getJobListingOrganizationTag } from "@/features/jobListings/db/cache/jobListings";
import { sortJobListingsByStatus } from "@/features/jobListings/lib/utils";
import { getJobListingApplicationJobListingTag } from "@/features/jobListingsApplication/db/cache/jobListingApplications";
import SidebarOrgannizationButton from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgPermissions";
import { count, desc, eq } from "drizzle-orm";
import { HomeIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";

export default function EmployerLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <LayoutSuspense>{children}</LayoutSuspense>
            </Suspense>
        </>
    )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
    const { orgId } = await getCurrentOrganization()
    if (orgId == null) return redirect("/organizations/select")

    return <AppSidebar
        content={
            <>
                <SidebarGroup>
                    <SidebarGroupLabel>Job listings</SidebarGroupLabel>
                    <AsyncIf condition={() => hasOrgUserPermission("org:job_listings:create")}>
                        <SidebarGroupAction asChild>
                            <Link href="/employer/job-listings/new">
                                <PlusIcon /> <span className="sr-only">Add job listing</span>
                            </Link>
                        </SidebarGroupAction>
                    </AsyncIf>
                    <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
                        <Suspense fallback={<div>Loading...</div>}>
                            <JobListingMenu orgId={orgId} />
                        </Suspense>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarNavMenuGroup className="mt-auto" items={[{
                    href: "/",
                    icon: <HomeIcon />,
                    label: "Home"
                },
                ]} />
            </>
        }
        footerButton={
            <SidebarOrgannizationButton />
        }>
        {children}
    </AppSidebar>
}


async function JobListingMenu({ orgId }: { orgId: string }) {
    const jobListings = await getJobListings(orgId)
    if (jobListings.length === 0 && (await hasOrgUserPermission("org:job_listings:create"))) {
        return (<SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/employer/job-listings/new">
                        <PlusIcon className="mr-2" />
                        <span>New job listing</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        )
    }
    return Object.entries(Object.groupBy(jobListings, j => j.status)).sort(([statusA], [statusB]) => {
        return sortJobListingsByStatus(statusA as JobListingStatuses, statusB as JobListingStatuses)
    }).map(([key, value]) => {
        return <JobListingMenuGroup key={key} status={key as JobListingStatuses} jobListings={value} />
    })

}


async function getJobListings(orgId: string) {
    "use cache"
    cacheTag(getJobListingOrganizationTag(orgId))

    const data = await db.select({
        id: JobListingTable.id,
        title: JobListingTable.title,
        status: JobListingTable.status,
        applicationCount: count(jobListingApplicationsTable.userId)
    }).from(JobListingTable)
        .where(eq(JobListingTable.organizationId, orgId))
        .leftJoin(jobListingApplicationsTable, eq(JobListingTable.id, jobListingApplicationsTable.jobListingId))
        .groupBy(jobListingApplicationsTable.jobListingId, JobListingTable.id)
        .orderBy(desc(JobListingTable.createdAt))
    data.forEach(jobListing => {
        cacheTag(getJobListingApplicationJobListingTag(jobListing.id))
    })

    return data
}