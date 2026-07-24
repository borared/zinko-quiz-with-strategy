export function formatDiscoveryCreatorName(creator) {
  if (!creator) return 'Unknown';

  if (creator.username) {
    return `@${creator.username}`;
  }

  const fullName = [creator.first_name, creator.last_name].filter(Boolean).join(' ');
  return fullName || 'Unknown';
}