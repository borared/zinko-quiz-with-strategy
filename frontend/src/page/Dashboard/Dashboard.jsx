import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import { useUser } from '@clerk/clerk-react';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      try {
        const data = await api.get(`/api/quizzes/user/${user.id}`);
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  return (
    <div className="flex bg-[#FFD54F] font-sans min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Welcome Banner & Stats */}
          <WelcomeBanner />

          {/* Recent Quizzes */}
          <QuizGrid quizzes={quizzes} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
