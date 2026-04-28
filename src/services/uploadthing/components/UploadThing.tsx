"use client"

import {
    generateUploadButton,
    generateUploadDropzone,
} from "@uploadthing/react";
import { CustomFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";


export const UploadButtonComponent = generateUploadButton<CustomFileRouter>();
export const UploadDropzoneComponent = generateUploadDropzone<CustomFileRouter>();

export function UploadDropzone({ className, onClientUploadComplete, onUploadError, ...props }: ComponentProps<typeof UploadDropzoneComponent>) {
    return (
        <UploadDropzoneComponent
            className={cn("border-dashed border-2 border-muted rounded-lg flex items-center justify-center ", className)}
            onClientUploadComplete={res => {
                res.forEach(({ serverData }) => toast.success(serverData.message));
                onClientUploadComplete?.(res);
            }}
            onUploadError={(e: UploadThingError<Json>) => {
                toast.error(e?.message);
                onUploadError?.(e);
            }}
            {...props} />
    )
}