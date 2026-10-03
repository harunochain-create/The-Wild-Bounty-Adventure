import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { GridTile } from '../types/slot';
import { NUM_COLUMNS, REEL_ROW_COUNTS, SYMBOLS } from '../utils/slotEngine';
import { SlotSymbolGraphic } from './SlotSymbolGraphic';

export type WinAnimStage = 'IDLE' | 'EXPANDING' | 'HOLD' | 'SHATTERING';

interface WildBountyReelsProps {
  grid: GridTile[][]; // 6 columns: [3, 4, 5, 5, 4, 3] = 24 tiles
  winningTileIds: string[];
  winAnimStage: WinAnimStage;
  isSpinExiting: boolean;
  isTurbo: boolean;
  isCascading?: boolean;
  isFreeSpins?: boolean;
  remainingFreeSpins?: number;
  hasWildWin?: boolean;
  currentMultiplier?: number;
}

// Delicate Golden Star Particles & Subtle Gold Smoke for Star-Shatter Effect
interface StarShardConfig {
  icon: string;
  dx: number;
  dy: number;
  rotate: number;
  size: number;
  color: string;
}

const STAR_SHARD_CONFIGS: StarShardConfig[] = [
  { icon: '✦', dx: -16, dy: -20, rotate: -45, size: 14, color: '#fef08a' },
  { icon: '★', dx: 18, dy: -18, rotate: 60, size: 13, color: '#fde047' },
  { icon: '✧', dx: 22, dy: -4, rotate: -30, size: 15, color: '#f59e0b' },
  { icon: '✦', dx: 18, dy: 16, rotate: 45, size: 13, color: '#fef08a' },
  { icon: '★', dx: 10, dy: 22, rotate: -60, size: 12, color: '#fde047' },
  { icon: '✧', dx: -14, dy: 20, rotate: 30, size: 14, color: '#d97706' },
  { icon: '✦', dx: -22, dy: 4, rotate: -40, size: 13, color: '#fef08a' },
  { icon: '★', dx: -16, dy: -10, rotate: 50, size: 12, color: '#fde047' },
];

// PRECISE BOARD DIMENSIONS
const PITCH_X = 96;
const PITCH_Y = 108;
const PAD_X = 48;
const PAD_Y = 46;
const SVG_WIDTH = 6 * PITCH_X + 2 * PAD_X; // 672
const SVG_HEIGHT = 5 * PITCH_Y + 2 * PAD_Y; // 632

// Outer Board Frame Path
const OUTER_BOARD_PATH = [
  'M 336, 16',
  'L 24, 108',
  'L 24, 514',
  'L 308, 620',
  'Q 336, 626 364, 620',
  'L 648, 514',
  'L 648, 108',
  'Z',
].join(' ');

// Inner Board Fill Path
const INNER_BOARD_PATH = [
  'M 336, 22',
  'L 30, 112',
  'L 30, 510',
  'L 310, 614',
  'Q 336, 620 362, 614',
  'L 642, 510',
  'L 642, 112',
  'Z',
].join(' ');

// Perimeter Bronze/Gold Rivets
const BOARD_RIVETS = [
  { x: 336, y: 22 },
  { x: 260, y: 44 },
  { x: 180, y: 68 },
  { x: 100, y: 90 },
  { x: 30, y: 112 },
  { x: 412, y: 44 },
  { x: 492, y: 68 },
  { x: 572, y: 90 },
  { x: 642, y: 112 },
  { x: 30, y: 190 },
  { x: 30, y: 270 },
  { x: 30, y: 350 },
  { x: 30, y: 430 },
  { x: 30, y: 510 },
  { x: 642, y: 190 },
  { x: 642, y: 270 },
  { x: 642, y: 350 },
  { x: 642, y: 430 },
  { x: 642, y: 510 },
  { x: 100, y: 536 },
  { x: 170, y: 562 },
  { x: 240, y: 588 },
  { x: 310, y: 614 },
  { x: 362, y: 614 },
  { x: 432, y: 588 },
  { x: 502, y: 562 },
  { x: 572, y: 536 },
];

export const WildBountyReels: React.FC<WildBountyReelsProps> = ({
  grid,
  winningTileIds,
  winAnimStage,
  isSpinExiting,
  isTurbo,
  isCascading = false,
  isFreeSpins = false,
  remainingFreeSpins = 0,
  hasWildWin = false,
  currentMultiplier = 1,
}) => {
  // Store previous settled grid so old symbols are physically pushed down by incoming symbols
  const prevSettledGridRef = useRef<GridTile[][]>(grid);

  const isSpinEntering = !isCascading && grid.some((col) => col.some((t) => t.isNew));

  useEffect(() => {
    if (!isSpinEntering) {
      prevSettledGridRef.current = grid;
    }
  }, [grid, isSpinEntering]);

  return (
    <div className="relative w-full max-w-[560px] sm:max-w-[580px] mx-auto select-none px-0.5 overflow-hidden">
      {/* MAIN WILD BOUNTY WOODEN BOARD CONTAINER - BACKGROUND COKLAT TRANSPARAN */}
      <div
        className={`relative w-full transition-all duration-300 ${
          isFreeSpins
            ? 'filter drop-shadow-[0_0_24px_rgba(245,197,66,0.65)]'
            : 'drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]'
        }`}
        style={{
          aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}`,
          transform: 'translateZ(0)',
        }}
      >
        {/* SVG LAYER: WOODEN BOARD, 3600 WAYS ENGRAVINGS, METALLIC RIM & RIVETS */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {/* Background Coklat Transparan untuk Box Bingkai (Opacity 0.58 to 0.70) */}
            <linearGradient id="boardWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#45200c" stopOpacity="0.62" />
              <stop offset="25%" stopColor="#2e1407" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#1c0b03" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#100502" stopOpacity="0.70" />
            </linearGradient>

            {/* Bronze/Gold Beveled Metallic Outer Frame */}
            <linearGradient id="bronzeFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isFreeSpins ? '#fffbeb' : '#ffeed4'} />
              <stop offset="20%" stopColor={isFreeSpins ? '#fde047' : '#d89648'} />
              <stop offset="50%" stopColor={isFreeSpins ? '#b45309' : '#7a3f12'} />
              <stop offset="80%" stopColor={isFreeSpins ? '#f59e0b' : '#c5843b'} />
              <stop offset="100%" stopColor={isFreeSpins ? '#78350f' : '#4e2406'} />
            </linearGradient>

            {/* Gold Highlight Inlay */}
            <linearGradient id="goldInlayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Metallic Rivet Gradient */}
            <radialGradient id="boardRivetGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="45%" stopColor="#d97706" />
              <stop offset="85%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#291104" />
            </radialGradient>
          </defs>

          {/* 1. Main Solid Dark Wood Board (Coklat Transparan) */}
          <path d={OUTER_BOARD_PATH} fill="url(#boardWoodGrad)" />

          {/* 2. Vertical Wood Planks Lines Texture */}
          <g stroke="#000000" strokeWidth="1.5" opacity="0.2">
            <line x1={PAD_X + 1 * PITCH_X} y1="80" x2={PAD_X + 1 * PITCH_X} y2="550" />
            <line x1={PAD_X + 2 * PITCH_X} y1="40" x2={PAD_X + 2 * PITCH_X} y2="595" />
            <line x1={PAD_X + 3 * PITCH_X} y1="20" x2={PAD_X + 3 * PITCH_X} y2="620" />
            <line x1={PAD_X + 4 * PITCH_X} y1="40" x2={PAD_X + 4 * PITCH_X} y2="595" />
            <line x1={PAD_X + 5 * PITCH_X} y1="80" x2={PAD_X + 5 * PITCH_X} y2="550" />
          </g>

          {/* 3. Subtle Column Divider Glows */}
          <g opacity="0.12" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 5">
            <line x1={PAD_X + 1 * PITCH_X} y1="100" x2={PAD_X + 1 * PITCH_X} y2="532" />
            <line x1={PAD_X + 2 * PITCH_X} y1="46" x2={PAD_X + 2 * PITCH_X} y2="586" />
            <line x1={PAD_X + 3 * PITCH_X} y1="46" x2={PAD_X + 3 * PITCH_X} y2="586" />
            <line x1={PAD_X + 4 * PITCH_X} y1="46" x2={PAD_X + 4 * PITCH_X} y2="586" />
            <line x1={PAD_X + 5 * PITCH_X} y1="100" x2={PAD_X + 5 * PITCH_X} y2="532" />
          </g>

          {/* 4. Engraved "3600 WAYS" on Left Shoulder (Angled) */}
          <g transform="translate(130, 72) rotate(-16.5)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#180b04"
              stroke="#3a1c0b"
              strokeWidth="0.8"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              fontSize="20"
              letterSpacing="2.5"
              opacity="0.85"
            >
              3600 WAYS
            </text>
          </g>

          {/* 5. Engraved "3600 WAYS" on Right Shoulder (Angled) */}
          <g transform="translate(542, 72) rotate(16.5)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#180b04"
              stroke="#3a1c0b"
              strokeWidth="0.8"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              fontSize="20"
              letterSpacing="2.5"
              opacity="0.85"
            >
              3600 WAYS
            </text>
          </g>

          {/* 6. Thick Outer Bronze/Copper Beveled Rim */}
          <path
            d={OUTER_BOARD_PATH}
            fill="none"
            stroke="url(#bronzeFrameGrad)"
            strokeWidth="9"
            strokeLinejoin="round"
          />

          {/* 7. Inner Fine Gold Accent Trace */}
          <path
            d={INNER_BOARD_PATH}
            fill="none"
            stroke="url(#goldInlayGrad)"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* 8. Perimeter Bronze Rivets with Highlights */}
          {BOARD_RIVETS.map((rivet, idx) => (
            <g key={idx} transform={`translate(${rivet.x}, ${rivet.y})`}>
              <circle r="4.5" fill="url(#boardRivetGrad)" stroke="#451a03" strokeWidth="1" />
              <circle r="1.5" fill="#fffbeb" opacity="0.75" cx="-1" cy="-1" />
            </g>
          ))}
        </svg>

        {/* TOP STATUS BADGE: SISA SPIN or PAY ANYWHERE IN CENTER PEAK */}
        <div className="absolute top-1 left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
          {isFreeSpins && remainingFreeSpins > 0 ? (
            <div className="px-3.5 py-0.5 rounded-full bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 border border-yellow-300 shadow-[0_2px_12px_rgba(245,197,66,0.9)] animate-pulse">
              <span className="text-[10px] text-yellow-100 font-western font-black tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                ★ SISA SPIN: {remainingFreeSpins} ★
              </span>
            </div>
          ) : (
            <div className="px-3 py-0.5 rounded-full bg-gradient-to-b from-[#2a1408]/90 to-[#120703]/90 border border-amber-500/50 shadow-md">
              <span className="text-[9px] text-amber-300/90 font-western font-bold tracking-widest uppercase">
                PAY ANYWHERE
              </span>
            </div>
          )}
        </div>

        {/* 2. REEL GRID TILES LAYER (STRICTLY CLIPPED TO BOARD INTERIOR) */}
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          style={{
            // Hardware-accelerated clip path matching the exact inner board contour
            clipPath:
              'polygon(50% 3.5%, 4.5% 17.7%, 4.5% 80.7%, 46.1% 97.2%, 50% 98.1%, 53.9% 97.2%, 95.5% 80.7%, 95.5% 17.7%)',
            transform: 'translateZ(0)',
          }}
        >
          {Array.from({ length: NUM_COLUMNS }).map((_, colIdx) => {
            const colTiles = grid[colIdx] || [];
            const prevColTiles = prevSettledGridRef.current[colIdx] || [];
            const colRowCount = REEL_ROW_COUNTS[colIdx];
            const offsetY = ((5 - colRowCount) * PITCH_Y) / 2;
            const totalDropDistance = colRowCount * PITCH_Y;

            const colLeftPct = ((PAD_X + colIdx * PITCH_X) / SVG_WIDTH) * 100;
            const colWidthPct = (PITCH_X / SVG_WIDTH) * 100;

            const peekVisualY = PAD_Y + offsetY - PITCH_Y;
            const peekVisualYPct = (peekVisualY / SVG_HEIGHT) * 100;
            const tileHeightPct = (PITCH_Y / SVG_HEIGHT) * 100;

            const spinDropDuration = isTurbo ? 0.30 : 0.54;
            const spinColDelay = isTurbo ? 0 : colIdx * 0.13;

            return (
              <div
                key={colIdx}
                className="absolute top-0 bottom-0 overflow-visible"
                style={{
                  left: `${colLeftPct}%`,
                  width: `${colWidthPct}%`,
                }}
              >
                {/* 1. BAGIAN ATAS HANYA BAYANGAN (Reel Top Ambient Shadow / Vignette) */}
                <div
                  className="absolute left-0 right-0 w-full flex items-center justify-center pointer-events-none"
                  style={{
                    top: `${peekVisualYPct}%`,
                    height: `${tileHeightPct}%`,
                  }}
                >
                  <div className="w-[85%] h-full bg-gradient-to-b from-black/80 via-black/40 to-transparent rounded-b-2xl opacity-75 filter blur-[1px]" />
                </div>

                {/* 2A. SIMBOL SEBELUMNYA TERDORONG TURUN (TETAP TERLIHAT MELEWATI BINGKAI SAMPAI KELUAR) */}
                {isSpinEntering &&
                  prevColTiles.map((prevTile) => {
                    const visualY = PAD_Y + offsetY + prevTile.row * PITCH_Y;
                    const visualYPct = (visualY / SVG_HEIGHT) * 100;

                    return (
                      <motion.div
                        key={`prev-${prevTile.id}`}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: totalDropDistance, opacity: 1 }}
                        transition={{
                          duration: spinDropDuration,
                          delay: spinColDelay,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute left-0 right-0 w-full flex items-center justify-center overflow-visible z-10 pointer-events-none"
                        style={{
                          top: `${visualYPct}%`,
                          height: `${tileHeightPct}%`,
                          willChange: 'transform',
                          transform: 'translate3d(0, 0, 0)',
                        }}
                      >
                        <div className="relative flex items-center justify-center w-full h-full overflow-visible pointer-events-none">
                          <SlotSymbolGraphic symbolId={prevTile.symbol} isWinning={false} />
                        </div>
                      </motion.div>
                    );
                  })}

                {/* 2B. SIMBOL BARU MASUK DARI ATAS MENDORONG KE TEMPATNYA SECARA KONTINU */}
                {colTiles.map((tile) => {
                  const isWinning = winningTileIds.includes(tile.id);

                  const visualY = PAD_Y + offsetY + tile.row * PITCH_Y;
                  const visualYPct = (visualY / SVG_HEIGHT) * 100;

                  // Hardware accelerated pixel translates:
                  let initialY = 0;

                  if (isSpinEntering) {
                    // Masuk dari tepat di atas simbol yang ada sebagai tumpukan bersambung
                    initialY = -totalDropDistance;
                  } else if (isCascading) {
                    // CASCADE TUMBLE (setelah Wild / simbol pecah):
                    if (tile.dropRows && tile.dropRows > 0) {
                      initialY = -(tile.dropRows * PITCH_Y);
                    }
                  }

                  const scaleDuration = isTurbo ? 0.12 : 0.24;
                  const symImage = SYMBOLS[tile.symbol]?.image;

                  return (
                    <motion.div
                      key={tile.id}
                      initial={{
                        y: initialY,
                        scale: 1,
                        opacity: 1,
                      }}
                      animate={{
                        y: 0,
                        scale: isWinning
                          ? 1.15
                          : (tile.symbol === 'WILD' || tile.symbol === 'SCATTER') && tile.isNew
                          ? 1.12
                          : 1,
                        opacity: 1,
                      }}
                      transition={
                        isSpinEntering
                          ? {
                              // Spin drop: meluncur turun bersambung dalam satu kecepatan dengan simbol yang didorong
                              duration: spinDropDuration,
                              delay: spinColDelay,
                              ease: [0.16, 1, 0.3, 1],
                            }
                          : isCascading
                          ? {
                              // Tumble drop saat cascade: gerakan turun mulus mengisi ruang kosong
                              duration: isTurbo ? 0.24 : 0.44,
                              delay: 0,
                              ease: [0.16, 1, 0.3, 1],
                            }
                          : isWinning
                          ? { duration: scaleDuration, ease: 'easeInOut' }
                          : {
                              duration: 0.2,
                              ease: 'easeOut',
                            }
                      }
                      className={`absolute left-0 right-0 w-full flex items-center justify-center overflow-visible ${
                        isWinning ? 'z-30' : 'z-20'
                      }`}
                      style={{
                        top: `${visualYPct}%`,
                        height: `${tileHeightPct}%`,
                        willChange: 'transform',
                        transform: 'translate3d(0, 0, 0)',
                      }}
                    >
                      {/* DELICATE STAR SHARDS & SUBTLE GOLD SMOKE SHATTERING EFFECT */}
                      {isWinning && winAnimStage === 'SHATTERING' && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40 overflow-visible">
                          {/* Subtle Faint Golden Smoke Mist Puff (tidak menutupi grid) */}
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0.55 }}
                            animate={{ scale: 1.25, opacity: 0 }}
                            transition={{
                              duration: isTurbo ? 0.20 : 0.38,
                              ease: 'easeOut',
                            }}
                            className="absolute w-20 h-20 rounded-full bg-radial from-amber-400/30 via-yellow-500/10 to-transparent blur-sm pointer-events-none"
                          />

                          {/* Small Star Fragments Dispersing Outwards */}
                          {STAR_SHARD_CONFIGS.map((star, sIdx) => (
                            <motion.div
                              key={sIdx}
                              initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                              animate={{
                                x: star.dx,
                                y: star.dy,
                                rotate: star.rotate,
                                scale: 0.3,
                                opacity: 0,
                              }}
                              transition={{
                                duration: isTurbo ? 0.20 : 0.38,
                                ease: 'easeOut',
                              }}
                              className="absolute flex items-center justify-center pointer-events-none select-none font-bold"
                              style={{
                                color: star.color,
                                fontSize: `${star.size}px`,
                                textShadow: `0 0 6px ${star.color}`,
                                willChange: 'transform, opacity',
                              }}
                            >
                              {star.icon}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Main Symbol Graphic (Maksimal besar, saling menempel, tanpa ubin aneh) */}
                      <div
                        className={`relative flex items-center justify-center w-full h-full overflow-visible pointer-events-none transition-opacity duration-75 ${
                          isWinning && winAnimStage === 'SHATTERING' ? 'opacity-0' : 'opacity-100'
                        }`}
                      >
                        <SlotSymbolGraphic
                          symbolId={tile.symbol}
                          isWinning={isWinning}
                          hasWildWin={hasWildWin}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
