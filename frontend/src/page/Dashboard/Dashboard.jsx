import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import QuizGrid from '../../components/Dashboard/QuizGrid';

const Dashboard = () => {
  return (
    <div className="flex bg-[#FFD54F] font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Welcome Banner & Stats */}
          <WelcomeBanner />

          {/* Recent Quizzes */}
          <QuizGrid />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
