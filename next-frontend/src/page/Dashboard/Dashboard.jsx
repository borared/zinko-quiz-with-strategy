"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import { useUser } from '@clerk/nextjs';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 12;
const PREFETCH_ROOT_MARGIN = '1200px';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { disconnectSocket } = useSocketStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [totalQuizCount, setTotalQuizCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hasMoreQuizzes, setHasMoreQuizzes] = useState(false);

  const paginationRef = useRef({
    nextCursor: null,
    hasNextPage: false,
    isFetching: false,
  });
  const sentinelRef = useRef(null);

  const fetchMoreQuizzes = useCallback(async () => {
    const pagination = paginationRef.current;
    if (pagination.isFetching || !pagination.hasNextPage || !user) return;

    pagination.isFetching = true;
    try {
      const cursorParam = encodeURIComponent(pagination.nextCursor);
      const data = await api.get(
        `/api/quizzes/user/${user.id}?cursor=${cursorParam}&limit=${PAGE_SIZE}`
      );

      setQuizzes((prev) => [...prev, ...(data.quizzes || [])]);
      pagination.nextCursor = data.nextCursor || null;
      pagination.hasNextPage = data.hasNextPage === true;
      setHasMoreQuizzes(pagination.hasNextPage);

      if (pagination.hasNextPage) {
        queueMicrotask(() => fetchMoreQuizzes());
      }
    } catch (error) {
      console.error('Error fetching more quizzes:', error);
    } finally {
      pagination.isFetching = false;
    }
  }, [user]);

  const loadInitialQuizzes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    setHasMoreQuizzes(false);
    paginationRef.current = {
      nextCursor: null,
      hasNextPage: false,
      isFetching: false,
    };

    try {
      const data = await api.get(`/api/quizzes/user/${user.id}?limit=${PAGE_SIZE}`);
      setQuizzes(data.quizzes || []);
      if (data.totalCount !== undefined) {
        setTotalQuizCount(data.totalCount);
      }

      paginationRef.current.nextCursor = data.nextCursor || null;
      paginationRef.current.hasNextPage = data.hasNextPage === true;
      setHasMoreQuizzes(paginationRef.current.hasNextPage);

      if (paginationRef.current.hasNextPage) {
        fetchMoreQuizzes();
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setFetchError(error.message || 'Error fetching quizzes');
    } finally {
      setLoading(false);
    }
  }, [user, fetchMoreQuizzes]);

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  useEffect(() => {
    if (!isLoaded || !isJwtReady) return;
    loadInitialQuizzes();
  }, [isLoaded, isJwtReady, loadInitialQuizzes]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasMoreQuizzes) return;

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
  }, [fetchMoreQuizzes, loading, hasMoreQuizzes, quizzes.length]);

  return (
    <div className="flex bg-[#FFD54F] font-sans min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <WelcomeBanner totalQuizzes={totalQuizCount} />

          <QuizGrid quizzes={quizzes} loading={loading} />
          {fetchError && (
            <div className="text-red-600 font-bold mt-4">Unable to load your quizzes: {fetchError}</div>
          )}

          {!loading && hasMoreQuizzes && (
            <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
          )}
        </div>
      </div>

      <button
        onClick={() => router.push('/create-game')}
        className="fixed bottom-10 right-10 z-50 flex items-center justify-center w-16 h-16 bg-[#5D3FD3] hover:bg-zk-blue text-white rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
      >
        <Plus size={32} strokeWidth={4} />
      </button>
    </div>
  );
};

export default Dashboard;