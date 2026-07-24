import ComingSoonPage from '@/components/global/ComingSoonPage';

export const metadata = {
  title: 'Blog | Zinko',
  description: 'Zinko blog — coming soon',
};

export default function BlogPage() {
  return (
    <ComingSoonPage
      featureName="Blog"
      description="Stories, tips, and updates from the Zinko team are on the way. Check back soon for fresh content!"
    />
  );
}