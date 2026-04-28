import { db } from "@/drizzle/db"
import { inngest } from "../client"
import { eq } from "drizzle-orm"
import { env } from "@/data/env/server"
import { updateUserResume } from "@/features/users/db/userResumes"
import { userResumeTable } from '@/drizzle/schema';

export const createAiSummaryOfUploadedResume = inngest.createFunction(
    {
        id: "create-ai-summary-of-uploaded-resume",
        name: "Create AI Summary of Uploaded Resume",
    },
    {
        event: "app/resume.uploaded",
    },
    async ({ step, event }) => {
        const { id: userId } = event.user

        const userResume = await step.run("get-user-resume", async () => {
            return await db.query.userResumeTable.findFirst({
                where: eq(userResumeTable.userId, userId),
                columns: { resumeFileUrl: true },
            })
        })

        if (userResume == null) return


        const result = await step.ai.infer("create-ai-summary", {
            model: step.ai.models.gemini({
                model: "gemini-2.5-flash",
                apiKey: env.GEMINI_API_KEY,
            }),
            body: {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "application/pdf",
                                    data: await convertPdfToBase64(userResume.resumeFileUrl),
                                },
                            },
                            {
                                text: "Summarize the following resume and extract all key skills, experience, and qualifications. The summary should include all the information that a hiring manager would need to know about the candidate in order to determine if they are a good fit for a job. This summary should be formatted as markdown only (no codeblocks). Do not return any other text. If the file does not look like a resume return the text 'N/A'.",
                            },
                        ],
                    },
                ],
            },
        })

        await step.run("save-ai-summary", async () => {
            const message = result.candidates?.[0]?.content?.parts?.[0]
            if (!message || !("text" in message)) return

            await updateUserResume(userId, { aiSummary: message.text })
        })
    }
)

async function convertPdfToBase64(pdfUrl: string) {
    const res = await fetch(pdfUrl)
    const arrayBuffer = res.arrayBuffer()
    const base64 = Buffer.from(await arrayBuffer).toString("base64")
    console.log("Base64 string:", base64)
    return base64
}