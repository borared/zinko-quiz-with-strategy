import { Lightbulb } from 'lucide-react';

const BottomPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Quick Tip */}
      <div className="bg-white border-[3px] border-zk-black rounded-xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#5D3FD3]">
          <Lightbulb size={20} strokeWidth={3} />
          <h3 className="font-black text-sm uppercase">Quick Tip</h3>
        </div>
        <p className="text-xs font-bold text-zk-black/70">
          Using images in your questions increases engagement by up to 40% in high-energy classroom settings!
        </p>
      </div>

      {/* Empty Box */}
      <div className="bg-white border-[3px] border-zk-black rounded-xl p-6">
        {/* Placeholder or empty as in image */}
      </div>

      {/* Duplicate & Remix */}
      <div className="bg-[#6C5CE7] border-[3px] border-zk-black rounded-xl p-6 flex flex-col justify-between gap-4 text-white">
        <div>
          <h3 className="font-black text-sm uppercase mb-1">Duplicate & Remix</h3>
          <p className="text-xs font-bold text-white/80">
            Quickly clone questions or pull from your existing question bank to save time.
          </p>
        </div>
        
        <button className="w-full bg-white text-zk-black border-[2px] border-zk-black py-2 font-bold text-sm flex items-center justify-center gap-2 rounded-lg transition-colors hover:bg-gray-50">
          Open Bank
        </button>
      </div>
    </div>
  );
};

export default BottomPanel;
