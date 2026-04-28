import { JobListingTable } from '@/drizzle/schema';
import { Button, Container, Head, Heading, Html, Section, Tailwind, Text } from "@react-email/components"
import tailwindConfig from '../data/tailwindConfig';
import { formatExpierenceLevels, formatJobListingLocation, formatJobType, formatLocationRequirement, formatWage } from '@/features/jobListings/lib/formatters';

type JobListing = Pick<typeof JobListingTable.$inferSelect, | "id" | "title" | "city" | "stateAbbreviation" | "type" | "expierenceLevel" | "wage" | "wageInterval" | "locationRequirement"> & {
    organizationName: string
}


export default function DailyJobListingEmail({ userName, jobListings, serverUrl }: {
    userName: string
    jobListings: JobListing[]
    serverUrl: string

}) {
    return <Tailwind config={tailwindConfig}>
        <Html>
            <Head />
            <Container className="font-sans">
                <Heading as="h2">We got you new Job Listings!</Heading>
                <Text>Greetings {userName}. Here are your new daily job listings that meet your criteria.</Text>
                <Section>
                    {jobListings.map(jobListing => (
                        <div key={jobListing.id} className='bg-card text-card-foreground rounded-lg border p-4 border-primary border-solid mb-6'>
                            <Text className="leading-none font-semibold text-xl my-0">{jobListing.title}</Text>
                            <Text className="text-muted-foreground mb-2 mt-0">{jobListing.organizationName}</Text>
                            <div className='mb-5'>
                                {getBadges(jobListing).map((badge, index) => (
                                    <div key={index} className='inline-block rounded border-solid border font-medium w-fit text-foreground text-sm px-3 py-1 mb-1 mr-1'>
                                        {badge}
                                    </div>
                                ))}
                            </div>
                            <Button href={`${serverUrl}/job-listings/${jobListing.id}`} className='rounded-md text-sm font-medium focus-visible: border-ring bg-primary text-primary-foreground px-4 py-2'>
                                Open Job
                            </Button>
                        </div>

                    ))}
                </Section>
            </Container>
        </Html>
    </ Tailwind>
}

function getBadges(jobListing: JobListing) {
    const badges = [
        formatLocationRequirement(jobListing.locationRequirement),
        formatJobType(jobListing.type),
        formatExpierenceLevels(jobListing.expierenceLevel)
    ]

    if (jobListing.city != null || jobListing.stateAbbreviation != null) {
        badges.unshift(formatJobListingLocation(jobListing))
    }

    if (jobListing.wage != null && jobListing.wageInterval != null) {
        badges.unshift(formatWage(jobListing.wage, jobListing.wageInterval))
    }

    return badges
}

DailyJobListingEmail.PreviewProps = {
    jobListings: [
        {
            id: "1",
            title: "Frontend Developer",
            city: "Rawalpindi",
            stateAbbreviation: "PB",
            type: "full-time",
            expierenceLevel: "mid level",
            wage: 120000,
            wageInterval: "monthly",
            locationRequirement: "remote",
            organizationName: "TechNova"
        },
        {
            id: "2",
            title: "Backend Engineer",
            city: "Islamabad",
            stateAbbreviation: "PB",
            type: "full-time",
            expierenceLevel: "senior",
            wage: 180000,
            wageInterval: "monthly",
            locationRequirement: "hybrid",
            organizationName: "CloudStack"
        }
    ],
    userName: "User",
    serverUrl: "https://localhost:3000"
} satisfies Parameters<typeof DailyJobListingEmail>[0]