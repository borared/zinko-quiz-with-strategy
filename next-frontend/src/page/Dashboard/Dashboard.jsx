"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import { useUser } from '@clerk/nextjs';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 12;
const PREFETCH_ROOT_MARGIN = '1200px';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { disconnectSocket } = useSocketStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const router = useRouter();

  const {
    quizzes,
    totalQuizCount,
    hasNextPage,
    nextCursor,
    isCachedForUser,
    hasPersistedQuizzes,
    setInitialCache,
    appendQuizzes,
  } = useDashboardQuizStore();

  const quizzesCached = Boolean(user?.id && isCachedForUser(user.id));
  const hasPersistedData = hasPersistedQuizzes();

  const [clientReady, setClientReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const paginationRef = useRef({
    nextCursor: null,
    hasNextPage: false,
    isFetching: false,
  });
  const sentinelRef = useRef(null);
  const initializedForUserRef = useRef(null);

  const syncPaginationRef = useCallback((cursor, hasMore) => {
    paginationRef.current.nextCursor = cursor;
    paginationRef.current.hasNextPage = hasMore;
  }, []);

  const fetchMoreQuizzes = useCallback(async () => {
    const pagination = paginationRef.current;
    if (pagination.isFetching || !pagination.hasNextPage || !user) return;

    pagination.isFetching = true;
    try {
      const cursorParam = encodeURIComponent(pagination.nextCursor);
      const data = await api.get(
        `/api/quizzes/user/${user.id}?cursor=${cursorParam}&limit=${PAGE_SIZE}`
      );

      appendQuizzes({
        quizzes: data.quizzes || [],
        nextCursor: data.nextCursor || null,
        hasNextPage: data.hasNextPage === true,
      });

      pagination.nextCursor = data.nextCursor || null;
      pagination.hasNextPage = data.hasNextPage === true;

      const storeState = useDashboardQuizStore.getState();
      const allLoaded =
        storeState.totalQuizCount != null &&
        storeState.quizzes.length >= storeState.totalQuizCount;

      if (pagination.hasNextPage && !allLoaded) {
        queueMicrotask(() => fetchMoreQuizzes());
      } else if (allLoaded) {
        pagination.hasNextPage = false;
      }
    } catch (error) {
      console.error('Error fetching more quizzes:', error);
    } finally {
      pagination.isFetching = false;
    }
  }, [user, appendQuizzes]);

  const loadInitialQuizzes = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      if (!silent) setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setFetchError(null);
    }

    paginationRef.current = {
      nextCursor: null,
      hasNextPage: false,
      isFetching: false,
    };

    try {
      const data = await api.get(`/api/quizzes/user/${user.id}?limit=${PAGE_SIZE}`);

      setInitialCache({
        userId: user.id,
        quizzes: data.quizzes || [],
        totalQuizCount: data.totalCount,
        nextCursor: data.nextCursor || null,
        hasNextPage: data.hasNextPage === true,
      });

      syncPaginationRef(data.nextCursor || null, data.hasNextPage === true);

      if (data.hasNextPage === true) {
        fetchMoreQuizzes();
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      if (!silent) {
        setFetchError(error.message || 'Error fetching quizzes');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, setInitialCache, syncPaginationRef, fetchMoreQuizzes]);

  useEffect(() => {
    useDashboardQuizStore.getState().hydrateFromSession();
    setClientReady(true);
  }, []);

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  useEffect(() => {
    if (!user?.id) return;

    const state = useDashboardQuizStore.getState();
    if (state.isHydrated && state.userId && state.userId !== user.id) {
      useDashboardQuizStore.getState().invalidate();
      initializedForUserRef.current = null;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!clientReady || !isLoaded || !isJwtReady || !user?.id) return;
    if (initializedForUserRef.current === user.id) return;
    initializedForUserRef.current = user.id;

    if (isCachedForUser(user.id)) {
      setLoading(false);
      setFetchError(null);
      syncPaginationRef(nextCursor, hasNextPage);
      paginationRef.current.isFetching = false;

      const allQuizzesLoaded =
        totalQuizCount != null && quizzes.length >= totalQuizCount;

      if (hasNextPage && !allQuizzesLoaded) {
        fetchMoreQuizzes();
      }

      loadInitialQuizzes({ silent: true });
      return;
    }

    loadInitialQuizzes();
  }, [
    clientReady,
    isLoaded,
    isJwtReady,
    user?.id,
    isCachedForUser,
    nextCursor,
    hasNextPage,
    totalQuizCount,
    quizzes.length,
    loadInitialQuizzes,
    fetchMoreQuizzes,
    syncPaginationRef,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasNextPage) return;

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
  }, [fetchMoreQuizzes, loading, hasNextPage, quizzes.length]);

  return (
    <WorkspaceShell sidebar={<Sidebar />} contentClassName="dashboard-shell">
      <WelcomeBanner />

      <QuizGrid
        quizzes={quizzes}
        loading={
          !clientReady
          || (((!isLoaded || !isJwtReady) && !hasPersistedData)
          || (loading && !quizzesCached && quizzes.length === 0))
        }
        totalQuizCount={totalQuizCount}
      />

      {fetchError && (
        <div className="zk-panel !shadow-none bg-red-50 text-red-700 font-bold p-4">
          Unable to load your quizzes: {fetchError}
        </div>
      )}

      {!loading && hasNextPage && (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={() => router.push('/create-game')}
        aria-label="Create new game"
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-40 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-[5px] border-zk-border bg-zk-purple text-white !shadow-none transition-colors hover:bg-zk-blue"
      >
        <Plus size={32} strokeWidth={4} />
      </button>
    </WorkspaceShell>
  );
};

export default Dashboard;