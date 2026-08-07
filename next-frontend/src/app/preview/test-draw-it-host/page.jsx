"use client";
import DrawItHost from "@/components/HostGame/DrawItHost";
import { useState } from "react";

export default function TestDrawItHost() {
  const [winner, setWinner] = useState(null);
  
  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <button onClick={() => setWinner("A")} className="bg-zk-panel-bg p-2 rounded border-2 border-black font-bold">Team A Wins</button>
        <button onClick={() => setWinner(null)} className="bg-zk-panel-bg p-2 rounded border-2 border-black font-bold">Reset Winner</button>
      </div>
      <DrawItHost 
        pin="TEST_PIN" 
        word="apple" 
        roundsRemaining={2} 
        winnerTeam={winner}
        winnerNickname={winner ? "TestUser" : null}
        teamNames={{A: "Alpha", B: "Beta"}}
        background="/images/backgrounds/default.jpg" 
      />
    </div>
  );
}
