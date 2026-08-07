"use client";

const TEAM_COLORS = {
  A: '#4ADE80',
  B: '#F87171',
  C: '#60A5FA',
  D: '#FBBF24',
  E: '#A78BFA',
  F: '#FB923C',
};

const PlayerCount = ({ teams = ['A', 'B'], teamCounts = {} }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 border-[3px] border-zk-border bg-zk-panel-bg px-6 py-3 mt-6 rounded-xl max-w-4xl mx-auto">
      {teams.map((teamId, index) => (
        <div key={teamId} className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full border-[2px] border-zk-border inline-block" 
              style={{ backgroundColor: TEAM_COLORS[teamId] || '#ccc' }}
            />
            <span className="font-black text-xs uppercase tracking-widest text-zk-text whitespace-nowrap">
              Team {teamId}: {teamCounts[teamId] || 0} Players
            </span>
          </div>
          {index < teams.length - 1 && (
            <div className="w-[2px] h-5 bg-gray-300 hidden md:block" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerCount;
