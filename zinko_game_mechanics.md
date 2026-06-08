# Zinko Game Mechanics: Skills & Strategy

This document details the core gameplay mechanics, specifically focusing on how players interact with and use their "Skills" during a live multiplayer match to ensure a balanced, strategic, and fun experience.

## 1. Skill Activation Timing
To keep the game fast-paced and reactive, skills are activated in **real-time** while the question is active.
- As soon as a question and its multiple-choice answers appear on the screen, a **Skill Button** lights up on the player's interface.
- A player must tap their Skill Button **BEFORE** they submit their answer (A, B, C, or D).
- Once a player selects an answer, their screen locks for that question, and they can no longer activate their skill until the next round.

## 2. Preventing Chaos: The "Lockout" System
To prevent all 4 teammates from panicking and wasting their skills on the same question simultaneously, Zinko uses a **"First Come, First Served" Lockout mechanic**.

- **The Rule:** Only **ONE** skill can be activated per team, per question.
- **The Execution:** The precise moment *Player A* taps their skill button, the system triggers a real-time WebSocket event. Instantly, the skill buttons for *Players B, C, and D* turn grey (disabled).
- **The UI Feedback:** The disabled buttons will display a clear message: *"Skill active by [Player A]"*.
- **The Benefit:** This entirely prevents duplicate skill usage and strongly encourages verbal team communication (e.g., "I'm using my Rabbit, don't use your skills!").

## 3. Skill Profiles & Charges
To prevent players from spamming their abilities, each skill has a strict maximum number of **Charges** (uses) allowed per entire game/match. Players must use them strategically.

### 🐇 The Rabbit (Adrenaline Rush)
- **Role:** Point Multiplier
- **Charges Limit:** 2 per whole game
- **Mechanic:** When the Rabbit activates this skill, a 5-second countdown begins. If the team submits the correct answer **under 5 seconds**, the **entire team** receives **x2 points** for that question. 
- **Strategic Value:** Massive point swings. This is the ultimate "We know this one!" ability. It requires the whole team to act fast, resulting in a huge coordinated score boost.

### 🦊 The Fox (Smokescreen)
- **Role:** Saboteur (Offensive)
- **Charges Limit:** 3 per whole game
- **Mechanic:** When activated, the Fox instantly disrupts the *opposing team's* screens. This could involve scrambling the order of the answers (A, B, C, D) or putting a visual "smoke" over the question text for 3 seconds.
- **Strategic Value:** Creates instant panic. To be effective, the Fox must activate this *immediately* when the question drops, right before the opposing team starts reading.

### 🦋 The Butterfly (The Oracle)
- **Role:** Team Support
- **Charges Limit:** 2 per whole game
- **Mechanic:** When activated, the system instantly identifies and visually removes **2 incorrect answers** from the screens of the **entire team** (functioning like a 50/50 lifeline).
- **Strategic Value:** The ultimate safety net. Used when the team is completely stumped by a difficult question to guarantee a higher chance of answering correctly.

### 🐸 The Frog (Sticky Tongue)
- **Role:** The Thief
- **Charges Limit:** 3 per whole game
- **Mechanic:** The Frog activates the skill and answers the question. If the Frog gets the answer correct, the system identifies the *fastest player* on the opposing team for that round, and **steals 50% of the points** they just earned, transferring them to the Frog's team.
- **Strategic Value:** The great equalizer. If the opposing team has one player who always answers instantly and correctly, the Frog can target their points, keeping the match highly competitive.
