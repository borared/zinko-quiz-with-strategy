"use client";
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    disconnectSocket();

    const fetchPublicQuizzes = async () => {
      try {
        const data = await api.get('/api/quizzes/public');
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
        setFetchError(error.message || 'Error fetching public quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, [disconnectSocket]);

  return (
    <div className="flex bg-[#FFD54F] font-sans min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
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
            {/* Optional graphic here */}
          </div>

          {/* Public Quizzes */}
          <QuizGrid quizzes={quizzes} loading={loading} isDiscoveryMode={true} />
          {fetchError && (
            <div className="text-red-600 font-bold mt-4">Unable to load quizzes: {fetchError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;
