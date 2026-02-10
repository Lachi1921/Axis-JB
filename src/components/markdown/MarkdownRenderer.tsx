import { cn } from "@/lib/utils"
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { MarkdownClassNames } from "./_MarkdownEditor"

export function MarkdownRenderer({ className, options, ...props }: MDXRemoteProps & { className?: string }) {
    return <div className={cn(MarkdownClassNames, className)}>
        <MDXRemote {...props} options={{
            mdxOptions: {
                remarkPlugins: [
                    remarkGfm,
                    ...options?.mdxOptions?.remarkPlugins ?? []
                ],
                ...options?.mdxOptions,
            }
        }} />

    </div>
}