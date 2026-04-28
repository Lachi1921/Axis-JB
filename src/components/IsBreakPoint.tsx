"use client";

import { useEffect, useState } from "react";

export function IsBreakPoint({
    breakpoint,
    otherwise,
    children,

}: {
    breakpoint: string;
    otherwise?: React.ReactNode;
    children: React.ReactNode;
}) {
    const isBreakPoint = useIsBreakPoint(breakpoint);

    return isBreakPoint ? children : otherwise;
}

function useIsBreakPoint(breakpoint: string) {
    const [isBreakPoint, setIsBreakPoint] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const media = window.matchMedia(`${breakpoint}`);
        media.addEventListener("change", e => {
            setIsBreakPoint(e.matches);
        }, { signal: controller.signal });

        setIsBreakPoint(media.matches);

        return () => controller.abort();
    }, [breakpoint])

    return isBreakPoint;
}