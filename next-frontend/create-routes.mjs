import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, 'src/app');

const routes = [
  { path: 'signup', component: '@/components/Authentication/Signup', name: 'Signup' },
  { path: 'signin', component: '@/components/Authentication/Signin', name: 'Signin' },
  { path: 'sso-callback', component: '@/page/Authentication/SSOCallbackView', name: 'SSOCallbackView' },
  { path: 'pricing', component: '@/page/PricingPanel/PricingPanel', name: 'PricingPanel' },
  { path: 'create-game', component: '@/page/GameCreator/GameCreator', name: 'GameCreator' },
  { path: 'create-game/[quizId]', component: '@/page/GameCreator/GameCreator', name: 'GameCreator' },
  { path: 'dashboard', component: '@/page/Dashboard/Dashboard', name: 'Dashboard' },
  { path: 'join', component: '@/page/PinJoiningGate/EnterPin', name: 'EnterPin' },
  { path: 'join-nickname', component: '@/page/PinJoiningGate/EnterNickname', name: 'EnterNickname' },
  { path: 'choose-team', component: '@/page/PinJoiningGate/ChooseTeam', name: 'ChooseTeam' },
  { path: 'team-warmup', component: '@/page/PinJoiningGate/TeamWarmUp', name: 'TeamWarmUp' },
  { path: 'choose-skill', component: '@/page/PinJoiningGate/ChoosingSkill', name: 'ChoosingSkill' },
  { path: 'host/lobby/[pin]', component: '@/page/Host/HostLobby', name: 'HostLobby' },
  { path: 'host/game/[pin]', component: '@/page/Host/HostGame', name: 'HostGame' },
  { path: 'play/lobby/[pin]', component: '@/page/Play/PlayerLobby', name: 'PlayerLobby' },
  { path: 'play/game/[pin]', component: '@/page/Play/PlayerController', name: 'PlayerController' },
  { path: 'play/result/[pin]', component: '@/page/Play/PlayerResult', name: 'PlayerResult' }
];

function createRoute(route) {
  const routeDir = path.join(appDir, route.path);
  fs.mkdirSync(routeDir, { recursive: true });
  
  const content = `"use client";
import ${route.name} from '${route.component}';

export default function Page() {
  return <${route.name} />;
}
`;
  fs.writeFileSync(path.join(routeDir, 'page.jsx'), content);
  console.log(`Created route: ${route.path}`);
}

routes.forEach(createRoute);

// Create Landing Page (replace the default app/page.jsx)
const landingContent = `"use client";
import Hero from '@/page/landing/Hero';
import Engagement from '@/page/landing/Engagement';
import WhyZinko from '@/page/landing/WhyZinko';
import Ready from '@/page/landing/Ready';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Engagement />
      <WhyZinko />
      <Ready />
    </>
  );
}
`;
fs.writeFileSync(path.join(appDir, 'page.jsx'), landingContent);
console.log('Created Landing Page (/)');

// Replace layout.jsx to remove default tailwind junk and wrap context if needed
// Actually we can let the user update layout later, or just inject ClerkProvider
