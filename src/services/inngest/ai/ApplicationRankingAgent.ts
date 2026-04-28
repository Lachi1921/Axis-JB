import { updateJobListingApplication } from "@/features/jobListingsApplication/db/jobListingApplications"
import { createAgent, createTool, gemini } from "@inngest/agent-kit"
import z from "zod"

const saveApplicantRating = createTool({
    name: "save-applicant-rating",
    description: "Saves the applicant rating for a specific job listing to the database.",
    parameters: z.object({
        rating: z.number().int().min(1).max(5),
        jobListingId: z.string(),
        userId: z.string(),
    }),
    handler: async ({ rating, jobListingId, userId }) => {
        await updateJobListingApplication({ jobListingId, userId }, { rating })

        return "Successfully saved applicant rating score to the database."
    }
})

export const ApplicationRankingAgent = createAgent(
    {
        name: "Applicant Ranking Agent",
        description: "Agent that ranks job applicants based on their resume and cover letter.",
        system: "You are an expert at ranking job applicants for specific jobs based on their resume and cover letter. You will be provided with a user prompt that includes a user's id, resume and cover letter as well as the job listing they are applying for in JSON. Your task is to compare the job listing with the applicant's resume and cover letter and provide a rating for the applicant on how well they fit that specific job listing. The rating should be a number between 1 and 5, where 5 is the highest rating indicating a perfect or near perfect match. A rating 3 should be used for applicants that barely meet the requirements of the job listing, while a rating of 1 should be used for applicants that do not meet the requirements at all. You should save this user rating in the database and not return any output",
        tools: [saveApplicantRating],
        model: gemini({
            model: "gemini-2.0-flash",
            apiKey: process.env.GEMINI_API_KEY,
        })
    }

)       