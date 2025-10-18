# Markdown Resume

A modern web application for creating and managing professional resumes using Markdown. Built with Next.js, this project provides an intuitive markdown editor with live preview and PDF export capabilities.

## Features

- **Markdown Editor**: Write your resume in Markdown with real-time preview
- **Authentication**: Secure user authentication with NextAuth.js
- **Document Management**: Create, edit, and manage multiple resume documents
- **PDF Export**: Convert your markdown resume to PDF format
- **Modern UI**: Clean and responsive interface built with React and Tailwind CSS
- **Theme Support**: Light and dark mode theme toggle
- **Database Integration**: Persistent storage with Drizzle ORM

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) with App Router
- **Authentication**: NextAuth.js
- **Database**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Yarn, npm, pnpm, or Bun package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
# or
npm install
# or
pnpm install
# or
bun install
```

3. Set up your environment variables (create a `.env.local` file)

### Development

Run the development server:

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/database` - Database schema and migrations
- `/src/lib` - Utility functions and helpers
- `/src/services` - Business logic and service layer
- `/src/types` - TypeScript type definitions

## Deployment

This application can be deployed on:
- [Vercel](https://vercel.com) (recommended for Next.js)
- [Cloudflare Pages](https://pages.cloudflare.com) (configured with `wrangler.jsonc`)

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
