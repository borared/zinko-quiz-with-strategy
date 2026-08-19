"use client";

import React from "react";
import MinigamePicker from "@/components/HostGame/MinigamePicker";
import { useRouter } from "next/navigation";

export default function TestMinigamePickerPage() {
  const router = useRouter();

  return (
    <MinigamePicker 
      onPick={(choice) => {
        if (choice === 'DRAW_IT') {
          router.push('/preview/test-draw-it-host');
        } else if (choice === 'IMPOSTER') {
          router.push('/preview/test-imposter-host');
        }
      }}
      background="/images/hero_bg2.png" 
    />
  );
}
