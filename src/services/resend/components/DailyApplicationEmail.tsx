import { jobListingApplicationsTable } from '@/drizzle/schema';
import { Container, Head, Heading, Html, Section, Tailwind, Text } from "@react-email/components"
import tailwindConfig from '../data/tailwindConfig';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Application = Pick<typeof jobListingApplicationsTable.$inferSelect, "rating"> & {
    userName: string,
    organizationId: string,
    organizationName: string,
    jobListingId: string,
    jobListingTitle: string,
}


export default function DailyApplicationEmail({ userName, applications }: {
    userName: string
    applications: Application[]

}) {
    return <Tailwind config={tailwindConfig}>
        <Html>
            <Head />
            <Container className="font-sans">
                <Heading as="h2">New applications submitted last 24h</Heading>
                <Text>Greetings {userName}. Here are your new applications for all of your job listings in 24 hours.</Text>
                {Object.entries(Object.groupBy(applications, a => a.organizationId)).map(([orgId, orgApplications], index) => {
                    if (orgApplications == null || orgApplications.length === 0) return null

                    return <OrgSection key={orgId} orgName={orgApplications[0].organizationName} applications={orgApplications} noMargin={index === 0} />
                })}
            </Container>
        </Html>
    </ Tailwind>
}

function OrgSection({ orgName, applications, noMargin = false, }: { orgName: string, applications: Application[], noMargin?: boolean }) {
    return <Section className={noMargin ? undefined : "mt-8"}>
        <Heading as="h2" className='leading-none font-semibold text-3xl my-4'>
            {orgName}
        </Heading>
        {Object.entries(Object.groupBy(applications, a => a.jobListingId)).map(([jobListingId, listingApplications], index) => {
            if (listingApplications == null || listingApplications.length === 0) return null

            return <JobListingCard key={jobListingId} jobListingTitle={listingApplications[0].jobListingTitle} applications={listingApplications} noMargin={index === 0} />

        })}
    </Section>
}

function JobListingCard({ jobListingTitle, applications, noMargin = false, }: { jobListingTitle: string, applications: Application[], noMargin?: boolean }) {
    return <div className={cn("bg-card text-card-foreground rounded-lg border p-4 border-primary border-solid", !noMargin && "mt-6")}>
        <Heading as="h3" className='leading-none font-semibold text-xl mb-3 mt-0'>
            {jobListingTitle}
        </Heading>
        {applications.map((application, index) => (
            <Text key={index} className='mt-2 mb-0'>
                <span>{application.userName}: </span>
                <RatingIcons rating={application.rating} />
            </Text>
        ))}
    </div>
}

function RatingIcons({ rating }: { rating: number | null }) {
    if (rating == null || rating < 1 || rating > 5) {
        return "Unrated"
    }

    const stars: ReactNode[] = []
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className='w-3 mb-[7px] mr-0.5'>
                {rating >= i ? "★" : "☆"}
            </span>
        )
    }

    return stars
}



DailyApplicationEmail.PreviewProps = {
    applications: [
        {
            rating: 5,
            userName: "Alice Johnson",
            organizationId: "org_1",
            organizationName: "TechNova",
            jobListingId: "job_1",
            jobListingTitle: "Frontend Developer",
        },
        {
            rating: 4,
            userName: "Bob Smith",
            organizationId: "org_1",
            organizationName: "TechNova",
            jobListingId: "job_1",
            jobListingTitle: "Frontend Developer",
        },
        {
            rating: 3,
            userName: "Charlie Brown",
            organizationId: "org_1",
            organizationName: "TechNova",
            jobListingId: "job_2",
            jobListingTitle: "Backend Engineer",
        },
        {
            rating: null,
            userName: "Diana Lee",
            organizationId: "org_2",
            organizationName: "CloudCore",
            jobListingId: "job_3",
            jobListingTitle: "DevOps Specialist",
        },
        {
            rating: 5,
            userName: "Ethan Carter",
            organizationId: "org_2",
            organizationName: "CloudCore",
            jobListingId: "job_3",
            jobListingTitle: "DevOps Specialist",
        },
    ],
    userName: "User",
} satisfies Parameters<typeof DailyApplicationEmail>[0]