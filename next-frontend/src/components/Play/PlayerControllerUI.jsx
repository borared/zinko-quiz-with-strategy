"use client";
import React from 'react';
import PlayHeader from './PlayHeader';
import QuestionPrompt from './QuestionPrompt';
import AnswerGrid from './AnswerGrid';
import DragLayersPlay from './DragLayersPlay';
import LineMatchingPlay from './LineMatchingPlay';
import { isDragLayersQuestion, isLineMatchingQuestion } from '@/lib/questionTypes';
import ResultOverlay from './ResultOverlay';
import RabbitRush from './Skills/RabbitRush';
import ButterflyEffect from './Skills/ButterflyEffect';
import VaultBreakerPlayer from './VaultBreakerPlayer';
import HigherLowerPlayer from './HigherLowerPlayer';
import ImposterPlayer from './ImposterPlayer';
import FiveGridPlayer from './FiveGridPlayer';
import DrawItPlayer from './DrawItPlayer';
import RewardWheel from '../HostGame/RewardWheel';
import { usePlayerGameState } from '@/hooks/usePlayerGameState';
import { useGameBackground } from '@/hooks/useGameBackground';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

export default function PlayerControllerUI() {
  const gameState = usePlayerGameState();
  const background = useGameBackground(gameState.pin);

  const {
    playerId,
    nickname,
    playerSkill,
    team,
    pin,
    isLeader,
    
    question,
    selectedId,
    phase,
    resultData,
    timeLeft,
    questionTimeLimit,
    
    minigameData,
    higherLowerData,
    fivegridData,
    imposterData,
    minigameSpinner,
    isWheelSpinning,
    
    skillChargesLeft,
    isSkillLockedOut,
    skillLockoutMsg,
    removedAnswers,
    foxSmokescreen,
    rabbitRush,
    butterflyActive,
    teamCounterBlindCharges,
    handleCounterBlind,
    
    handleAnswer,
    handleSubmitLayerOrder,
    handleSubmitMatches,
    handleUseSkill,
    handleHigherLowerGuess,
    handleHigherLowerSetSecret,
    handleHoldButton,
    handleReleaseButton,
    handleFiveGridGuess,
    handleImposterSubmitClue,
    handleImposterSabotageVote
  } = gameState;

  // ── RESULT overlay ──
  if (phase === 'RESULT' && resultData) {
    return <ResultOverlay resultData={resultData} />;
  }

  // ── MINIGAME ──
  if (phase === 'MINIGAME_RACING') {
    const assignedColors = minigameData.playerButtons[playerId] || [];
    return (
      <VaultBreakerPlayer 
        assignedColors={assignedColors}
        onHold={handleHoldButton}
        onRelease={handleReleaseButton}
        isLeader={isLeader}
      />
    );
  }

  if (phase === 'MINIGAME_FIVEGRID') {
    return (
      <FiveGridPlayer 
        fivegridData={gameState.fivegridData}
        team={team}
        onGuess={gameState.handleFiveGridGuess}
        background={background}
        isLeader={isLeader}
      />
    );
  }

  if (phase === 'MINIGAME_FIVEGRID_CATEGORY_PICK') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-20 text-white"
        style={battleBackgroundStyle(background)}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-[6px] border-zk-yellow border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-widest mb-4">Host is Choosing</h2>
          <p className="text-xl font-bold opacity-80">The Host is selecting a Word Category.</p>
          <p className="text-lg opacity-60 mt-2">Get ready to discuss with your team!</p>
        </div>
      </div>
    );
  }

  if (phase === 'MINIGAME_HIGHER_LOWER') {
    return (
      <HigherLowerPlayer 
        onGuess={handleHigherLowerGuess}
        onSetSecret={handleHigherLowerSetSecret}
        statusObj={higherLowerData.status}
        subPhase={higherLowerData.subPhase}
        currentTurn={higherLowerData.currentTurn}
        team={team}
        background={background}
        isLeader={isLeader}
      />
    );
  }

  if (phase === 'MINIGAME_DRAW_IT') {
    return (
      <DrawItPlayer
        pin={pin}
        playerId={playerId}
        winnerTeam={minigameData.winner}
        winnerNickname={minigameData.winnerNickname}
        word={minigameData.word}
        teamNames={minigameData.teamNames}
        isLeader={isLeader}
        background={background}
      />
    );
  }

  if (phase === 'MINIGAME_IMPOSTER') {
    return (
      <div 
        className="min-h-screen flex flex-col relative transition-colors duration-300 p-0 bg-zk-black"
      >
        <div className="relative z-10 w-full h-full flex-1">
          <ImposterPlayer 
            pin={pin}
            playerId={playerId}
            imposterData={imposterData}
            team={team}
            isLeader={isLeader}
            onSubmitClue={handleImposterSubmitClue}
            onSabotageVote={handleImposterSabotageVote}
          />
        </div>
      </div>
    );
  }

  if (phase === 'MINIGAME_REWARD') {
    const isMe = minigameSpinner.id === playerId;
    
    if (minigameData.winner && minigameData.winner !== team) {
      return (
        <div 
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-20 text-white"
          style={battleBackgroundStyle(background)}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10 flex flex-col items-center">
            <img src="/images/model_answer/wrong.png" alt="Defeat" className="w-56 h-56 mb-6 drop-shadow-[0_10px_0_rgba(0,0,0,0.5)] animate-bounce" />
            <h2 className="gasoek-one-regular text-6xl text-zk-red uppercase tracking-widest mb-2 drop-shadow-[0_4px_0_#000]" style={{ WebkitTextStroke: '2px black' }}>DEFEAT</h2>
            <p className="text-4xl text-white font-bold" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>Team {minigameData.winner} Won!</p>
            <p className="text-2xl text-white/80 font-bold mt-2" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}>Waiting for them to spin...</p>
          </div>
        </div>
      );
    }

    return (
      <RewardWheel 
        pin={pin}
        winnerTeam={minigameData.winner}
        spinnerName={minigameSpinner.name}
        isSpinner={isMe}
        preSelectedRewardId={minigameSpinner.preSelectedRewardId}
        externalSpinTrigger={isWheelSpinning}
        onRewardClaimed={() => {}} // Host handles server transition
        playerId={playerId}
        isHost={false}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden relative transition-colors duration-300"
      style={battleBackgroundStyle(background)}
    >
      <RabbitRush isActive={rabbitRush} />
      <ButterflyEffect isActive={butterflyActive} />

      {/* Warm overlay matching host screen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />
      
      {/* ── Content wrapper to sit above overlay ── */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 h-full">
        <PlayHeader 
          nickname={nickname}
          question={question}
          timeLeft={timeLeft}
          totalTime={questionTimeLimit}
        />

        <QuestionPrompt
          phase={phase}
          question={question}
          selectedId={selectedId}
          playerSkill={playerSkill}
          isSkillLockedOut={isSkillLockedOut}
          skillLockoutMsg={skillLockoutMsg}
          skillChargesLeft={skillChargesLeft}
          foxSmokescreen={foxSmokescreen}
          handleUseSkill={handleUseSkill}
        >
          {isDragLayersQuestion(question?.questionType) && (
            <DragLayersPlay
              question={question}
              phase={phase}
              selectedId={selectedId}
              foxSmokescreen={foxSmokescreen}
              isLeader={isLeader}
              teamCounterBlindCharges={teamCounterBlindCharges}
              onCounterBlind={handleCounterBlind}
              onSubmitOrder={handleSubmitLayerOrder}
              inPanel
            />
          )}
          {isLineMatchingQuestion(question?.questionType) && (
            <LineMatchingPlay
              question={question}
              phase={phase}
              selectedId={selectedId}
              foxSmokescreen={foxSmokescreen}
              isLeader={isLeader}
              teamCounterBlindCharges={teamCounterBlindCharges}
              onCounterBlind={handleCounterBlind}
              onSubmitMatches={handleSubmitMatches}
              timeLeft={timeLeft}
              inPanel
            />
          )}
        </QuestionPrompt>

        {!isDragLayersQuestion(question?.questionType) && !isLineMatchingQuestion(question?.questionType) && (
          <AnswerGrid
            question={question}
            phase={phase}
            selectedId={selectedId}
            removedAnswers={removedAnswers}
            foxSmokescreen={foxSmokescreen}
            isLeader={isLeader}
            teamCounterBlindCharges={teamCounterBlindCharges}
            onCounterBlind={handleCounterBlind}
            handleAnswer={(answerId) => handleAnswer(answerId, removedAnswers)}
          />
        )}
      </div>
    </div>
  );
}
