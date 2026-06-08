"use client";
const WaitingBar = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-zk-black border-t-[4px] border-zk-black py-4 flex items-center justify-center">
      <span className="font-black text-white uppercase tracking-[0.25em] text-sm animate-pulse">
        Waiting Host to Start...
      </span>
    </div>
  );
};

export default WaitingBar;
