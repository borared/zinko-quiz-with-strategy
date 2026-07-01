"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useSocketStore } from '@/store/useSocketStore';
import { isEmojiHeavy } from '@/lib/lobbyChatUtils';
import { getLobbySticker } from '@/lib/lobbyStickers';
import LobbySticker from '@/components/Play/LobbySticker';

const MESSAGE_MAX = 200;
const POPUP_DURATION_MS = 4500;

/** One-tap trash-talk / hype reactions for the lobby */
const QUICK_EMOJIS = ['😂', '🤡', '💀', '👀', '🔥', '😤', '🙄', '🫵', '💪', '😴', '🗿', '👑'];

function teamAccent(team) {
  return team === 'A' ? 'bg-[#2ea84a]' : 'bg-[#c0392b]';
}

function ChatMessageBody({ message, variant = 'inline' }) {
  const emojiOnly = isEmojiHeavy(message);
  if (emojiOnly) {
    const trimmed = message.trim();
    const primary = trimmed.match(/\p{Extended_Pictographic}/u)?.[0];
    if (primary && getLobbySticker(primary) && trimmed === primary) {
      return <LobbySticker emoji={primary} size="lg" />;
    }
    return <span className="text-2xl leading-none">{message}</span>;
  }
  return (
    <span className={variant === 'popup' ? 'text-base leading-snug' : ''}>{message}</span>
  );
}

export default function PlayerLobbyChat({ pin, playerId, nickname, disabled = false, onChatMessage }) {
  const { getSocket, isConnected } = useSocketStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [popups, setPopups] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const listRef = useRef(null);
  const popupTimers = useRef(new Map());
  const isOpenRef = useRef(isOpen);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const addPopup = (msg) => {
    const popupId = `popup-${msg.id}`;
    setPopups((prev) => [...prev.slice(-4), { ...msg, popupId }]);

    if (popupTimers.current.has(popupId)) {
      clearTimeout(popupTimers.current.get(popupId));
    }

    const timer = setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.popupId !== popupId));
      popupTimers.current.delete(popupId);
    }, POPUP_DURATION_MS);

    popupTimers.current.set(popupId, timer);
  };

  const handleIncomingMessage = (msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });

    const emojiOnly = isEmojiHeavy(msg.message);

    if (emojiOnly) {
      onChatMessage?.(msg);
    } else {
      addPopup(msg);
      if (!isOpenRef.current) {
        setUnread((n) => n + 1);
      }
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected || !pin || !playerId) return;

    const onChatMessage = (msg) => handleIncomingMessage(msg);
    const onChatHistory = ({ messages: history }) => {
      setMessages(history || []);
      setTimeout(scrollToBottom, 50);
    };

    socket.on('lobby:chat-message', onChatMessage);
    socket.on('lobby:chat-history', onChatHistory);
    socket.emit('lobby:chat-history', { pin, playerId });

    return () => {
      socket.off('lobby:chat-message', onChatMessage);
      socket.off('lobby:chat-history', onChatHistory);
      popupTimers.current.forEach((timer) => clearTimeout(timer));
      popupTimers.current.clear();
    };
  }, [getSocket, isConnected, pin, playerId, onChatMessage]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(scrollToBottom, 50);
    } else {
      setShowEmojiPicker(false);
    }
  }, [isOpen, messages.length]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return false;

    const socket = getSocket();
    if (!socket || !pin || !playerId) return false;

    socket.emit('lobby:chat-send', { pin, playerId, message: trimmed });
    return true;
  };

  const handleSend = () => {
    if (sendMessage(draft)) {
      setDraft('');
      setShowEmojiPicker(false);
    }
  };

  const insertEmoji = (emoji) => {
    setDraft((prev) => (prev + emoji).slice(0, MESSAGE_MAX));
    inputRef.current?.focus();
  };

  const handleQuickEmoji = (emoji) => {
    sendMessage(emoji);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((open) => !open);
  };

  return (
    <>
      {/* Message popups — visible even when panel is closed */}
      <div className="fixed bottom-28 right-6 z-[45] flex flex-col items-end gap-3 pointer-events-none w-[min(400px,calc(100vw-2rem))]">
        <AnimatePresence>
          {popups.map((popup) => (
            <motion.div
              key={popup.popupId}
              initial={{ opacity: 0, y: 20, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              className="w-full min-w-[260px] bg-white border-[4px] border-zk-black rounded-2xl shadow-[6px_6px_0_0_#000] px-5 py-4 pointer-events-auto"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`text-xs font-black uppercase text-white px-2.5 py-1 rounded-md ${teamAccent(popup.team)}`}>
                  Team {popup.team}
                </span>
                <span className="text-sm md:text-base font-black text-zk-black uppercase truncate">
                  {popup.nickname}
                  {popup.nickname === nickname ? ' (you)' : ''}
                </span>
              </div>
              <p className="font-bold text-zk-black/90 break-words">
                <ChatMessageBody message={popup.message} variant="popup" />
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="fixed bottom-24 right-6 z-[46] w-[min(340px,calc(100vw-3rem))] bg-white border-[3px] border-zk-black rounded-2xl shadow-[6px_6px_0_0_#000] flex flex-col overflow-visible"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-zk-black bg-zk-yellow rounded-t-2xl">
              <div>
                <p className="font-black text-zk-black uppercase text-sm tracking-wide">Lobby Chat</p>
                <p className="text-[10px] font-bold text-zk-black/60 uppercase">All players · Host can&apos;t see</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:rotate-90 transition-transform"
                aria-label="Close chat"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 max-h-64 min-h-40 overflow-y-auto px-3 py-3 space-y-2 bg-zk-yellow/20">
              {messages.length === 0 ? (
                <p className="text-center text-xs font-bold text-zk-black/50 uppercase py-8">
                  Emojis pop on avatars · Text shows here
                </p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.playerId === playerId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isMe ? (
                          <span className="text-[8px] font-black uppercase text-zk-black/50">You · Team {msg.team}</span>
                        ) : (
                          <>
                            <span className={`text-[8px] font-black uppercase text-white px-1 py-0.5 rounded ${teamAccent(msg.team)}`}>
                              Team {msg.team}
                            </span>
                            <span className="text-[8px] font-black uppercase text-zk-black/70">{msg.nickname}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl border-[2px] break-words ${
                          isMe
                            ? 'bg-zk-blue text-white border-zk-black'
                            : `bg-white text-zk-black border-zk-black ${msg.team === 'A' ? 'ring-2 ring-[#2ea84a]/40' : 'ring-2 ring-[#c0392b]/40'}`
                        } ${isEmojiHeavy(msg.message) ? 'text-2xl' : 'text-sm font-bold'}`}
                        style={{ boxShadow: '2px 2px 0 0 #000' }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick emoji reactions */}
            <div className="flex gap-1 px-3 py-2 border-t-[2px] border-zk-black/15 bg-white overflow-x-auto scrollbar-hide">
              {QUICK_EMOJIS.map((emoji) => {
                const sticker = getLobbySticker(emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleQuickEmoji(emoji)}
                    disabled={disabled}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center border-[2px] border-zk-black rounded-lg bg-zk-yellow/40 hover:bg-zk-yellow hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 overflow-hidden"
                    aria-label={`Send ${sticker?.label || emoji}`}
                  >
                    <LobbySticker emoji={emoji} size="md" withShadow={false} />
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center gap-2 p-3 border-t-[3px] border-zk-black bg-white rounded-b-2xl">
              {showEmojiPicker && (
                <div
                  ref={pickerRef}
                  className="absolute bottom-full right-0 mb-2 z-50 border-[3px] border-zk-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]"
                >
                  <EmojiPicker
                    onEmojiClick={(data) => insertEmoji(data.emoji)}
                    width={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 48 : 320)}
                    height={340}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                    searchPlaceholder="Search emoji..."
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                disabled={disabled}
                className={`border-[2px] border-zk-black p-2 rounded-lg shadow-[2px_2px_0_0_#000] transition-colors disabled:opacity-50 ${
                  showEmojiPicker ? 'bg-zk-yellow text-zk-black' : 'bg-white text-zk-black hover:bg-zk-yellow/50'
                }`}
                aria-label="Open emoji picker"
              >
                <Smile size={18} strokeWidth={3} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_MAX))}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type or pick an emoji..."
                disabled={disabled}
                className="flex-1 border-[2px] border-zk-black rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zk-blue/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={disabled || !draft.trim()}
                className="bg-zk-blue hover:bg-[#5D3FD3] text-white border-[2px] border-zk-black p-2 rounded-lg shadow-[2px_2px_0_0_#000] disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send size={18} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat FAB — bottom right */}
      <motion.button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-[47] flex items-center justify-center w-14 h-14 bg-zk-blue hover:bg-[#5D3FD3] text-white border-[3px] border-zk-black rounded-full shadow-[4px_4px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={26} strokeWidth={3} /> : <MessageCircle size={26} strokeWidth={3} />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FF4B4B] text-white text-[10px] font-black rounded-full border-[2px] border-zk-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </motion.button>
    </>
  );
}