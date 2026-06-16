git add backend/prisma/schema.prisma
git commit -m "feat(db): Add notifications model with JSON metadata support to track cloned quizzes"

git add backend/repositories/notificationRepository.js
git commit -m "feat(backend): Add repository layer for notification database operations, including mark as read and clear all"

git add backend/services/notificationService.js
git commit -m "feat(backend): Add service layer for handling notification business logic"

git add backend/controllers/notificationController.js
git commit -m "feat(backend): Add API controller for fetching, marking as read, and clearing notifications"

git add backend/routes/notification.js
git commit -m "feat(backend): Define Express routes for notification endpoints"

git add backend/index.js
git commit -m "feat(backend): Mount notification API routes to the main Express app"

git add backend/repositories/userRepository.js
git commit -m "feat(backend): Implement getUserByClerkId to fetch cloner profile data for rich notifications"

git add backend/services/quizService.js
git commit -m "feat(backend): Trigger notification creation when a quiz is cloned, storing cloner avatar and name in metadata"

git add next-frontend/src/store/useNotificationStore.js
git commit -m "feat(frontend): Create Zustand store for managing notification state, API calls, and unread counts"

git add next-frontend/src/components/global/Navbar.jsx
git commit -m "refactor(frontend): Remove inline notification dropdown and replace with redirect to dedicated notifications page"

git add next-frontend/src/app/notifications
git commit -m "feat(frontend): Create dedicated Next.js route for the full-screen notifications page"

git add next-frontend/src/page/Notifications
git commit -m "feat(frontend): Implement full-page Notifications UI with cloner avatars, Amatic SC fonts, and floating SVG shapes"

git push
