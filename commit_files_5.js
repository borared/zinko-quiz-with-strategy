const { execSync } = require('child_process');

const commits = [
  { 
    files: [
      'backend/swagger.js', 
      'backend/index.js', 
      'backend/package.json', 
      'package-lock.json', 
      'backend/routes/ai.js',
      'backend/routes/avatar.js',
      'backend/routes/game.js',
      'backend/routes/notification.js',
      'backend/routes/quiz.js',
      'backend/routes/scenery.js',
      'backend/routes/shop.js',
      'backend/routes/user.js',
      'backend/routes/webhooks.js',
      'addSwaggerComments.js'
    ], 
    msg: 'feat(api): Add Swagger UI and auto-generated API documentation for all backend routes' 
  },
  { 
    files: ['backend/services/avatarService.js'], 
    msg: 'feat(avatars): Make all avatars globally unlocked and available in the library' 
  },
  { 
    files: ['next-frontend/src/page/Shop/Shop.jsx'], 
    msg: 'refactor(shop): Remove avatar purchases from shop UI and show not-yet-product message' 
  },
  { 
    files: ['next-frontend/src/store/useLibraryCartStore.js'], 
    msg: 'fix(cart): Automatically purge legacy avatars from shopping cart state on load' 
  },
  { 
    files: ['next-frontend/src/components/Library/CollectionItemCard.jsx'], 
    msg: 'style(library): Remove titles and subtitles from avatar cards for a cleaner layout' 
  },
  { 
    files: ['next-frontend/src/components/global/Navbar.jsx'], 
    msg: 'style(navbar): Remove bulky box-shadows from logo and header action buttons' 
  },
  { 
    files: ['next-frontend/src/components/landingSection/ReadySection.jsx'], 
    msg: 'style(landing): Update Start For Free button to flat blue theme with no shadow' 
  },
  {
    files: [
      'commit_all.ps1',
      'commit_all_new.ps1',
      'commit_files.js',
      'commit_files_2.js',
      'commit_files_3.js',
      'commit_files_4.js',
      'commit_files_5.js',
      'next-frontend/test-drag.js',
      'codex-67-emoji-response.txt'
    ],
    msg: 'chore: Track various scripts and temporary files'
  }
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
      console.log(`Committing ${filesToCommit}...`);
      execSync(`git commit -m "${commit.msg}"`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`Error processing ${commit.files}:`, error.message);
  }
}
