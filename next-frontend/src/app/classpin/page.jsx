import ComingSoonPage from '@/components/global/ComingSoonPage';

export const metadata = {
  title: 'Classpin | Zinko',
  description: 'Zinko Classpin — coming soon',
};

export default function ClasspinPage() {
  return (
    <ComingSoonPage
      featureName="Classpin"
      description="Classpin is brewing! Soon you'll be able to pin, share, and manage class quizzes like never before."
    />
  );
}