# Database Schema Details

This document details the database attributes, record types, and their relational mappings for the Zinko Quiz application, including core game loop elements, real-time match state, tracking, social features, and AI features.

---

## 1. Table: `users`
This table stores user profile information synchronized from Clerk authentication via webhooks. It represents hosters and players.

**Attributes & Types:**
- `clerk_id` (Primary Key, String): The unique identifier provided by Clerk Auth.
- `email` (String): The primary email address of the user.
- `first_name` (String, Nullable): User's first name.
- `last_name` (String, Nullable): User's last name.
- `username` (String, Nullable): User's chosen username.
- `avatar_url` (String, Nullable): URL to the user's profile picture.
- `updated_at` (Timestamp): Timestamp of the last profile update.

**Relationships:**
- **One-to-Many** with `quizzes`: A single user can create multiple quizzes. (`users.clerk_id` -> `quizzes.creator_id`)
- **One-to-Many** with `matches`: A user can host multiple matches. (`users.clerk_id` -> `matches.hoster_id`)
- **One-to-Many** with `match_players`: A user can participate in multiple matches as a player. (`users.clerk_id` -> `match_players.user_id`)
- **One-to-One** with `player_stats`: A user has one global leaderboard record. (`users.clerk_id` -> `player_stats.user_id`)
- **One-to-Many** with `ai_interactions`: A user can make multiple AI requests. (`users.clerk_id` -> `ai_interactions.user_id`)
- **One-to-Many** with `friendships`: A user can send or receive many friend requests. (`users.clerk_id` -> `friendships.requester_id` & `addressee_id`)

---

## 2. Table: `friendships` (Social)
Manages the social connections between players.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `requester_id` (Foreign Key, String): References `users.clerk_id`.
- `addressee_id` (Foreign Key, String): References `users.clerk_id`.
- `status` (String): e.g., `pending`, `accepted`, `blocked`.
- `created_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `users`: The requester is one user. (`friendships.requester_id` -> `users.clerk_id`)
- **Many-to-One** with `users`: The addressee is one user. (`friendships.addressee_id` -> `users.clerk_id`)

---

## 3. Table: `quizzes`
This table stores the high-level metadata for a quiz game.

**Attributes & Types:**
- `id` (Primary Key, UUID): Unique identifier for the quiz.
- `title` (String): The title or name of the quiz.
- `creator_id` (Foreign Key, String): References `users.clerk_id`. The user who created the quiz.
- `cover_image` (String, Nullable): URL to the cover image of the quiz.
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `users`: Each quiz is created by exactly one user. (`quizzes.creator_id` -> `users.clerk_id`)
- **One-to-Many** with `questions`: A single quiz contains multiple questions. (`quizzes.id` -> `questions.quiz_id`)
- **One-to-Many** with `matches`: A quiz can be played across multiple hosted matches. (`quizzes.id` -> `matches.quiz_id`)

---

## 4. Table: `questions`
This table stores individual questions that belong to a specific quiz.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `quiz_id` (Foreign Key, UUID): References `quizzes.id`.
- `question_text` (Text)
- `image_url` (String, Nullable)
- `answers` (JSONB): Contains the possible choices (text, color, and boolean if correct).
- `order_index` (Integer): The sequential order of the question.
- `round` (Integer): The round number (1=Easy, 2=Medium, 3=Hard).

**Relationships:**
- **Many-to-One** with `quizzes`: Each question belongs to exactly one quiz. (`questions.quiz_id` -> `quizzes.id`)
- **One-to-Many** with `match_answers`: A single question will be answered many times across matches. (`questions.id` -> `match_answers.question_id`)

---

## 5. Table: `matches`
Represents a live game session hosted by a user.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `quiz_id` (Foreign Key, UUID): References `quizzes.id`.
- `hoster_id` (Foreign Key, String): References `users.clerk_id`. The user hosting the game.
- `status` (String): Current state (`waiting`, `in_progress`, `finished`).
- `current_round` (Integer): The active round (1, 2, or 3).
- `created_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `quizzes`: A match is an instance of one quiz. (`matches.quiz_id` -> `quizzes.id`)
- **Many-to-One** with `users`: A match is hosted by one user. (`matches.hoster_id` -> `users.clerk_id`)
- **One-to-One** with `match_settings`: A match has one configuration block. (`matches.id` -> `match_settings.match_id`)
- **One-to-Many** with `teams`: A match has multiple teams (e.g., Team A and Team B). (`matches.id` -> `teams.match_id`)
- **One-to-Many** with `match_rounds`: A match is broken into multiple rounds. (`matches.id` -> `match_rounds.match_id`)
- **One-to-Many** with `match_players`: A match has multiple players. (`matches.id` -> `match_players.match_id`)

---

## 6. Table: `match_settings`
Configuration applied by the host before a match starts.

**Attributes & Types:**
- `match_id` (Primary Key, Foreign Key, UUID): References `matches.id`.
- `time_limit_seconds` (Integer): Default time per question (e.g., 10s, 20s).
- `allow_skills` (Boolean): Flag to enable/disable player skills in this match.
- `points_multiplier` (Float): Global multiplier for points.

**Relationships:**
- **One-to-One** with `matches`: Belongs exclusively to one match. (`match_settings.match_id` -> `matches.id`)

---

## 7. Table: `match_rounds`
Tracks the independent score and state of each round within a given match.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `match_id` (Foreign Key, UUID): References `matches.id`.
- `round_number` (Integer): 1, 2, or 3.
- `winning_team_id` (Foreign Key, UUID, Nullable): References `teams.id`. Set when round completes.
- `team_a_score` (Integer): Temporary accumulated score for team A in this round.
- `team_b_score` (Integer): Temporary accumulated score for team B in this round.
- `status` (String): `in_progress`, `finished`.

**Relationships:**
- **Many-to-One** with `matches`: Belongs to a single match. (`match_rounds.match_id` -> `matches.id`)
- **Many-to-One** with `teams`: One team wins the round. (`match_rounds.winning_team_id` -> `teams.id`)

---

## 8. Table: `teams`
Represents Team A and Team B in a specific match.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `match_id` (Foreign Key, UUID): References `matches.id`.
- `name` (String): E.g., "Team A" or "Team B".
- `total_score` (Integer): The accumulated score of the team across all rounds.

**Relationships:**
- **Many-to-One** with `matches`: A team belongs to exactly one match. (`teams.match_id` -> `matches.id`)
- **One-to-Many** with `match_players`: A team contains multiple players. (`teams.id` -> `match_players.team_id`)
- **One-to-Many** with `skill_usages`: A team can be the target of multiple skill attacks. (`teams.id` -> `skill_usages.target_team_id`)

---

## 9. Table: `skills`
A lookup table for the available strategic skills in the game.

**Attributes & Types:**
- `id` (Primary Key, String): The unique code (`rabbit`, `frog`, `fox`, `butterfly`).
- `name` (String): Display name.
- `description` (String): Effect description (e.g., "Destroys 50% of Enemy Points").

**Relationships:**
- **One-to-Many** with `match_players`: A single skill type is equipped by many players across matches. (`skills.id` -> `match_players.skill_id`)
- **One-to-Many** with `skill_usages`: A single skill type is executed many times in the action log. (`skills.id` -> `skill_usages.skill_id`)

---

## 10. Table: `match_players`
Maps a specific user to a match, their assigned team, and their chosen skill.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `match_id` (Foreign Key, UUID): References `matches.id`.
- `user_id` (Foreign Key, String): References `users.clerk_id`.
- `team_id` (Foreign Key, UUID): References `teams.id`.
- `skill_id` (Foreign Key, String, Nullable): References `skills.id`.
- `individual_score` (Integer): Points scored by this specific player in the match.

**Relationships:**
- **Many-to-One** with `matches`: The player is in one match session here. (`match_players.match_id` -> `matches.id`)
- **Many-to-One** with `users`: This record maps to one real user account. (`match_players.user_id` -> `users.clerk_id`)
- **Many-to-One** with `teams`: The player is assigned to one team for the match. (`match_players.team_id` -> `teams.id`)
- **Many-to-One** with `skills`: The player equips one skill for the match. (`match_players.skill_id` -> `skills.id`)
- **One-to-Many** with `match_answers`: The player submits many answers during the match. (`match_players.id` -> `match_answers.player_id`)
- **One-to-Many** with `skill_usages`: The player activates their skill one or more times. (`match_players.id` -> `skill_usages.player_id`)

---

## 11. Table: `match_answers` (Realtime Log)
Ledger of every answer submitted by every player. Crucial for resolving ties and distributing points accurately based on speed.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `match_id` (Foreign Key, UUID): References `matches.id`.
- `player_id` (Foreign Key, UUID): References `match_players.id`.
- `question_id` (Foreign Key, UUID): References `questions.id`.
- `selected_answer` (String): The ID or text of the choice chosen.
- `is_correct` (Boolean): True if correct.
- `time_taken_ms` (Integer): Milliseconds it took the player to submit.
- `points_earned` (Integer): How many points were awarded for this action.
- `created_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `matches`: The answer occurs in one match. (`match_answers.match_id` -> `matches.id`)
- **Many-to-One** with `match_players`: The answer was submitted by one specific player session. (`match_answers.player_id` -> `match_players.id`)
- **Many-to-One** with `questions`: The answer relates to one specific question. (`match_answers.question_id` -> `questions.id`)

---

## 12. Table: `skill_usages` (Action Log)
Ledger of when skills are activated to calculate point drains and play visual feedback animations on the frontend.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `match_id` (Foreign Key, UUID): References `matches.id`.
- `player_id` (Foreign Key, UUID): References `match_players.id` (the attacker).
- `skill_id` (Foreign Key, String): References `skills.id`.
- `target_team_id` (Foreign Key, UUID): References `teams.id` (the victim team, or own team for buffs).
- `round_number` (Integer): When it occurred.
- `points_affected` (Integer): The calculated amount of points stolen/destroyed/boosted.
- `created_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `matches`: The action occurs in one match. (`skill_usages.match_id` -> `matches.id`)
- **Many-to-One** with `match_players`: The action was performed by one player. (`skill_usages.player_id` -> `match_players.id`)
- **Many-to-One** with `skills`: A specific skill type was used. (`skill_usages.skill_id` -> `skills.id`)
- **Many-to-One** with `teams`: The action targets one specific team. (`skill_usages.target_team_id` -> `teams.id`)

---

## 13. Table: `player_stats`
Aggregates performance across all matches to populate the global leaderboard.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key, String): References `users.clerk_id`. Unique constraint.
- `total_points` (Integer): Sum of all points scored across all games.
- `games_played` (Integer): Total matches participated in.
- `games_won` (Integer): Total matches won by their team.

**Relationships:**
- **One-to-One** with `users`: Represents the global stats for exactly one user account. (`player_stats.user_id` -> `users.clerk_id`)

---

## 14. Table: `ai_interactions`
Logs AI Assistant usage for generating quizzes or processing data.

**Attributes & Types:**
- `id` (Primary Key, UUID)
- `user_id` (Foreign Key, String): References `users.clerk_id`. Who made the request.
- `prompt` (Text): The user's input/context to the AI.
- `response` (Text): The raw response generated by the AI (e.g., JSON output).
- `created_at` (Timestamp)

**Relationships:**
- **Many-to-One** with `users`: The interaction belongs to the user who requested it. (`ai_interactions.user_id` -> `users.clerk_id`)
