import React from 'react';
import { Wallet, Coins, Zap, Minus, Plus, Play, Menu, RotateCcw } from 'lucide-react';
import { sound } from '../utils/soundEngine';
import { Language, TRANSLATIONS } from '../utils/translations';

interface WildBountyControlsProps {
  balance: number;
  bet: number;
  win: number;
  currency: 'USD' | 'IDR';
  language?: Language;
  isSpinning: boolean;
  isTurbo: boolean;
  autoSpinsRemaining: number;
  isFreeSpins?: boolean;
  remainingFreeSpins?: number;
  onToggleTurbo: () => void;
  onDecreaseBet: () => void;
  onIncreaseBet: () => void;
  onSpin: () => void;
  onToggleAuto: () => void;
  onOpenMenu: () => void;
}

// Highly Detailed Western Bison Skull SVG Icon for Spin Button Background
const BisonSkullSvg: React.FC<{ className?: string; isEnergized?: boolean }> = ({
  className = 'w-full h-full',
  isEnergized = false,
}) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Horn Gradient Left */}
      <linearGradient id="bisonHornLeft" x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#1a0c04" />
        <stop offset="35%" stopColor="#5a3818" />
        <stop offset="70%" stopColor="#9a6e3d" />
        <stop offset="100%" stopColor="#e5d3b6" />
      </linearGradient>

      {/* Horn Gradient Right */}
      <linearGradient id="bisonHornRight" x1="90%" y1="0%" x2="10%" y2="100%">
        <stop offset="0%" stopColor="#1a0c04" />
        <stop offset="35%" stopColor="#5a3818" />
        <stop offset="70%" stopColor="#9a6e3d" />
        <stop offset="100%" stopColor="#e5d3b6" />
      </linearGradient>

      {/* Bone Cranium Gradient */}
      <linearGradient id="bisonBoneGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#faf5ec" />
        <stop offset="25%" stopColor="#e8dec8" />
        <stop offset="65%" stopColor="#bfa47d" />
        <stop offset="100%" stopColor="#7a542a" />
      </linearGradient>

      {/* Skull Cavities Dark Ambient Occlusion */}
      <radialGradient id="socketDark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0a0402" />
        <stop offset="85%" stopColor="#220e05" />
        <stop offset="100%" stopColor="#3d1d0c" />
      </radialGradient>
    </defs>

    {/* 1. Left Sweeping Curved Bison Horn */}
    <path
      d="M 52 44 C 36 38 22 28 12 16 C 5 7 3 3 2 1 C 5 6 12 18 24 26 C 35 32 44 38 50 42 Z"
      fill="url(#bisonHornLeft)"
      stroke="#120602"
      strokeWidth="1"
    />
    {/* Left Horn Ridges */}
    <path d="M 16 19 C 14 16 12 14 10 10" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />
    <path d="M 23 25 C 20 22 17 19 15 15" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />
    <path d="M 33 31 C 29 27 25 24 22 20" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />

    {/* 2. Right Sweeping Curved Bison Horn */}
    <path
      d="M 68 44 C 84 38 98 28 108 16 C 115 7 117 3 118 1 C 115 6 108 18 96 26 C 85 32 76 38 70 42 Z"
      fill="url(#bisonHornRight)"
      stroke="#120602"
      strokeWidth="1"
    />
    {/* Right Horn Ridges */}
    <path d="M 104 19 C 106 16 108 14 110 10" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />
    <path d="M 97 25 C 100 22 103 19 105 15" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />
    <path d="M 87 31 C 91 27 95 24 98 20" stroke="#3d210d" strokeWidth="1.2" opacity="0.7" />

    {/* 3. Main Skull Cranium Bone */}
    <path
      d="M 40 34 Q 60 28 80 34 L 83 48 L 76 66 L 68 96 L 52 96 L 44 66 L 37 48 Z"
      fill="url(#bisonBoneGrad)"
      stroke="#3a1c09"
      strokeWidth="1.5"
    />

    {/* 4. Brow Ridge & Forehead Suture Lines */}
    <path d="M 46 38 Q 60 34 74 38" stroke="#7a542a" strokeWidth="1.5" fill="none" opacity="0.8" />
    <path d="M 60 35 L 60 48" stroke="#5a3818" strokeWidth="1" fill="none" opacity="0.7" />

    {/* 5. Deep Eye Socket Cavities */}
    <ellipse cx="49" cy="54" rx="5.5" ry="7.5" transform="rotate(-8 49 54)" fill="url(#socketDark)" />
    <ellipse cx="71" cy="54" rx="5.5" ry="7.5" transform="rotate(8 71 54)" fill="url(#socketDark)" />

    {/* 6. Nasal Cavity Bone & Snout Cavities */}
    <path
      d="M 57 72 L 63 72 L 62 86 L 58 86 Z"
      fill="#140702"
      stroke="#5a3818"
      strokeWidth="0.8"
    />
    <ellipse cx="58" cy="85" rx="1.5" ry="2.5" fill="#000000" />
    <ellipse cx="62" cy="85" rx="1.5" ry="2.5" fill="#000000" />

    {/* 7. Energized Gold Glow for Active Spin */}
    {isEnergized && (
      <circle
        cx="60"
        cy="60"
        r="44"
        stroke="#fde047"
        strokeWidth="2.5"
        strokeDasharray="4 6"
        className="animate-spin opacity-80"
        style={{ transformOrigin: 'center' }}
      />
    )}
  </svg>
);

export const WildBountyControls: React.FC<WildBountyControlsProps> = ({
  balance,
  bet,
  win,
  currency,
  language = 'ID',
  isSpinning,
  isTurbo,
  autoSpinsRemaining,
  isFreeSpins = false,
  remainingFreeSpins = 0,
  onToggleTurbo,
  onDecreaseBet,
  onIncreaseBet,
  onSpin,
  onToggleAuto,
  onOpenMenu,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ID;

  const formatVal = (num: number) => {
    if (currency === 'IDR') {
      return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleDecreaseWithSound = () => {
    sound.playBetChange();
    onDecreaseBet();
  };

  const handleIncreaseWithSound = () => {
    sound.playBetChange();
    onIncreaseBet();
  };

  return (
    <div className="w-full max-w-[540px] mx-auto select-none pt-0.5 pb-2 px-1 sm:px-2 flex flex-col gap-2">
      {/* 3-PILL STATUS BAR (Balance, Bet, Win) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Balance Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#25150a]/95 border border-[#7a421e] shadow-md overflow-hidden">
          <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
          <div
            className="truncate text-stone-100 font-mono text-[11px] sm:text-xs font-bold"
            title={formatVal(balance)}
          >
            {formatVal(balance)}
          </div>
        </div>

        {/* Bet Pill */}
        <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#25150a]/95 border border-[#7a421e] shadow-md overflow-hidden">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <div
            className="truncate text-amber-200 font-mono text-[11px] sm:text-xs font-bold"
            title={formatVal(bet)}
          >
            {formatVal(bet)}
          </div>
        </div>

        {/* Win Pill */}
        <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#25150a]/95 border border-[#7a421e] shadow-md overflow-hidden">
          <div className="w-4 h-4 rounded-full border border-amber-400 bg-amber-950/80 flex items-center justify-center shrink-0">
            <span className="text-[7.5px] font-black text-amber-300 leading-none">{t.win}</span>
          </div>
          <div
            className="truncate text-amber-300 font-mono text-[11px] sm:text-xs font-bold"
            title={formatVal(win)}
          >
            {formatVal(win)}
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS DOCK: EXACT SYMMETRICAL 3-COLUMN GRID WITH ENLARGED BUTTONS */}
      {/* Col 1 (1fr, right-aligned) | Col 2 (auto, EXACT CENTER) | Col 3 (1fr, left-aligned) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full px-0.5 pt-0.5">
        {/* LEFT CONTROLS CLUSTER: Turbo & Minus (Aligned right toward center) */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-4 pr-2 sm:pr-4">
          {/* Turbo Button (Enlarged) */}
          <button
            onClick={onToggleTurbo}
            className={`flex flex-col items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isTurbo
                ? 'bg-amber-500/35 border-yellow-400 shadow-[0_0_16px_rgba(245,197,66,0.85)] scale-105'
                : 'bg-[#1b1009] border-[#d4963e] hover:border-yellow-400'
            }`}
            title="Toggle Turbo Speed"
          >
            <Zap
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isTurbo ? 'text-yellow-300 fill-yellow-300 animate-pulse' : 'text-amber-300'
              }`}
            />
            <span className="text-[8px] sm:text-[9px] font-black text-amber-200 uppercase tracking-tight -mt-0.5">
              {t.turbo}
            </span>
          </button>

          {/* Minus Button (Enlarged) */}
          <button
            disabled={isSpinning || isFreeSpins || bet <= 400}
            onClick={handleDecreaseWithSound}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#3a2010] to-[#1a0e07] border-2 border-[#d4963e] text-amber-200 hover:brightness-115 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-lg"
            title="Decrease Bet"
          >
            <Minus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>

        {/* EXACT CENTER: ENLARGED SPIN BUTTON WITH GRAND BISON SKULL */}
        <div className="flex items-center justify-center shrink-0">
          <button
            disabled={isSpinning || isFreeSpins}
            onClick={onSpin}
            className={`relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 rounded-full bg-gradient-to-b from-[#7a3c14] via-[#4a230b] to-[#1e0d04] border-[4.5px] border-[#f0b254] shadow-[0_10px_32px_rgba(0,0,0,0.95),inset_0_2px_12px_rgba(255,255,255,0.45),0_0_24px_rgba(240,178,84,0.5)] transition-all overflow-hidden select-none ${
              isFreeSpins
                ? 'ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(245,197,66,0.95)] cursor-default'
                : 'hover:brightness-115 active:scale-95 cursor-pointer'
            }`}
            title={t.spin}
          >
            {/* Outer Inlay Gold Ring */}
            <div className="absolute inset-1 rounded-full border border-amber-400/50 pointer-events-none" />

            {/* BISON SKULL BACKGROUND SVG (Tulang Kepala Bison) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2 opacity-65">
              <BisonSkullSvg
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                isEnergized={isSpinning || isFreeSpins}
              />
            </div>

            {/* Subtle Vignette Overlay for Skull Depth */}
            <div className="absolute inset-0 rounded-full bg-radial from-transparent via-[#200e05]/30 to-[#100602]/70 pointer-events-none" />

            {/* FOREGROUND CONTROLS OVER BISON SKULL */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isFreeSpins ? (
                // In Free Spins Mode
                <div className="flex flex-col items-center justify-center animate-pulse">
                  <span className="text-[10px] sm:text-xs font-western font-black text-amber-300 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {t.auto}
                  </span>
                  <span className="text-2xl sm:text-3xl font-western font-black text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] tabular-nums -mt-1">
                    {remainingFreeSpins}
                  </span>
                </div>
              ) : autoSpinsRemaining > 0 ? (
                // In Auto Spin Mode
                <div className="flex flex-col items-center justify-center animate-in zoom-in-75">
                  <span className="text-[9px] sm:text-[10px] font-western font-bold text-amber-300 uppercase tracking-wider drop-shadow">
                    {t.auto}
                  </span>
                  <span className="text-2xl sm:text-3xl font-western font-black text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {autoSpinsRemaining}
                  </span>
                </div>
              ) : isSpinning ? (
                // Active Spinning Spinner with Rotating Arrows
                <div className="flex items-center justify-center">
                  <RotateCcw className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 animate-spin stroke-[2.8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]" />
                </div>
              ) : (
                // Idle Circulating Double Curved Arrows
                <div className="flex items-center justify-center text-amber-300">
                  <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3] text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] transition-transform group-hover:rotate-45" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* RIGHT CONTROLS CLUSTER: Plus & Auto & Menu (Aligned left from center) */}
        <div className="flex items-center justify-start gap-2 sm:gap-3 pl-2 sm:pl-4">
          {/* Plus Button (Enlarged) */}
          <button
            disabled={isSpinning || isFreeSpins || bet >= 1228800}
            onClick={handleIncreaseWithSound}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#3a2010] to-[#1a0e07] border-2 border-[#d4963e] text-amber-200 hover:brightness-115 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-lg"
            title="Increase Bet"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>

          {/* Auto Spin Button (Enlarged) */}
          <button
            disabled={isFreeSpins}
            onClick={onToggleAuto}
            className={`flex flex-col items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isFreeSpins
                ? 'opacity-40 cursor-not-allowed bg-[#1b1009] border-[#6b401c]'
                : autoSpinsRemaining > 0
                ? 'bg-red-950/85 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.75)] animate-pulse'
                : 'bg-[#1b1009] border-[#d4963e] hover:border-amber-400'
            }`}
            title="Auto Spin"
          >
            <Play
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                autoSpinsRemaining > 0 ? 'text-red-400 fill-red-400' : 'text-amber-300 fill-amber-300'
              }`}
            />
            <span className="text-[8px] sm:text-[9px] font-black text-amber-200 uppercase tracking-tight mt-0.5">
              {t.auto}
            </span>
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenMenu}
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1b1009] border-2 border-[#d4963e] text-amber-300 hover:text-white hover:border-amber-400 transition-all cursor-pointer shadow-md active:scale-95"
            title={t.menuTitle}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

