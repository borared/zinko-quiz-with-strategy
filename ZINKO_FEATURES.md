# Zinko Features

> A real-time, team-based quiz battle platform where speed, strategy, and teamwork decide the winner.

Zinko lets educators and creators build custom quizzes, host live multiplayer games with a PIN or QR code, and compete in two-team battles with animal-themed skills, scoring bonuses, and optional minigames. Players can join without signing in; creators manage quizzes, discovery, and account settings when signed in.

---

## Table of Contents

1. [Authentication & Accounts](#authentication--accounts)
2. [Quiz Creation & Editing](#quiz-creation--editing)
3. [Dashboard (Your Library)](#dashboard-your-library)
4. [Discovery (Public Quizzes)](#discovery-public-quizzes)
5. [Hosting Games](#hosting-games)
6. [Playing Games](#playing-games)
7. [Question Types & Rounds](#question-types--rounds)
8. [Skills System](#skills-system)
9. [Scoring](#scoring)
10. [Minigames](#minigames)
11. [Lobby & Cosmetics](#lobby--cosmetics)
12. [Notifications](#notifications)
13. [Settings & Privacy](#settings--privacy)
14. [Marketing Pages](#marketing-pages)

---

## Authentication & Accounts

| Feature | Description |
|---------|-------------|
| **Sign in / Sign up** | Clerk-powered auth at `/signin` and `/signup`, including SSO callback support. |
| **Zinko JWT** | After Clerk sign-in, the app exchanges a session token for a Zinko API JWT used for authenticated requests. |
| **Guest players** | Players join live games with a PIN and nickname — no account required. |
| **Username** | Creators can set a unique username shown on Discovery for their public quizzes. |
| **Profile** | Display name and avatar from Clerk; editable via Manage Account. |
| **Account deletion** | Delete Zinko data from Settings; full Clerk account removal via Manage Account. |

---

## Quiz Creation & Editing

**Routes:** `/create-game` (new) · `/create-game/[quizId]` (edit)

### Quiz metadata
- Title (max 15 characters)
- Optional cover image
- Save to create or update via the API

### Three-round structure
Quizzes are organized into three difficulty rounds:

| Round | Label |
|-------|-------|
| 1 | Easy |
| 2 | Medium |
| 3 | Hard |

Each question is tagged with a round. The editor shows per-round counts; hosting requires **at least 6 questions per round**.

### Question editor
- Sidebar list of questions per round
- Add and delete questions with undo (Ctrl/Cmd+Z) for accidental deletes
- Per-question text, optional image, and time limit (20 / 30 / 60 / 100 / 120 seconds)
- Type-specific editors for each question format

### AI quiz generation (Zinko Assistant)
- Generate questions from a text prompt and/or uploaded file (PDF, DOCX, DOC, TXT)
- Powered by Groq AI; results are formatted into the creator for review and editing

### Validation
- Save validates question text, answer counts, and structure per question type before persisting

---

## Dashboard (Your Library)

**Route:** `/dashboard`

| Feature | Description |
|---------|-------------|
| **Quiz grid** | Paginated list of quizzes you own, with infinite scroll. |
| **Cached loading** | Quiz list is cached so refresh does not flash empty state after the first load. |
| **Create** | Floating button opens the game creator for a new quiz. |
| **Host** | Start a live game if the quiz is ready (6+ questions per round, valid content). |
| **Edit** | Open the creator for an existing quiz. |
| **Delete** | Permanently remove a quiz. |
| **Public / Private** | Toggle visibility on Discovery. Cloned quizzes cannot be made public. |
| **Ready badge** | Shows when a quiz meets hosting requirements. |

### Workspace navigation
- **Library** — your quizzes
- **Discover** — browse public quizzes
- **Classes** — coming soon
- **Reports** — coming soon

---

## Discovery (Public Quizzes)

**Route:** `/discovery`

### Browse & search
- Cursor-paginated feed of public quizzes
- Search by title with debounced suggestions
- Day/night hero imagery based on time of day
- Creator username displayed on each card

### Quiz card actions
| State | UI |
|-------|-----|
| **Someone else's quiz** | **View** + **Clone** |
| **Already cloned** | **View** + **Cloned** (orange snackbar: *"You already cloned this quiz."*) |
| **Your own public quiz** | **Yours** badge on cover; **View** only (no clone) |

### Clone rules
- Only **public** quizzes can be cloned
- You cannot clone your own quiz
- One clone per user per source quiz
- Clones are **private**, marked as cloned, and appear in your Dashboard library
- Original creator receives a **Quiz Cloned** notification

### Privacy on Discovery
- Correct answers are stripped from public API responses
- Listing respects creator settings: Discovery opt-in and “show on Discovery” privacy flag

---

## Hosting Games

### Start a session
1. From Dashboard, click **Host** on a ready quiz
2. Backend returns a **6-digit PIN**
3. Host is redirected to `/host/lobby/[pin]`

### Host lobby
| Feature | Description |
|---------|-------------|
| **PIN & QR code** | Share join link with players |
| **Team panels** | Team A and Team B slots (max 4 per team, 8 total) |
| **Live player list** | Real-time updates via Socket.IO |
| **Lobby scenery** | Host picks an owned background; synced to all clients |
| **Halloween ambience** | Optional sound toggle for Halloween scenery |
| **Start Battle** | Requires balanced teams (equal non-zero counts); 3-second countdown |

### Host game session
Phases: **Skill Pick** → **Question** → **Result** → **Leaderboard** → optional **Minigames** → **Finished**

- Host advances questions and can trigger minigames
- Live answer progress from players
- Reconnect support for dropped connections
- Up to **15 shuffled questions** selected at game start from the quiz pool

> Live game state (PIN, players, scores) is held in memory and is not persisted to the database.

---

## Playing Games

### Join flow

| Step | Route | What happens |
|------|-------|----------------|
| Enter PIN | `/join` | Validate 6-digit PIN |
| Nickname & avatar | `/play/[pin]/join-nickname` | Choose display name and avatar |
| Choose team | `/play/[pin]/choose-team` | Join Team A or Team B |
| Lobby | `/play/[pin]/lobby` | Wait for host; chat and reactions |
| Skill pick | `/play/[pin]/choose-skill` | Draft one unique skill per team |
| Game | `/play/[pin]/game` | Answer questions and use skills |
| Results | `/play/[pin]/result` | Final leaderboard |

### Join constraints
- PIN must be valid and game in lobby phase
- Room capped at **8 players** (4 per team)
- Nickname: 1–20 characters (letters, numbers, space, hyphen, underscore)
- One connection per player

### Player lobby social features
- **Lobby chat** (players only): messages up to 200 characters
- **Quick emojis** and full emoji picker
- **Sticker reactions** on emoji messages
- **Avatar emoji burst** on heavy emoji use

### Gameplay
- Answer by question type (multiple choice, drag-order, line matching)
- Per-question timer synced from server
- Activate team skills during the question phase (limited charges)
- Per-question result overlay; final leaderboard at game end

---

## Question Types & Rounds

| Type | Label | Player experience |
|------|-------|-------------------|
| `multiple_choice` | Multiple Choice | Tap one of 2–4 answers |
| `true_false` | True or False | Tap True or False |
| `drag_layers` | Drag & Order | Drag steps into the correct order |
| `line_matching` | Line Matching | Match pairs on left and right |

- Questions belong to **rounds 1–3** in the creator
- Default time limit: **20 seconds** (configurable per question)
- Live games use a shuffled subset (up to 15 questions), not a fixed 5-per-round split

---

## Skills System

Before the match, each player picks **one unique skill** — no duplicates on the same team. Missing picks are auto-assigned at game start.

| Skill | Effect | Charges (per team) |
|-------|--------|-------------------|
| **The Rabbit** | 2× points for 5 seconds after activation | 2 |
| **The Fox** | Smokescreen — blinds enemies for 5 seconds | 2 |
| **The Butterfly** | Removes 2 wrong answers for the team (not on drag-order questions) | 2 |
| **The Frog** | Steals 50% of the fastest correct enemy’s round points | 2 |

Skills are **player-activated** during the question phase, not auto-triggered by fastest finger.

**Skills info page:** `/skills` — descriptions and showcase for each skill.

---

## Scoring

| Outcome | Points |
|---------|--------|
| **Correct** | 1000 base + speed bonus (up to +500 by response time) |
| **Wrong / missed** | 0 (no negative penalty) |
| **Rabbit active** | 2× on qualifying correct answers |
| **Frog active** | Steals 50% from fastest correct enemy |
| **Minigame bonus** | 1.2× multiplier for one round if team wins reward wheel |

---

## Minigames

Host can trigger minigames between rounds from the host game UI.

| Minigame | Description |
|----------|-------------|
| **Vault Breaker** | Teams hold color buttons to crack vault codes; first to 3 vaults wins |
| **Higher / Lower** | Teams set secret numbers; alternating higher/lower guesses |
| **Reward Wheel** | Winning team spins for extra skill charge, +20% next round, or nothing |

---

## Lobby & Cosmetics

| Feature | Description |
|---------|-------------|
| **Avatars** | Catalog of player avatars chosen at join |
| **Lobby sceneries** | Unlockable backgrounds (e.g. City, Halloween) |
| **Scenery gifts** | New users can receive Halloween scenery via notification |
| **Host scenery picker** | Host selects owned background in lobby; synced to all clients |

---

## Notifications

**Route:** `/notifications`

| Type | Trigger | Action |
|------|---------|--------|
| **Quiz Cloned** | Someone clones your public quiz | View cloner info; mark as read |
| **Scenery Gift** | Welcome or seasonal gift | Preview image; **Collect** to unlock |

- Unread count badge on navbar avatar
- Mark one read, mark all read, or clear all
- List is cached per user to avoid refetch on every visit

---

## Settings & Privacy

**Route:** `/settings`

### Sections

| Section | Options |
|---------|---------|
| **Profile** | Clerk avatar and name; Manage Account panel |
| **Plan & billing** | Shows Basic (free) tier; link to `/pricing` |
| **Notifications** | Toggles for scenery gifts, quiz activity, email digest |
| **Privacy & content** | Default quiz visibility; show on Discovery; allow cloning preference |
| **Discovery** | Username, discovery opt-in |
| **Account & legal** | Privacy policy, sign out, delete account |

Saved settings show a bottom-right snackbar: *"Settings Saved."*

**Privacy policy:** `/privacy`

---

## Marketing Pages

| Route | Content |
|-------|---------|
| `/` | Landing — hero, engagement, skills, why Zinko, CTA |
| `/pricing` | Basic / Pro / School tiers (UI showcase) |
| `/skills` | Skill descriptions and visuals |
| `/blog` | Coming soon |
| `/reports` | Coming soon |
| `/classpin` | Coming soon |

---

## Tech Stack (Summary)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), Zustand, Framer Motion, Socket.IO client |
| Backend | Express, Socket.IO, Prisma, PostgreSQL |
| Auth | Clerk + custom JWT |
| AI | Groq (quiz generation) |

---

## Quick User Journeys

```
Creator:  Sign in → Dashboard → Create quiz → Host → Share PIN/QR → Run game

Player:   /join → PIN → Nickname & avatar → Team → Lobby → Skills → Play → Results

Discover: Browse or search → View → Clone (or see Cloned / Yours) → Dashboard library
```

---

*This document reflects features implemented in the Zinko codebase. For setup and development, see [SETUP_GUIDE.md](./SETUP_GUIDE.md) and [README.md](./README.md).*