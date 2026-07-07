const { execSync } = require('child_process');

const commits = [
  { files: ['backend/controllers/aiController.js', 'backend/lib/aiQuizPrompt.js'], msg: 'Update AI Controller: Implement AI-powered question generation and custom prompts' },
  { files: ['backend/controllers/quizController.js', 'backend/services/quizService.js'], msg: 'Update Quiz Controller & Service: Support new question types and validation logic' },
  { files: ['backend/lib/errorHandler.js'], msg: 'Update errorHandler.js: Enhance global error handling' },
  { files: ['backend/lib/socketHandlers/gameHandlers.js', 'backend/lib/socketHandlers/skillHandlers.js', 'backend/lib/socketHandlers/lobbyHandlers.js'], msg: 'Update Socket Handlers: Support new game phases and question interaction events' },
  { files: ['backend/lib/socketUtils.js'], msg: 'Update socketUtils.js: Improve socket event utilities' },
  { files: ['backend/prisma/schema.prisma'], msg: 'Update schema.prisma: Add support for different question types and time limits' },
  { files: ['backend/repositories/quizRepository.js'], msg: 'Update quizRepository.js: Handle persistence of new question formats' },
  { files: ['backend/lib/dragLayersUtils.js', 'backend/lib/lineMatchingUtils.js'], msg: 'Add Question Utils: Add drag layers and line matching logic helpers' },
  { files: ['backend/lib/gameQuestionPayload.js'], msg: 'Add gameQuestionPayload.js: Format specific payloads per question type' },
  { files: ['backend/lib/questionTimeLimit.js', 'backend/lib/questionTypes.js'], msg: 'Add Question Type Enums: Define question types and time limit constants' },
  { files: ['backend/prisma/migrations/20250701130000_add_question_type/', 'backend/prisma/migrations/20250701140000_add_question_time_limit/'], msg: 'Add Prisma Migrations: Add question_type and time_limit columns' },
  { files: ['next-frontend/src/components/ChoosingSkill/ChoosingSkillSection.jsx'], msg: 'Update ChoosingSkillSection.jsx: Enhance skill selection UI' },
  { files: ['next-frontend/src/components/GameCreator/AiSidebar.jsx'], msg: 'Update AiSidebar.jsx: Integrate AI question generation UI' },
  { files: ['next-frontend/src/components/GameCreator/AnswerGrid.jsx', 'next-frontend/src/components/GameCreator/QuestionEditor.jsx'], msg: 'Update QuestionEditor: Enhance answer grid and editor to support multiple question types' },
  { files: ['next-frontend/src/components/GameCreator/QuestionTypePicker.jsx'], msg: 'Add QuestionTypePicker.jsx: UI component for selecting question type' },
  { files: ['next-frontend/src/components/GameCreator/DragLayersEditor.jsx', 'next-frontend/src/components/GameCreator/LineMatchingEditor.jsx'], msg: 'Add Editor Components: Implement editors for Drag Layers and Line Matching' },
  { files: ['next-frontend/src/components/HostGame/AnswerBarChart.jsx', 'next-frontend/src/components/HostGame/HigherLowerHost.jsx', 'next-frontend/src/components/HostGame/HostGameUI.jsx'], msg: 'Update Host Game UI: Support higher/lower display and enhance game controls' },
  { files: ['next-frontend/src/components/HostGame/QuestionPhase.jsx', 'next-frontend/src/components/HostGame/ResultPhase.jsx', 'next-frontend/src/components/HostGame/SkillPickPhase.jsx'], msg: 'Update Host Phases: Enhance state management during different game phases' },
  { files: ['next-frontend/src/components/HostGame/DragLayersPhase.jsx', 'next-frontend/src/components/HostGame/LineMatchingPhase.jsx'], msg: 'Add Host Game Phases: Add views for drag layers and line matching' },
  { files: ['next-frontend/src/components/Play/AnswerGrid.jsx', 'next-frontend/src/components/Play/HigherLowerPlayer.jsx', 'next-frontend/src/components/Play/PlayHeader.jsx', 'next-frontend/src/components/Play/PlayerControllerUI.jsx', 'next-frontend/src/components/Play/QuestionPrompt.jsx'], msg: 'Update Player UI: Support interactive answering for new question formats' },
  { files: ['next-frontend/src/components/Play/DragLayersPlay.jsx', 'next-frontend/src/components/Play/LineMatchingPlay.jsx'], msg: 'Add Player Interactives: Add drag layers and line matching player views' },
  { files: ['next-frontend/src/hooks/usePlayerCoreGame.js', 'next-frontend/src/hooks/useGameBackground.js'], msg: 'Update Player Hooks: Add game background hook and enhance core game logic' },
  { files: ['next-frontend/src/lib/dragLayersUtils.js', 'next-frontend/src/lib/lineMatchingUtils.js', 'next-frontend/src/lib/questionTypes.js'], msg: 'Add Frontend Question Utils: Implement logic for rendering dynamic question types' },
  { files: ['next-frontend/src/lib/formatAiQuestions.js', 'next-frontend/src/lib/timeLimit.js', 'next-frontend/src/lib/validateQuizSave.js', 'next-frontend/src/lib/lobbyScenery.js'], msg: 'Add Frontend Utils: Implement AI formatting, time limit constants, and quiz validation' },
  { files: ['next-frontend/src/page/GameCreator/GameCreator.jsx'], msg: 'Update GameCreator.jsx: Integrate new question type pickers and editors' },
  { files: ['next-frontend/src/page/Host/HostLobby.jsx', 'next-frontend/src/page/Play/PlayerLobby.jsx'], msg: 'Update Lobbies: Enhance host and player lobby connection logic' },
  { files: ['next-frontend/src/services/api.js'], msg: 'Update api.js: Add endpoints for AI generation' },
  { files: ['next-frontend/src/store/useQuizStore.js'], msg: 'Update useQuizStore.js: Store support for advanced question structures' },
  { files: ['next-frontend/src/app/preview/test-drag-layers-player/', 'next-frontend/src/app/preview/test-line-matching-player/'], msg: 'Add Preview Routes: Add sandbox routes to test new question components' }
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
