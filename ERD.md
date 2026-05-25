# Entity Relationship Diagram (ERD)

This is the extended Entity Relationship Diagram for the Zinko Quiz application, including future features like multiplayer matches, teams, player skills, leaderboards, game state logs, and AI assistant tracking.

```mermaid
erDiagram
    %% Core Entities
    USERS ||--o{ QUIZZES : "creates"
    QUIZZES ||--|{ QUESTIONS : "contains"
    
    %% Match & Multiplayer Entities
    USERS ||--o{ MATCHES : "hosts"
    QUIZZES ||--o{ MATCHES : "played in"
    MATCHES ||--o| MATCH_SETTINGS : "configures"
    MATCHES ||--|{ MATCH_ROUNDS : "has"
    MATCHES ||--|{ TEAMS : "has"
    MATCHES ||--|{ MATCH_PLAYERS : "has"
    TEAMS ||--|{ MATCH_PLAYERS : "contains"
    USERS ||--o{ MATCH_PLAYERS : "plays as"
    SKILLS ||--o{ MATCH_PLAYERS : "used by"
    
    %% Game State & Actions
    MATCH_PLAYERS ||--o{ MATCH_ANSWERS : "submits"
    QUESTIONS ||--o{ MATCH_ANSWERS : "answered in"
    MATCH_PLAYERS ||--o{ SKILL_USAGES : "activates"
    TEAMS ||--o{ SKILL_USAGES : "targeted by"
    
    %% Progress & Tracking
    USERS ||--o| PLAYER_STATS : "has"
    USERS ||--o{ AI_INTERACTIONS : "requests"
    
    %% Social
    USERS ||--o{ FRIENDSHIPS : "initiates/receives"

    USERS {
        string clerk_id PK
        string email
        string first_name
        string last_name
        string username
        string avatar_url
        timestamp updated_at
    }

    FRIENDSHIPS {
        uuid id PK
        string requester_id FK "users.clerk_id"
        string addressee_id FK "users.clerk_id"
        string status "pending, accepted, blocked"
        timestamp created_at
    }

    QUIZZES {
        uuid id PK
        string title
        string creator_id FK "users.clerk_id"
        string cover_image
        timestamp created_at
        timestamp updated_at
    }

    QUESTIONS {
        uuid id PK
        uuid quiz_id FK "quizzes.id"
        text question_text
        string image_url
        jsonb answers
        int order_index
        int round
    }

    MATCHES {
        uuid id PK
        uuid quiz_id FK "quizzes.id"
        string hoster_id FK "users.clerk_id"
        string status "waiting, in_progress, finished"
        int current_round "1, 2, 3"
        timestamp created_at
    }

    MATCH_SETTINGS {
        uuid match_id PK, FK "matches.id"
        int time_limit_seconds
        boolean allow_skills
        float points_multiplier
    }

    MATCH_ROUNDS {
        uuid id PK
        uuid match_id FK "matches.id"
        int round_number "1, 2, 3"
        uuid winning_team_id FK "teams.id"
        int team_a_score
        int team_b_score
        string status "in_progress, finished"
    }

    TEAMS {
        uuid id PK
        uuid match_id FK "matches.id"
        string name "Team A / Team B"
        int total_score
    }

    SKILLS {
        string id PK "rabbit, frog, fox, butterfly"
        string name
        string description
    }

    MATCH_PLAYERS {
        uuid id PK
        uuid match_id FK "matches.id"
        string user_id FK "users.clerk_id"
        uuid team_id FK "teams.id"
        string skill_id FK "skills.id"
        int individual_score
    }

    MATCH_ANSWERS {
        uuid id PK
        uuid match_id FK "matches.id"
        uuid player_id FK "match_players.id"
        uuid question_id FK "questions.id"
        string selected_answer "A, B, C, D"
        boolean is_correct
        int time_taken_ms
        int points_earned
        timestamp created_at
    }

    SKILL_USAGES {
        uuid id PK
        uuid match_id FK "matches.id"
        uuid player_id FK "match_players.id"
        string skill_id FK "skills.id"
        uuid target_team_id FK "teams.id"
        int round_number
        int points_affected
        timestamp created_at
    }

    PLAYER_STATS {
        uuid id PK
        string user_id FK "users.clerk_id"
        int total_points
        int games_played
        int games_won
    }

    AI_INTERACTIONS {
        uuid id PK
        string user_id FK "users.clerk_id"
        text prompt
        text response
        timestamp created_at
    }
```
