# 1. Zustand Migration
git add next-frontend/src/store/ next-frontend/src/context/ next-frontend/src/hooks/ next-frontend/src/app/layout.js next-frontend/src/app/ClientLayoutWrapper.jsx
git commit -m "Refactor: Migrate from Context API to Zustand" -m "Deleted deprecated Context and Hooks files. Added new Zustand store for socket, toast, transitions, and quiz. Updated ClientLayoutWrapper and layout to use Zustand."

# 2. Global UI components & CSS
git add next-frontend/src/app/globals.css next-frontend/src/components/transition/EyeBlinkOverlay.jsx next-frontend/src/components/global/ToastContainer.jsx
git commit -m "UI: Update global styles and transitions" -m "Added Zinko custom fonts and CSS variables in globals.css. Refactored ToastContainer and EyeBlinkOverlay for better visuals."

# 3. Minigame Handlers (Backend)
git add backend/lib/socketHandlers/minigameHandlers.js backend/lib/socketUtils.js
git commit -m "Backend: Update minigame socket handlers" -m "Refactored socket handlers to support vault breaker cracking logic and dynamic reward wheel functionality."

# 4. Preview pages
git add next-frontend/src/app/preview/
git commit -m "Feature: Add developer preview pages" -m "Added isolated preview routes for rapidly testing Player, Host, Wheel, and Vault Breaker UI components without playing a full game."

# 5. Play UI - Headers and Prompts
git add next-frontend/src/components/Play/PlayHeader.jsx next-frontend/src/components/Play/QuestionPrompt.jsx
git commit -m "UI: Redesign Player Header and Question Prompt" -m "Added high contrast Zinko-style badges and applied Amatic SC font. Replaced default hourglass emoji with pulsing lucide-react Lock icon."

# 6. Play UI - Answer Grid and Result Overlay
git add next-frontend/src/components/Play/AnswerGrid.jsx next-frontend/src/components/Play/ResultOverlay.jsx next-frontend/src/components/Play/PlayerControllerUI.jsx
git commit -m "UI: Refactor Player Controller and Results" -m "Updated Player Controller layout, AnswerGrid component styling, and ResultOverlay with improved Zinko aesthetics."

# 7. Play UI - Minigames
git add next-frontend/src/components/Play/VaultBreakerPlayer.jsx
git commit -m "UI: Update Player Vault Breaker minigame" -m "Refactored vault breaking interactions and styling to match the brand guidelines."

# 8. Host UI - Top Bar and Countdown
git add next-frontend/src/components/HostGame/QuestionPhase.jsx next-frontend/src/components/HostGame/CountdownRing.jsx
git commit -m "UI: Redesign Host Question Phase and Timer" -m "Replaced SVG countdown ring with high-contrast Zinko styled badge. Applied Amatic SC font and increased readability for Round and Answered indicators."

# 9. Host UI - Results and Minigames
git add next-frontend/src/components/HostGame/ResultPhase.jsx next-frontend/src/components/HostGame/RewardWheel.jsx next-frontend/src/components/HostGame/VaultBreakerHost.jsx next-frontend/src/components/HostGame/AnswerBarChart.jsx next-frontend/src/components/HostGame/HostGameUI.jsx
git commit -m "UI: Update Host Game Minigames and Results" -m "Styled the Reward Wheel, Vault Breaker Host, and Answer Bar Chart components. Changed title to Vaults Cracker."

# 10. Landing Pages and Navbar
git add next-frontend/src/components/landingSection/ next-frontend/src/components/global/Navbar.jsx next-frontend/src/app/page.jsx
git commit -m "UI: Refactor Landing Sections and Navbar" -m "Updated hero, engagement, why zinko, and ready sections. Tweaked global Navbar."

# 11. Pin Entry & Team Select
git add next-frontend/src/components/EntryPin/ next-frontend/src/components/TeamSelect/ next-frontend/src/components/ChoosingSkill/
git commit -m "UI: Update Lobby Entry and Selection" -m "Refactored UI for pin entry, nickname selection, team picking, and skill selection."

# 12. Game Creator & Dashboard
git add next-frontend/src/components/GameCreator/ next-frontend/src/page/GameCreator/ next-frontend/src/page/Dashboard/
git commit -m "UI: Update Dashboard and Game Creator" -m "Styled the dashboard, sidebar, answer grids, and AI components within the Quiz Creator."

# 13. Page Lobbies
git add next-frontend/src/page/Host/HostLobby.jsx next-frontend/src/page/Play/PlayerLobby.jsx
git commit -m "UI: Update Host and Player Lobbies" -m "Refactored the initial lobby waiting rooms for both host and players to improve contrast."

# 14. Dependencies
git add next-frontend/package.json next-frontend/package-lock.json
git commit -m "Chore: Update frontend dependencies" -m "Added Zustand, lucide-react, and framer-motion packages to the lockfile."

# 15. Dev Tools
git add next-frontend/knip.json
git commit -m "Chore: Add knip config" -m "Added knip.json for static dependency analysis and dead code tracking."

# 16. Push to github
git push origin grid_map
