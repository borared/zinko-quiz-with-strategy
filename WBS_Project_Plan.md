# Zinko: Quiz with Strategy - Work Breakdown Structure (WBS)

## Project Overview
**Zinko** is a real-time multiplayer interactive quiz game with strategic elements like team battles, unique skills, and avatars. The system is built with a React/Vite frontend and a Node.js/Express backend, utilizing Socket.io for real-time synchronization, Supabase for data storage, Clerk for user authentication, and Groq API for AI-assisted quiz generation.

Since the team consists of 3 members, the Work Breakdown Structure (WBS) is divided fairly to ensure each member handles a distinct layer of the tech stack while contributing equally to the final product.

---

## 1. Member 1: Lead Frontend Developer & UI/UX Designer
**Primary Focus:** Client-side architecture, visual design, animations, and user experience.

### 1.1 Project Setup & Foundation
- Initialize Vite + React project structure.
- Configure Tailwind CSS, custom fonts, and global CSS utilities (e.g., 3D perspectives).
- Build reusable UI components (Buttons, Inputs, Modals).

### 1.2 Dashboard & Static Pages
- Develop the Landing Page and Pricing Panels.
- Build the User Dashboard and My Quizzes views.
- Implement the Game Creator interface (forms, layout).

### 1.3 Interactive Game Interfaces
- **Player Journey:** Build `EnterPinSection`, `ChooseTeamSection`, and `AvatarSelector`.
- **Lobby UI:** Develop `HostLobby` and `PlayerLobby` screens with responsive flexbox/grid layouts.
- **Game UI:** Build the main `HostGame` and `PlayerController` screens, including question display and result screens.

### 1.4 Animations & Polish
- Integrate `framer-motion` for complex animations (e.g., error shaking, bouncing transitions).
- Implement background logic (e.g., displaying random battle backgrounds like `city.jpg` and `board.png`).

---

## 2. Member 2: Lead Backend Developer & Real-time Architect
**Primary Focus:** Server architecture, database management, and Socket.io real-time communication.

### 2.1 Backend Server Setup
- Initialize Node.js + Express backend application.
- Configure middleware (CORS, body parsing, request logging).
- Set up routing architecture and structure (`index.js`).

### 2.2 Database Integration (Supabase)
- Design the database schema (Tables for Quizzes, Questions, Users).
- Implement backend data models and controllers (`avatarController.js`, quiz controllers).
- Create REST API endpoints for fetching and storing quiz data (`routes/quiz.js`, `routes/avatar.js`).

### 2.3 Real-Time Game Engine (Socket.io)
- Set up the Socket.io server and connection lifecycle.
- Develop the in-memory game state manager (`socketHandler.js`).
- **Lobby Management:** Handle `host:initialize`, `player:join`, and real-time player list broadcasts.
- **Room State:** Sync shared data like randomized backgrounds across all clients.

---

## 3. Member 3: Full-stack Integrator & Game Logic Specialist
**Primary Focus:** Authentication, AI integration, game mechanics, and end-to-end communication.

### 3.1 Authentication & Security (Clerk)
- Integrate Clerk authentication into the React frontend.
- Implement Clerk backend middleware (`@clerk/express`) to secure private API endpoints.
- Manage SSO callbacks and session state.

### 3.2 AI Quiz Generation Integration
- Integrate Groq SDK (`routes/ai.js`) for prompt-based question generation.
- Implement file parsing middleware (`multer`, `pdf-parse`, `officeparser`) to allow users to generate quizzes from uploaded documents.

### 3.3 Core Game Loop Mechanics
- Develop the `SocketContext` on the frontend to bridge React with Socket.io.
- **Game Phases:** Program the logic for transitioning between `LOBBY`, `SKILL_PICK`, `QUESTION`, `RESULT`, and `FINISHED` phases.
- **Mechanics:** Implement skill selection logic, answer submission tracking, score calculation, and the timer system.
- Ensure end-to-end stability during edge cases (e.g., player disconnects/reconnects).

---

## Timeline & Integration Strategy

- **Phase 1 (Foundation):** 
  - Member 1 sets up React; Member 2 sets up Express/Supabase; Member 3 configures Clerk Auth.
- **Phase 2 (Core Features):** 
  - Member 1 builds Game Creation UI; Member 2 builds Quiz API; Member 3 implements AI generation.
- **Phase 3 (Multiplayer Loop):** 
  - Member 1 builds Lobbies/Game UI; Member 2 builds Socket room handlers; Member 3 writes the game state logic and timer.
- **Phase 4 (Testing & Polish):** 
  - All 3 members collaborate on debugging, testing edge cases (e.g., invalid PINs, late joins), and final deployment.
