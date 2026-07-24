const STORAGE_KEY = 'zinko_new_scenery_slugs';

function readSlugs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(slugs)]));
}

export function getNewScenerySlugs() {
  return readSlugs();
}

export function hasNewScenery(slugs = readSlugs()) {
  return slugs.length > 0;
}

export function markSceneryAsNew(slug) {
  if (!slug) return;
  const slugs = readSlugs();
  if (!slugs.includes(slug)) {
    writeSlugs([...slugs, slug]);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newSceneryChanged'));
  }
}

export function acknowledgeNewScenery(slug) {
  if (!slug) return;
  writeSlugs(readSlugs().filter((entry) => entry !== slug));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newSceneryChanged'));
  }
}

export function acknowledgeAllNewScenery() {
  writeSlugs([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newSceneryChanged'));
  }
}

export function isSceneryNew(slug, slugs = readSlugs()) {
  return slugs.includes(slug);
}