"use client";
import DrawItPlayer from "@/components/Play/DrawItPlayer";
import { useState } from "react";

export default function TestDrawItPlayer() {
  const [winner, setWinner] = useState(null);
  
  return (
    <div className="w-full h-screen bg-zk-blue p-4 relative">
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <button onClick={() => setWinner("A")} className="bg-white p-2 rounded border-2 border-black font-bold">Team A Wins</button>
        <button onClick={() => setWinner(null)} className="bg-white p-2 rounded border-2 border-black font-bold">Reset Winner</button>
      </div>
      <DrawItPlayer 
        pin="TEST_PIN" 
        playerId="player1"
        winnerTeam={winner}
        winnerNickname={winner ? "TestUser" : null}
        word={winner ? "apple" : null}
        teamNames={{A: "Alpha", B: "Beta"}}
      />
    </div>
  );
}
