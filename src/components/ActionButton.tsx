"use client"
import { ComponentPropsWithRef, useTransition } from "react"
import { Button } from "./ui/button"
import { ReactNode } from "react"
import { toast } from "sonner"
import { LoadingSwap } from "./LoadingSwap"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

export function ActionButton({
    action,
    requireAreYouSure = false,
    areYouSureDescription = "This action cannot be reversed.",
    ...props
}: Omit<ComponentPropsWithRef<typeof Button>, "onClick"> & {
    action: () => Promise<{ error: boolean, message?: string }>,
    requireAreYouSure?: boolean,
    areYouSureDescription?: ReactNode
}) {
    const [isLoading, startLoading] = useTransition()

    function performAction() {
        startLoading(async () => {
            const data = await action()
            if (data.error) {
                toast(data.message || "An error occurred while performing the action.")
            }

        })
    }

    if (requireAreYouSure) {
        return <AlertDialog open={isLoading ? true : undefined}>
            <AlertDialogTrigger asChild>
                <Button {...props} />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>{areYouSureDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={isLoading} onClick={performAction}>
                        <LoadingSwap isLoading={isLoading}>
                            Confirm
                        </LoadingSwap>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
    }

    return <Button {...props} onClick={performAction} disabled={isLoading}>
        <LoadingSwap isLoading={isLoading} className="inline-flex items-center gap-2">
            {props.children}
        </LoadingSwap>
    </Button>

}