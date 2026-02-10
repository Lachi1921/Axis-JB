import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { BrainCogIcon, HomeIcon, LayoutDashboard, LogIn } from "lucide-react";
import { ReactNode } from "react";

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
    return <AppSidebar
        content={
            <SidebarNavMenuGroup className="mt-auto" items={[
                { href: "/", icon: <HomeIcon />, label: "Home" },
                { href: "ai-search/", icon: <BrainCogIcon />, label: "AI search" },
                { href: "/employer", icon: <LayoutDashboard />, label: "Employer", authStatus: "signedIn" },
                { href: "/sign-in", icon: <LogIn />, label: "Sign in", authStatus: "signedOut" },
            ]} />
        }
        footerButton={
            <SidebarUserButton />
        }>

        <main className="flex-1">{children}</main>
    </AppSidebar>
}