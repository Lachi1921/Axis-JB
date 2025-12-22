import { Button } from "@/components/ui/button";
import { AppSidebarClient } from "@/app/_AppSidebarClient";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LogInIcon } from "lucide-react";
import { SignedIn, SignedOut } from '@/services/clert/components/SignInStatus';
import Link from "next/link";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";

export default function Page() {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row">
            <SidebarTrigger />
            <span className="text-xl text-nowrap">Job board</span>
          </SidebarHeader>
          <SidebarContent>
            <SignedOut>
              <SidebarMenuButton asChild>
                <Link href='/sign-in'>
                  <LogInIcon />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            </SignedOut>
          </SidebarContent>
          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarUserButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1">ABC</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}