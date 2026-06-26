# Project Hosting & Deployment Report

## 1. Project Title
**Zinko: Quiz with Strategy**

## 2. Team Members
*Please replace the placeholders with actual team member names:*
- **[Member 1 Name]** - Lead Frontend Developer & UI/UX Designer
- **[Member 2 Name]** - Lead Backend Developer & Real-time Architect
- **[Member 3 Name]** - Full-stack Integrator & Game Logic Specialist

## 3. Selected Hosting Platforms
To effectively support our real-time, full-stack architecture, we have chosen a multi-platform hosting approach:
- **Frontend App (Next.js/React)**: Vercel
- **Backend Server (Node.js/Socket.io)**: Render
- **Database**: Supabase (PostgreSQL)

## 4. Justification

### Frontend: Vercel
- **Native Next.js Support**: Vercel is the creator of Next.js, ensuring zero-configuration deployments, optimal performance, and first-class support for features like Edge routing and Server-Side Rendering (SSR).
- **Global CDN & CI/CD**: Automatic deployments on every Git push and a global edge network ensure fast load times for players globally.

### Backend: Render
- **Persistent WebSocket Support**: Unlike standard serverless functions, Render provides persistent Web Services which are absolutely critical for maintaining long-lived **Socket.io** connections required for our real-time game engine.
- **Developer Experience**: Render automatically builds and deploys Node.js applications from GitHub and handles port binding effortlessly, making it highly reliable for Node/Express backends.

### Database: Supabase
- **Relational Integrity & Pooling**: Supabase provides a powerful PostgreSQL foundation with built-in connection pooling (PgBouncer/Supavisor), preventing our frontend and real-time backend from exhausting database connections.
- **Ecosystem**: Easily integrates with our existing stack and authentication flow (Clerk).

## 5. Deployment Plan

The deployment will be executed in a staged pipeline to ensure system stability and proper environment configuration:

### Phase 1: Environment & Repository Preparation
- Ensure the `next-frontend` and `backend` codebases are separated or properly configured in a monorepo format on GitHub.
- Gather all production API keys (Clerk Publishable/Secret Keys, Supabase URL/Service Role Key, Groq API Key).

### Phase 2: Database Initialization (Supabase)
- Create the production project on Supabase.
- Run SQL migration scripts to establish the production schema (Users, Quizzes, Questions).
- Retrieve the pooled transaction `DATABASE_URL` for the backend.

### Phase 3: Backend Deployment (Render)
- Connect the backend repository to a Render Web Service.
- Set up the environment variables (`PORT`, `FRONTEND_URL`, `SUPABASE_URL`, `GROQ_API_KEY`, etc.).
- Define the build command (`npm install`) and start command (`npm start` or `node index.js`).
- Deploy and verify the health check endpoint and Socket.io readiness.

### Phase 4: Frontend Deployment (Vercel)
- Import the Next.js project into Vercel from GitHub.
- Add all required `NEXT_PUBLIC_` environment variables (e.g., pointing the socket client to the new Render backend URL).
- Deploy the application and monitor the Vercel build logs.

### Phase 5: End-to-End Validation
- Perform a live test of the entire game loop in production: creating a quiz, hosting a lobby, joining via PIN, real-time skill selection, and completing the game.
- Monitor Render logs for any WebSocket disconnects or memory leaks during gameplay.
