"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HubAssets } from '@/components/Dashboard/HubWorldAssets';
import { Keyboard, MousePointerClick, HelpCircle } from 'lucide-react';

const TILE_SIZE = 64;
const GRID_COLS = 12;
const GRID_ROWS = 8;
const CANVAS_WIDTH = GRID_COLS * TILE_SIZE; // 768px
const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE; // 512px

export default function HubWorld({ onSwitchToClassic }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const assetsRef = useRef(null);

  // Interaction overlay state
  const [nearInteraction, setNearInteraction] = useState(null);
  const [showControlsInfo, setShowControlsInfo] = useState(true);

  // Player position in grid coordinates (target) and pixel coordinates (current)
  const playerRef = useRef({
    gridX: 6,
    gridY: 4,
    x: 6 * TILE_SIZE,
    y: 4 * TILE_SIZE,
    speed: 4, // pixels per frame
    dir: 'S', // S, N, E, W
    isWalking: false,
    animTimer: 0,
    animFrame: 1,
  });

  // Keep track of active keys
  const keysRef = useRef({});

  // Define static collidable/interactable furniture
  const furniture = [
    {
      id: 'bed',
      name: 'Cozy Bed',
      gridX: 1,
      gridY: 1,
      width: 1,
      height: 2,
      asset: 'bed',
      drawOffsetY: -32, // Offset to make headboard look tall
      interaction: {
        action: () => alert("Zinko Hub: Take a rest, you've earned it! 🛌"),
        label: 'Press E to sleep',
      },
    },
    {
      id: 'desk',
      name: 'Creator Desk',
      gridX: 4,
      gridY: 1,
      width: 2,
      height: 1,
      asset: 'desk',
      drawOffsetY: -16,
      interaction: {
        action: () => onSwitchToClassic(),
        label: 'Press E to Open Creator Panel (Quizzes)',
      },
    },
    {
      id: 'bookcase',
      name: 'Library Bookcase',
      gridX: 8,
      gridY: 0,
      width: 1,
      height: 2,
      asset: 'bookcase',
      drawOffsetY: -32,
      interaction: {
        action: () => router.push('/discovery'),
        label: 'Press E to Search Public Quizzes',
      },
    },
    {
      id: 'chest',
      name: 'Customizer Chest',
      gridX: 10,
      gridY: 2,
      width: 1,
      height: 1,
      asset: 'chest',
      drawOffsetY: -8,
      interaction: {
        action: () => router.push('/shop'),
        label: 'Press E to open Shop & Wardrobe',
      },
    },
    {
      id: 'mailbox',
      name: 'Social Mailbox',
      gridX: 11,
      gridY: 5,
      width: 1,
      height: 1,
      asset: 'mailbox',
      drawOffsetY: -32,
      interaction: {
        action: () => router.push('/dashboard/social'),
        label: 'Press E to view Friends List',
      },
    },
  ];

  // Helper: check if a grid coordinate has collision
  const checkCollision = (gridX, gridY) => {
    // Canvas borders
    if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) {
      return true;
    }
    // Wall row (Row 0 is strictly wall)
    if (gridY === 0) {
      return true;
    }
    // Furniture collision box
    for (const f of furniture) {
      if (
        gridX >= f.gridX &&
        gridX < f.gridX + f.width &&
        gridY >= f.gridY &&
        gridY < f.gridY + f.height
      ) {
        return true;
      }
    }
    return false;
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;

      // Handle interaction key 'E'
      if (e.code === 'KeyE' && nearInteraction) {
        nearInteraction.action();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearInteraction]);

  // Main canvas loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Pre-load SVG images
    assetsRef.current = HubAssets.getImages();

    let animationFrameId;

    const updateAndRender = () => {
      const p = playerRef.current;

      // --- MOVEMENT ENGINE ---
      // If the player is currently aligned to the grid, we check key input to set a new grid target
      if (p.x === p.gridX * TILE_SIZE && p.y === p.gridY * TILE_SIZE) {
        let dx = 0;
        let dy = 0;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) {
          dy = -1;
          p.dir = 'N';
        } else if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) {
          dy = 1;
          p.dir = 'S';
        } else if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) {
          dx = -1;
          p.dir = 'W';
        } else if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) {
          dx = 1;
          p.dir = 'E';
        }

        if (dx !== 0 || dy !== 0) {
          const nextX = p.gridX + dx;
          const nextY = p.gridY + dy;

          if (!checkCollision(nextX, nextY)) {
            p.gridX = nextX;
            p.gridY = nextY;
            p.isWalking = true;
          } else {
            p.isWalking = false;
          }
        } else {
          p.isWalking = false;
        }
      }

      // Smoothly interpolate pixel coordinates to align with grid coordinate targets
      if (p.isWalking) {
        const targetX = p.gridX * TILE_SIZE;
        const targetY = p.gridY * TILE_SIZE;

        if (p.x < targetX) p.x = Math.min(p.x + p.speed, targetX);
        if (p.x > targetX) p.x = Math.max(p.x - p.speed, targetX);
        if (p.y < targetY) p.y = Math.min(p.y + p.speed, targetY);
        if (p.y > targetY) p.y = Math.max(p.y - p.speed, targetY);

        // Animation frame swap (flips feet back and forth while walking)
        p.animTimer += 1;
        if (p.animTimer > 8) {
          p.animFrame = p.animFrame === 1 ? 2 : 1;
          p.animTimer = 0;
        }
      } else {
        p.animFrame = 1;
      }

      // Check distance to interactable furniture
      let currentInteraction = null;
      for (const f of furniture) {
        // Calculate taxicab distance in grid cells
        const dist = Math.abs(p.gridX - f.gridX) + Math.abs(p.gridY - f.gridY);
        // If close enough to the bounding box of furniture, show interaction
        if (dist <= 2) {
          currentInteraction = f.interaction;
          break;
        }
      }
      setNearInteraction(currentInteraction);

      // --- RENDER PASS ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const images = assetsRef.current;
      if (images) {
        // 1. Draw floor grid
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (r === 0) {
              if (images.wall) ctx.drawImage(images.wall, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
              if (images.floor) ctx.drawImage(images.floor, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }

        // 2. Draw Furniture & Player (Sorted by Y-Coordinate for Layer Depth)
        const renderQueue = [
          ...furniture.map((f) => ({
            type: 'furniture',
            y: (f.gridY + f.height) * TILE_SIZE, // Base line Y for depth
            data: f,
          })),
          {
            type: 'player',
            y: p.y + TILE_SIZE,
            data: p,
          },
        ];

        // Sort ascending by Y coord
        renderQueue.sort((a, b) => a.y - b.y);

        renderQueue.forEach((item) => {
          if (item.type === 'furniture') {
            const f = item.data;
            const img = images[f.asset];
            if (img) {
              ctx.drawImage(
                img,
                f.gridX * TILE_SIZE,
                f.gridY * TILE_SIZE + (f.drawOffsetY || 0),
                f.width * TILE_SIZE,
                f.height * TILE_SIZE - (f.drawOffsetY || 0)
              );
            }
          } else if (item.type === 'player') {
            const charKey = `${p.dir}${p.animFrame}`;
            const img = images.char[charKey];
            if (img) {
              ctx.drawImage(img, p.x, p.y, TILE_SIZE, TILE_SIZE);
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onSwitchToClassic]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zk-purple-dark/20 border-[3px] border-zk-black rounded-2xl relative overflow-hidden backdrop-blur-md">
      {/* HUD Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-3">
        <h3 className="font-['Amatic_SC'] text-3xl font-black text-zk-black uppercase tracking-wider">
          Your Cozy Workspace
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowControlsInfo(!showControlsInfo)}
            className="bg-white p-2 rounded-xl border-2 border-zk-black hover:bg-zk-yellow/30 transition-colors"
            title="Show controls"
          >
            <HelpCircle size={18} className="text-zk-black" />
          </button>
        </div>
      </div>

      {/* Main Canvas Frame */}
      <div className="relative border-[4px] border-zk-black rounded-2xl overflow-hidden bg-[#2d3748] !shadow-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full max-w-[768px] aspect-[3/2]"
        />

        {/* Floating Interaction Prompt */}
        {nearInteraction && (
          <div className="absolute left-1/2 bottom-8 -translate-x-1/2 bg-zk-yellow border-[3px] border-zk-black rounded-2xl px-4 py-2 font-['Outfit'] font-bold text-zk-black text-sm flex items-center gap-2 animate-bounce z-20 !shadow-none">
            <Keyboard size={16} />
            {nearInteraction.label}
          </div>
        )}
      </div>

      {/* Info overlays (collapsible) */}
      {showControlsInfo && (
        <div className="mt-4 w-full max-w-3xl bg-white border-[3px] border-zk-black rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-3 text-xs font-['Outfit'] text-zk-black/80">
          <div className="flex items-center gap-2">
            <Keyboard className="text-zk-purple" size={18} />
            <span>Use **WASD** or **Arrow Keys** to walk around your room.</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointerClick className="text-zk-purple" size={18} />
            <span>Walk up to objects (Desk, Bookcase, Mailbox) and press **E** to interact!</span>
          </div>
        </div>
      )}
    </div>
  );
}
