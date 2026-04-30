# AXIS - AI-Powered Job Portal Platform

A full-stack AI-powered job portal featuring automated applicant ranking, resume summarization, prompt-based AI job search, and AI-driven cron jobs. Includes secure Clerk authentication, all CRUD operations for job listings and applications, integrated pricing and billing system, and a modern responsive design. Built with Next.js 14, Drizzle ORM, and TypeScript.

## Features

- AI-Powered Resume Matching: AI resume analysis and candidate scoring using Google Gemini AI
- Prompt-Based Job Search: Advanced AI search functionality for finding relevant job opportunities based on your prompt.
- Resume Summarization: Automated resume processing and summarization
- Role-Based Authentication: Secure authentication and authorization using Clerk for employers and job seekers
- Job Listings Management: Job posting and management system for employers
- File Uploads: Secure resume and document uploads using Uploadthing
- Email Notifications: Automated email notifications via Resend
- Background Jobs: Asynchronous processing with Inngest for cron jobs.
- Responsive Design: Modern UI built with Tailwind CSS and ShadCN.
- Database Management: PostgreSQL database with docker and using Drizzle ORM.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind, ShadCN
- Database: PostgreSQL with Drizzle ORM
- AI/ML: Google Gemini API

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd axis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   DB_NAME=axis_db

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

   # AI and External Services
   GEMINI_API_KEY=your_gemini_api_key
   UPLOADTHING_TOKEN=your_uploadthing_token
   RESEND_API_KEY=your_resend_api_key

   # Application
   SERVER_URL=http://localhost:3000
   ```

4. **Set up the database**

   Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d
   ```

   Push the database schema:
   ```bash
   npm run db:push
   ```

   Generate and run migrations if needed:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Usage

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**

   Navigate to `http://localhost:3000`

3. **Access Drizzle Studio** (optional)

   View and manage your database:
   ```bash
   npm run db:studio
   ```

## Scripts

- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run inngest` - Start Inngest development server
- `npm run email` - Start email development server
