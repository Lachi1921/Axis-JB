import { AsyncIf } from "@/components/AsyncIf";
import { LoadingSwap } from "@/components/LoadingSwap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JobListingAiSearchForm from "@/features/jobListings/components/JobListingAiSearch";
import { SignUpButton } from "@/services/clerk/components/AuthButtons";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";

export default function AiSearchPage() {
    return <div className="p-4 flex items-center justify-center min-h-full">
        <Card className="max-w-4xl">
            <AsyncIf condition={async () => {
                const { userId } = await getCurrentUser()
                return userId != null
            }} loadingFallback={
                <LoadingSwap isLoading>
                    <AiCard />
                </LoadingSwap>
            } otherwise={<NoPermission />}>
                asas
            </AsyncIf>
        </Card>
    </div>
}

function AiCard() {
    return (
        <>
            <CardHeader>
                <CardTitle>AI Title</CardTitle>
                <CardDescription>Searching for you! This can take a few minutes to process, please be patient.</CardDescription>
            </CardHeader>
            <CardContent>
                <JobListingAiSearchForm />
            </CardContent>
        </>
    )

}

function NoPermission() {
    return (
        <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-1">No Permission</h2>
            <p className="mb-4 text-muted-foreground">You need to create an account to use AI Search.</p>
            <SignUpButton />
        </CardContent>
    )
}