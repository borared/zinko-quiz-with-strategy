# 1. Backend Controllers and Repository
git add backend/controllers/quizController.js
git commit -m "Backend: Update quiz controller" -m "Refactored quizController.js to improve API endpoints and data handling."

git add backend/repositories/quizRepository.js
git commit -m "Backend: Update quiz repository" -m "Updated quizRepository.js database queries for fetching and modifying quizzes."

git add backend/index.js
git commit -m "Config: Update backend server entry" -m "Updated backend index.js CORS whitelist and startup logs to bind to 172.23.4.140."

# 2. Backend Game State and Sockets
git add backend/lib/gameState.js
git commit -m "Backend: Update game state" -m "Refactored gameState.js to track new minigame and skill states."

git add backend/lib/socketHandlers/minigameHandlers.js
git commit -m "Backend: Update minigame handlers" -m "Updated minigame socket handlers to support vault breaker cracking and higher/lower games."

git add backend/lib/socketHandlers/skillHandlers.js
git commit -m "Fix: Butterfly Skill Logic" -m "Fixed butterfly skill in skillHandlers.js to properly identify the right answer using 'isCorrect' instead of 'checked', guaranteeing 50/50 behavior."

git add backend/lib/socketUtils.js
git commit -m "Backend: Update socket utilities" -m "Refactored socketUtils.js for cleaner timer handling and score calculations."

# 3. Frontend App & Global Config
git add next-frontend/package.json
git commit -m "Config: Update frontend dev script" -m "Modified next-frontend/package.json to bind 'npm run dev' to 172.23.4.140."

git add next-frontend/src/app/globals.css
git commit -m "UI: Update global styles" -m "Modified globals.css to include new Zinko variables and animations."

git add next-frontend/src/app/ClientLayoutWrapper.jsx
git commit -m "UI: Update Layout Wrapper" -m "Refactored ClientLayoutWrapper.jsx to support the global custom cursor and new transitions."

git add next-frontend/src/config/skills.js
git commit -m "Config: Update Fox skill duration" -m "Updated skills.js to change Fox blind description from 10s to 5s."

git add next-frontend/src/components/global/Navbar.jsx
git commit -m "UI: Update Navbar" -m "Refactored Navbar.jsx for better responsiveness and Zinko styling."

git add next-frontend/src/components/global/CustomCursor.jsx
git commit -m "UI: Add Custom Cursor" -m "Added a new CustomCursor.jsx component for a dynamic gaming cursor across the application."

git add next-frontend/src/app/not-found.jsx
git commit -m "UI: Add custom 404 page" -m "Created not-found.jsx for a branded 404 error page."

# 4. Move Routing Files
git rm next-frontend/src/app/choose-team/page.jsx
git rm next-frontend/src/app/join-nickname/page.jsx
git add next-frontend/src/app/play/choose-team/ next-frontend/src/app/play/join-nickname/
git commit -m "Refactor: Move player entry routes" -m "Moved choose-team and join-nickname routes under the app/play directory."

# 5. Dashboard Components
git add next-frontend/src/components/Dashboard/QuizCard.jsx
git commit -m "UI: Update QuizCard" -m "Styled QuizCard.jsx to align with the bold Zinko aesthetic."

git add next-frontend/src/components/Dashboard/QuizGrid.jsx
git commit -m "UI: Update QuizGrid" -m "Removed redundant 'Public Quizzes' header in QuizGrid.jsx when in Discovery Mode to fix spacing."

git add next-frontend/src/components/Dashboard/Sidebar.jsx
git commit -m "UI: Update Sidebar" -m "Refactored Sidebar.jsx layout and links."

git add next-frontend/src/components/Dashboard/WelcomeBanner.jsx
git commit -m "UI: Update Welcome Banner" -m "Refactored WelcomeBanner.jsx for the Dashboard and Discovery views."

# 6. Entry and Team Select Components
git add next-frontend/src/components/EntryPin/EnterNicknameSection.jsx
git commit -m "UI: Update Nickname Entry" -m "Styled EnterNicknameSection.jsx with updated inputs and buttons."

git add next-frontend/src/components/EntryPin/EnterPinSection.jsx
git commit -m "UI: Update Pin Entry" -m "Styled EnterPinSection.jsx to improve visual clarity."

git add next-frontend/src/components/TeamSelect/ChooseTeamSection.jsx
git commit -m "UI: Update Team Select" -m "Refactored ChooseTeamSection.jsx to match the new team picking logic and visuals."

# 7. Host Game Components
git add next-frontend/src/components/HostGame/HostGameUI.jsx
git commit -m "UI: Update Host Game UI" -m "Refactored HostGameUI.jsx to manage new phases and layouts."

git add next-frontend/src/components/HostGame/LeaderboardPhase.jsx
git commit -m "UI: Update Leaderboard Phase" -m "Refactored LeaderboardPhase.jsx for high contrast rankings."

git add next-frontend/src/components/HostGame/RewardWheel.jsx
git commit -m "UI: Update Reward Wheel" -m "Refactored RewardWheel.jsx minigame UI for the host view."

git add next-frontend/src/components/HostGame/VaultBreakerHost.jsx
git commit -m "UI: Update Vault Breaker Host" -m "Refactored VaultBreakerHost.jsx for the cracking animation and state."

git add next-frontend/src/components/HostGame/HigherLowerHost.jsx
git commit -m "UI: Add Higher/Lower Host" -m "Added HigherLowerHost.jsx minigame component."

# 8. Play Components
git add next-frontend/src/components/Play/AnswerGrid.jsx
git commit -m "UI: Update Answer Grid" -m "Refactored AnswerGrid.jsx styling and responsiveness."

git rm next-frontend/src/components/Play/BoatTapController.jsx
git commit -m "UI: Remove BoatTapController" -m "Deleted deprecated BoatTapController.jsx."

git add next-frontend/src/components/Play/PlayerControllerUI.jsx
git commit -m "UI: Update Player Controller" -m "Refactored PlayerControllerUI.jsx and changed Fox blind skill duration from 10s to 5s."

git add next-frontend/src/components/Play/VaultBreakerPlayer.jsx
git commit -m "UI: Update Vault Breaker Player" -m "Refactored VaultBreakerPlayer.jsx for player inputs during the minigame."

git add next-frontend/src/components/Play/HigherLowerPlayer.jsx
git commit -m "UI: Add Higher/Lower Player" -m "Added HigherLowerPlayer.jsx minigame controller."

# 9. Pages
git add next-frontend/src/page/Discovery/Discovery.jsx
git commit -m "UI: Update Discovery Page" -m "Fixed gap spacing between Welcome Banner and Search bar in Discovery.jsx to group elements closer."

git add next-frontend/src/page/GameCreator/GameCreator.jsx
git commit -m "UI: Update Game Creator" -m "Refactored GameCreator.jsx for better question editing and AI generation."

git add next-frontend/src/page/Host/HostLobby.jsx
git commit -m "UI: Update Host Lobby" -m "Refactored HostLobby.jsx to handle players joining."

git rm next-frontend/src/page/Host/HostLobbyUI.jsx
git rm next-frontend/src/page/Host/TestHost.jsx
git commit -m "Refactor: Remove unused Host Lobby files" -m "Deleted deprecated HostLobbyUI.jsx and TestHost.jsx."

git add next-frontend/src/page/Notifications/Notifications.jsx
git commit -m "UI: Update Notifications Page" -m "Refactored Notifications.jsx to show recent activity."

git add next-frontend/src/page/Play/PlayerResult.jsx
git commit -m "UI: Update Player Result" -m "Refactored PlayerResult.jsx layout for post-question results."

# 10. Stores
git add next-frontend/src/store/useQuizStore.js
git commit -m "State: Update Quiz Store" -m "Refactored useQuizStore.js logic for managing quiz data."

git add next-frontend/src/store/useTransitionStore.js
git commit -m "State: Update Transition Store" -m "Refactored useTransitionStore.js for page transition animations."

# 11. Previews
git add next-frontend/src/app/preview/test-higher-lower-host/ next-frontend/src/app/preview/test-higher-lower-player/ next-frontend/src/app/preview/test-vault-host/
git commit -m "Feature: Add Minigame Previews" -m "Added dedicated routes to preview Higher/Lower and Vault Breaker minigames."

# 12. Cleanup Scripts
git rm next-frontend/create-routes.mjs
git rm next-frontend/migrate.mjs
git add backend/test-db.js test-db.js commit_changes.ps1 do_commits.ps1
git commit -m "Chore: Add cleanup and testing scripts" -m "Added test-db.js and PS1 scripts. Removed deprecated migration mjs scripts."

# 13. Push
git push origin grid_map
