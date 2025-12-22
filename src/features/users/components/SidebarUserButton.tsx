import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { SidebarUserButtonClient } from "./_SidebarUserButtonClient";

export default function SidebarUserButton() {
    return <Suspense>
        <SidebarUserSuspense />
    </Suspense>
}

async function SidebarUserSuspense() {
    const { userId } = await auth()

    return <SidebarUserButtonClient user={{ email: "Kio@axis.com", imageUrl: "", name: "WDS Axis" }} />
}