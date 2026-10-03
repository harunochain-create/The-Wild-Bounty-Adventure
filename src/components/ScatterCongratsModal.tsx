import React, { useEffect } from 'react';
import { SlotSymbolGraphic } from './SlotSymbolGraphic';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ScatterCongratsModalProps {
  freeSpinsAwarded: number;
  onClose: () => void;
  language?: Language;
}

export const ScatterCongratsModal: React.FC<ScatterCongratsModalProps> = ({
  freeSpinsAwarded,
  onClose,
  language = 'ID',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ID;
  const isID = language === 'ID';

  useEffect(() => {
    // Auto close after 2.8s
    const timer = setTimeout(() => {
      onClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer select-none"
      title={isID ? 'Ketuk untuk lewati' : 'Tap to skip'}
    >
      {/* 85% Width Carved Gold-Wood Card */}
      <div className="relative w-[85%] max-w-sm rounded-3xl bg-gradient-to-b from-[#3a1d0d] via-[#241107] to-[#120703] border-[3px] border-[#f5c542] p-6 text-center shadow-[0_16px_50px_rgba(0,0,0,0.95),inset_0_2px_12px_rgba(245,197,66,0.5)] animate-in zoom-in-95 duration-300">
        {/* Gold Bars Scatter Icon with Radiant Aura */}
        <div className="relative mx-auto w-28 h-28 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/40 via-yellow-300/60 to-amber-500/40 blur-xl animate-pulse" />
          <div className="relative animate-bounce">
            <SlotSymbolGraphic symbolId="SCATTER" className="w-24 h-24 drop-shadow-[0_4px_24px_rgba(245,197,66,1)]" isWinning={true} />
          </div>
        </div>

        {/* Title: SELAMAT! & CONGRATULATIONS! */}
        <div className="text-[11px] font-western font-bold uppercase tracking-widest text-amber-400 mb-0.5">
          ★ {t.congratsScatter} ★
        </div>

        {/* Main Title matching Header Font */}
        <h3 className="font-western text-2xl sm:text-3xl font-black text-gold-gradient tracking-wide mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {t.scatterWon}
        </h3>

        {/* Amount Awarded (e.g. 10 FREE SPINS / 5 FREE SPINS) */}
        <div className="p-3 my-2 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900/95 to-amber-950/90 border-2 border-amber-500/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
          <div className="text-[11px] font-western text-stone-300">
            {isID ? 'ANDA MEMPEROLEH' : 'YOU WON'}
          </div>
          <div className="text-3xl sm:text-4xl font-western font-black text-gold-gradient tracking-wide drop-shadow-[0_4px_12px_rgba(245,197,66,0.85)] my-1">
            {freeSpinsAwarded} {isID ? 'PUTARAN GRATIS' : 'FREE SPINS'}
          </div>
          <div className="text-[10px] text-amber-300/90 font-medium">
            {isID ? 'Multiplier Berkelipatan Dimulai dari X8!' : 'Multiplier progression starts at 8X!'}
          </div>
        </div>

        <div className="text-[10px] text-stone-400 mt-3 font-medium animate-pulse">
          {isID ? 'Ketuk di mana saja untuk melanjutkan...' : 'Tap anywhere to continue...'}
        </div>
      </div>
    </div>
  );
};

