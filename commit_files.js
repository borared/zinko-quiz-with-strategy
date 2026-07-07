const { execSync } = require('child_process');

const commits = [
  { files: ['backend/controllers/authController.js'], msg: 'Update authController.js: Improve authentication flow and add validations' },
  { files: ['backend/index.js'], msg: 'Update backend/index.js: Register scenery routes and update backend initialization' },
  { files: ['backend/lib/gameState.js'], msg: 'Update gameState.js: Add state management for lobby sceneries and player properties' },
  { files: ['backend/lib/socketHandlers/lobbyHandlers.js'], msg: 'Update lobbyHandlers.js: Add socket events for lobby chat and emoji bursts' },
  { files: ['backend/prisma/schema.prisma'], msg: 'Update schema.prisma: Add Scenery and UserScenery models' },
  { files: ['backend/repositories/notificationRepository.js'], msg: 'Update notificationRepository.js: Add methods for notification queries' },
  { files: ['backend/repositories/quizRepository.js'], msg: 'Update quizRepository.js: Add search and filtering capabilities' },
  { files: ['backend/repositories/userRepository.js'], msg: 'Update userRepository.js: Include scenery relations' },
  { files: ['backend/services/notificationService.js'], msg: 'Update notificationService.js: Implement notification logic' },
  { files: ['backend/services/userService.js'], msg: 'Update userService.js: Add scenery unlocking logic' },
  { files: ['next-frontend/package.json', 'next-frontend/package-lock.json'], msg: 'Update package.json: Add dependencies for animations and audio' },
  { files: ['next-frontend/src/app/ClientLayoutWrapper.jsx'], msg: 'Update ClientLayoutWrapper.jsx: Add context providers' },
  { files: ['next-frontend/src/app/globals.css'], msg: 'Update globals.css: Add global styles for sceneries' },
  { files: ['next-frontend/src/app/play/[pin]/layout.jsx'], msg: 'Update play layout: Adjust layout for player lobby' },
  { files: ['next-frontend/src/components/Authentication/AuthSync.jsx'], msg: 'Update AuthSync.jsx: Sync authentication state' },
  { files: ['next-frontend/src/components/Dashboard/QuizCard.jsx'], msg: 'Update QuizCard.jsx: Enhance UI for quiz display' },
  { files: ['next-frontend/src/components/Dashboard/QuizGrid.jsx'], msg: 'Update QuizGrid.jsx: Enhance UI for quiz grid' },
  { files: ['next-frontend/src/components/Dashboard/Sidebar.jsx'], msg: 'Update Dashboard Sidebar.jsx: Improve sidebar responsiveness' },
  { files: ['next-frontend/src/components/Dashboard/WelcomeBanner.jsx'], msg: 'Update WelcomeBanner.jsx: Personalize user welcome' },
  { files: ['next-frontend/src/components/EntryPin/EnterPinSection.jsx'], msg: 'Update EnterPinSection.jsx: Improve UI for pin entry' },
  { files: ['next-frontend/src/components/GameCreator/QuestionEditor.jsx'], msg: 'Update QuestionEditor.jsx: Enhance question editor' },
  { files: ['next-frontend/src/components/GameCreator/Sidebar.jsx'], msg: 'Update GameCreator Sidebar.jsx: Enhance sidebar tools' },
  { files: ['next-frontend/src/components/HostGame/HostGameUI.jsx'], msg: 'Update HostGameUI.jsx: Enhance host controls' },
  { files: ['next-frontend/src/components/TeamSelect/ChooseTeamSection.jsx'], msg: 'Update ChooseTeamSection.jsx: Improve team selection UI' },
  { files: ['next-frontend/src/components/global/Footer.jsx'], msg: 'Update Footer.jsx: Adjust footer styling' },
  { files: ['next-frontend/src/components/global/SoundToggle.jsx'], msg: 'Update SoundToggle.jsx: Add sound toggle component' },
  { files: ['next-frontend/src/components/landingSection/EngagementSection.jsx'], msg: 'Update EngagementSection.jsx: Enhance engagement section' },
  { files: ['next-frontend/src/components/landingSection/HeroSection.jsx'], msg: 'Update HeroSection.jsx: Enhance hero section' },
  { files: ['next-frontend/src/page/Dashboard/Dashboard.jsx'], msg: 'Update Dashboard.jsx: Integrate workspace nav' },
  { files: ['next-frontend/src/page/Discovery/Discovery.jsx'], msg: 'Update Discovery page: Add quiz discovery features' },
  { files: ['next-frontend/src/page/GameCreator/GameCreator.jsx'], msg: 'Update GameCreator.jsx: Integrate new sidebar tools' },
  { files: ['next-frontend/src/page/Host/HostLobby.jsx'], msg: 'Update HostLobby: Implement scenery changes and advanced lobby controls' },
  { files: ['next-frontend/src/page/Notifications/Notifications.jsx'], msg: 'Update Notifications.jsx: Add page for user notifications' },
  { files: ['next-frontend/src/page/Play/PlayerLobby.jsx'], msg: 'Update PlayerLobby.jsx: Redesign lobby with chat and sceneries' },
  { files: ['next-frontend/src/store/useNotificationStore.js'], msg: 'Update useNotificationStore.js: Add notifications store' },
  { files: ['next-frontend/src/store/useQuizStore.js'], msg: 'Update useQuizStore.js: Update quiz store' },
  { files: ['backend/controllers/sceneryController.js'], msg: 'Add sceneryController.js: Implement scenery API' },
  { files: ['backend/lib/lobbyScenery.js'], msg: 'Add lobbyScenery.js: Implement lobby scenery logic' },
  { files: ['backend/lib/sceneryConstants.js'], msg: 'Add sceneryConstants.js: Add scenery constants' },
  { files: ['backend/lib/searchUtils.js'], msg: 'Add searchUtils.js: Helper for generic search' },
  { files: ['backend/repositories/sceneryRepository.js'], msg: 'Add sceneryRepository.js: Scenery DB operations' },
  { files: ['backend/routes/scenery.js'], msg: 'Add scenery.js: Scenery API routes' },
  { files: ['backend/services/sceneryService.js'], msg: 'Add sceneryService.js: Scenery business logic' },
  { files: ['backend/prisma/migrations/20250701120000_add_sceneries/'], msg: 'Add scenery migration: Create database tables for sceneries' },
  { files: ['backend/scripts/backfill-halloween-gifts.js'], msg: 'Add backfill script: Grant Halloween sceneries to existing users' },
  { files: ['next-frontend/public/audio/halloween-ambience.mp3'], msg: 'Add halloween-ambience.mp3: Halloween scenery audio' },
  { files: ['next-frontend/public/audio/reactions/'], msg: 'Add audio/reactions/: Emoji reaction sound effects' },
  { files: ['next-frontend/public/background_battle/halloween_scenery.jpg'], msg: 'Add halloween_scenery.jpg: Halloween background' },
  { files: ['next-frontend/public/images/'], msg: 'Add image assets: New icons and illustrations' },
  { files: ['next-frontend/src/app/privacy/'], msg: 'Add privacy app routes: Privacy policy and terms' },
  { files: ['next-frontend/src/app/reports/'], msg: 'Add reports app routes: Game reports structure' },
  { files: ['next-frontend/src/components/Dashboard/MobileWorkspaceNav.jsx'], msg: 'Add MobileWorkspaceNav.jsx: Mobile workspace navigation' },
  { files: ['next-frontend/src/components/Dashboard/workspaceNav.js'], msg: 'Add workspaceNav.js: Workspace navigation config' },
  { files: ['next-frontend/src/components/Discovery/'], msg: 'Add Discovery components: Components for quiz discovery' },
  { files: ['next-frontend/src/components/Host/'], msg: 'Add Host components: Scenery controls for host' },
  { files: ['next-frontend/src/components/Play/AvatarEmojiBurst.jsx'], msg: 'Add AvatarEmojiBurst.jsx: Emoji burst component' },
  { files: ['next-frontend/src/components/Play/LobbySticker.jsx'], msg: 'Add LobbySticker.jsx: Lobby sticker component' },
  { files: ['next-frontend/src/components/Play/PlayerLobbyChat.jsx'], msg: 'Add PlayerLobbyChat.jsx: Player lobby chat component' },
  { files: ['next-frontend/src/components/Play/stickers/'], msg: 'Add Play stickers: Sticker assets for lobby chat' },
  { files: ['next-frontend/src/components/Privacy/'], msg: 'Add Privacy components: Components for privacy policy' },
  { files: ['next-frontend/src/components/layout/'], msg: 'Add layout components: Reusable layout structures' },
  { files: ['next-frontend/src/hooks/useButtonClickSound.js'], msg: 'Add useButtonClickSound.js: Hook for button click sound' },
  { files: ['next-frontend/src/hooks/useDayNight.js'], msg: 'Add useDayNight.js: Hook for day/night cycle' },
  { files: ['next-frontend/src/hooks/useHalloweenSceneryAudio.js'], msg: 'Add useHalloweenSceneryAudio.js: Hook for Halloween audio' },
  { files: ['next-frontend/src/lib/'], msg: 'Add frontend libs: Utility functions for frontend' },
  { files: ['next-frontend/src/page/Privacy/'], msg: 'Add Privacy page: Privacy policy page' },
  { files: ['next-frontend/src/store/useDashboardQuizStore.js'], msg: 'Add useDashboardQuizStore.js: Dashboard quiz store' },
  { files: ['next-frontend/src/store/useDiscoveryQuizStore.js'], msg: 'Add useDiscoveryQuizStore.js: Discovery quiz store' },
  { files: ['next-frontend/src/store/useOwnedSceneryStore.js'], msg: 'Add useOwnedSceneryStore.js: Owned scenery store' }
];

for (const commit of commits) {
  try {
    const filesToCommit = commit.files.join(' ');
    console.log(`Adding ${filesToCommit}...`);
    execSync(`git add ${filesToCommit}`, { stdio: 'inherit' });
    
    try {
      execSync('git diff --cached --quiet');
      console.log(`No changes to commit for ${filesToCommit}`);
    } catch (e) {
      // Error means there are changes
      console.log(`Committing ${filesToCommit}...`);
      execSync(`git commit -m "${commit.msg}"`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`Error processing ${commit.files}:`, error.message);
  }
}
