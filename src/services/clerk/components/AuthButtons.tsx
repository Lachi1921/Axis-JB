import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import {
    SignOutButton as ClerkSignOutButton,
    SignUpButton as ClerkSignUpButton,
    SignInButton as ClerkSignInButton,
} from "@clerk/nextjs"

export function SignUpButton({ children = <Button>Sign up</Button>, ...props }: ComponentProps<typeof ClerkSignOutButton>) {
    return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>
}

export function SignInButton({ children = <Button>Sign in</Button>, ...props }: ComponentProps<typeof ClerkSignOutButton>) {
    return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>
}

export function SignOutButton({ children = <Button>Sign Out</Button>, ...props }: ComponentProps<typeof ClerkSignOutButton>) {
    return <ClerkSignOutButton {...props}>{children}</ClerkSignOutButton>
}