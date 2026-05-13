import React from 'react';
import { useUser } from '@clerk/clerk-react';

const WelcomeBanner = () => {
  const { user } = useUser();
  const firstName = user?.firstName || 'Majora';

  return (
    <div className="bg-white border-[3px] border-zk-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
      <div className="flex flex-col gap-2">
        <h1 className="font-black text-4xl text-zk-black tracking-tight">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 font-medium">Ready to spark some curiosity today? Your students are waiting for their next challenge.</p>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-6 mt-8">
        {/* Card 1 */}
        <div className="bg-[#7C4DFF] border-[3px] border-zk-black p-6 flex flex-col gap-1 w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Games Created</p>
          <p className="text-5xl font-black">2</p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FF6B4A] border-[3px] border-zk-black p-6 flex flex-col gap-1 w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Players</p>
          <p className="text-5xl font-black">30</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
