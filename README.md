# ⚔️ Brain Battle Arena

> A real-time multiplayer educational battle game where speed, strategy, and teamwork determine victory.

---

## 🎮 Overview

Brain Battle Arena is a competitive team-based quiz game that combines:

- ⚡ Fast response gameplay
- 🧠 Knowledge-based challenges
- 🎯 Strategic skill usage
- 👥 Team coordination
- 🔥 High-stakes score mechanics

Two teams compete across multiple rounds by answering questions as quickly and accurately as possible while using unique abilities to gain an advantage.

---

# 🚀 Features

## 👥 Team-Based Multiplayer
- 2 Teams:
  - Team A
  - Team B
- 4 players per team

---

## 🧩 Draft Phase System

Before the match starts, teams enter a **Draft Phase**.

Each player selects exactly **ONE unique skill**.

⚠️ Duplicate skills are not allowed within the same team.

### Available Skills

| Skill | Effect |
|---|---|
| 🛡️ Guardian | Protects team from enemy sabotage effects |
| ⚔️ Sapper | Reduces enemy score |
| 📈 Catalyst | Boosts team score by +20% |
| 💰 Trickster | Steals points from enemy team |

---

# ⚡ Fastest Finger Mechanic

All players answer simultaneously.

However:

✅ Only the **FASTEST CORRECT PLAYER** activates their skill for the round.

This creates:
- High-speed competition
- Tactical role assignment
- Reward for both speed and accuracy

---

# 🧮 Scoring System

## Base Score Formula

```math
TeamTotal = Σ(Correct Answers)
```

### Rules
- Correct Answer → Adds points
- Wrong Answer → 0 points
- No negative penalty for incorrect answers

---

# ⚔️ Skill Activation System

Only **ONE skill** can activate each round.

## 🛡️ Guardian
Cancels enemy sabotage effects.

---

## ⚔️ Sapper
Subtracts a fixed amount or percentage from the enemy team score.

---

## 📈 Catalyst
Boosts own team score.

```math
NewScore = Score × 1.20
```

---

## 💰 Trickster
Steals points from the enemy team.

Example:
- Enemy loses X points
- Your team gains X points

---

# 🔥 2X Point Round

Special rounds can be marked as **2X Point Rounds**.

## Effects
- All points earned are doubled
- Skills still apply normally
- Creates dramatic momentum shifts

### Formula

```math
FinalScore = BaseScore × 2
```

---

# 🔄 Match Flow

```text
Initialize Match
    ↓
Draft Phase
    ↓
Lock Skills
    ↓
Start Round
    ↓
Distribute Questions
    ↓
Collect Answers
    ↓
Evaluate Answers
    ↓
Track Response Time
    ↓
Identify Fastest Correct Player
    ↓
Activate Skill
    ↓
Apply Score Modifiers
    ↓
Apply 2X Point Modifier (optional)
    ↓
Update Leaderboard
    ↓
Repeat Until Match Ends
    ↓
Declare Winner
```

---

# 🏗️ System Modules

## 🎯 Draft Phase Module
- Skill selection
- Skill locking
- Team setup

---

## ⚡ Round Execution Module
- Question distribution
- Answer collection
- Response time tracking
- Skill triggering

---

## 🧮 Scoring Module
- Point calculation
- Score modifiers
- Leaderboard updates

---

## ⚔️ Skill Engine
Handles:
- Guardian
- Sapper
- Catalyst
- Trickster

---

## 🔥 2X Point Module
Handles special high-value rounds.

---

# 📦 Data Entities

## Player
```ts
Player {
  playerId
  name
  teamId
  skill
  score
}
```

## Team
```ts
Team {
  teamId
  teamName
  totalScore
  members[]
}
```

## Match
```ts
Match {
  matchId
  teams[]
  rounds[]
  status
}
```

## Round
```ts
Round {
  roundId
  questions[]
  answers[]
  fastestPlayer
  skillTriggered
}
```

## Skill
```ts
Skill {
  type
  ownerPlayerId
  isActivated
}
```

---

# 📜 Business Rules

- Each player has exactly 1 skill
- Skills are locked after drafting
- No duplicate skills within a team
- Only fastest correct player activates skill
- Wrong answers give 0 points
- Only one skill activates per round
- 2X rounds are optional

---

# 🛠️ Suggested Tech Stack

## Frontend
- React / Next.js
- TailwindCSS
- Socket.IO Client

## Backend
- Node.js
- Express.js
- Socket.IO

## Database
- MongoDB / PostgreSQL

## Real-Time Engine
- WebSockets
- Redis (optional)

---

# 📡 Real-Time Features

- Live score updates
- Instant skill activation
- Real-time synchronization
- Response time tracking
- Multiplayer support

---

# 🎯 System Goals

The game is designed to balance:

- ⚡ Speed
- 🧠 Knowledge
- 🎮 Strategy
- 👥 Teamwork
- 🔥 Competitive gameplay

---

# 🏆 Winning Condition

The team with the highest total score at the end of the match wins.

---

# 📌 Future Improvements

- Ranked matchmaking
- Tournament system
- Spectator mode
- AI-generated questions
- Voice chat
- Replay system
- Mobile support
- Seasonal rankings

---

# 📄 License

MIT License

---

# ❤️ Inspiration

Inspired by:
- Competitive esports
- Educational quiz platforms
- MOBA-style team mechanics
- Real-time multiplayer games
