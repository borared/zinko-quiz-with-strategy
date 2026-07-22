"use client";
import { Users } from 'lucide-react';

const TeamCard = ({ team, label, badge, icon, bgColor, onJoin }) => {
  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-[280px]">
      
      {/* Card Box */}
      <div
        className="relative w-full aspect-square border-[4px] border-zk-black flex items-center justify-center cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] rounded-xl"
        style={{ backgroundColor: bgColor }}
        onClick={onJoin}
      >
        {/* Badge top-left or top-right */}
        <div className="absolute top-[-2px] left-[-2px] bg-white border-[3px] border-zk-black px-3 py-0.5 rounded-xl">
          <span className="font-black text-xs uppercase tracking-wider text-zk-black">{badge}</span>
        </div>

        {/* Team Letter */}
        <span className="text-[100px] md:text-[130px] font-black text-zk-black leading-none select-none">
          {team}
        </span>

       
      </div>

      {/* Join Button */}
      <button
        onClick={onJoin}
        className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] hover:bg-zk-blue text-white border-[4px] border-zk-black py-3 font-black text-sm uppercase tracking-wider transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] mt-5 rounded-lg"
      >
        <Users size={16} />
        Join Team {team}
      </button>

    </div>
  );
};

export default TeamCard;
