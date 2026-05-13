const PlayerCount = ({ countA, countB }) => {
  return (
    <div className="flex items-center gap-0 border-[3px] border-zk-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-3 mt-6 rounded-xl">
      
      {/* Team A */}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#4ADE80] border-[2px] border-zk-black inline-block" />
        <span className="font-black text-xs uppercase tracking-widest text-zk-black">
          Team A: {countA} Players
        </span>
      </div>

      {/* Divider */}
      <div className="w-[2px] h-5 bg-gray-300 mx-6" />

      {/* Team B */}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#F87171] border-[2px] border-zk-black inline-block" />
        <span className="font-black text-xs uppercase tracking-widest text-zk-black">
          Team B: {countB} Players
        </span>
      </div>

    </div>
  );
};

export default PlayerCount;
