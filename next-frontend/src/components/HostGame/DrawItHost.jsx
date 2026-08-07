import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Eraser, Pen, Mail, Send, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useSocketStore } from '@/store/useSocketStore';

export default function DrawItHost({ pin, word, roundsRemaining, winnerTeam, winnerNickname, teamNames, background }) {
  const canvasRef = useRef(null);
  const { getSocket, isConnected } = useSocketStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState(null);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [eraserSize, setEraserSize] = useState(20);
  const [penSize, setPenSize] = useState(4);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, clickX: 0, clickY: 0 });
  const [activeToolbarSlider, setActiveToolbarSlider] = useState(null);
  const [emailStatus, setEmailStatus] = useState({ show: false, status: 'sending', message: 'Sending word to your email...' });
  const [secretWord, setSecretWord] = useState(word || null);
  const [showWordReveal, setShowWordReveal] = useState(false);

  useEffect(() => {
    setSecretWord(word || null);
    setShowWordReveal(false);
  }, [word]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;
    
    // Automatically send word when round starts/word changes
    if (word) {
      setEmailStatus({ show: true, status: 'sending', message: 'Sending word to your email...' });
      socket.emit('host:send-secret-word', { pin });
    }

    const handleSent = () => setEmailStatus({ show: true, status: 'success', message: 'Secret word sent to your email! 🤫' });
    const handleFailed = ({ message, word: fallbackWord }) => {
      if (fallbackWord) setSecretWord(fallbackWord);
      setEmailStatus({
        show: true,
        status: 'error',
        message: message || 'Failed to send email. Use Reveal Word instead.',
      });
    };

    socket.on('game:secret-word-sent', handleSent);
    socket.on('game:secret-word-email-failed', handleFailed);

    return () => {
      socket.off('game:secret-word-sent', handleSent);
      socket.off('game:secret-word-email-failed', handleFailed);
    };
  }, [word, pin, getSocket, isConnected]);
  // Hide the toast after 5 seconds
  useEffect(() => {
    if (emailStatus.show && emailStatus.status !== 'sending') {
      const timer = setTimeout(() => setEmailStatus(prev => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [emailStatus.show, emailStatus.status]);

  // Handle resizing of canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make canvas fill the parent container, maintaining aspect ratio or just fluid
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight || 500; // default height if flex doesn't expand
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Support both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Calculate relative percentages (0 to 1) so it scales properly on players' screens
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setContextMenu({ visible: false, x: 0, y: 0, clickX: 0, clickY: 0 });
    setActiveToolbarSlider(null);
    
    // Don't draw on right click
    if (e.button === 2) return; 

    setIsDrawing(true);
    const pos = getCoordinates(e);
    setLastPos(pos);
    updateHoverPos(e);
  };

  const updateHoverPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX !== undefined && clientY !== undefined) {
      setHoverPos({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    updateHoverPos(e);
    if (isDrawing) {
      draw(e);
    }
  };

  const draw = (e) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentPos = getCoordinates(e);

    const color = tool === 'eraser' ? '#FFFFFF' : '#000000';
    const width = tool === 'eraser' ? eraserSize : penSize;

    // Draw locally
    ctx.beginPath();
    ctx.moveTo(lastPos.x * canvas.width, lastPos.y * canvas.height);
    ctx.lineTo(currentPos.x * canvas.width, currentPos.y * canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Emit stroke
    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit('host:draw-it-stroke', {
        pin,
        stroke: { start: lastPos, end: currentPos, color, width }
      });
    }

    setLastPos(currentPos);
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit('host:draw-it-clear', { pin });
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    let x = clickX;
    let y = clickY;
    
    // Prevent going off screen (assuming menu is ~200px wide and 80px tall)
    if (x + 200 > rect.width) x -= 200;
    if (y + 80 > rect.height) y -= 80;

    setContextMenu({ visible: true, x, y, clickX, clickY });
  };

  const currentRound = roundsRemaining === 2 ? 1 : (roundsRemaining === 1 ? 2 : 2);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center pt-6 px-4 pb-4 bg-zk-blue"
      style={{
        backgroundImage: `url('${background}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Header Info */}
      <div className="relative z-10 w-full flex items-center justify-between mb-4">
        <div className="bg-zk-panel-bg border-[4px] border-[#000000] rounded-xl px-6 py-2">
          <h2 className="font-black text-2xl">Draw It - Round {currentRound}/2</h2>
        </div>
        
        <div className="bg-zk-bg border-[4px] border-[#000000] rounded-xl px-4 sm:px-6 py-2 flex flex-wrap items-center gap-3">
          <Mail size={24} className="text-black" />
          <span className="font-black text-lg sm:text-xl">
            {emailStatus.status === 'error' ? 'Email failed — reveal word privately' : 'Word sent to your Email'}
          </span>
          <button 
            onClick={() => {
              setEmailStatus({ show: true, status: 'sending', message: 'Sending word to your email...' });
              getSocket()?.emit('host:send-secret-word', { pin });
            }}
            disabled={emailStatus.status === 'sending'}
            className="flex items-center gap-2 font-black text-sm bg-zk-panel-bg px-4 py-2 rounded border-[3px] border-black cursor-pointer transition-all hover:bg-gray-100 active:translate-y-1 disabled:opacity-50 disabled:active:translate-y-0"
            title="Resend Email"
          >
            <Send size={16} /> RESEND
          </button>
          <button
            onClick={() => setShowWordReveal((prev) => !prev)}
            disabled={!secretWord}
            className="flex items-center gap-2 font-black text-sm bg-zk-blue text-white px-4 py-2 rounded border-[3px] border-black cursor-pointer transition-all hover:brightness-110 active:translate-y-1 disabled:opacity-50 disabled:active:translate-y-0"
            title="Privately reveal the secret word on this screen only"
          >
            {showWordReveal ? <EyeOff size={16} /> : <Eye size={16} />}
            {showWordReveal ? 'HIDE WORD' : 'REVEAL WORD'}
          </button>
        </div>      </div>

      {/* Canvas Area */}
      <div className="relative z-10 w-full flex-1 bg-zk-panel-bg border-[6px] border-[#000000] rounded-2xl overflow-hidden flex flex-col">
        
        <div 
          className={`flex-1 w-full relative ${!contextMenu.visible ? 'cursor-none' : 'cursor-crosshair'}`}
          style={{ cursor: !contextMenu.visible ? 'none' : 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseUp={endDrawing}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onTouchStart={startDrawing}
            onContextMenu={handleContextMenu}
            className="w-full h-full touch-none"
            style={{ cursor: 'inherit' }}
          />
          {(hoverPos || contextMenu.visible || activeToolbarSlider) && (
            <div 
              className={`absolute pointer-events-none rounded-full shadow-sm z-[100] ${tool === 'eraser' ? 'border-2 border-black' : 'bg-black'}`}
              style={{
                width: tool === 'eraser' ? eraserSize : penSize,
                height: tool === 'eraser' ? eraserSize : penSize,
                left: activeToolbarSlider ? '50%' : (contextMenu.visible ? contextMenu.clickX : hoverPos?.x),
                top: activeToolbarSlider ? '50%' : (contextMenu.visible ? contextMenu.clickY : hoverPos?.y),
                transform: 'translate(-50%, -50%)',
                backgroundColor: tool === 'eraser' ? 'rgba(255, 255, 255, 0.85)' : '#000000'
              }}
            />
          )}
          
          {/* Photoshop-style Right Click Size Menu */}
          {contextMenu.visible && (
            <div 
              className="absolute bg-zk-panel-bg border-[3px] border-black rounded-xl p-4 z-[110] flex flex-col gap-3 w-48 select-none"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()} // Prevent startDrawing when interacting with slider
            >
              <label className="font-black text-sm uppercase text-gray-700 flex justify-between items-center cursor-default">
                <span>{tool} Size</span>
                <span className="bg-gray-200 px-2 rounded">{tool === 'eraser' ? eraserSize : penSize}px</span>
              </label>
              <input 
                type="range" 
                min={tool === 'eraser' ? "10" : "2"} 
                max={tool === 'eraser' ? "120" : "50"} 
                value={tool === 'eraser' ? eraserSize : penSize}
                onChange={(e) => tool === 'eraser' ? setEraserSize(Number(e.target.value)) : setPenSize(Number(e.target.value))}
                className="w-full cursor-pointer accent-zk-blue outline-none focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="h-16 border-t-[4px] border-[#000000] bg-gray-100 flex items-center justify-between px-6">
          <span className="font-black text-gray-500 uppercase tracking-widest text-sm hidden sm:block">You are drawing...</span>
          
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setTool('pen');
                  if (activeToolbarSlider) setActiveToolbarSlider(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTool('pen');
                  setActiveToolbarSlider(activeToolbarSlider === 'pen' ? null : 'pen');
                }}
                className={`p-2 rounded-lg border-[3px] border-[#000000] font-black uppercase transition-all flex items-center justify-center ${tool === 'pen' ? 'bg-zk-blue text-white' : 'bg-zk-panel-bg text-black hover:bg-gray-200'}`}
                title="Pen (Right click for size)"
              >
                <Pen size={24} strokeWidth={3} />
              </button>
              
              {/* Vertical Slider Popup for Pen */}
              {activeToolbarSlider === 'pen' && (
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-zk-panel-bg border-[3px] border-black rounded-xl p-3 z-50 flex flex-col items-center gap-3 w-16">
                  <span className="font-black text-sm bg-gray-200 w-10 text-center rounded">{penSize}</span>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="accent-zk-blue cursor-pointer"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      WebkitAppearance: 'slider-vertical',
                      height: '140px',
                      width: '12px'
                    }}
                  />
                  <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-black"></div>
                  <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-white z-10"></div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setTool('eraser');
                  if (activeToolbarSlider) setActiveToolbarSlider(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTool('eraser');
                  setActiveToolbarSlider(activeToolbarSlider === 'eraser' ? null : 'eraser');
                }}
                className={`p-2 rounded-lg border-[3px] border-[#000000] font-black uppercase transition-all flex items-center justify-center ${tool === 'eraser' ? 'bg-zk-blue text-white' : 'bg-zk-panel-bg text-black hover:bg-gray-200'}`}
                title="Eraser (Right click for size)"
              >
                <Eraser size={24} strokeWidth={3} />
              </button>
              
              {/* Vertical Slider Popup for Eraser */}
              {activeToolbarSlider === 'eraser' && (
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-zk-panel-bg border-[3px] border-black rounded-xl p-3 z-50 flex flex-col items-center gap-3 w-16">
                  <span className="font-black text-sm bg-gray-200 w-10 text-center rounded">{eraserSize}</span>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={eraserSize}
                    onChange={(e) => setEraserSize(Number(e.target.value))}
                    className="accent-zk-blue cursor-pointer"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      WebkitAppearance: 'slider-vertical',
                      height: '140px',
                      width: '12px'
                    }}
                  />
                  <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-black"></div>
                  <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-white z-10"></div>
                </div>
              )}
            </div>
            <div className="w-[3px] bg-black mx-1 rounded-full"></div> {/* Separator */}
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white border-[3px] border-[#000000] p-2 rounded-lg font-black uppercase active:translate-y-1 transition-all flex items-center justify-center"
              title="Clear Canvas"
            >
              <Trash2 size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {winnerTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.h2
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-6xl md:text-8xl font-black text-zk-yellow uppercase text-center mb-6"
              style={{ WebkitTextStroke: '3px #000000', textShadow: '4px 4px 0px #000' }}
            >
              ROUND OVER!
            </motion.h2>
            <p className="text-3xl md:text-5xl font-black text-white text-center">
              <span className="text-zk-blue bg-zk-panel-bg px-4 py-1 rounded border-[3px] border-black">Team {teamNames?.[winnerTeam] || winnerTeam}</span> guessed correctly!
            </p>
            <p className="text-xl md:text-3xl font-black text-gray-300 mt-4 uppercase">
              {winnerNickname} got it!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private word reveal — host-only overlay (tap to hide quickly if audience is nearby) */}
      <AnimatePresence>
        {showWordReveal && secretWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[180] flex items-center justify-center bg-black/90 p-6"
            onClick={() => setShowWordReveal(false)}
          >
            <div
              className="bg-zk-panel-bg border-[6px] border-black rounded-2xl px-10 py-8 text-center shadow-[8px_8px_0px_#000] max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-black uppercase tracking-widest text-sm text-gray-500 mb-3">Secret word (host only)</p>
              <p className="font-black text-5xl sm:text-6xl text-zk-blue break-words">{secretWord}</p>
              <p className="mt-4 text-sm font-bold text-gray-500">Tap outside or press Hide Word so players cannot see it.</p>
              <button
                onClick={() => setShowWordReveal(false)}
                className="mt-6 inline-flex items-center gap-2 font-black text-sm bg-zk-bg px-5 py-2 rounded border-[3px] border-black hover:brightness-105 active:translate-y-1"
              >
                <EyeOff size={16} /> HIDE WORD
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snackbar Toast for Email Status */}
      <AnimatePresence>
        {emailStatus.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-[200] border-[3px] border-black rounded-xl px-6 py-3 flex items-center gap-3 shadow-[4px_4px_0px_#000] max-w-[90vw] ${
              emailStatus.status === 'success' ? 'bg-green-400 text-black' :
              emailStatus.status === 'error' ? 'bg-red-500 text-white' :
              'bg-zk-panel-bg text-black'
            }`}
          >
            {emailStatus.status === 'sending' && <div className="w-5 h-5 border-4 border-zk-blue border-t-transparent rounded-full animate-spin" />}
            {emailStatus.status === 'success' && <CheckCircle2 size={24} />}
            {emailStatus.status === 'error' && <XCircle size={24} />}
            <span className="font-black text-base sm:text-lg">{emailStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
