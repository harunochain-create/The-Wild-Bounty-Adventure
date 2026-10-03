import React from 'react';
import { motion } from 'motion/react';
import { SymbolId } from '../types/slot';
import { SYMBOLS } from '../utils/slotEngine';

interface SlotSymbolGraphicProps {
  symbolId: SymbolId;
  className?: string;
  isWinning?: boolean;
  hasWildWin?: boolean;
}

export const SlotSymbolGraphic: React.FC<SlotSymbolGraphicProps> = ({
  symbolId,
  className = 'w-full h-full',
  isWinning = false,
  hasWildWin = false,
}) => {
  const sym = SYMBOLS[symbolId];
  if (!sym?.image) return null;

  const isWild = symbolId === 'WILD';
  const isScatter = symbolId === 'SCATTER';

  return (
    <div className={`relative ${className} flex items-center justify-center overflow-visible`}>
      {/* 1. SPECIAL RADIANT GOLDEN SUNBURST & SPARKLE HALO FOR WINNING WILD */}
      {isWild && isWinning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* Pulsing Radial Golden Light Core */}
          <div className="absolute w-[160%] h-[160%] rounded-full bg-radial from-yellow-300/80 via-amber-500/45 to-transparent blur-md animate-pulse" />

          {/* Rotating Golden Flare Beams */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[180%] h-[180%] opacity-85"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <radialGradient id="wildFlareGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g fill="url(#wildFlareGrad)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <polygon
                    key={i}
                    points="50,50 46,0 54,0"
                    transform={`rotate(${i * 30} 50 50)`}
                  />
                ))}
              </g>
            </svg>
          </motion.div>

          {/* Golden Sparkle Stars Floating around WILD */}
          <motion.div
            animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 -right-2 text-yellow-200 text-lg drop-shadow-[0_0_8px_rgba(253,224,71,1)]"
          >
            ✦
          </motion.div>
          <motion.div
            animate={{ scale: [1.2, 0.8, 1.2], opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="absolute -bottom-2 -left-2 text-amber-300 text-base drop-shadow-[0_0_8px_rgba(245,158,11,1)]"
          >
            ★
          </motion.div>
          <motion.div
            animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute -top-2 -left-1 text-yellow-100 text-sm drop-shadow-[0_0_6px_rgba(254,240,138,1)]"
          >
            ✧
          </motion.div>
        </div>
      )}

      {/* Golden Aura behind Scatter when Winning / Triggered */}
      {isScatter && isWinning && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/60 to-amber-500/50 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Regular Symbols during a WILD Win get an extra golden sparkle tint */}
      {hasWildWin && !isWild && isWinning && (
        <div className="absolute inset-0 rounded-2xl bg-amber-400/25 blur-sm animate-pulse pointer-events-none" />
      )}

      <img
        src={sym.image}
        alt={sym.name || symbolId}
        className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 ${
          isScatter && isWinning
            ? 'scale-155'
            : isWild && isWinning
            ? 'scale-150'
            : 'scale-145'
        }`}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          filter: isWild && isWinning
            ? 'drop-shadow(0 0 28px rgba(253, 224, 71, 1)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.9))'
            : isWinning
            ? hasWildWin
              ? 'drop-shadow(0 0 24px rgba(251, 191, 36, 1))'
              : 'drop-shadow(0 0 16px rgba(245, 197, 66, 0.9))'
            : isScatter
            ? 'drop-shadow(0 0 14px rgba(245, 197, 66, 0.85))'
            : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.75))',
        }}
        draggable={false}
        loading="eager"
      />

      {/* Prominent, large, readable "WILD" Badge overlaid on the symbol */}
      {isWild && (
        <div
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-md border pointer-events-none whitespace-nowrap transition-all duration-300 ${
            isWinning
              ? 'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] border-[#fef08a] shadow-[0_0_20px_rgba(253,224,71,1),0_2px_8px_rgba(0,0,0,0.9)] animate-pulse scale-110'
              : 'bg-gradient-to-b from-[#b45309] via-[#78350f] to-[#451a03] border-[1.5px] border-[#fde047] shadow-[0_2px_8px_rgba(0,0,0,0.9),0_0_12px_rgba(245,197,66,0.9)]'
          }`}
        >
          <span className="font-western font-black text-[14px] sm:text-[15px] text-yellow-100 tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1">
            {isWinning && <span className="text-[11px] text-yellow-200 animate-spin">★</span>}
            WILD
            {isWinning && <span className="text-[11px] text-yellow-200 animate-spin">★</span>}
          </span>
        </div>
      )}

      {/* Prominent "SCATTER" Badge for clear recognition */}
      {isScatter && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-md bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#1e0a02] border border-[#fde047] shadow-[0_2px_6px_rgba(0,0,0,0.9)] pointer-events-none whitespace-nowrap">
          <span className="font-western font-black text-[10px] sm:text-[11px] text-gold-gradient tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            SCATTER
          </span>
        </div>
      )}
    </div>
  );
};
