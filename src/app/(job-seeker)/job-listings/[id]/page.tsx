import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function JobListingPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<Record<string, string | string[]>> }) {
    return <ResizablePanelGroup autoSave="job-board-pannel" orientation="horizontal">
        <ResizablePanel>

        </ResizablePanel>
    </ResizablePanelGroup>
} 