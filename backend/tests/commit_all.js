const { execSync } = require('child_process');

const commits = [
  { file: 'frontend/src/components/Authentication/Signin.jsx', msg: 'UI: Apply rounded corners to Signin component for globally consistent shape' },
  { file: 'frontend/src/components/Authentication/Signup.jsx', msg: 'UI: Apply rounded corners to Signup component for globally consistent shape' },
  { file: 'frontend/src/components/Dashboard/QuizCard.jsx', msg: 'UI: Apply rounded corners to QuizCard component for globally consistent shape' },
  { file: 'frontend/src/components/Dashboard/QuizGrid.jsx', msg: 'UI: Apply rounded corners to QuizGrid component for globally consistent shape' },
  { file: 'frontend/src/components/Dashboard/Sidebar.jsx', msg: 'UI: Apply right-side rounded corners to Dashboard Sidebar component' },
  { file: 'frontend/src/components/Dashboard/WelcomeBanner.jsx', msg: 'UI: Apply rounded corners to WelcomeBanner component for globally consistent shape' },
  { file: 'frontend/src/components/EntryPin/EnterNicknameSection.jsx', msg: 'UI: Apply rounded corners to EnterNicknameSection component' },
  { file: 'frontend/src/components/EntryPin/EnterPinSection.jsx', msg: 'UI: Apply rounded corners to EnterPinSection component' },
  { file: 'frontend/src/components/GameCreator/AiSidebar.jsx', msg: 'UI: Apply left-side rounded corners to GameCreator AiSidebar component' },
  { file: 'frontend/src/components/GameCreator/AnswerGrid.jsx', msg: 'UI: Update AnswerGrid component with globally consistent rounded borders' },
  { file: 'frontend/src/components/GameCreator/GenerateQuizModal.jsx', msg: 'UI: Apply rounded corners to GenerateQuizModal component' },
  { file: 'frontend/src/components/GameCreator/Sidebar.jsx', msg: 'UI: Update GameCreator Sidebar elements to have globally rounded shapes' },
  { file: 'frontend/src/components/Pricing/FAQ.jsx', msg: 'UI: Apply rounded corners to Pricing FAQ component' },
  { file: 'frontend/src/components/Pricing/PricingCard.jsx', msg: 'UI: Apply rounded corners to PricingCard component' },
  { file: 'frontend/src/components/Pricing/Testimonial.jsx', msg: 'UI: Apply rounded corners to Pricing Testimonial component' },
  { file: 'frontend/src/components/TeamSelect/ChooseTeamSection.jsx', msg: 'UI: Apply rounded corners to ChooseTeamSection elements' },
  { file: 'frontend/src/components/TeamSelect/PlayerCount.jsx', msg: 'UI: Apply rounded corners to PlayerCount component' },
  { file: 'frontend/src/components/TeamSelect/TeamCard.jsx', msg: 'UI: Apply rounded corners to TeamCard component' },
  { file: 'frontend/src/components/TeamWarmUp/TeamPanel.jsx', msg: 'UI: Apply rounded corners to TeamPanel component' },
  { file: 'frontend/src/components/global/Navbar.jsx', msg: 'UI: Apply custom bottom rounded corners to global Navbar elements' },
  { file: 'frontend/src/components/global/SoundToggle.jsx', msg: 'UI: Apply rounded corners to SoundToggle component' },
  { file: 'frontend/src/components/landingSection/EngagementSection.jsx', msg: 'UI: Apply rounded corners to landing EngagementSection' },
  { file: 'frontend/src/components/landingSection/HeroSection.jsx', msg: 'UI: Apply rounded corners to landing HeroSection' },
  { file: 'frontend/src/components/landingSection/ReadySection.jsx', msg: 'UI: Apply rounded corners to landing ReadySection' }
];

commits.forEach(({ file, msg }) => {
  try {
    console.log(`Adding ${file}...`);
    execSync(`git add ${file}`, { stdio: 'inherit' });
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed on ${file}`);
  }
});

console.log('Pushing to GitHub...');
execSync('git push', { stdio: 'inherit' });
console.log('Done!');
