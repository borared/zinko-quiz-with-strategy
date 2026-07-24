"use client";

import { getLobbySticker } from '@/lib/lobbyStickers';
import ZinkoLaughSticker from '@/components/Play/stickers/ZinkoLaughSticker';

const STICKER_COMPONENTS = {
  'zinko-laugh': ZinkoLaughSticker,
};

const SIZE_CLASS = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  burst: 'w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem]',
};

/** Renders a custom Zinko taunt sticker when mapped; falls back to unicode emoji. */
export default function LobbySticker({
  emoji,
  size = 'md',
  className = '',
  withShadow = true,
}) {
  const sticker = getLobbySticker(emoji);
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  const shadowStyle = withShadow ? { filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.85))' } : undefined;

  const StickerComponent = sticker?.type ? STICKER_COMPONENTS[sticker.type] : null;
  if (StickerComponent) {
    return (
      <StickerComponent
        className={`${sizeClass} block ${className}`}
        style={shadowStyle}
        aria-label={sticker.alt}
      />
    );
  }

  if (sticker?.src) {
    return (
      <img
        src={sticker.src}
        alt={sticker.alt}
        draggable={false}
        className={`${sizeClass} object-contain select-none ${className}`}
        style={shadowStyle}
      />
    );
  }

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    burst: 'text-5xl md:text-6xl',
  };

  return (
    <span
      className={`leading-none select-none ${textSize[size] || textSize.md} ${className}`}
      style={shadowStyle}
    >
      {emoji}
    </span>
  );
}