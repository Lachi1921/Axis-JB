import { ApplicationStage } from "@/drizzle/schema";
import { ComponentPropsWithRef } from "react";
import { CircleHelpIcon, CircleCheckIcon, CircleXIcon, SpeechIcon, HandshakeIcon } from 'lucide-react';

export function StageIcon({ stage, ...props }: { stage: ApplicationStage } & ComponentPropsWithRef<typeof CircleHelpIcon>) {
    const Icon = getIcon(stage)
    return <Icon {...props} />
}

function getIcon(stage: ApplicationStage) {
    switch (stage) {
        case "applied":
            return CircleHelpIcon
        case "interested":
            return CircleCheckIcon
        case "denied":
            return CircleXIcon
        case "interviewed":
            return SpeechIcon
        case "hired":
            return HandshakeIcon
        default:
            throw new Error(`Unknown application stage: ${stage satisfies never}`)
    }
}