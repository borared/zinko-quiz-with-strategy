"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';

const Discovery = () => {
  const { disconnectSocket } = useSocketStore();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchMoreQuizzes = async () => {
    if (!hasNextPage || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const data = await api.get(`/api/quizzes/public?limit=12&cursor=${encodeURIComponent(nextCursor)}${searchParam}`);
      setQuizzes(prev => [...prev, ...(data.quizzes || [])]);
      setNextCursor(data.nextCursor || null);
      setHasNextPage(data.hasNextPage !== undefined ? data.hasNextPage : false);
    } catch (error) {
      console.error('Error fetching more quizzes:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const observer = useRef();
  const lastQuizElementRef = useCallback((node) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchMoreQuizzes();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasNextPage, debouncedSearch, nextCursor]);

  useEffect(() => {
    disconnectSocket();

    const fetchInitialQuizzes = async () => {
      setLoading(true);
      try {
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const data = await api.get(`/api/quizzes/public?limit=12${searchParam}`);
        setQuizzes(data.quizzes || data);
        setNextCursor(data.nextCursor || null);
        setHasNextPage(data.hasNextPage !== undefined ? data.hasNextPage : false);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
        setFetchError(error.message || 'Error fetching public quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialQuizzes();
  }, [disconnectSocket, debouncedSearch]);

  return (
    <div className="flex font-sans min-h-screen relative">
      {/* Cinematic Background Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://res.cloudinary.com/dicrvjstp/image/upload/v1778512239/Gemini_Generated_Image_o8qfs4o8qfs4o8qf_kqpgha.png")',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-zk-black/40 via-transparent to-zk-black/60"></div>
      </div>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 pt-6 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {/* Welcome Banner - customized for Discovery */}
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

            {/* Search Bar */}
            <div className="flex items-center gap-4 bg-white border-[3px] border-zk-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zk-black"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search public quizzes by title..."
                className="w-full text-lg font-bold outline-none placeholder:text-zk-black/50 text-zk-black bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Public Quizzes */}
          <QuizGrid quizzes={quizzes} loading={loading} isDiscoveryMode={true} />
          {fetchError && (
            <div className="text-red-600 font-bold mt-4">Unable to load quizzes: {fetchError}</div>
          )}

          {hasNextPage && !loading && (
            <div ref={lastQuizElementRef} className="h-20 w-full flex items-center justify-center mt-4 z-10 relative">
              {isFetchingMore && <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white"></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;
