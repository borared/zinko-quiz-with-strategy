"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '@/store/useSocketStore';
import {
  DEFAULT_LOBBY_SCENERY,
  getStoredGameBackground,
  setStoredGameBackground,
} from '@/lib/lobbyScenery';

/** Keeps the host-selected scenery in sync across lobby and the full game session. */
export function useGameBackground(pin) {
  const { getSocket } = useSocketStore();
  const [background, setBackground] = useState(DEFAULT_LOBBY_SCENERY);

  const applyBackground = useCallback((image) => {
    if (!image) return;
    setBackground(image);
    if (pin) setStoredGameBackground(pin, image);
  }, [pin]);

  useEffect(() => {
    if (!pin) return;
    setBackground(getStoredGameBackground(pin));
  }, [pin]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onBackgroundUpdate = ({ background: bg }) => {
      if (bg) applyBackground(bg);
    };

    const onPlayersUpdate = (data) => {
      if (data.background) applyBackground(data.background);
    };

    const onHostInitialized = (data) => {
      if (data.background) applyBackground(data.background);
    };

    const onHostSync = (data) => {
      if (data.background) applyBackground(data.background);
    };

    const onPlayerSync = (data) => {
      if (data.background) applyBackground(data.background);
    };

    const onQuestion = (data) => {
      if (data.background) applyBackground(data.background);
    };

    socket.on('lobby:background-update', onBackgroundUpdate);
    socket.on('lobby:players-update', onPlayersUpdate);
    socket.on('host:initialized', onHostInitialized);
    socket.on('host:sync-state-response', onHostSync);
    socket.on('player:sync-state-response', onPlayerSync);
    socket.on('game:question', onQuestion);

    return () => {
      socket.off('lobby:background-update', onBackgroundUpdate);
      socket.off('lobby:players-update', onPlayersUpdate);
      socket.off('host:initialized', onHostInitialized);
      socket.off('host:sync-state-response', onHostSync);
      socket.off('player:sync-state-response', onPlayerSync);
      socket.off('game:question', onQuestion);
    };
  }, [getSocket, applyBackground]);

  return background;
}