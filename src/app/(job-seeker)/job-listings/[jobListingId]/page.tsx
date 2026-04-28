import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { jobListingApplicationsTable, JobListingTable, userResumeTable } from "@/drizzle/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SignInButton } from "@/services/clerk/components/AuthButtons";
import { getJobListingApplicationIdTag } from "@/features/jobListingsApplication/db/cache/jobListingApplications";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import { getUserResumeIdTag } from "@/features/users/db/cache/userResume";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { NewJobListingApplicationForm } from "@/features/jobListingsApplication/components/NewJobListingApplicationForm";
import { Badge } from "@/components/ui/badge";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgPermissions";
import { AsyncIf } from "@/components/AsyncIf";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";

export default function JobListingPage({
    params,
    searchParams,
}: {
    params: Promise<{ jobListingId: string }>
    searchParams: Promise<Record<string, string | string[]>>
}) {
    return (
        <>
            {/* <ResizablePanelGroup autoSave="job-board-panel" orientation="horizontal">
                <ResizablePanel id="left" defaultSize="60%" minSize="30%">
                    <div className="p-4 h-screen overflow-y-auto">
                        <JobListingItems searchParams={searchParams} params={params} />
                    </div>
                </ResizablePanel>
                <IsBreakPoint
                    breakpoint="min-width: 1024px"
                    otherwise={
                        <ClientSheet>
                            <SheetContent hideCloseButton className="p-4 overflow-y-auto">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Job Listing Details</SheetTitle>
                                </SheetHeader>
                                <Suspense fallback={<LoadingSpinner />}>
                                    <JobListingDetails
                                        searchParams={searchParams}
                                        params={params}
                                    />
                                </Suspense>
                            </SheetContent>
                        </ClientSheet>
                    }>
                    <ResizableHandle withHandle className="mx-2" />
                    <ResizablePanel id="right" defaultSize={40} minSize={30}>
                        <div className="p-4 h-screen overflow-y-auto">

                        </div>
                    </ResizablePanel>
                </IsBreakPoint>
            </ResizablePanelGroup> */}
            <div className="space-y-6 max-w-6xl mx-auto py-8 px-4 @container">
                <div className="p-4 h-screen overflow-y-auto">
                    <h1 className="text-4xl font-bold mb-2">Job Listing Details</h1>

                    <Suspense fallback={<LoadingSpinner />}>
                        <JobListingDetails
                            params={params}
                            searchParams={searchParams}
                        />
                    </Suspense>
                </div>
            </div>
        </>
    )
}



async function JobListingDetails({
    params,
    searchParams,
}: {
    params: Promise<{ jobListingId: string }>
    searchParams: Promise<Record<string, string | string[]>>
}) {
    const { jobListingId } = await params
    const jobListing = await getJobListing(jobListingId)
    if (jobListing == null) return notFound()


    return (
        <div className="py-6">
            <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl tracking-tight">{jobListing.title}</h1>
                        <AsyncIf condition={() => hasOrgUserPermission("org:job_listings:update")}>
                            <Link href={`/employer/job-listings/${jobListingId}/edit`}>
                                <Edit />
                            </Link>
                        </AsyncIf>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
                        <JobListingBadges jobListing={jobListing} />
                    </div>
                </div>
                <div className="flex items-center gap-2 empty:-mt-4">
                    <ApplyButton jobListingId={jobListingId} />
                </div>
            </div>
            <MarkdownPartial
                dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
                mainMarkdown={<MarkdownRenderer className="prose-sm" source={jobListing.description} />}
                dialogTitle="Description"
            />
        </div>
    )
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
    const { userId } = await getCurrentUser()
    const job = await getJobListing(jobListingId)

    if (job == null) return null

    if (userId == null) {
        return <Popover>
            <PopoverTrigger asChild>
                <Button>
                    Apply
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                You need an account to apply for jobs. Please sign in or create an account to continue.
                <SignInButton />
            </PopoverContent>
        </Popover>

    }

    const application = await getJobListingApplication(jobListingId, userId)
    if (application != null) {
        const formatter = new Intl.RelativeTimeFormat(undefined, { style: "short", numeric: "always" })

        await connection()
        const difference = differenceInDays(application.createdAt, new Date())

        return <div className="text-muted-foreground text-sm">
            You already applied for this job {difference === 0 ? "today" : formatter.format(difference, "day")}.
        </div>
    }

    const userResume = await getUserResume(userId)
    if (userResume == undefined) {
        return <Popover>
            <PopoverTrigger asChild>
                <Button>
                    Apply
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                You need a resume to apply for jobs. Please upload a resume to continue.
                <Button asChild>
                    <Link href="/user-settings/resumes">Upload Resume</Link>
                </Button>
            </PopoverContent>
        </Popover>

    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Apply</Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Application</DialogTitle>
                    <DialogDescription>
                        Applying for a job cannot be undone and is something you can only do
                        once per job listing.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <NewJobListingApplicationForm jobListingId={jobListingId} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

async function getUserResume(userId: string) {
    "use cache"
    cacheTag(getUserResumeIdTag(userId))

    const resume = db.query.userResumeTable.findFirst({
        where: eq(userResumeTable.userId, userId)
    })
    console.log("Found user resume:", resume)
    return resume
}

async function getJobListingApplication(jobListingId: string, userId: string) {
    "use cache"
    cacheTag(getJobListingApplicationIdTag({ jobListingId, userId }))

    return db.query.jobListingApplicationsTable.findFirst({
        where: and(
            eq(jobListingApplicationsTable.jobListingId, jobListingId),
            eq(jobListingApplicationsTable.userId, userId)
        )
    })
}

async function getJobListing(id: string) {
    "use cache"
    cacheTag(getJobListingIdTag(id))

    const listing = await db.query.JobListingTable.findFirst({
        where: and(eq(JobListingTable.status, "published"), eq(JobListingTable.id, id)),
        with: {
            organizations: {
                columns: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            }
        }
    })
    if (listing != null) {
        cacheTag(getOrganizationIdTag(listing.organizations.id))
    }
    return listing;
}
