import React from "react"

export default function ClerkLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return <div className="flex w-screen h-screen justify-center items-center">
        <div>{children}</div>
    </div>
}