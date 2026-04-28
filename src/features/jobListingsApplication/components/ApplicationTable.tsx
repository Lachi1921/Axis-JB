"use client"

import { DataTable } from "@/components/dataTable/DataTable"
import { SortableColumnHeader } from "@/components/dataTable/SortableColumnHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApplicationStage, applicationStage, jobListingApplicationsTable, userResumeTable, UserTable } from "@/drizzle/schema"
import { ColumnDef, Table } from "@tanstack/react-table"
import { ReactNode, useOptimistic, useState, useTransition } from "react"
import { sortApplicationsByStage } from "../lib/utils"
import { StageIcon } from "./StageIcon"
import { formatJobApplicationStage } from "../lib/formatters"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { updateJobListingApplicationRating, updateJobListingApplicationStage } from "../actions/actions"
import { RatingIcons } from "./RatingIcons"
import { RATING_OPTIONS } from "@/features/organizations/data/constants"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { DataTableFacetedFilter } from "@/components/dataTable/DataTableFacetedFilter"

type Application = Pick<
    typeof jobListingApplicationsTable.$inferSelect,
    "createdAt" | "stage" | "rating" | "jobListingId"
> & {
    coverLetterMarkdown: ReactNode | null
    user: Pick<typeof UserTable.$inferSelect, "id" | "name" | "imageUrl"> & {
        userResumes:
        | (Pick<typeof userResumeTable.$inferSelect, "resumeFileUrl"> & {
            markdownSummary: ReactNode | null
        })
        | null
    }
}

function getColumns(canUpdateRating: boolean, canUpdateStage: boolean): ColumnDef<Application>[] {
    return [
        {
            accessorFn: row => row.user.name,
            header: "Name",
            cell: ({ row }) => {
                const user = row.original.user
                const userIntials = user.name.split(" ").slice(0, 2).map(char => char.charAt(0)).join("").toUpperCase()

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="rounded-full size-6">
                            <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />
                            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
                                {userIntials}
                            </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "stage",
            header: ({ column }) => (
                <SortableColumnHeader title="Stage" column={column} />
            ),
            sortingFn: ({ original: a }, { original: b }) => {
                return sortApplicationsByStage(a.stage, b.stage)
            },
            filterFn: ({ original }, _, value) => {
                return value.includes(original.stage)
            },
            cell: ({ row }) => (
                <StageCell
                    canUpdate={canUpdateStage} stage={row.original.stage}
                    jobListingId={row.original.jobListingId} userId={row.original.user.id}
                />
            )
        },
        {
            accessorKey: "rating",
            header: ({ column }) => (
                <SortableColumnHeader title="Rating" column={column} />
            ),
            filterFn: ({ original }, _, value) => {
                return value.includes(original.rating)
            },
            cell: ({ row }) => (
                <RatingCell
                    canUpdate={canUpdateRating} rating={row.original.rating}
                    jobListingId={row.original.jobListingId} userId={row.original.user.id}
                />
            )
        },
        {
            accessorKey: "createdAt",
            accessorFn: row => row.createdAt,
            header: ({ column }) => (
                <SortableColumnHeader title="Applied On" column={column} />
            ),
            cell: ({ row }) => row.original.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const jobListing = row.original
                const resume = jobListing.user.userResumes

                return <ActionCell coverLetterMarkdown={jobListing.coverLetterMarkdown} resumeMarkdown={resume?.markdownSummary} resumeUrl={resume?.resumeFileUrl} userName={jobListing.user.name} />
            }
        }
    ]
}

export function SkeletonApplicationTable() {
    return <ApplicationTable applications={[]} canUpdateRating={false} canUpdateStage={false} noResultsMessage={<LoadingSpinner className="size-12" />} />
}

export function ApplicationTable({ applications, canUpdateRating, canUpdateStage, noResultsMessage, disableToolbar = false }: { applications: Application[], canUpdateRating: boolean, canUpdateStage: boolean, noResultsMessage?: ReactNode, disableToolbar?: boolean }) {
    return <DataTable data={applications} columns={getColumns(canUpdateRating, canUpdateStage)} noResultsMessage={noResultsMessage} ToolbarComponent={disableToolbar ? DisableToolbar : Toolbar} initialFilters={
        [{ id: "stage", value: applicationStage.filter(stage => stage !== "denied"), }]
    } />
}

function DisableToolbar<T>({ table }: { table: Table<T> }) {
    return <Toolbar table={table} disabled />
}

function Toolbar<T>({ table, disabled }: { table: Table<T>, disabled?: boolean }) {
    const hiddenRows = table.getCoreRowModel().rows.length - table.getRowCount()

    return <div className="flex items-center gap-2">
        {table.getColumn("stage") && (
            <DataTableFacetedFilter column={table.getColumn("stage")} title="Stage" disabled={disabled} options={
                applicationStage.toSorted(sortApplicationsByStage).map(stage => ({ label: <StageDetails stage={stage} />, value: stage, key: stage }))
            } />
        )}
        {table.getColumn("rating") && (
            <DataTableFacetedFilter column={table.getColumn("rating")} title="Rating" disabled={disabled} options={
                RATING_OPTIONS.map((rating, i) => ({ label: <RatingIcons rating={rating} />, value: rating, key: i }))
            } />
        )}
        {hiddenRows > 0 && (
            <div className="text-sm text-muted-foreground ml-2">
                {hiddenRows} {hiddenRows > 1 ? "rows" : "row"}
            </div>
        )}
    </div>
}

function StageCell({ canUpdate, stage, jobListingId, userId, }: { canUpdate: boolean, stage: ApplicationStage, jobListingId: string, userId: string }) {
    const [optimisticStage, setOptimisticStage] = useOptimistic(stage)
    const [isPending, startTransition] = useTransition()

    if (!canUpdate) {
        return <StageDetails stage={optimisticStage} />
    }
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("-ml-3", isPending && "opacity-50")} disabled={isPending}>
                <StageDetails stage={optimisticStage} />
                <ChevronDownIcon />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {applicationStage.toSorted(sortApplicationsByStage).map(sV => (
                <DropdownMenuItem key={sV} onClick={() => {
                    startTransition(async () => {
                        setOptimisticStage(sV)
                        const res = await updateJobListingApplicationStage({ jobListingId, userId }, sV)
                        if (res?.error) {
                            toast.error(res.message)
                        }
                    })
                }}>
                    <StageDetails stage={sV} />
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu >

}

function RatingCell({ canUpdate, rating, jobListingId, userId, }: { canUpdate: boolean, rating: number | null, jobListingId: string, userId: string }) {
    const [optimisticRating, setOptimisticRating] = useOptimistic(rating)
    const [isPending, startTransition] = useTransition()

    if (!canUpdate) {
        return <RatingIcons rating={optimisticRating} />
    }
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("-ml-3", isPending && "opacity-50")} disabled={isPending}>
                <RatingIcons rating={optimisticRating} />
                <ChevronDownIcon />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {RATING_OPTIONS.map(r => (
                <DropdownMenuItem key={rating ?? "none"} onClick={() => {
                    startTransition(async () => {
                        setOptimisticRating(r)
                        const res = await updateJobListingApplicationRating({ jobListingId, userId }, r)
                        if (res?.error) {
                            toast.error(res.message)
                        }
                    })
                }}>
                    <RatingIcons rating={r} className="text-inherit" />
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu >

}

function ActionCell({ coverLetterMarkdown, resumeMarkdown, resumeUrl, userName }: { coverLetterMarkdown: ReactNode | null, resumeMarkdown: ReactNode | null, resumeUrl: string | null | undefined, userName: string }) {
    const [openModal, setOpenModal] = useState<"coverLetter" | "resume" | null>(null)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {resumeUrl != null || resumeMarkdown != null ? (
                    <DropdownMenuItem onClick={() => setOpenModal("resume")}>
                        View Resume
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuLabel className="text-muted-foreground">
                        No Resume
                    </DropdownMenuLabel>
                )}
                {coverLetterMarkdown ? (
                    <DropdownMenuItem onClick={() => setOpenModal("coverLetter")}>
                        View Cover Letter
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuLabel className="text-muted-foreground">
                        No Cover Letter
                    </DropdownMenuLabel>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        {(resumeMarkdown || resumeUrl) && (
            <Dialog open={openModal === "resume"} onOpenChange={(open) => { setOpenModal(open ? "resume" : null) }}>
                <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Resume</DialogTitle>
                        <DialogDescription>
                            {userName}
                        </DialogDescription>
                        {resumeUrl && (<Button asChild className="self-start">
                            <Link href={resumeUrl} target="_blank" rel="nooppener noreferrer">Original Resume</Link>
                        </Button>)}
                        <DialogDescription className="mt-2">
                            This is an AI-generated summary of the applicant's resume
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">{resumeMarkdown}</div>

                </DialogContent>
            </Dialog>
        )}
        {coverLetterMarkdown && (
            <Dialog open={openModal === "coverLetter"} onOpenChange={(open) => { setOpenModal(open ? "coverLetter" : null) }}>
                <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Cover letter</DialogTitle>
                        <DialogDescription>
                            {userName}
                        </DialogDescription>
                        <div className="flex-1 overflow-y-auto">{coverLetterMarkdown}</div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )}
    </>
}

function StageDetails({ stage }: { stage: ApplicationStage }) {
    return <div className="flex gap-2 items-center">
        <StageIcon stage={stage} className="size-4 text-inherit" />
        <div>{formatJobApplicationStage(stage)}</div>
    </div>
}