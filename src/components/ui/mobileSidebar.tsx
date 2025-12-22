'use client'
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { SidebarTrigger } from "./sidebar";

export function MobileSidebar({ children }: { children: ReactNode }) {
    const isMobile = useIsMobile()
    if (isMobile) {
        return (
            <div className="flex flex-col w-full">
                <div className="p-2 border-b flex items-center gap-2">
                    <SidebarTrigger />
                    <span className="text-xl text-nowrap">Job board</span>
                </div>
                <main className="flex-1">{children}</main>
            </div>
        )
    }
}
