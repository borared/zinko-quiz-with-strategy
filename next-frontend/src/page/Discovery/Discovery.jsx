"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';

const PAGE_SIZE = 12;
const PREFETCH_ROOT_MARGIN = '1200px';

const Discovery = () => {
  const { disconnectSocket } = useSocketStore();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hasMoreQuizzes, setHasMoreQuizzes] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const paginationRef = useRef({
    nextCursor: null,
    hasNextPage: false,
    isFetching: false,
  });
  const sentinelRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const buildSearchParam = useCallback((search) => {
    return search ? `&search=${encodeURIComponent(search)}` : '';
  }, []);

  const fetchMoreQuizzes = useCallback(async (search = debouncedSearch) => {
    const pagination = paginationRef.current;
    if (pagination.isFetching || !pagination.hasNextPage) return;

    pagination.isFetching = true;
    try {
      const searchParam = buildSearchParam(search);
      const cursorParam = encodeURIComponent(pagination.nextCursor);
      const data = await api.get(
        `/api/quizzes/public?limit=${PAGE_SIZE}&cursor=${cursorParam}${searchParam}`
      );

      setQuizzes((prev) => [...prev, ...(data.quizzes || [])]);
      pagination.nextCursor = data.nextCursor || null;
      pagination.hasNextPage = data.hasNextPage === true;
      setHasMoreQuizzes(pagination.hasNextPage);

      if (pagination.hasNextPage) {
        queueMicrotask(() => fetchMoreQuizzes(search));
      }
    } catch (error) {
      console.error('Error fetching more quizzes:', error);
    } finally {
      pagination.isFetching = false;
    }
  }, [debouncedSearch, buildSearchParam]);

  const loadInitialQuizzes = useCallback(async (search = debouncedSearch) => {
    setLoading(true);
    setFetchError(null);
    setHasMoreQuizzes(false);
    paginationRef.current = {
      nextCursor: null,
      hasNextPage: false,
      isFetching: false,
    };

    try {
      const searchParam = buildSearchParam(search);
      const data = await api.get(`/api/quizzes/public?limit=${PAGE_SIZE}${searchParam}`);
      setQuizzes(data.quizzes || []);

      paginationRef.current.nextCursor = data.nextCursor || null;
      paginationRef.current.hasNextPage = data.hasNextPage === true;
      setHasMoreQuizzes(paginationRef.current.hasNextPage);

      if (paginationRef.current.hasNextPage) {
        fetchMoreQuizzes(search);
      }
    } catch (error) {
      console.error('Error fetching public quizzes:', error);
      setFetchError(error.message || 'Error fetching public quizzes');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, buildSearchParam, fetchMoreQuizzes]);

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  useEffect(() => {
    loadInitialQuizzes(debouncedSearch);
  }, [debouncedSearch, loadInitialQuizzes]);

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
    <div className="flex font-sans min-h-screen relative">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://res.cloudinary.com/dicrvjstp/image/upload/v1778512239/Gemini_Generated_Image_o8qfs4o8qfs4o8qf_kqpgha.png")',
          filter: 'brightness(0.8) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-zk-black/40 via-transparent to-zk-black/60" />
      </div>

      <Sidebar />

      <div className="flex-1 p-8 pt-6 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="bg-white border-[3px] border-zk-black rounded-xl p-8 flex flex-col md:flex-row items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-6 relative overflow-hidden">
              <div className="flex flex-col gap-2 z-10">
                <h1 className="text-4xl font-black text-zk-black uppercase tracking-tight leading-tight">
                  DISCOVERY
                </h1>
                <p className="text-zk-black/70 font-bold text-lg">
                  Explore public quizzes and clone them to your dashboard!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white border-[3px] border-zk-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zk-black"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search public quizzes by title..."
                className="w-full text-lg font-bold outline-none placeholder:text-zk-black/50 text-zk-black bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <QuizGrid quizzes={quizzes} loading={loading} isDiscoveryMode />
          {fetchError && (
            <div className="text-red-600 font-bold mt-4">Unable to load quizzes: {fetchError}</div>
          )}

          {!loading && hasMoreQuizzes && (
            <div ref={sentinelRef} className="h-px w-full z-10 relative" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;