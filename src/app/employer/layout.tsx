import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel } from "@/components/ui/sidebar";
import SidebarOrgannizationButton from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { HomeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default function EmployerLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <LayoutSuspense>{children}</LayoutSuspense>
            </Suspense>
            <h1>Employer Layout</h1>
            <p>{children}</p>
        </>
    )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
    console.log(children)
    const { orgId } = await getCurrentOrganization()
    if (orgId == null) return redirect("/organizations/select")

    return <AppSidebar
        content={
            <>
                <SidebarGroup>
                    <SidebarGroupLabel>Job listings</SidebarGroupLabel>
                    <SidebarGroupAction asChild>
                        <Link href="/employer/job-listings/new">
                            <PlusIcon /> <span className="sr-only">Add job listing</span>
                        </Link>
                    </SidebarGroupAction>
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