# Zinko Quiz - System Diagrams

Based on your request, I've created the diagrams in Mermaid notation so they render directly in Markdown. 

Since your attached image is a **Swimlane Activity Diagram** (showing the step-by-step flow), I have completed that flow for both the Host and Player. I have also included a standard **Use Case Diagram** to show the distinct actions each actor can perform in the system.

## 1. Use Case Diagram

This diagram shows what each actor (Host vs Player) can do within the Zinko system.

```mermaid
flowchart LR
    %% Actors
    Host([User: Host])
    Player([User: Player])
    
    %% Use Cases
    subgraph "Zinko Quiz System"
        direction TB
        Auth(Register / Login)
        ManageQuiz(Create & Manage Quiz)
        HostMatch(Host a Match)
        ControlMatch(Start / End Rounds)
        
        JoinMatch(Join a Match)
        PickTeam(Select Team & Skill)
        Answer(Answer Questions)
        UseSkill(Activate Skill)
        ViewLeaderboard(View Match Results)
    end
    
    %% Host Relationships
    Host --> Auth
    Host --> ManageQuiz
    Host --> HostMatch
    Host --> ControlMatch
    
    %% Player Relationships
    Player --> Auth
    Player --> JoinMatch
    Player --> PickTeam
    Player --> Answer
    Player --> UseSkill
    Player --> ViewLeaderboard
```

## 2. Swimlane Activity Diagram (Based on your image)

This flowchart expands on the diagram you started in the image, showing the sequential flow and interactions between the Host and the Player during a game.

```mermaid
flowchart TD
    subgraph Host ["User(Host)"]
        H_Start((Start)) --> H_Login[Register/Login]
        H_Login --> H_Valid{Valid?}
        H_Valid -- No --> H_Login
        H_Valid -- Yes --> H_Dashboard[Go to Dashboard]
        H_Dashboard --> H_CreateQuiz[Create Quiz]
        H_CreateQuiz --> H_HostMatch[Host Match Lobby]
        
        H_HostMatch --> H_WaitPlayers[Wait for Players]
        H_WaitPlayers --> H_StartRound[Start Round]
        
        H_StartRound --> H_Monitor[Monitor Round]
        H_Monitor --> H_EndRound{End of Match?}
        
        H_EndRound -- No --> H_StartRound
        H_EndRound -- Yes --> H_EndMatch[Show Final Results]
    end

    subgraph Player ["User(Player)"]
        P_Start((Start)) --> P_Login[Register/Login]
        P_Login --> P_Valid{Valid?}
        P_Valid -- No --> P_Login
        P_Valid -- Yes --> P_Dashboard[Go to Dashboard]
        
        P_Dashboard --> P_JoinMatch[Join Match via Code]
        P_JoinMatch --> P_Select[Select Team & Skill]
        P_Select --> P_LobbyWait[Wait in Lobby]
        
        P_LobbyWait --> P_Play[Answer Questions & Use Skill]
        
        P_Play --> P_WaitNext[Wait for Next Round]
        
        P_WaitNext --> P_CheckEnd{End of Match?}
        
        P_CheckEnd -- No --> P_Play
        P_CheckEnd -- Yes --> P_ViewResults[View Final Results]
    end

    %% Interactions between swimlanes
    H_HostMatch -.->|Provides Match Code| P_JoinMatch
    P_Select -.->|Joins| H_WaitPlayers
    H_StartRound -.->|Triggers| P_Play
    H_EndMatch -.->|Displays to| P_ViewResults
```
