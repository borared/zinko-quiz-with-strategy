"use client";
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useVelocity, useSpring, useTransform } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // High-performance zero-lag tracking directly mapped to screen coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);



  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updateMousePosition = (e) => {
      if (!isVisible) setIsVisible(true);
      // Track EXACT mouse coordinates (offsets are handled per-SVG so tips perfectly align)
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          body, a, button, [role="button"], div, span, p, h1, h2, h3, h4, h5, h6, img, svg, label {
            cursor: none !important;
          }
          input, textarea, [contenteditable="true"] {
            cursor: text !important;
          }
        }
      `}} />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999]"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
        }}
      >
        {/* ARROW CURSOR */}
        <motion.svg 
          width="26" 
          height="26" 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="absolute top-0 left-0"
          style={{ x: -2, y: -2, originX: '2px', originY: '2px' }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: isHovering ? 0 : 1, scale: isHovering ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <path 
            d="M 2 2 L 2 26 L 10 18 L 24 32 L 32 24 L 18 10 L 26 2 Z" 
            fill="#FFFFFF"
            stroke="black" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />
        </motion.svg>

        {/* POINTING HAND CURSOR */}
        <motion.svg 
          width="36" 
          height="36" 
          viewBox="0 0 50 50" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="absolute top-0 left-0"
          style={{ x: -20, y: -2, originX: '20px', originY: '2px' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <g transform="translate(20, 2) rotate(-20) scale(0.9) translate(-20, -2)">
            <path 
              d="M 24 2 h 6 v 10 h 4 v 2 h 4 v 2 h 4 v 2 h 4 v 12 l -6 8 H 24 l -8 -8 v -8 l 6 -6 h 2 z" 
              fill="#FFCD29" 
              stroke="black" 
              strokeWidth="2.5" 
              strokeLinejoin="round" 
            />
          </g>
        </motion.svg>
      </motion.div>
    </>
  );
}
