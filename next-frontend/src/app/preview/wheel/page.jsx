"use client";
import { useState } from "react";
import RewardWheel from "@/components/HostGame/RewardWheel";

export default function WheelPreviewPage() {
  const [key, setKey] = useState(0); // remount wheel on reset

  return (
    <div className="relative w-screen h-screen">
      <RewardWheel
        key={key}
        pin="PREVIEW"
        winnerTeam="A"
        spinnerName="You"
        isSpinner={true}
        preSelectedRewardId={null}
        externalSpinTrigger={false}
        onRewardClaimed={() => setKey(k => k + 1)} // reset wheel
      />
    </div>
  );
}
