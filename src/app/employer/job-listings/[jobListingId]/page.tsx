import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { db } from "@/drizzle/db";
import { JobListingStatuses, JobListingTable } from "@/drizzle/schema";
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges";
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { hasReachedMaxFeaturedListings, hasReachedMaxJobListings } from "@/features/jobListings/lib/planFeaturesHelper";
import { getNextJobListingStatus } from "@/features/jobListings/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgPermissions";
import { and, eq } from "drizzle-orm";
import { Edit, EyeIcon, EyeOffIcon, GemIcon, Star, StarIcon, StarOffIcon, TrashIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { toggleJobListingFeatured, toggleJobListingStatus } from "@/features/jobListings/actions/actions";
import { deleteJobListing } from "@/features/jobListings/actions/actions";

type Props = {
    params: Promise<{ jobListingId: string }>
}

export default function JobListingPage(props: Props) {
    return <Suspense>
        <SuspendedPage {...props} />
    </Suspense>
}

async function SuspendedPage({ params }: Props) {
    const { orgId } = await getCurrentOrganization()
    if (orgId == null) return null

    const { jobListingId } = await params

    const jobListing = await getJobListing(jobListingId, orgId)

    if (jobListing == null) return notFound()

    return <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
        <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{jobListing.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
                    <JobListingBadges jobListing={jobListing} />
                </div>
            </div>
            <div className="flex items-center gap-2 empty:-mt-4">
                <AsyncIf condition={() => hasOrgUserPermission("org:job_listings:update")}>
                    <Button asChild variant="outline">
                        <Link href={`/employer/job-listings/${jobListingId}/edit`}>
                            <Edit /> Edit
                        </Link>
                    </Button>
                    <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
                    {jobListing.status === "published" &&
                        <FeatureUpdateButton id={jobListing.id} isFeatured={jobListing.isFeatured} />}
                </AsyncIf>
                <AsyncIf condition={() => hasOrgUserPermission("org:job_listings:delete")}>
                    <ActionButton className="cursor-pointer" variant="destructive" action={deleteJobListing.bind(null, jobListing.id)} requireAreYouSure>
                        <TrashIcon /> Delete
                    </ActionButton>
                </AsyncIf>
            </div>
        </div>
        <MarkdownPartial
            dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
            mainMarkdown={<MarkdownRenderer className="prose-sm" source={jobListing.description} />}
            dialogTitle="Description"
        />
    </div>
}

function StatusUpdateButton({ status, id }: { status: JobListingStatuses, id: string }) {

    const button = <ActionButton className="cursor-pointer" action={toggleJobListingStatus.bind(null, id)} variant="outline" requireAreYouSure={getNextJobListingStatus(status) === "published"} areYouSureDescription="This job listing will be published in the website.">{statusToggleButtonText(status)}</ActionButton>

    return (
        <AsyncIf
            condition={async () =>
                await hasOrgUserPermission("org:job_listings:change_status")
            }
        >
            {getNextJobListingStatus(status) === "published" ? (
                <AsyncIf
                    condition={async () => {
                        const isMaxed = await hasReachedMaxJobListings()
                        return !isMaxed
                    }}
                    otherwise={
                        <UpgradePopover
                            buttonText={statusToggleButtonText(status)}
                            popoverText="You must upgrade your plan to publish more job listings."
                        />
                    }
                >
                    {button}
                </AsyncIf>
            ) : (
                button
            )}
        </AsyncIf>
    )
}

function FeatureUpdateButton({ isFeatured, id }: { id: string, isFeatured: boolean }) {
    const button = <ActionButton className="cursor-pointer" action={toggleJobListingFeatured.bind(null, id)} variant="outline">
        {featureToggleButtonText(isFeatured)}
    </ActionButton>
    return (
        <AsyncIf
            condition={async () =>
                await hasOrgUserPermission("org:job_listings:change_status")
            }
        >
            {isFeatured ? (
                button
            ) : (
                <AsyncIf
                    condition={async () => {
                        const isMaxed = await hasReachedMaxFeaturedListings()
                        return !isMaxed
                    }}
                    otherwise={
                        <UpgradePopover
                            buttonText={featureToggleButtonText(isFeatured)}
                            popoverText="You must upgrade your plan to feature more job listings."
                        />
                    }
                >
                    {button}
                </AsyncIf>
            )}
        </AsyncIf>
    )
}

function UpgradePopover({ buttonText, popoverText }: { buttonText: ReactNode, popoverText: ReactNode }) {
    return <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline">
                {buttonText}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
            {popoverText}
            <Button asChild>
                <Link href="/employer/pricing">
                    {buttonText}
                </Link>
            </Button>
        </PopoverContent>
    </Popover>
}

async function getJobListing(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListingIdTag(id))

    return await db.query.JobListingTable.findFirst({
        where: and(
            eq(JobListingTable.id, id),
            eq(JobListingTable.organizationId, orgId)
        ),
    });
}

function statusToggleButtonText(status: JobListingStatuses) {
    switch (status) {
        case "draft":
        case "delisted":
            return (
                <>
                    <EyeIcon className="size-4" />
                    Publish
                </>
            )

        case "published":
            return (
                <>
                    <EyeOffIcon className="size-4" />
                    Delist
                </>
            )

        default: {
            const _exhaustiveCheck: never = status
            throw new Error(`Unknown job listing status: ${_exhaustiveCheck}`)
        }
    }
}

function featureToggleButtonText(isFeatured: boolean) {
    if (isFeatured) {
        return (
            <>
                <StarOffIcon className="size-4" />
                Unfeature
            </>
        )
    }
    else {
        return (
            <>
                <StarIcon className="size-4" />
                Feature
            </>
        )
    }
}