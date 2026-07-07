$commits = @(
    @(".env.example", "Update environment variables for Prisma, Clerk, and frontend URLs."),
    @("backend/.env.example", "Add database connection strings for Prisma and Supabase Postgres."),
    @("backend/controllers/gameController.js", "Add PIN validation using regex in game status check."),
    @("backend/controllers/notificationController.js", "Update markAsRead to use user ID for security."),
    @("backend/controllers/quizController.js", "Integrate quiz sanitizer and user-based auth checks."),
    @("backend/index.js", "Add Helmet, rate limiting, and environment validation."),
    @("backend/lib/socketHandlers/gameHandlers.js", "Add socket auth validation for game events."),
    @("backend/lib/socketHandlers/lobbyHandlers.js", "Switch to Prisma repository and add nickname validation."),
    @("backend/lib/socketHandlers/minigameHandlers.js", "Enforce player socket authentication for minigame actions."),
    @("backend/lib/socketHandlers/skillHandlers.js", "Add player socket requirement for skill usage."),
    @("backend/lib/socketUtils.js", "Refactor timer and leaderboard socket utilities."),
    @("backend/lib/supabaseClient.js", "Remove legacy Supabase client."),
    @("backend/middleware/auth.js", "Implement auth middleware using Clerk and user repository."),
    @("backend/package.json", "Add Prisma, Helmet, and express-rate-limit dependencies."),
    @("backend/prisma/schema.prisma", "Define Prisma models for Quiz, Question, Answer, and User."),
    @("backend/repositories/avatarRepository.js", "Migrate avatar operations to Prisma."),
    @("backend/repositories/notificationRepository.js", "Migrate notification operations to Prisma."),
    @("backend/repositories/quizRepository.js", "Migrate quiz CRUD operations to Prisma."),
    @("backend/repositories/userRepository.js", "Migrate user management to Prisma."),
    @("backend/routes/ai.js", "Update AI route handlers."),
    @("backend/routes/auth.js", "Refactor auth routes to align with Clerk."),
    @("backend/routes/notification.js", "Update notification route endpoints."),
    @("backend/routes/quiz.js", "Update quiz routes with auth middleware."),
    @("backend/services/notificationService.js", "Refactor notification service to use Prisma repository."),
    @("backend/services/quizService.js", "Refactor quiz service to use Prisma repository."),
    @("backend/test-db.js", "Update test script for Prisma database connection."),
    @("backend/tests/check_users.js", "Update user checking test script."),
    @("docker-compose.yml", "Update Docker compose configuration for the new stack."),
    @("next-frontend/src/app/preview/test-result/page.jsx", "Update test result page components."),
    @("next-frontend/src/components/Authentication/AuthSync.jsx", "Refactor auth synchronization with Clerk."),
    @("next-frontend/src/components/Authentication/Signin.jsx", "Update signin component for Clerk integration."),
    @("next-frontend/src/components/Dashboard/QuizCard.jsx", "Update quiz card UI component."),
    @("next-frontend/src/components/Dashboard/WelcomeBanner.jsx", "Update welcome banner with user data."),
    @("next-frontend/src/components/Play/ResultOverlay.jsx", "Update result overlay in play mode."),
    @("next-frontend/src/components/global/Navbar.jsx", "Refactor navbar for Clerk authentication state."),
    @("next-frontend/src/hooks/usePlayerCoreGame.js", "Update core game hook for socket synchronization."),
    @("next-frontend/src/hooks/usePlayerGameState.js", "Update player game state hook for new socket events."),
    @("next-frontend/src/page/Dashboard/Dashboard.jsx", "Refactor dashboard page layout and data fetching."),
    @("next-frontend/src/page/Discovery/Discovery.jsx", "Update discovery page for public quizzes."),
    @("next-frontend/src/page/Notifications/Notifications.jsx", "Update notifications page UI."),
    @("next-frontend/src/store/useNotificationStore.js", "Update notification Zustand store."),
    @("next-frontend/src/store/useQuizStore.js", "Update quiz Zustand store."),
    @("package-lock.json", "Update lockfile with new dependencies."),
    @("test-db.js", "Update root test database script."),
    @("backend/lib/envValidation.js", "Add environment variable validation utility."),
    @("backend/lib/quizSanitizer.js", "Add utility to sanitize quiz data."),
    @("backend/lib/socketAuth.js", "Add socket authentication helper functions."),
    @("backend/lib/uuid.js", "Add UUID generation utility."),
    @("backend/middleware/security.js", "Add security middleware (rate limiting)."),
    @("backend/prisma/migrations/", "Add Prisma migration files."),
    @("backend/scripts/", "Add backend utility scripts."),
    @("next-frontend/src/app/blog/", "Add blog pages."),
    @("next-frontend/src/app/classpin/", "Add classpin joining page."),
    @("next-frontend/src/components/global/ComingSoonPage.jsx", "Add coming soon placeholder component."),
    @("next-frontend/src/hooks/usePlayerSession.js", "Add player session management hook."),
    @("next-frontend/src/store/useAuthStore.js", "Add auth Zustand store.")
)

foreach ($commit in $commits) {
    $file = $commit[0]
    $message = $commit[1]

    # For deleted files, we might need git rm instead of git add, but git add -u handles it.
    # We will just do git add $file and check if it staged.
    if ($file -eq "backend/lib/supabaseClient.js") {
        Write-Host "git rm $file"
        git rm $file
    } else {
        Write-Host "git add $file"
        git add $file
    }

    Write-Host "git commit -m `"$message`""
    git commit -m "$message"
}
