const { execSync } = require('child_process');

const commits = [
  { files: ['ZINKO_FEATURES.md'], msg: 'Update documentation: Add ZINKO_FEATURES.md detailing complete project feature set' },
  { files: ['backend/.env.example', 'backend/nodemon.json', 'backend/package.json', 'package-lock.json', 'backend/scripts/free-port.js'], msg: 'Update backend tooling: Add free-port script, update dependencies and nodemon config' },
  { files: ['backend/controllers/avatarController.js', 'backend/routes/avatar.js', 'backend/repositories/avatarRepository.js', 'backend/services/avatarService.js'], msg: 'Update Avatar API: Enhance avatar controllers, routes, and services' },
  { files: ['backend/controllers/quizController.js', 'backend/repositories/quizRepository.js', 'backend/routes/quiz.js', 'backend/services/quizService.js'], msg: 'Update Quiz Backend: Handle quiz cloning logic and update query optimization' },
  { files: ['backend/controllers/webhookController.js', 'backend/routes/webhooks.js'], msg: 'Update Webhooks API: Implement Stripe webhook handling for payments' },
  { files: ['backend/index.js'], msg: 'Update backend/index.js: Register shop and webhook routes, update middleware order' },
  { files: ['backend/lib/lobbyScenery.js', 'backend/lib/questionTypes.js'], msg: 'Update backend libs: Tweak lobby scenery properties and question constants' },
  { files: ['backend/prisma/schema.prisma'], msg: 'Update schema.prisma: Add shop, products, and payment models for monetization' },
  { files: ['backend/repositories/sceneryRepository.js', 'backend/repositories/userRepository.js'], msg: 'Update repositories: Refine scenery fetching and user relation queries' },
  { files: ['backend/controllers/shopController.js', 'backend/repositories/shopRepository.js', 'backend/routes/shop.js', 'backend/services/shopService.js'], msg: 'Add Shop API: Implement complete backend for scenery marketplace and Stripe checkout' },
  { files: ['backend/lib/formatPrice.js', 'backend/lib/shopConstants.js', 'backend/lib/stripe.js'], msg: 'Add Shop Utils: Stripe configuration, price formatting, and shop constants' },
  { files: ['backend/prisma/migrations/20250703140000_add_cloned_from_id/', 'backend/prisma/migrations/20250703150000_backfill_cloned_from_id/'], msg: 'Add Migrations (Quiz Cloning): Add and backfill cloned_from_id on quizzes' },
  { files: ['backend/prisma/migrations/20250704120000_update_scenery_image_urls/', 'backend/prisma/migrations/20250704130000_add_inside_scenery/', 'backend/prisma/migrations/20250704160000_update_scenery_prices/', 'backend/prisma/migrations/20250704170000_add_ghost_station_scenery/', 'backend/prisma/migrations/20250704180000_update_ghost_station_image/'], msg: 'Add Migrations (Scenery Updates): Update images, add Inside and Ghost Station sceneries, set prices' },
  { files: ['backend/prisma/migrations/20250704140000_add_shop/', 'backend/prisma/migrations/20250704150000_shop_stripe_payments/'], msg: 'Add Migrations (Shop & Payments): Create schema structures for shop integration' },
  { files: ['next-frontend/src/app/ClientLayoutWrapper.jsx', 'next-frontend/src/app/globals.css', 'next-frontend/src/app/layout.js'], msg: 'Update Next.js App Shell: Integrate shop providers and global CSS adjustments' },
  { files: ['next-frontend/src/components/Authentication/AuthSync.jsx'], msg: 'Update AuthSync.jsx: Ensure shop state syncs across authentication events' },
  { files: ['next-frontend/src/components/Dashboard/MobileWorkspaceNav.jsx', 'next-frontend/src/components/Dashboard/Sidebar.jsx', 'next-frontend/src/components/Dashboard/workspaceNav.js'], msg: 'Update Dashboard Nav: Add Shop link to sidebar and mobile navigation' },
  { files: ['next-frontend/src/components/Dashboard/QuizCard.jsx', 'next-frontend/src/components/Dashboard/QuizGrid.jsx'], msg: 'Update Quiz Display: Display cloning badges and improve grid layout' },
  { files: ['next-frontend/src/components/GameCreator/AiSidebar.jsx', 'next-frontend/src/components/GameCreator/GenerateQuizModal.jsx'], msg: 'Update AI Game Creator: Improve generation UI and integrate custom modal' },
  { files: ['next-frontend/src/components/GameCreator/AnswerGrid.jsx', 'next-frontend/src/components/GameCreator/QuestionEditor.jsx', 'next-frontend/src/components/GameCreator/Sidebar.jsx'], msg: 'Update Game Creator Editor: Refine sidebar layout, question editor, and answer grid' },
  { files: ['next-frontend/src/components/Host/HalloweenSoundToggle.jsx', 'next-frontend/src/components/Host/ScenerySoundToggle.jsx'], msg: 'Update Scenery Controls: Refactor sound toggle for dynamic scenery audio' },
  { files: ['next-frontend/src/components/HostGame/HostGameUI.jsx'], msg: 'Update HostGameUI.jsx: Integrate new scenery controls into host layout' },
  { files: ['next-frontend/src/components/Settings/ManageAccountPanel.jsx', 'next-frontend/src/components/Settings/ProfileLottie.jsx'], msg: 'Update Settings Panel: Adjust profile animation rendering and layout' },
  { files: ['next-frontend/src/components/global/Navbar.jsx', 'next-frontend/src/components/global/ToastContainer.jsx'], msg: 'Update Global Components: Integrate toast notifications and update navbar state' },
  { files: ['next-frontend/src/hooks/useHalloweenSceneryAudio.js'], msg: 'Update Audio Hooks: Refactor legacy hook for general scenery audio' },
  { files: ['next-frontend/src/lib/lobbyScenery.js', 'next-frontend/src/lib/questionTypes.js', 'next-frontend/src/lib/sceneryAudio.js', 'next-frontend/src/lib/validateQuizSave.js'], msg: 'Update Frontend Libs: Refine validation logic, dynamic scenery mapping, and constants' },
  { files: ['next-frontend/src/middleware.js'], msg: 'Update middleware.js: Secure shop routing and protected checkouts' },
  { files: ['next-frontend/src/page/Dashboard/Dashboard.jsx', 'next-frontend/src/page/Discovery/Discovery.jsx', 'next-frontend/src/page/GameCreator/GameCreator.jsx', 'next-frontend/src/page/Host/HostLobby.jsx', 'next-frontend/src/page/Notifications/Notifications.jsx', 'next-frontend/src/page/Settings/SettingsPanel.jsx'], msg: 'Update Pages: Refine state fetching across major views (Dashboard, Discovery, Host, Settings)' },
  { files: ['next-frontend/src/services/api.js'], msg: 'Update api.js: Add frontend API hooks for shop and payment operations' },
  { files: ['next-frontend/src/store/useDashboardQuizStore.js', 'next-frontend/src/store/useDiscoveryQuizStore.js', 'next-frontend/src/store/useQuizStore.js', 'next-frontend/src/store/useUserSettingsStore.js'], msg: 'Update Stores: Sync state implementations and error handling across Zustand stores' },
  { files: ['next-frontend/public/audio/inside-ambience.mp3', 'next-frontend/public/file.svg', 'next-frontend/public/globe.svg', 'next-frontend/public/next.svg', 'next-frontend/public/vercel.svg', 'next-frontend/public/window.svg'], msg: 'Add Assets: Add Inside Scenery ambience and standard Next.js SVG icons' },
  { files: ['next-frontend/src/app/shop/', 'next-frontend/src/components/Shop/', 'next-frontend/src/page/Shop/'], msg: 'Add Shop Frontend: Create app routes, pages, and components for digital storefront' },
  { files: ['next-frontend/src/lib/formatPrice.js', 'next-frontend/src/lib/sceneryDetails.js'], msg: 'Add Shop Libs: Helpers for price formatting and scenery metadata' },
  { files: ['next-frontend/src/store/useShopStore.js'], msg: 'Add Shop Store: Zustand store for global cart and product state' },
  { files: ['backend/models/.gitkeep'], msg: 'Add empty model directory for structure' }
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
