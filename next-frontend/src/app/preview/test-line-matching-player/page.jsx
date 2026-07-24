"use client";

import React, { useEffect, useState } from 'react';
import PlayHeader from '@/components/Play/PlayHeader';
import QuestionPrompt from '@/components/Play/QuestionPrompt';
import LineMatchingPlay from '@/components/Play/LineMatchingPlay';
import { QUESTION_TYPES } from '@/lib/questionTypes';
import { parseLineMatchingAnswer } from '@/lib/lineMatchingUtils';
import { shuffleArray } from '@/lib/dragLayersUtils';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

const MOCK_PAIRS = [
  {
    leftId: 'L-pair-1',
    rightId: 'R-pair-1',
    leftText: 'France',
    rightText: 'Paris — the capital and largest city of France',
    leftColor: 'bg-[#5D3FD3]',
    rightColor: 'bg-[#FFCD29]',
  },
  {
    leftId: 'L-pair-2',
    rightId: 'R-pair-2',
    leftText: 'Japan',
    rightText: 'Tokyo, the political and economic center of Japan',
    leftColor: 'bg-[#3B68FF]',
    rightColor: 'bg-[#FF6B4A]',
  },
  {
    leftId: 'L-pair-3',
    rightId: 'R-pair-3',
    leftText: 'Brazil',
    rightText: 'Brasília, the planned federal capital built in the 1960s',
    leftColor: 'bg-[#2ea84a]',
    rightColor: 'bg-[#5D3FD3]',
  },
  {
    leftId: 'L-pair-4',
    rightId: 'R-pair-4',
    leftText: 'Egypt',
    rightText: 'Cairo, a major city on the Nile in northern Egypt',
    leftColor: 'bg-[#FF6B4A]',
    rightColor: 'bg-[#2ea84a]',
  },
];

const LEFT_ITEMS = MOCK_PAIRS.map((pair) => ({
  id: pair.leftId,
  text: pair.leftText,
  color: pair.leftColor,
}));

const ORDERED_RIGHT_ITEMS = MOCK_PAIRS.map((pair) => ({
  id: pair.rightId,
  text: pair.rightText,
  color: pair.rightColor,
}));

const CORRECT_MATCHES = Object.fromEntries(
  MOCK_PAIRS.map((pair) => [pair.leftId, pair.rightId])
);

function buildMockQuestion(rightItems) {
  return {
    index: 0,
    round: 1,
    match: 1,
    total: 10,
    questionText: 'Match each country to its capital',
    questionType: QUESTION_TYPES.LINE_MATCHING,
    pairCount: MOCK_PAIRS.length,
    leftItems: LEFT_ITEMS,
    rightItems,
    answers: [],
    timeSeconds: 45,
  };
}

export default function TestLineMatchingPlayerPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [submittedPayload, setSubmittedPayload] = useState(null);
  const [mockQuestion, setMockQuestion] = useState(() => buildMockQuestion(ORDERED_RIGHT_ITEMS));
  const timeLeft = 45;

  useEffect(() => {
    setMockQuestion(buildMockQuestion(shuffleArray(ORDERED_RIGHT_ITEMS)));
  }, []);

  const handleSubmitMatches = (payload) => {
    setSelectedId('preview-submitted');
    setSubmittedPayload(payload);
    console.log('Submitted matches:', payload);
  };

  const handleReset = () => {
    setSelectedId(null);
    setSubmittedPayload(null);
    setMockQuestion(buildMockQuestion(shuffleArray(ORDERED_RIGHT_ITEMS)));
  };

  const submitted = parseLineMatchingAnswer(submittedPayload);
  const isCorrect = submitted
    ? Object.keys(CORRECT_MATCHES).every((leftId) => submitted[leftId] === CORRECT_MATCHES[leftId])
    : false;

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={battleBackgroundStyle('/background_battle/city.jpg')}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 h-full">
        <PlayHeader
          nickname="Preview Player"
          question={mockQuestion}
          timeLeft={timeLeft}
          totalTime={mockQuestion.timeSeconds}
        />

        <QuestionPrompt
          phase={selectedId ? 'ANSWERED' : 'PLAYING'}
          question={mockQuestion}
          selectedId={selectedId}
          playerSkill={null}
          isSkillLockedOut={false}
          skillLockoutMsg=""
          skillChargesLeft={0}
          foxSmokescreen={false}
          handleUseSkill={() => {}}
        >
          <LineMatchingPlay
            key={mockQuestion.rightItems.map((item) => item.id).join('-')}
            question={mockQuestion}
            phase={selectedId ? 'ANSWERED' : 'PLAYING'}
            selectedId={selectedId}
            foxSmokescreen={false}
            onSubmitMatches={handleSubmitMatches}
            inPanel
          />
        </QuestionPrompt>

        {submittedPayload && (
          <div className="mx-4 mb-6 rounded-xl border-[3px] border-zk-black bg-white/95 p-4 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-black uppercase tracking-widest text-sm mb-2">
              {isCorrect ? 'All pairs correct!' : 'Submitted — check the console for payload'}
            </p>
            <p className="text-zk-black/70 text-sm font-bold mb-3 break-all">
              {submittedPayload}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 rounded-lg border-[3px] border-zk-black bg-zk-yellow font-black uppercase text-sm shadow-[3px_3px_0_0_#000] active:translate-y-0.5"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}