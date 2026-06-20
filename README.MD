
## 8. README GENERATION


# SitePilot AI Website Builder

A multi-tenant website builder powered by Google Gemini AI, GrapesJS visual editing, and automated GitHub/Kubernetes publishing.

## Overview

SitePilot helps teams and small businesses create production-ready websites from natural language prompts. Users can define their business, branding, and content goals, then generate page structure, component content, and editable HTML through AI. The platform supports tenant-based collaboration, asset management, plan limits, versioning, and publishing automation.

## Features

- AI-driven website planning and page generation
- Natural language section creation and editing
- JWT authentication with tenant and role support
- Team invites, member roles, and tenant limits
- Asset upload and storage tracking
- Project versioning and rollback
- GitHub-based publish automation
- Custom deployment pipeline using Docker and Kubernetes
- Visual page editing with GrapesJS
- Billing and plan upgrade workflow

## Architecture

### Frontend
- Next.js 16, React 19, Tailwind CSS
- Client-side login/signup, dashboard, onboarding, editor, and style guide
- API wrapper with authentication and error handling
- AI orchestration through `/api/ai/*` endpoints

### Backend
- Express 5 REST API
- Prisma ORM with PostgreSQL
- JWT auth and tenant-scoped middleware
- AI integration via `@google/generative-ai`
- Asset upload management with multer
- Publish workflow using GitHub API and deployment service

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Express
- Prisma
- PostgreSQL
- JSON Web Tokens
- bcrypt
- Google Gemini
- GrapesJS
- GitHub API / Octokit
- Docker
- Kubernetes
- Multer

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd AI_driven_website/sitebuilder
npm install
```

### Deployment service
```bash
cd depoyment
npm install
```

## Environment Variables

### Backend `.env`
- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_KEY`
- `BACKEND_URL`
- `DEPLOYMENT_SERVER_URL`
- `GITHUB_TOKEN`

### Frontend `.env.local`
- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Running Locally

Start backend:
```bash
cd backend
npm start
```

Start frontend:
```bash
cd AI_driven_website/sitebuilder
npm run dev
```

Start deployment service:
```bash
cd depoyment
npm start
```

## Deployment

1. Configure `DEPLOYMENT_SERVER_URL` to point at the deployment API.
2. Ensure `GITHUB_TOKEN` has repo scope.
3. Publish sites from the editor to push to GitHub and trigger deployment.

## Folder Structure

- sitebuilder — frontend Next.js app
- backend — Express API, Prisma schema, controllers, and middleware
- depoyment — deployment service for Docker/Kubernetes publishing
- prisma — Prisma schema and migrations

## Future Enhancements

- Add live collaboration and WebSocket support
- Replace local asset storage with a cloud CDN
- Add full test coverage and CI pipelines
- Improve publish pipeline persistence and status tracking
- Add richer template marketplace and custom domains
