import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BASE_MULTIPLIERS, FREE_SPIN_MULTIPLIERS } from '../utils/slotEngine';

interface HangingMultiplierSignProps {
  currentMultiplier: number;
  isFreeSpins: boolean;
}

export const HangingMultiplierSign: React.FC<HangingMultiplierSignProps> = ({
  currentMultiplier,
  isFreeSpins,
}) => {
  const multipliers = isFreeSpins ? FREE_SPIN_MULTIPLIERS : BASE_MULTIPLIERS;
  const activeIndex = Math.max(0, multipliers.indexOf(currentMultiplier));
  const [showMultiplierBurst, setShowMultiplierBurst] = useState<boolean>(false);

  useEffect(() => {
    if (currentMultiplier > (isFreeSpins ? 8 : 1)) {
      setShowMultiplierBurst(true);
      const timer = setTimeout(() => setShowMultiplierBurst(false), 550);
      return () => clearTimeout(timer);
    }
  }, [currentMultiplier, isFreeSpins]);

  // Display 5 multipliers with current active in the center
  const displayList = [-2, -1, 0, 1, 2].map((offset) => {
    let targetIndex = (activeIndex + offset) % multipliers.length;
    if (targetIndex < 0) targetIndex += multipliers.length;
    return {
      value: multipliers[targetIndex],
      isCurrent: offset === 0,
      offset,
    };
  });

  return (
    <div className="relative w-full max-w-[540px] sm:max-w-[560px] mx-auto select-none pt-0.5 pb-0.5">
      {/* Hanging Bronze / Copper Chains */}
      <div className="absolute -top-3.5 left-10 flex flex-col items-center z-10 pointer-events-none">
        {/* Chain Links */}
        <div className="w-2 h-4 rounded border-2 border-[#b87834] bg-[#221208] shadow-sm" />
        <div className="w-2 h-4 -mt-1.5 rounded border-2 border-[#d97706] bg-[#3a1d0d] shadow-sm" />
        <div className="w-3.5 h-3.5 -mt-1 rounded-full border-2 border-[#e2a84d] bg-[#1a0c04] shadow-md flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#fef08a]" />
        </div>
      </div>

      <div className="absolute -top-3.5 right-10 flex flex-col items-center z-10 pointer-events-none">
        {/* Chain Links */}
        <div className="w-2 h-4 rounded border-2 border-[#b87834] bg-[#221208] shadow-sm" />
        <div className="w-2 h-4 -mt-1.5 rounded border-2 border-[#d97706] bg-[#3a1d0d] shadow-sm" />
        <div className="w-3.5 h-3.5 -mt-1 rounded-full border-2 border-[#e2a84d] bg-[#1a0c04] shadow-md flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#fef08a]" />
        </div>
      </div>

      {/* SVG ARCHED WOODEN MULTIPLIER SIGN (Matching Screenshot 1 & 2) */}
      <div className="relative mx-1">
        <svg
          viewBox="0 0 440 92"
          className="w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] pointer-events-none"
        >
          <defs>
            {/* Arched Wood Grain Gradient */}
            <linearGradient id="signWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a2610" />
              <stop offset="35%" stopColor="#301708" />
              <stop offset="75%" stopColor="#1e0e05" />
              <stop offset="100%" stopColor="#0f0602" />
            </linearGradient>

            {/* Bronze Rim Metallic Gradient */}
            <linearGradient id="signRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe4b5" />
              <stop offset="25%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Center Sunburst Flare Radial Gradient */}
            <radialGradient id="centerBurstGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Arched Wooden Signboard Path (Curved top with center peak, curved bottom) */}
          <path
            d="M 20, 24 Q 130, 36 220, 16 Q 310, 36 420, 24 L 428, 70 Q 310, 84 220, 86 Q 130, 84 12, 70 Z"
            fill="url(#signWoodGrad)"
            stroke="url(#signRimGrad)"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Gold Trace */}
          <path
            d="M 24, 28 Q 130, 39 220, 21 Q 310, 39 416, 28 L 423, 66 Q 310, 80 220, 82 Q 130, 80 17, 66 Z"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Subtle Vertical Wood Grain Texture Lines */}
          <g stroke="#000000" strokeWidth="1" opacity="0.25">
            <line x1="90" y1="30" x2="90" y2="76" />
            <line x1="170" y1="24" x2="170" y2="82" />
            <line x1="270" y1="24" x2="270" y2="82" />
            <line x1="350" y1="30" x2="350" y2="76" />
          </g>

          {/* Corner Screw Rivets */}
          <circle cx="28" cy="34" r="3" fill="#d97706" stroke="#451a03" strokeWidth="0.8" />
          <circle cx="412" cy="34" r="3" fill="#d97706" stroke="#451a03" strokeWidth="0.8" />
          <circle cx="24" cy="62" r="3" fill="#d97706" stroke="#451a03" strokeWidth="0.8" />
          <circle cx="416" cy="62" r="3" fill="#d97706" stroke="#451a03" strokeWidth="0.8" />

          {/* Chain Connection Rings */}
          <circle cx="70" cy="32" r="4.5" fill="#241208" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="370" cy="32" r="4.5" fill="#241208" stroke="#d97706" strokeWidth="1.5" />

          {/* Center Sunburst Glow Behind Active Multiplier */}
          <ellipse cx="220" cy="48" rx="60" ry="34" fill="url(#centerBurstGrad)" />
        </svg>

        {/* HTML MULTIPLIERS OVERLAY ALONG THE CURVED SIGN */}
        <div className="absolute inset-0 flex items-center justify-around px-5 pointer-events-none">
          {displayList.map((item) => {
            if (item.isCurrent) {
              return (
                <div
                  key={`cur-${item.value}`}
                  className="relative flex items-center justify-center -translate-y-1.5 z-20"
                >
                  {/* Glowing halo */}
                  <div className="absolute inset-0 -m-3 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none" />

                  <motion.div
                    key={item.value}
                    initial={{ scale: 0.85, y: -2 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    className="relative flex items-center justify-center"
                  >
                    <span className="font-western text-2xl sm:text-3xl font-black text-amber-100 drop-shadow-[0_2px_8px_rgba(245,197,66,0.95)] tracking-wide">
                      X{item.value}
                    </span>
                  </motion.div>
                </div>
              );
            }

            // Inactive carved wooden numbers
            return (
              <div
                key={`other-${item.offset}-${item.value}`}
                className="font-western text-xs sm:text-sm font-extrabold text-[#9c6332] opacity-70 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                style={{
                  transform: `translateY(${Math.abs(item.offset) * 2}px) rotate(${item.offset * 4}deg)`,
                }}
              >
                x{item.value}
              </div>
            );
          })}
        </div>

        {/* Pop-Up Multiplier Burst (When upgraded during cascades) */}
        <AnimatePresence>
          {showMultiplierBurst && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.25, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <span className="font-western text-3xl sm:text-4xl font-black text-amber-200 drop-shadow-[0_0_24px_#f59e0b]">
                X{currentMultiplier}!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
