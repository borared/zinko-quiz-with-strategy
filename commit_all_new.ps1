git add backend/lib/socketHandlers/lobbyHandlers.js
git commit -m "feat(lobby): update lobby handlers to handle new events"

git add backend/repositories/avatarRepository.js
git commit -m "feat(avatar): update avatar repository queries and logic"

git add next-frontend/package.json next-frontend/package-lock.json
git commit -m "chore(deps): update dependencies in next-frontend"

git add next-frontend/src/app/ClientLayoutWrapper.jsx
git commit -m "feat(layout): update ClientLayoutWrapper"

git add next-frontend/src/app/globals.css
git commit -m "style(global): update globals.css styling"

git add next-frontend/src/app/preview/test-drag-layers-player/page.jsx
git commit -m "test(preview): update drag layers test preview page"

git add next-frontend/src/components/Dashboard/QuizCard.jsx
git commit -m "feat(dashboard): enhance QuizCard UI components"

git add next-frontend/src/components/Dashboard/QuizGrid.jsx
git commit -m "feat(dashboard): improve QuizGrid layout and responsiveness"

git add next-frontend/src/components/Dashboard/WelcomeBanner.jsx
git commit -m "feat(dashboard): update WelcomeBanner display"

git add next-frontend/src/components/Discovery/DiscoverySearchIdle.jsx
git commit -m "feat(discovery): update DiscoverySearchIdle component"

git add next-frontend/src/components/Discovery/DiscoverySearchNotFound.jsx
git commit -m "feat(discovery): update DiscoverySearchNotFound states"

git add next-frontend/src/components/EntryPin/AvatarSelector.jsx
git commit -m "feat(entry): update AvatarSelector UI"

git add next-frontend/src/components/EntryPin/EnterNicknameSection.jsx
git commit -m "feat(entry): refine EnterNicknameSection logic and UI"

git add next-frontend/src/components/Play/DragLayersPlay.jsx
git commit -m "fix(play): resolve dnd-kit freeze, add unique idPrefix to DraggableChip, and fix empty space drop zone collision logic"

git add next-frontend/src/components/Play/QuestionPrompt.jsx
git commit -m "feat(play): update QuestionPrompt presentation"

git add next-frontend/src/components/Shop/SceneryDetailModal.jsx
git commit -m "feat(shop): update SceneryDetailModal UI and functionality"

git add next-frontend/src/components/Shop/ShopItemCard.jsx
git commit -m "feat(shop): update ShopItemCard component"

git add next-frontend/src/components/Shop/ShopItemCardSkeleton.jsx
git commit -m "feat(shop): refine ShopItemCardSkeleton loading state"

git add next-frontend/src/components/Shop/TrendingSceneryCarousel.jsx
git commit -m "feat(shop): enhance TrendingSceneryCarousel"

git add next-frontend/src/components/TeamSelect/ChooseTeamSection.jsx
git commit -m "feat(team): update ChooseTeamSection UI"

git add next-frontend/src/components/global/Navbar.jsx
git commit -m "feat(nav): update Navbar layout and items"

git add next-frontend/src/lib/dragLayersUtils.js
git commit -m "fix(play): update dragLayersUtils helper functions"

git add next-frontend/src/lib/sceneryDetails.js
git commit -m "feat(shop): update sceneryDetails constant data"

git add next-frontend/src/middleware.js
git commit -m "chore(middleware): update middleware.js routing config"

git add next-frontend/src/page/Dashboard/Dashboard.jsx
git commit -m "feat(dashboard): update Dashboard page structure"

git add next-frontend/src/page/Discovery/Discovery.jsx
git commit -m "feat(discovery): update Discovery page layout"

git add next-frontend/src/page/Shop/Shop.jsx
git commit -m "feat(shop): update Shop page implementation"

git add backend/prisma/migrations/20250704190000_backfill_avatar_price_cents/
git commit -m "chore(db): add migration for backfilling avatar price cents"

git add next-frontend/public/images/library-cart-day.jpg next-frontend/public/images/library-cart-night.jpg next-frontend/public/images/library-day.jpg next-frontend/public/images/library-night.jpg
git commit -m "feat(assets): add library images for day and night modes"

git add next-frontend/src/app/library/
git commit -m "feat(library): add library app routes"

git add next-frontend/src/components/Library/
git commit -m "feat(library): add Library UI components"

git add next-frontend/src/page/Library/
git commit -m "feat(library): add Library page implementation"

git add next-frontend/src/store/useLibraryCartStore.js next-frontend/src/store/useLibraryCollectionStore.js
git commit -m "feat(library): add zustand stores for library cart and collection"

git push origin grid_map
