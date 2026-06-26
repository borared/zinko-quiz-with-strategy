"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import { useUser } from '@clerk/nextjs';
import api from '../../services/api';
import { useSocketStore } from '@/store/useSocketStore';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { disconnectSocket } = useSocketStore();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

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
  }, [loading, isFetchingMore, hasNextPage]);

  const fetchMoreQuizzes = async () => {
    if (!hasNextPage || isFetchingMore || !user) return;
    setIsFetchingMore(true);
    try {
      const data = await api.get(`/api/quizzes/user/${user.id}?cursor=${encodeURIComponent(nextCursor)}&limit=12`);
      setQuizzes((prev) => [...prev, ...(data.quizzes || [])]);
      setNextCursor(data.nextCursor || null);
      setHasNextPage(data.hasNextPage !== undefined ? data.hasNextPage : false);
    } catch (error) {
      console.error('Error fetching more quizzes:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    disconnectSocket();

    const fetchQuizzes = async () => {
      if (!isLoaded) return;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get(`/api/quizzes/user/${user.id}?limit=12`);
        setQuizzes(data.quizzes || data);
        setNextCursor(data.nextCursor || null);
        setHasNextPage(data.hasNextPage !== undefined ? data.hasNextPage : false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setFetchError(error.message || 'Error fetching quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user, isLoaded, disconnectSocket]);

  return (
    <div className="flex bg-[#FFD54F] font-sans min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Welcome Banner & Stats */}
          <WelcomeBanner totalQuizzes={quizzes.length} />

          {/* Recent Quizzes */}
          <QuizGrid quizzes={quizzes} loading={loading} />
          {fetchError && (
            <div className="text-red-600 font-bold mt-4">Unable to load your quizzes: {fetchError}</div>
          )}
          
          {hasNextPage && !loading && (
            <div ref={lastQuizElementRef} className="h-20 w-full flex items-center justify-center mt-4">
              {isFetchingMore && <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-zk-black"></div>}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/create-game')}
        className="fixed bottom-10 right-10 z-50 flex items-center justify-center w-16 h-16 bg-[#FF3366] hover:bg-[#E6004C] text-white rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
      >
        <Plus size={32} strokeWidth={4} />
      </button>
    </div>
  );
};

export default Dashboard;
