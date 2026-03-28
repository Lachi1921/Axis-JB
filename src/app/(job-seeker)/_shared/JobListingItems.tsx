import { db } from '@/drizzle/db';
import { and, eq, ilike, or, SQL } from 'drizzle-orm';
import { jobType, expierenceLevels, JobListingTable, locationRequirement, OrganizationTable } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { Suspense } from 'react';
import Link from 'next/link';
import { convertSearchParamsToString } from '@/lib/convertSearchParamsToString';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInDays } from 'date-fns';
import { connection } from 'next/server';
import { Badge } from '@/components/ui/badge';
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges';
import z from 'zod';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingGlobalTag } from '@/features/jobListings/db/cache/jobListings';

type Props = {
    searchParams: Promise<Record<string, string | string[]>>
    params?: Promise<{ jobListingId: string }>
}

const searchParamsSchema = z.object({
    title: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    state: z.string().optional().catch(undefined),
    expierenceLevel: z.enum(expierenceLevels).optional().catch(undefined),
    locationRequirement: z.enum(locationRequirement).optional().catch(undefined),
    type: z.enum(jobType).optional().catch(undefined),
    jobIds: z.union([z.string(), z.array(z.string())]).transform(value => Array.isArray(value) ? value : [value]).optional().catch([])

})

export function JobListingItems(props: Props) {
    return <Suspense>
        <SuspendedComponent {...props} />
    </Suspense>
}

async function SuspendedComponent({ searchParams, params }: Props) {
    const jobListingId = params ? (await params).jobListingId : undefined
    const { success, data } = searchParamsSchema.safeParse(await searchParams)
    const search = success ? data : {}

    const jobListings = await getAllJobListings(search, jobListingId)
    if (jobListings.length === 0) {
        return <div className="text-muted-foreground p-4">
            No job listings found.
        </div>
    }

    return <div className="space-y-4">
        {jobListings.map(jobListing => (
            <Link className="block" key={jobListing.id} href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(search)}`}>
                <JobListingListItem jobListing={jobListing} organization={jobListing.organizations} />
            </Link>
        ))}
    </div>
}

function JobListingListItem({ jobListing, organization }: {
    jobListing: Pick<typeof JobListingTable.$inferSelect, "title" | "stateAbbreviation" | "city" | "wage" | "wageInterval" | "expierenceLevel" | "type" | "postedAt" | "locationRequirement" | "isFeatured">,
    organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
}) {
    const nameInitals = organization?.name.split(" ").splice(0, 4).map(word => word[0]).join("")

    return <Card className={cn("@container", jobListing.isFeatured && "border-featured bg-featured/20")}>
        <CardHeader className='flex gap-4'>
            <Avatar className='size-14 @max-sm:hidden'>
                <AvatarImage src={organization.imageUrl ?? undefined} alt={organization?.name || "Organization Image"} />
                <AvatarFallback className="uppercase bg-primary text-primary-foreground">{nameInitals}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
                <CardTitle className='text-xl'>{jobListing.title}</CardTitle>
                <CardDescription className='text-base text-muted-foreground'>{organization?.name}</CardDescription>
                {jobListing.postedAt != null &&
                    <div className="text-sm font-medium text-primmary @min-md:hidden">
                        <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                            <DaysSincePosted postedAt={jobListing.postedAt} />
                        </Suspense>
                    </div>
                }
            </div>
            {jobListing.postedAt != null &&
                <div className="text-sm font-medium text-primmary ml-auto @max-md:hidden">
                    <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                        <DaysSincePosted postedAt={jobListing.postedAt} />
                    </Suspense>
                </div>
            }
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
            <JobListingBadges jobListing={jobListing} />
        </CardContent>
    </Card>
}


async function DaysSincePosted({ postedAt }: { postedAt: Date }) {
    await connection()
    const daysSincePosted = differenceInDays(postedAt, Date.now())

    if (daysSincePosted === 0) {
        return <Badge>Today</Badge>
    }

    return new Intl.RelativeTimeFormat(undefined, { style: "narrow", numeric: "always" }).format(daysSincePosted, "day")
}

async function getAllJobListings(searchParams: z.infer<typeof searchParamsSchema>, jobListingId: string | undefined) {
    "use cache"
    cacheTag(getJobListingGlobalTag())

    const whereConditions: (SQL | undefined)[] = []

    if (searchParams.title) {
        whereConditions.push(ilike(JobListingTable.title, `%${searchParams.title}%`))
    }
    if (searchParams.locationRequirement) {
        whereConditions.push(ilike(JobListingTable.locationRequirement, `%${searchParams.locationRequirement}%`))
    }
    if (searchParams.city) {
        whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`))
    }
    if (searchParams.state) {
        whereConditions.push(ilike(JobListingTable.stateAbbreviation, `%${searchParams.state}%`))
    }
    if (searchParams.expierenceLevel) {
        whereConditions.push(eq(JobListingTable.expierenceLevel, searchParams.expierenceLevel))
    }
    if (searchParams.type) {
        whereConditions.push(eq(JobListingTable.type, searchParams.type))
    }
    if (searchParams.jobIds) {
        whereConditions.push(or(...searchParams.jobIds.map(id => eq(JobListingTable.id, id))))
    }


    return db.query.JobListingTable.findMany({
        where: or(jobListingId ? and(eq(JobListingTable.status, "published"), eq(JobListingTable.id, jobListingId)) : undefined, and(eq(JobListingTable.status, "published"), ...whereConditions)),
        with: {
            organizations: {
                columns: {
                    name: true,
                    imageUrl: true,
                }
            }
        },
        orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
    })

}