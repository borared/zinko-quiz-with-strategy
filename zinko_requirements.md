# Zinko Quiz with Strategy - Requirements Document

## HCI / UX

**1. Who is the target user?**
The target users are students, teachers, trivia enthusiasts, and groups of friends looking for a fun, interactive, and strategic real-time multiplayer quiz experience.

**2. What pain point does this prototype solve?**
Traditional quizzes and educational games can sometimes feel repetitive or purely rely on rote memorization. Zinko solves this by introducing team-based competition and "skills" (power-ups), adding a layer of strategy and unpredictability. This keeps players engaged and allows them to contribute to their team's success in ways beyond just answering questions correctly.

**3. What user story does this flow support?**
*As a host (e.g., teacher or friend)*, I want to create custom quizzes and host real-time multiplayer matches so that participants can join, compete, and learn in an engaging environment.
*As a player*, I want to join a match, pick a unique skill (e.g., rabbit, frog, fox), answer questions quickly, and strategically use my skill to boost my team's score or affect the opposing team.

**4. What screens or interface parts are included?**
- Login and Registration page (Clerk Auth)
- Home / Dashboard page (View stats, past games, and friends)
- Quiz Creator / Editor page (Add/edit questions and answers)
- Match Lobby / Waiting Room (Players join, select teams and skills)
- Game / Match Interface (Real-time question display, answer selection, skill activation, timer)
- Match Results / Leaderboard page (Round winners, final scores, MVP)
- Player Profile & Social page (Manage friendships, view player stats)

**5. What navigation and feedback must be clear?**
Users should be able to smoothly transition from the dashboard to creating a quiz or joining a lobby. During a live match, real-time feedback is critical: the system must clearly show the countdown timer, immediate feedback on whether an answer was correct, real-time team score updates, visual cues when a skill is activated, and clear transitions between rounds.

## Software Engineering

**6. What are the main functional requirements?**
- User registration and authentication.
- Create, read, update, and delete (CRUD) custom quizzes and questions.
- Host real-time multiplayer matches with customizable settings (time limits, skill allowances).
- Allow players to join via code/link, select a team (Team A or B), and equip a skill.
- Synchronize real-time gameplay, tracking answers, time taken, and calculating points.
- Process skill usages and apply their effects to team scores in real-time.
- Track progression across multiple match rounds to determine a winning team.
- Manage social features like sending, accepting, and blocking friend requests.
- Integrate AI interactions for generating questions or quiz content.

**7. What non-functional requirements matter?**
- **Low Latency & Real-time Sync:** The game relies on WebSockets for instant updates; latency must be minimized for fairness in answering.
- **Scalability:** Must handle multiple concurrent users and high-frequency events (answers, skill triggers) within a match.
- **Data Consistency:** Ensuring scores and skill modifiers are calculated accurately across all clients.
- **Cross-platform Usability:** Responsive UI that works seamlessly on both desktop (for hosts) and mobile devices (for players).

## Backend

**8. What main API actions or resources may be needed?**
- Authentication webhooks (syncing users from Clerk).
- REST API for Quiz and Question management.
- REST API for Social (Friendships) and Player Stats retrieval.
- WebSocket / Socket.io event handlers for Matchmaking (join, leave, ready).
- WebSocket handlers for Game State (start round, submit answer, activate skill, end round).
- AI prompt processing endpoints.

**9. Does this flow require authentication or protected routes?**
Yes. Authentication is required to create quizzes, host matches, save personal game statistics, interact with friends, and maintain a consistent player identity across games.

## Database

**10. What main data entities are involved?**
- Users & Friendships
- Quizzes & Questions
- Matches, Match Settings, Match Rounds, and Teams
- Match Players, Match Answers, Skills, and Skill Usages
- Player Stats & AI Interactions

**11. What relationships or keys might matter?**
- A `User` can create many `Quizzes` and host many `Matches`.
- A `Match` contains multiple `Match Rounds`, `Teams`, and `Match Players`.
- `Match Players` belong to `Teams`, are linked to a `User`, and equip a `Skill`.
- `Match Answers` and `Skill Usages` are tied to specific `Match Players`, tracking what happened during a specific `Match`.

**12. Does the system need roles, permissions, or admin control?**
Yes. The system naturally creates roles based on the context of a match:
- **Host / Creator:** Has permission to edit their own quizzes, start the match, move to the next round, and end the game.
- **Player:** Can join a match, submit answers, and use skills, but cannot control the global flow of the match.
- **System Admin:** (Optional/Implied) To manage global skills configurations, moderate users, and monitor system health.
