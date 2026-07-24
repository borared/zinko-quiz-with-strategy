"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Sidebar from '../../components/Dashboard/Sidebar';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import DiscoverySearchIdle from '@/components/Discovery/DiscoverySearchIdle';
import DiscoverySearchNotFound from '@/components/Discovery/DiscoverySearchNotFound';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';
import { mergeQuizzesById } from '@/store/useDashboardQuizStore';
import { useDiscoveryQuizStore } from '@/store/useDiscoveryQuizStore';
import { useDayNight } from '@/hooks/useDayNight';


const DISCOVERY_DAY_IMAGE = '/images/discovery-day.jpg';
const DISCOVERY_NIGHT_IMAGE = '/images/discovery-night.jpg';

const PAGE_SIZE = 12;
const PREFETCH_ROOT_MARGIN = '1200px';
const SUGGESTION_LIMIT = 8;
const SEARCH_PREFETCH_DEBOUNCE_MS = 200;

const BROWSE_KEY = '';

const Discovery = () => {
  const { disconnectSocket } = useSocketStore();
  const isDay = useDayNight();
  const {
    isCached,
    getCache,
    setInitialCache,
    appendQuizzes,
    hasPersistedQuizzes,
  } = useDiscoveryQuizStore();

  const [clientReady, setClientReady] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hasMoreQuizzes, setHasMoreQuizzes] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const paginationRef = useRef({
    nextCursor: null,
    hasNextPage: false,
    isFetching: false,
    activeSearch: BROWSE_KEY,
  });
  const sentinelRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchPrefetchRef = useRef({});
  const draftQueryRef = useRef('');

  const isDrafting =
    inputValue.trim().length > 0 && inputValue.trim() !== committedSearch.trim();

  const showNotFound =
    !isDrafting && !loading && committedSearch.trim().length > 0 && quizzes.length === 0;

  const buildSearchParam = useCallback((search) => {
    return search ? `&search=${encodeURIComponent(search)}` : '';
  }, []);

  const syncPaginationFromCache = useCallback((search, cache) => {
    paginationRef.current = {
      nextCursor: cache.nextCursor,
      hasNextPage: cache.hasNextPage,
      isFetching: false,
      activeSearch: search.trim(),
    };
  }, []);

  const applySearchPage = useCallback(
    (search, data) => {
      const trimmed = search.trim();
      const nextQuizzes = data.quizzes || [];

      setQuizzes(nextQuizzes);
      setLoading(false);
      setFetchError(null);
      setInitialCache(trimmed, {
        quizzes: nextQuizzes,
        nextCursor: data.nextCursor || null,
        hasNextPage: data.hasNextPage === true,
      });

      paginationRef.current = {
        nextCursor: data.nextCursor || null,
        hasNextPage: data.hasNextPage === true,
        isFetching: false,
        activeSearch: trimmed,
      };
      setHasMoreQuizzes(paginationRef.current.hasNextPage);

      return paginationRef.current.hasNextPage;
    },
    [setInitialCache]
  );

  const applyCache = useCallback(
    (search) => {
      const cache = getCache(search);
      if (!cache?.isHydrated) return false;

      setLoading(false);
      setFetchError(null);
      setQuizzes(cache.quizzes);
      setHasMoreQuizzes(cache.hasNextPage);
      syncPaginationFromCache(search, cache);
      return true;
    },
    [getCache, syncPaginationFromCache]
  );

  const fetchMoreQuizzes = useCallback(
    async (search = committedSearch) => {
      const pagination = paginationRef.current;
      if (pagination.isFetching || !pagination.hasNextPage) return;
      if (pagination.activeSearch !== search.trim()) return;

      pagination.isFetching = true;
      try {
        const searchParam = buildSearchParam(search);
        const cursorParam = encodeURIComponent(pagination.nextCursor);
        const data = await api.get(
          `/api/quizzes/public?limit=${PAGE_SIZE}&cursor=${cursorParam}${searchParam}`
        );

        if (pagination.activeSearch !== search.trim()) return;

        setQuizzes((prev) => mergeQuizzesById(prev, data.quizzes || []));
        appendQuizzes(search, {
          quizzes: data.quizzes || [],
          nextCursor: data.nextCursor || null,
          hasNextPage: data.hasNextPage === true,
        });

        pagination.nextCursor = data.nextCursor || null;
        pagination.hasNextPage = data.hasNextPage === true;
        setHasMoreQuizzes(pagination.hasNextPage);

      } catch (error) {
        console.error('Error fetching more quizzes:', error);
      } finally {
        pagination.isFetching = false;
      }
    },
    [committedSearch, buildSearchParam, appendQuizzes]
  );

  const loadInitialQuizzes = useCallback(
    async (
      search = committedSearch,
      { useCache = true, showSkeleton = true, silent = false } = {}
    ) => {
      const trimmed = search.trim();

      if (!silent && useCache && isCached(trimmed) && applyCache(trimmed)) {
        return;
      }

      if (!silent) {
        if (showSkeleton) {
          setQuizzes([]);
          setLoading(true);
        } else if (!isCached(trimmed)) {
          setLoading(true);
        }

        setFetchError(null);
        setHasMoreQuizzes(false);
        paginationRef.current = {
          nextCursor: null,
          hasNextPage: false,
          isFetching: false,
          activeSearch: trimmed,
        };
      } else {
        paginationRef.current.activeSearch = trimmed;
      }

      try {
        const searchParam = buildSearchParam(trimmed);
        const data = await api.get(`/api/quizzes/public?limit=${PAGE_SIZE}${searchParam}`);

        if (paginationRef.current.activeSearch !== trimmed) return;

        applySearchPage(trimmed, data);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
        if (!silent) {
          setFetchError(error.message || 'Error fetching public quizzes');
          setLoading(false);
        }
      }
    },
    [
      committedSearch,
      buildSearchParam,
      fetchMoreQuizzes,
      isCached,
      applyCache,
      getCache,
      applySearchPage,
    ]
  );

  const commitSearch = useCallback(
    (query) => {
      const trimmed = query.trim();
      setInputValue(trimmed);
      setCommittedSearch(trimmed);
      setShowSuggestions(false);

      if (isCached(trimmed) && applyCache(trimmed)) {
        return;
      }

      const prefetched = searchPrefetchRef.current[trimmed];
      if (prefetched?.status === 'ready') {
        applySearchPage(trimmed, prefetched);
        return;
      }

      if (suggestions.length > 0 && draftQueryRef.current === trimmed) {
        setQuizzes(suggestions);
        setLoading(false);
        setFetchError(null);
        loadInitialQuizzes(trimmed, { useCache: false, showSkeleton: false });
        return;
      }

      loadInitialQuizzes(trimmed, { useCache: false, showSkeleton: true });
    },
    [
      isCached,
      applyCache,
      getCache,
      fetchMoreQuizzes,
      applySearchPage,
      suggestions,
      loadInitialQuizzes,
    ]
  );

  const initializedRef = useRef(false);

  useEffect(() => {
    useDiscoveryQuizStore.getState().hydrateFromSession();
    setClientReady(true);
  }, []);

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  useEffect(() => {
    if (!clientReady) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (isCached(BROWSE_KEY)) {
      applyCache(BROWSE_KEY);
      loadInitialQuizzes(BROWSE_KEY, {
        useCache: false,
        showSkeleton: false,
        silent: true,
      });
      return;
    }

    loadInitialQuizzes(BROWSE_KEY);
  }, [
    clientReady,
    loadInitialQuizzes,
    isCached,
    applyCache,
  ]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    draftQueryRef.current = trimmed;

    if (!trimmed || !isDrafting) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const handler = setTimeout(async () => {
      const query = trimmed;
      setSuggestionsLoading(true);
      searchPrefetchRef.current[query] = { status: 'loading' };

      try {
        const data = await api.get(
          `/api/quizzes/public?limit=${PAGE_SIZE}&search=${encodeURIComponent(query)}`
        );

        if (draftQueryRef.current !== query) return;

        const results = data.quizzes || [];
        setSuggestions(results.slice(0, SUGGESTION_LIMIT));
        setShowSuggestions(true);

        searchPrefetchRef.current[query] = {
          status: 'ready',
          quizzes: results,
          nextCursor: data.nextCursor || null,
          hasNextPage: data.hasNextPage === true,
        };
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (draftQueryRef.current === query) {
          setSuggestions([]);
        }
        delete searchPrefetchRef.current[query];
      } finally {
        if (draftQueryRef.current === query) {
          setSuggestionsLoading(false);
        }
      }
    }, SEARCH_PREFETCH_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [inputValue, isDrafting]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasMoreQuizzes || isDrafting) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchMoreQuizzes();
        }
      },
      { rootMargin: PREFETCH_ROOT_MARGIN }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMoreQuizzes, loading, hasMoreQuizzes, quizzes.length, isDrafting]);

  const handleClear = () => {
    setInputValue('');
    setCommittedSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    draftQueryRef.current = '';
    loadInitialQuizzes(BROWSE_KEY);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSearch(inputValue);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const browseCached = isCached(BROWSE_KEY);
  const hasPersistedBrowse = hasPersistedQuizzes(BROWSE_KEY);
  const showGridSkeleton =
    !clientReady
    || (loading && quizzes.length === 0 && !(browseCached || hasPersistedBrowse));

  return (
    <WorkspaceShell sidebar={<Sidebar />} contentClassName="discovery-shell">
      <div className="relative zk-panel !shadow-none overflow-hidden min-h-[180px] md:min-h-[200px]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${isDay ? DISCOVERY_DAY_IMAGE : DISCOVERY_NIGHT_IMAGE})`,
          }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 transition-colors duration-700 ${isDay
              ? 'bg-gradient-to-r from-zk-black/75 via-zk-black/45 to-zk-black/20'
              : 'bg-gradient-to-r from-zk-black/85 via-zk-black/60 to-zk-black/35'
            }`}
          aria-hidden="true"
        />

        <div className="relative z-10 p-6 md:p-8">
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-yellow mb-1"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}
          >
            Community Library
          </p>
          <h1
            className="font-['Outfit'] text-4xl md:text-5xl font-black text-white tracking-tight uppercase"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
          >
            Discovery
          </h1>
          <p
            className="amatic-sc-regular text-xl md:text-2xl text-white/90 mt-2 max-w-lg leading-snug"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.7)', letterSpacing: '0.5px' }}
          >
            Explore public quizzes from other creators and clone them to your library.
          </p>
        </div>
      </div>

      <div ref={searchWrapRef} className="relative z-20">
        <div className="zk-panel-glass !shadow-none px-4 py-3 flex items-center gap-3">
          <Search size={22} strokeWidth={2.5} className="text-zk-black shrink-0" />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full text-base md:text-lg font-bold outline-none placeholder:text-zk-black/40 text-zk-black bg-transparent"
            value={inputValue}
            onChange={(e) => {
              const next = e.target.value;
              if (next.trim() === '') {
                if (inputValue || committedSearch) {
                  handleClear();
                }
                return;
              }
              setInputValue(next);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (inputValue.trim() && isDrafting) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showSuggestions && isDrafting}
            aria-autocomplete="list"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-black uppercase text-zk-black/50 hover:text-zk-black shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {isDrafting && showSuggestions && (
          <ul
            className="absolute top-full left-0 right-0 mt-2 zk-panel !shadow-none overflow-hidden z-30"
            role="listbox"
          >
            {suggestionsLoading && (
              <li className="px-4 py-3 flex items-center gap-2 text-sm font-bold text-zk-black/50">
                <Loader2 size={16} className="animate-spin" />
                Finding matches...
              </li>
            )}
            {!suggestionsLoading && suggestions.length === 0 && inputValue.trim() && (
              <li className="px-4 py-3 text-sm font-bold text-zk-black/50">
                No similar titles found — press Enter to search
              </li>
            )}
            {!suggestionsLoading &&
              suggestions.map((quiz) => (
                <li key={quiz.id} role="option">
                  <button
                    type="button"
                    onClick={() => commitSearch(quiz.title)}
                    className="w-full text-left px-4 py-3 font-bold text-zk-black hover:bg-zk-yellow/40 transition-colors flex items-center gap-3 border-b border-zk-black/10 last:border-b-0"
                  >
                    <Search size={14} className="text-zk-black/40 shrink-0" />
                    <span className="truncate">{quiz.title}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {isDrafting ? (
        <DiscoverySearchIdle query={inputValue.trim()} />
      ) : showNotFound ? (
        <DiscoverySearchNotFound query={committedSearch} onClear={handleClear} />
      ) : (
        <>
          <QuizGrid
            quizzes={quizzes}
            loading={showGridSkeleton}
            isDiscoveryMode
          />

          {fetchError && (
            <div className="zk-panel !shadow-none bg-red-50 text-red-700 font-bold p-4">
              Unable to load quizzes: {fetchError}
            </div>
          )}

          {!showGridSkeleton && hasMoreQuizzes && (
            <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
          )}
        </>
      )}
    </WorkspaceShell>
  );
};

export default Discovery;