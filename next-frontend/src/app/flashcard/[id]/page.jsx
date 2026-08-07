import { use } from 'react';
import FlashcardViewerPage from '@/page/Flashcard/FlashcardViewerPage';

export default function Page({ params }) {
  const unwrappedParams = use(params);
  return <FlashcardViewerPage deckId={unwrappedParams.id} />;
}
