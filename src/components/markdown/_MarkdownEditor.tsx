"use client"
import { useIsDarkMode } from "@/hooks/userDarkMode";
import { cn } from "@/lib/utils";
import { BlockTypeSelect, BoldItalicUnderlineToggles, headingsPlugin, InsertTable, InsertThematicBreak, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, MDXEditorMethods, MDXEditorProps, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin } from "@mdxeditor/editor"
import { Ref } from "react";
import { MarkdownClassNames } from "./MarkdownRenderer";


export default function InternalMarkdownEditor({ ref, className, ...props }: MDXEditorProps & { ref: Ref<MDXEditorMethods> }) {
    const isDarkMode = useIsDarkMode()

    return <MDXEditor {...props} ref={ref} className={cn(MarkdownClassNames, isDarkMode && "dark-theme", className)} suppressHtmlProcessing plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
            toolbarContents: () => (
                <>
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                    <InsertThematicBreak />
                    <InsertTable />
                </>
            )
        }),
    ]} />
}