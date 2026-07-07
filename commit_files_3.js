const { execSync } = require('child_process');

const commits = [
  { files: ['backend/controllers/quizController.js', 'backend/repositories/quizRepository.js'], msg: 'Update quiz controller & repo: Improve quiz fetching and update operations' },
  { files: ['backend/controllers/userController.js', 'backend/repositories/userRepository.js', 'backend/routes/user.js'], msg: 'Update user backend: Add user settings management and profile update endpoints' },
  { files: ['backend/lib/questionTimeLimit.js'], msg: 'Update questionTimeLimit.js: Adjust game time limit configurations' },
  { files: ['backend/prisma/schema.prisma'], msg: 'Update schema.prisma: Add user settings relations and username constraints' },
  { files: ['backend/lib/userSettings.js'], msg: 'Add userSettings.js: Helper for validating user settings payload' },
  { files: ['backend/prisma/migrations/20250702120000_add_user_settings/', 'backend/prisma/migrations/20250703120000_add_username_unique/'], msg: 'Add Prisma Migrations: Add user settings table and username unique constraint' },
  { files: ['next-frontend/package.json', 'next-frontend/package-lock.json'], msg: 'Update package.json: Add dependencies for Lottie animations' },
  { files: ['next-frontend/src/components/Authentication/AuthSync.jsx'], msg: 'Update AuthSync.jsx: Improve tab synchronization for user settings' },
  { files: ['next-frontend/src/components/Dashboard/QuizCard.jsx'], msg: 'Update QuizCard.jsx: Enhance UI for creator display format' },
  { files: ['next-frontend/src/components/EntryPin/EnterPinSection.jsx'], msg: 'Update EnterPinSection.jsx: Improve validation for game pin entry' },
  { files: ['next-frontend/src/components/GameCreator/QuestionEditor.jsx', 'next-frontend/src/components/GameCreator/QuestionTypePicker.jsx'], msg: 'Update GameCreator: Enhance editor UI for dynamic question types' },
  { files: ['next-frontend/src/components/Play/DragLayersPlay.jsx', 'next-frontend/src/components/Play/LineMatchingPlay.jsx', 'next-frontend/src/components/Play/QuestionPrompt.jsx'], msg: 'Update Play Components: Refine interactive gameplay UI and prompt rendering' },
  { files: ['next-frontend/src/components/Pricing/FAQ.jsx', 'next-frontend/src/components/Pricing/PricingCard.jsx', 'next-frontend/src/components/Pricing/PricingHeader.jsx', 'next-frontend/src/components/Pricing/Testimonial.jsx'], msg: 'Update Pricing Components: Enhance UI/UX for pricing and testimonials sections' },
  { files: ['next-frontend/src/components/global/Footer.jsx', 'next-frontend/src/components/global/Navbar.jsx'], msg: 'Update Global Nav/Footer: Integrate Lottie animations and dynamic links' },
  { files: ['next-frontend/src/components/landingSection/EngagementSection.jsx'], msg: 'Update EngagementSection.jsx: Tweak landing page call to actions' },
  { files: ['next-frontend/src/lib/dragLayersUtils.js', 'next-frontend/src/lib/timeLimit.js'], msg: 'Update Frontend Utils: Fix edge cases in time limits and drag layers logic' },
  { files: ['next-frontend/src/middleware.js'], msg: 'Update middleware.js: Secure new settings and preview routes' },
  { files: ['next-frontend/src/page/Notifications/Notifications.jsx'], msg: 'Update Notifications.jsx: Refine notification list layout' },
  { files: ['next-frontend/src/services/api.js'], msg: 'Update api.js: Add endpoints for user settings operations' },
  { files: ['next-frontend/src/store/useDiscoveryQuizStore.js', 'next-frontend/src/store/useNotificationStore.js'], msg: 'Update Stores: Improve state management for discovery and notifications' },
  { files: ['next-frontend/public/lottie/'], msg: 'Add Lottie Assets: Add animation files for footer and profile' },
  { files: ['next-frontend/src/app/settings/'], msg: 'Add Settings Routes: Add Next.js app routes for settings pages' },
  { files: ['next-frontend/src/components/GameCreator/CreatorSelectPicker.jsx'], msg: 'Add CreatorSelectPicker.jsx: UI component for selecting creator display format' },
  { files: ['next-frontend/src/components/Settings/'], msg: 'Add Settings Components: UI components for managing profile and preferences' },
  { files: ['next-frontend/src/components/global/FooterLottie.jsx'], msg: 'Add FooterLottie.jsx: Lottie animation wrapper for footer' },
  { files: ['next-frontend/src/lib/creatorDisplay.js'], msg: 'Add creatorDisplay.js: Utility for formatting creator display names' },
  { files: ['next-frontend/src/lib/footer-lottie.json', 'next-frontend/src/lib/settings-profile-lottie.json'], msg: 'Add Lottie JSON configs: Configurations for new animations' },
  { files: ['next-frontend/src/lib/userSettings.js'], msg: 'Add userSettings.js (frontend): Constants and helpers for settings UI' },
  { files: ['next-frontend/src/page/Settings/'], msg: 'Add Settings Page: View container for user settings and preferences' },
  { files: ['next-frontend/src/store/useUserSettingsStore.js'], msg: 'Add useUserSettingsStore.js: Zustand store for global user settings state' }
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
