import { create } from 'zustand';
import api from '../services/api';
import { DEFAULT_LOBBY_SCENERY, LOBBY_SCENERY } from '@/lib/lobbyScenery';
import {
  acknowledgeNewScenery,
  acknowledgeAllNewScenery,
  getNewScenerySlugs,
  markSceneryAsNew,
} from '@/lib/newSceneryNotice';

const FALLBACK_SCENERY = LOBBY_SCENERY.filter((s) => s.id === 'city');

export const useOwnedSceneryStore = create((set, get) => ({
  ownedScenery: FALLBACK_SCENERY,
  newScenerySlugs: [],
  isLoading: false,

  syncNewScenerySlugs: () => {
    const slugs = getNewScenerySlugs();
    set({ newScenerySlugs: slugs });
    return slugs;
  },

  markSceneryAsNew: (slug) => {
    markSceneryAsNew(slug);
    get().syncNewScenerySlugs();
  },

  acknowledgeNewScenery: (slug) => {
    acknowledgeNewScenery(slug);
    get().syncNewScenerySlugs();
  },

  acknowledgeAllNewScenery: () => {
    acknowledgeAllNewScenery();
    get().syncNewScenerySlugs();
  },

  fetchOwnedScenery: async () => {
    if (!localStorage.getItem('zinko_jwt')) {
      set({ ownedScenery: FALLBACK_SCENERY });
      return FALLBACK_SCENERY;
    }

    if (get().isLoading) return get().ownedScenery;

    set({ isLoading: true });
    try {
      const data = await api.get('/api/sceneries/owned');
      const sceneries = Array.isArray(data?.sceneries) ? data.sceneries : FALLBACK_SCENERY;
      const normalized = sceneries.map((scenery) => ({
        id: scenery.id || scenery.slug,
        slug: scenery.slug || scenery.id,
        name: scenery.name,
        image: scenery.image || scenery.image_url,
        is_default: scenery.is_default,
      }));

      set({ ownedScenery: normalized.length ? normalized : FALLBACK_SCENERY, isLoading: false });
      return normalized;
    } catch (error) {
      console.error('Failed to fetch owned scenery:', error);
      set({ ownedScenery: FALLBACK_SCENERY, isLoading: false });
      return FALLBACK_SCENERY;
    }
  },

  isOwnedImage: (image) => {
    const owned = get().ownedScenery;
    return owned.some((scenery) => scenery.image === image);
  },

  getDefaultImage: () => {
    const owned = get().ownedScenery;
    const city = owned.find((scenery) => scenery.id === 'city' || scenery.slug === 'city');
    return city?.image || DEFAULT_LOBBY_SCENERY;
  },
}));