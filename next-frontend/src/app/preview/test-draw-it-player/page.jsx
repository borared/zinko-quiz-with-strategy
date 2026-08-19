"use client";
import DrawItPlayer from "@/components/Play/DrawItPlayer";
import { useState } from "react";

import { useSocketStore } from "@/store/useSocketStore";

export default function TestDrawItPlayer() {
  const [winner, setWinner] = useState(null);
  
  const triggerMockFeedback = (score, guess) => {
    // This is a hacky but effective way to trigger the socket listener manually in the preview
    const listeners = useSocketStore.getState().getSocket()?._callbacks?.['$game:draw-it-guess-feedback'];
    if (listeners) {
      listeners.forEach(cb => cb({ score, guess }));
    }
  };

  return (
    <div className="w-full h-screen bg-zk-blue relative">
      <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2">
        <button onClick={() => setWinner("A")} className="bg-zk-panel-bg p-2 rounded border-2 border-black font-bold">Team A Wins</button>
        <button onClick={() => setWinner(null)} className="bg-zk-panel-bg p-2 rounded border-2 border-black font-bold">Reset Winner</button>
        <div className="h-4"></div>
        <button onClick={() => triggerMockFeedback(70, "animal")} className="bg-orange-400 p-2 rounded border-2 border-black font-bold text-white">Mock Warm (70%)</button>
        <button onClick={() => triggerMockFeedback(90, "dig")} className="bg-red-500 p-2 rounded border-2 border-black font-bold text-white">Mock Hot (90%)</button>
      </div>
      <DrawItPlayer 
        pin="TEST_PIN" 
        playerId="player1"
        winnerTeam={winner}
        winnerNickname={winner ? "TestUser" : null}
        word={winner ? "apple" : null}
        teamNames={{A: "Alpha", B: "Beta"}}
        background="/images/hero_bg2.png"
      />
    </div>
  );
}
