import { Edit3 } from 'lucide-react';
import PlayerSlot from './PlayerSlot';

// TeamPanel - the big colored square for each team
const TeamPanel = ({ teamName, playerCount, color }) => {
  const bgColor     = color === 'green' ? '#2ea84a' : '#c0392b';
  const shadowColor = color === 'green' ? '#1a6b2e' : '#7b1515';

  return (
    <div
      className="flex-1 border-[4px] border-zk-black p-4 flex flex-col gap-3 rounded-xl"
      style={{ backgroundColor: bgColor, boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl text-white uppercase tracking-wider">
            {teamName}
          </span>
          <div className="w-7 h-7 bg-white/20 border-[2px] border-white flex items-center justify-center">
            <Edit3 size={13} color="white" />
          </div>
        </div>
        <div className="bg-white border-[2px] border-zk-black px-2 py-0.5 rounded-xl">
          <span className="font-black text-[10px] text-zk-black uppercase tracking-wider">
            Player Count: {playerCount}
          </span>
        </div>
      </div>

      {/* 2×2 player grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <PlayerSlot key={i} isFirst={i === 0} color={color} />
        ))}
      </div>
    </div>
  );
};

export default TeamPanel;
