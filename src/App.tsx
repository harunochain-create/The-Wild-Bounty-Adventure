import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Trophy,
  HelpCircle,
  Code,
  Volume2,
  VolumeX,
  Music,
  Wallet,
  Flame,
  X,
  Menu,
  Globe,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  SlidersHorizontal,
} from 'lucide-react';
import {
  GridTile,
  Transaction,
  LeaderboardEntry,
} from './types/slot';
import {
  NUM_COLUMNS,
  REEL_ROW_COUNTS,
  LEVEL_CONFIGS,
  generateInitialTileGrid,
  executeFullCascadeSpin,
  sha256,
  generateRandomHex,
} from './utils/slotEngine';
import { sound } from './utils/soundEngine';
import { Language, TRANSLATIONS } from './utils/translations';
import { WildBountyReels, WinAnimStage } from './components/WildBountyReels';
import { HangingMultiplierSign } from './components/HangingMultiplierSign';
import { HorseshoeMessageBanner } from './components/HorseshoeMessageBanner';
import { WildBountyControls } from './components/WildBountyControls';
import { ThreeWinCanvas, WinTier } from './components/ThreeWinCanvas';
import { ScatterCongratsModal } from './components/ScatterCongratsModal';
import { FreeSpinsTotalWinModal } from './components/FreeSpinsTotalWinModal';
import { SaloonSafeBonus } from './components/SaloonSafeBonus';
import { PaymentModal } from './components/PaymentModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PaytableModal } from './components/PaytableModal';
import { NativeEngineModal } from './components/NativeEngineModal';
import { AutoSpinModal } from './components/AutoSpinModal';
import originalDesertBg from './assets/images/wild_bounty_banner_1791020853754.jpg';

// Bet Steps Ladder: 400 -> 600 (+200) -> x2 subsequent steps (1200, 2400, 4800, ...)
const BET_STEPS = [
  400,
  600,
  1200,
  2400,
  4800,
  9600,
  19200,
  38400,
  76800,
  153600,
  307200,
  614400,
  1228800,
];

export default function App() {
  // Language State (ID / EN)
  const [language, setLanguage] = useState<Language>('ID');
  const t = TRANSLATIONS[language] || TRANSLATIONS.ID;

  // Player Balance & Wallet
  const [balance, setBalance] = useState<number>(100000);
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('IDR');
  const [bet, setBet] = useState<number>(400);
  const [currentWin, setCurrentWin] = useState<number>(0);

  // Progressive Scatter Level
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [scattersCollected, setScattersCollected] = useState<number>(0);

  // Free Spins State
  const [isFreeSpins, setIsFreeSpins] = useState<boolean>(false);
  const [remainingFreeSpins, setRemainingFreeSpins] = useState<number>(0);
  const [totalFreeSpinsSession, setTotalFreeSpinsSession] = useState<number>(10);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);
  const [freeSpinsSummaryBanner, setFreeSpinsSummaryBanner] = useState<{
    active: boolean;
    totalWon: number;
  } | null>(null);
  const [freeSpinsTotalWinModal, setFreeSpinsTotalWinModal] = useState<{
    active: boolean;
    totalWon: number;
  } | null>(null);

  // Scatter Congratulations Popup State
  const [showScatterCongrats, setShowScatterCongrats] = useState<boolean>(false);
  const [scatterCongratsAwarded, setScatterCongratsAwarded] = useState<number>(10);

  // Active Multiplier
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [hasWildWin, setHasWildWin] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('BAYAR DI MANA SAJA!');

  // Uniform 6x5 Grid of GridTiles
  const [grid, setGrid] = useState<GridTile[][]>(() => generateInitialTileGrid(1));
  const [winningTileIds, setWinningTileIds] = useState<string[]>([]);
  const [winAnimStage, setWinAnimStage] = useState<WinAnimStage>('IDLE');
  const [isSpinExiting, setIsSpinExiting] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isCascading, setIsCascading] = useState<boolean>(false);

  // Controls & Options
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);
  const autoRemainingRef = useRef<number>(0);
  const scatterHitStepRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Provably Fair Real RNG Seeds
  const [serverSeed, setServerSeed] = useState<string>(() => generateRandomHex(32));
  const [serverSeedHash, setServerSeedHash] = useState<string>('');
  const [clientSeed, setClientSeed] = useState<string>('wild-bounty-player-2026');
  const [nonce, setNonce] = useState<number>(1);
  const [lastRevealedServerSeed, setLastRevealedServerSeed] = useState<string | null>(null);

  // Modals & Menu
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [paymentTab, setPaymentTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');
  const [showFairness, setShowFairness] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showNativeSpecs, setShowNativeSpecs] = useState<boolean>(false);
  const [showSafeBonus, setShowSafeBonus] = useState<boolean>(false);
  const [showAutoSpinModal, setShowAutoSpinModal] = useState<boolean>(false);

  // Bet Stepping Handlers (Min 400 -> 600 (+200) -> x2 steps up to 1.2M)
  const handleIncreaseBet = () => {
    setBet((prev) => {
      const idx = BET_STEPS.indexOf(prev);
      if (idx !== -1 && idx < BET_STEPS.length - 1) {
        return BET_STEPS[idx + 1];
      }
      if (prev < 400) return 400;
      if (prev === 400) return 600;
      return Math.min(1228800, prev * 2);
    });
  };

  const handleDecreaseBet = () => {
    setBet((prev) => {
      const idx = BET_STEPS.indexOf(prev);
      if (idx > 0) {
        return BET_STEPS[idx - 1];
      }
      if (prev === 600) return 400;
      if (prev > 600) return Math.max(400, Math.floor(prev / 2));
      return 400;
    });
  };

  const handleSelectAutoSpins = (count: number) => {
    setShowAutoSpinModal(false);
    autoRemainingRef.current = count;
    setAutoSpinsRemaining(count);
    if (!isSpinning && !isCascading) {
      handleSpin();
    }
  };

  // Win Celebration Canvas (Compact top banner, max 2.5s, non-blocking)
  const [winCelebration, setWinCelebration] = useState<{
    active: boolean;
    tier: WinTier;
    amount: number;
  }>({ active: false, tier: 'BIG_WIN', amount: 0 });

  // Transactions Ledger
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-DEP-884920',
      type: 'DEPOSIT',
      method: 'QRIS Instant Transfer',
      amount: 100000,
      currency: 'IDR',
      timestamp: Date.now() - 1800000,
      status: 'COMPLETED',
      reference: 'GW-SECURE-9182AB',
    },
  ]);

  // Global Leaderboard Mock Entries
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, playerName: 'Gunslinger_Tex', country: 'US 🇺🇸', biggestWin: 38400, level: 5, multiplier: 35.0, timestamp: '10m ago' },
    { rank: 2, playerName: 'BanditQueen_ID', country: 'ID 🇮🇩', biggestWin: 29500, level: 5, multiplier: 35.0, timestamp: '24m ago' },
    { rank: 3, playerName: 'ElDorado_MX', country: 'MX 🇲🇽', biggestWin: 18200, level: 4, multiplier: 15.0, timestamp: '1h ago' },
    { rank: 4, playerName: 'You (Bounty Hunter)', country: 'ID 🇮🇩', biggestWin: 4800, level: 1, multiplier: 8.0, timestamp: 'Just now', isCurrentPlayer: true },
  ]);

  // Pre-calculate SHA-256 Server Seed Hash for Provably Fair
  useEffect(() => {
    sha256(serverSeed).then((hash) => setServerSeedHash(hash));
  }, [serverSeed]);

  // Cowboy Ambient Music State & 3D Free Spins Showdown Transition
  const [isMusicActive, setIsMusicActive] = useState<boolean>(false);
  const [showFreeSpins3DTransition, setShowFreeSpins3DTransition] = useState<boolean>(false);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (next && isMusicActive) {
      setIsMusicActive(false);
    }
  };

  // Toggle Cowboy Saloon BGM
  const handleToggleMusic = () => {
    if (isMuted) {
      setIsMuted(false);
      sound.setMuted(false);
    }
    const playing = sound.toggleBGM();
    setIsMusicActive(playing);
  };

  // CORE SPIN FUNCTION
  const handleSpin = async () => {
    if (isSpinning || isCascading || showScatterCongrats) return;
    if (!isFreeSpins && balance < bet) {
      autoRemainingRef.current = 0;
      setAutoSpinsRemaining(0);
      setShowPayment(true);
      return;
    }

    // PERBAIKAN 6: Setiap putaran auto: angka sisa berkurang 1 TEPAT saat putaran dimulai (sebelum animasi keluar)
    if (!isFreeSpins && autoRemainingRef.current > 0) {
      autoRemainingRef.current -= 1;
      setAutoSpinsRemaining(autoRemainingRef.current);
    }

    // Decrement free spins if in Free Spins mode
    if (isFreeSpins) {
      const nextRemaining = Math.max(0, remainingFreeSpins - 1);
      setRemainingFreeSpins(nextRemaining);
      const currentSpinNum = Math.max(1, totalFreeSpinsSession - nextRemaining);
      setStatusMessage(`${t.freeSpin} ${currentSpinNum} / ${totalFreeSpinsSession}`);
    } else {
      setBalance((prev) => prev - bet);
      setStatusMessage(t.payAnywhere);
    }

    // PERBAIKAN 7: Reset scatter hit step count for this spin
    scatterHitStepRef.current = 0;

    setCurrentWin(0);
    setWinningTileIds([]);
    setWinAnimStage('IDLE');
    setHasWildWin(false);
    setIsSpinning(true);
    setCurrentMultiplier(isFreeSpins ? 8 : 1);

    // Direct continuous downward roll through the frame
    setIsSpinExiting(false);
    if (isTurbo) {
      sound.playTurboTumble();
    } else {
      sound.playCowboySpin();
    }

    const newGrid = generateInitialTileGrid(currentLevel);
    const enteringGrid: GridTile[][] = newGrid.map((colTiles) =>
      colTiles.map((t) => ({ ...t, isNew: true }))
    );
    setGrid(enteringGrid);

    // Landing timing synchronized with visual drop cadence:
    // Mode Turbo: Turun serentak, mendarat pada 320ms
    // Mode Biasa: Berurutan dari kiri ke kanan (delay c * 130ms + descent 560ms)
    if (isTurbo) {
      setTimeout(() => {
        sound.playReelStop(false);
        let turboScatters = 0;
        enteringGrid.forEach((col) => {
          col.forEach((t) => {
            if (t.isNew && t.symbol === 'SCATTER') turboScatters++;
          });
        });
        for (let s = 0; s < turboScatters; s++) {
          sound.playCashRegisterCring(scatterHitStepRef.current);
          scatterHitStepRef.current = Math.min(6, scatterHitStepRef.current + 1);
        }
      }, 320);
    } else {
      [0, 1, 2, 3, 4, 5].forEach((c) => {
        const colScatters = enteringGrid[c].filter(
          (t) => t.isNew && t.symbol === 'SCATTER'
        ).length;
        const colLandingTime = c * 130 + 560;
        setTimeout(() => {
          sound.playReelStop(false);
          for (let s = 0; s < colScatters; s++) {
            sound.playCashRegisterCring(scatterHitStepRef.current);
            scatterHitStepRef.current = Math.min(6, scatterHitStepRef.current + 1);
          }
        }, colLandingTime);
      });
    }

    // Allow full smooth descent animation to finish settling
    const settleDuration = isTurbo ? 400 : 1350;
    setTimeout(() => {
      // Clear isNew flag and start cascade evaluation
      const settledGrid: GridTile[][] = enteringGrid.map((colTiles) =>
        colTiles.map((t) => ({ ...t, isNew: false, dropRows: 0 }))
      );
      setGrid(settledGrid);

      const result = executeFullCascadeSpin(
        settledGrid,
        bet,
        currentLevel,
        scattersCollected,
        isFreeSpins
      );

      animateCascadeSteps(settledGrid, result);
    }, settleDuration);
  };

  // Sequential Cascade Tumble Animation:
  // (a) membesar ke 1.2 dalam 0.25s (turbo 0.12s) dengan ring emas
  // (b) tahan sekitar 0.15s (turbo 0.08s)
  // (c) pecah bersamaan ke 0 dengan partikel emas dalam 0.25s (turbo 0.12s)
  // (d) jatuh serentak mengisi kekosongan (0.35s, turbo 0.2s)
  const animateCascadeSteps = (
    currentGridState: GridTile[][],
    result: ReturnType<typeof executeFullCascadeSpin>
  ) => {
    const { steps, totalWin, totalScatters, awardedFreeSpins, levelUpOccurred, newLevel } = result;
    let stepIndex = 0;
    let runningGrid = currentGridState;

    const playNextStep = () => {
      if (stepIndex >= steps.length) {
        // All cascades of this spin complete
        setIsSpinning(false);
        setIsCascading(false);
        setWinningTileIds([]);
        setWinAnimStage('IDLE');

        // Advance Provably Fair nonce & server seed
        setLastRevealedServerSeed(serverSeed);
        setServerSeed(generateRandomHex(32));
        setNonce((n) => n + 1);

        // Win calculation per spin
        if (totalWin > 0) {
          setBalance((prev) => prev + totalWin);
          setCurrentWin(totalWin);
          if (isFreeSpins) {
            setFreeSpinsTotalWon((prev) => prev + totalWin);
          }
          setStatusMessage(`KEMENANGAN TOTAL ${currency === 'IDR' ? 'Rp ' : '$'}${totalWin.toLocaleString()}!`);

          // 2. TINGKAT KEMENANGAN (kelipatan total bet, dihitung dari total kemenangan satu spin):
          // - < 10x: tanpa overlay, hanya angka win di status bar
          // - 10x - 24x: BIG WIN (banner kecil)
          // - 25x - 49x: SUPER BIG WIN
          // - 50x - 99x: MEGA WIN
          // - 100x+: EPIC WIN
          const winRatio = totalWin / bet;
          if (winRatio >= 100) {
            setWinCelebration({ active: true, tier: 'EPIC_WIN', amount: totalWin });
            sound.playWin(true);
          } else if (winRatio >= 50) {
            setWinCelebration({ active: true, tier: 'MEGA_WIN', amount: totalWin });
            sound.playWin(true);
          } else if (winRatio >= 25) {
            setWinCelebration({ active: true, tier: 'SUPER_BIG_WIN', amount: totalWin });
            sound.playWin(true);
          } else if (winRatio >= 10) {
            setWinCelebration({ active: true, tier: 'BIG_WIN', amount: totalWin });
            sound.playWin(true);
          } else {
            // < 10x: tanpa overlay
            sound.playWin(false);
          }
        } else {
          setStatusMessage(isFreeSpins ? 'MULTIPLIER BERKELIPATAN' : 'MULTIPLIER DOUBLES AFTER');
        }

        // 3. SCATTER (EMAS BATANGAN) & POPUP SELAMAT (Perbaikan 3)
        // Minimal 3 Scatter = 10 Free Spins (+2 per additional scatter) / Retrigger = 5 Free Spins
        const boardScatterCount = runningGrid.reduce(
          (acc, col) => acc + col.filter((t) => t.symbol === 'SCATTER').length,
          0
        );
        const effectiveScatters = Math.max(totalScatters, boardScatterCount);
        let effectiveAwardedFreeSpins = awardedFreeSpins;
        if (effectiveAwardedFreeSpins === 0 && effectiveScatters >= 3) {
          effectiveAwardedFreeSpins = isFreeSpins ? 5 : 10 + (effectiveScatters - 3) * 2;
        }

        if (effectiveAwardedFreeSpins > 0) {
          const triggerScatterSequence = () => {
            // (a) Semua scatter di papan membesar/berkedip sebentar (0.6 detik)
            const scatterIds: string[] = [];
            runningGrid.forEach((col) => {
              col.forEach((t) => {
                if (t.symbol === 'SCATTER') scatterIds.push(t.id);
              });
            });
            setWinningTileIds(scatterIds);
            setWinAnimStage('EXPANDING');

            sound.playScatterFanfare();

            if (levelUpOccurred) {
              setCurrentLevel(newLevel);
              setScattersCollected(0);
            } else {
              setScattersCollected((prev) => prev + effectiveScatters);
            }

            // (b) Popup SELAMAT muncul (zoom in) setelah 0.6 detik
            setTimeout(() => {
              setScatterCongratsAwarded(effectiveAwardedFreeSpins);
              setShowScatterCongrats(true);
            }, 600);
          };

          // Jika ada efek win (10x+), efek win muncul dulu baru popup scatter
          const winRatio = totalWin / bet;
          if (winRatio >= 10) {
            setTimeout(() => {
              triggerScatterSequence();
            }, 2000);
          } else {
            triggerScatterSequence();
          }

          return; // Modal close callback triggers the free spin sequence
        } else if (effectiveScatters > 0) {
          // Progress level counter
          if (levelUpOccurred) {
            setCurrentLevel(newLevel);
            setScattersCollected(0);
            sound.playScatterFanfare();
          } else {
            setScattersCollected((prev) => prev + effectiveScatters);
          }
        }

        // Check if Free Spins ended
        if (isFreeSpins && remainingFreeSpins <= 1) {
          const finalWon = freeSpinsTotalWon + totalWin;
          setFreeSpinsTotalWinModal({ active: true, totalWon: finalWon });
          setStatusMessage(`TOTAL MENANG: ${currency === 'IDR' ? 'Rp ' : '$'}${finalWon.toLocaleString()}`);
          return;
        }

        // Normal Auto-Spin loop
        if (!isFreeSpins && autoRemainingRef.current > 0) {
          setTimeout(() => {
            if (autoRemainingRef.current > 0 && balance >= bet) {
              handleSpin();
            } else {
              autoRemainingRef.current = 0;
              setAutoSpinsRemaining(0);
            }
          }, isTurbo ? 400 : 800);
        }

        return;
      }

      const currentStep = steps[stepIndex];
      setCurrentMultiplier(currentStep.multiplier);
      const isWildStep = !!currentStep.hasWild && currentStep.multiplier > 1;
      setHasWildWin(isWildStep);

      if (currentStep.winningWays.length > 0) {
        setIsCascading(true);
        setWinningTileIds(currentStep.winningTileIds);
        sound.playGunshot();
        if (isWildStep) {
          setStatusMessage(`WILD WIN X${currentStep.multiplier}! +${currency === 'IDR' ? 'Rp ' : '$'}${currentStep.stepWin.toLocaleString()}`);
        } else {
          setStatusMessage(`WIN! +${currency === 'IDR' ? 'Rp ' : '$'}${currentStep.stepWin.toLocaleString()}`);
        }

        // (a) EXPANDING: membesar bersamaan dengan ring emas
        setWinAnimStage('EXPANDING');
        const expandTime = isTurbo ? 140 : 320;

        setTimeout(() => {
          // (b) HOLD: tahan sejenak agar kemenangan terlihat jelas oleh mata
          setWinAnimStage('HOLD');
          const holdTime = isTurbo ? 100 : 220;

          setTimeout(() => {
            // (c) SHATTERING: menyusut sambil memancarkan serpihan bintang sampai tuntas
            setWinAnimStage('SHATTERING');
            const shatterTime = isTurbo ? 220 : 400;

            setTimeout(() => {
              // (c2) JEDA RUANG KOSONG:
              // WAJIB: Hapus simbol yang pecah dari state/render seketika agar ruang kosong benar-benar terbentuk!
              const winningIdSet = new Set(currentStep.winningTileIds);
              const clearedGrid: GridTile[][] = runningGrid.map((colTiles) =>
                colTiles.filter((t) => !winningIdSet.has(t.id))
              );
              runningGrid = clearedGrid;
              setGrid(clearedGrid);
              setWinningTileIds([]);
              setWinAnimStage('IDLE');
              setHasWildWin(false);

              const pauseAfterShatter = isTurbo ? 120 : 280;

              setTimeout(() => {
                // (d) SIMBOL BARU & BERGESER MULAI TURUN DARI ATAS MENGISI RUANG KOSONG
                const nextSourceGrid = steps[stepIndex + 1]?.grid ?? result.finalGrid;
                const newTileIdSet = new Set(currentStep.newTiles.map((t) => t.id));

                const shiftedMap = new Map<string, number>();
                currentStep.shiftedTiles.forEach((s) => {
                  shiftedMap.set(s.id, s.toRow - s.fromRow);
                });

                const newCountByCol = new Map<number, number>();
                currentStep.newTiles.forEach((t) => {
                  newCountByCol.set(t.col, (newCountByCol.get(t.col) || 0) + 1);
                });

                const nextGrid: GridTile[][] = nextSourceGrid.map((colTiles, cIdx) =>
                  colTiles.map((t) => {
                    let dropRows = 0;
                    if (newTileIdSet.has(t.id)) {
                      dropRows = newCountByCol.get(cIdx) || 1;
                    } else if (shiftedMap.has(t.id)) {
                      dropRows = shiftedMap.get(t.id) || 0;
                    }
                    return {
                      ...t,
                      isWinning: false,
                      isNew: newTileIdSet.has(t.id),
                      dropRows,
                    };
                  })
                );

                runningGrid = nextGrid;
                setGrid(nextGrid);
                if (isTurbo) {
                  sound.playTurboTumble();
                } else {
                  sound.playCoin();
                }

                // Suara scatter saat mendarat pada cascade tumble
                const tumbleDuration = isTurbo ? 240 : 440;
                setTimeout(() => {
                  let scatterLanded = false;
                  nextGrid.forEach((col) => {
                    col.forEach((t) => {
                      if (t.isNew && t.symbol === 'SCATTER') {
                        scatterLanded = true;
                      }
                    });
                  });
                  if (scatterLanded) {
                    sound.playCashRegisterCring(scatterHitStepRef.current);
                    scatterHitStepRef.current = Math.min(6, scatterHitStepRef.current + 1);
                  }
                }, tumbleDuration);

                // (e) SIMBOL MENDARAT PENUH + JEDA DIAM SEBELUM EVALUASI CASCADE BERIKUTNYA
                const tumbleDropWait = isTurbo ? 320 : 640;
                setTimeout(() => {
                  const settled = runningGrid.map((colTiles) =>
                    colTiles.map((t) => ({ ...t, isNew: false, dropRows: 0 }))
                  );
                  runningGrid = settled;
                  setGrid(settled);

                  stepIndex++;
                  playNextStep();
                }, tumbleDropWait);
              }, pauseAfterShatter);
            }, shatterTime);
          }, holdTime);
        }, expandTime);
      } else {
        stepIndex++;
        playNextStep();
      }
    };

    playNextStep();
  };

  // 5. FREE SPIN AUTO RUN LOOP
  useEffect(() => {
    if (
      isFreeSpins &&
      remainingFreeSpins > 0 &&
      !isSpinning &&
      !isCascading &&
      !showScatterCongrats &&
      !showFreeSpins3DTransition &&
      !freeSpinsTotalWinModal &&
      !winCelebration.active &&
      !freeSpinsSummaryBanner
    ) {
      const delay = isTurbo ? 400 : 800;
      const timer = setTimeout(() => {
        handleSpin();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [
    isFreeSpins,
    remainingFreeSpins,
    isSpinning,
    isCascading,
    showScatterCongrats,
    showFreeSpins3DTransition,
    freeSpinsTotalWinModal,
    winCelebration.active,
    freeSpinsSummaryBanner,
    isTurbo,
  ]);

  // Handler when Scatter Congrats Popup closes:
  const handleScatterCongratsClose = () => {
    setShowScatterCongrats(false);
    setWinningTileIds([]);
    setWinAnimStage('IDLE');

    // Trigger 3D Professional Visual Refresh Showdown Transition
    setShowFreeSpins3DTransition(true);
    sound.playScatterFanfare();

    setTimeout(() => {
      setShowFreeSpins3DTransition(false);

      // ONLY start Free Spins session AFTER the Scatter Showdown animation has fully completed
      if (!isFreeSpins) {
        setIsFreeSpins(true);
        setRemainingFreeSpins(scatterCongratsAwarded);
        setTotalFreeSpinsSession(scatterCongratsAwarded);
        setFreeSpinsTotalWon(0);
        setStatusMessage(`FREE SPIN 1 / ${scatterCongratsAwarded}`);
      } else {
        setRemainingFreeSpins((prev) => prev + scatterCongratsAwarded);
        setTotalFreeSpinsSession((prev) => prev + scatterCongratsAwarded);
        setStatusMessage(`RETRIGGER! +${scatterCongratsAwarded} FREE SPINS!`);
      }
    }, 2200);
  };

  const handleFreeSpinsTotalWinComplete = () => {
    setFreeSpinsTotalWinModal(null);
    setIsFreeSpins(false);
    setRemainingFreeSpins(0);
    setFreeSpinsTotalWon(0);
    setStatusMessage('PAY ANYWHERE!');
  };

  const handleDepositSuccess = (amount: number, tx: Transaction) => {
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleWithdrawSuccess = (amount: number, tx: Transaction) => {
    setBalance((prev) => Math.max(0, prev - amount));
    setTransactions((prev) => [tx, ...prev]);
  };

  const currentLevelConfig = LEVEL_CONFIGS[currentLevel - 1] || LEVEL_CONFIGS[0];

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#0e0704] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black overflow-hidden relative font-sans">
      {/* 3D FREE SPINS SCATTER SHOWDOWN REFRESH TRANSITION OVERLAY */}
      {showFreeSpins3DTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300 pointer-events-none select-none">
          <div
            className="relative flex flex-col items-center justify-center text-center animate-in zoom-in-90 duration-300"
            style={{ perspective: '1000px' }}
          >
            {/* 3D Rotating Gold Sheriff Star with Radial Light Rays */}
            <div className="relative w-40 h-40 flex items-center justify-center animate-[spin_5s_linear_infinite]">
              <div className="absolute inset-0 rounded-full bg-radial from-amber-400/50 via-yellow-500/25 to-transparent blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="w-36 h-36 drop-shadow-[0_0_30px_rgba(245,197,66,0.95)]">
                <polygon
                  points="50,5 62,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 38,35"
                  fill="url(#transGoldStar)"
                  stroke="#fef08a"
                  strokeWidth="2.5"
                />
                <circle cx="50" cy="50" r="16" fill="#451a03" stroke="#fef08a" strokeWidth="1.5" />
                <text
                  x="50"
                  y="54"
                  textAnchor="middle"
                  fill="#fef08a"
                  fontFamily="Impact, sans-serif"
                  fontWeight="900"
                  fontSize="10"
                  letterSpacing="1"
                >
                  BOUNTY
                </text>
                <defs>
                  <linearGradient id="transGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fffbeb" />
                    <stop offset="25%" stopColor="#fde047" />
                    <stop offset="60%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/95 via-amber-800 to-amber-950/95 border-2 border-yellow-300 shadow-[0_0_35px_rgba(245,197,66,0.85)] animate-bounce">
              <h2 className="text-xl sm:text-2xl font-western font-black text-yellow-100 tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                ★ SHOWDOWN MODE ACTIVATED! ★
              </h2>
              <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest mt-0.5">
                MULTIPLIER DIMULAI DARI X8 • SALOON FREE SPINS
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SELAMAT SAAT SCATTER (Emas Batangan, 2.5s auto dismiss, tap to skip) */}
      {showScatterCongrats && (
        <ScatterCongratsModal
          freeSpinsAwarded={scatterCongratsAwarded}
          onClose={handleScatterCongratsClose}
          language={language}
        />
      )}

      {/* GRAND TOTAL KEMENANGAN FREE SPIN MODAL (Animasi hitung tung-tung-tung, tap to finish) */}
      {freeSpinsTotalWinModal?.active && (
        <FreeSpinsTotalWinModal
          totalWon={freeSpinsTotalWinModal.totalWon}
          currency={currency}
          onComplete={handleFreeSpinsTotalWinComplete}
          language={language}
        />
      )}

      {/* COMPACT FREE SPINS SUMMARY BANNER AT COMPLETION */}
      {freeSpinsSummaryBanner && (
        <div
          onClick={() => setFreeSpinsSummaryBanner(null)}
          className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] pointer-events-auto cursor-pointer animate-in slide-in-from-top-4 select-none"
        >
          <div className="relative rounded-2xl bg-gradient-to-b from-[#3a1d0d] via-[#241107] to-[#120703] border-2 border-amber-400 p-3 text-center shadow-2xl">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
              🏆 TOTAL KEMENANGAN FREE SPIN 🏆
            </div>
            <div className="text-xl sm:text-2xl font-western font-black text-gold-gradient my-0.5">
              +{currency === 'IDR' ? 'Rp ' : '$'}{freeSpinsSummaryBanner.totalWon.toLocaleString()}
            </div>
            <div className="text-[9px] text-stone-400">Kembali ke mode permainan normal</div>
          </div>
        </div>
      )}

      {/* Original Western Canyon Background from repository */}
      <div
        className="fixed inset-0 pointer-events-none opacity-90 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${originalDesertBg})`,
        }}
      />

      {/* FREE SPINS ACTIVE 3D GOLDEN BORDER & SHOWDOWN LIGHTING */}
      {isFreeSpins && (
        <div className="fixed inset-0 pointer-events-none z-10 border-4 border-amber-400/40 shadow-[inset_0_0_60px_rgba(245,197,66,0.3)] animate-pulse" />
      )}

      {/* 4. COMPACT HEADER (Western Title & Hamburger Menu Button ONLY - Sound & 3-dots removed) */}
      <header className="relative z-30 px-3 py-1.5 bg-[#120804]/90 border-b border-[#523015] flex items-center justify-between backdrop-blur-sm max-w-[560px] sm:max-w-[580px] mx-auto w-full shrink-0">
        <div className="flex items-center">
          <h1 className="font-western text-lg sm:text-xl font-black text-gold-gradient tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Hamburger Menu Drawer Toggle Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-[#221208] border border-[#d4963e] text-amber-300 hover:text-white hover:border-amber-400 transition-colors shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
            title={t.menuTitle}
          >
            <Menu className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </header>

      {/* 3. MAIN GAME CONTAINER (Expanded width approaching screen edges with balanced height) */}
      <main className="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-between sm:justify-evenly px-0.5 sm:px-1 py-0.5 max-w-[560px] sm:max-w-[580px] mx-auto w-full overflow-hidden">
        {/* Top Hanging Wooden Multiplier Sign */}
        <div className="w-full shrink-0">
          <HangingMultiplierSign
            currentMultiplier={currentMultiplier}
            isFreeSpins={isFreeSpins}
          />
        </div>

        {/* 6-Pointed Sheriff Star Badge Box Grid */}
        <div className="w-full shrink-0 flex items-center justify-center my-0.5">
          <WildBountyReels
            grid={grid}
            winningTileIds={winningTileIds}
            winAnimStage={winAnimStage}
            isSpinExiting={isSpinExiting}
            isTurbo={isTurbo}
            isCascading={isCascading}
            isFreeSpins={isFreeSpins}
            remainingFreeSpins={remainingFreeSpins}
            hasWildWin={hasWildWin}
            currentMultiplier={currentMultiplier}
          />
        </div>

        {/* Plakat Kemenangan Total / Status Message with overlaid ThreeWinCanvas during celebration */}
        <div className="w-full shrink-0 relative flex items-center justify-center">
          <HorseshoeMessageBanner
            message={statusMessage}
            isFreeSpins={isFreeSpins}
            remainingFreeSpins={remainingFreeSpins}
            currentWin={currentWin}
            currency={currency}
            language={language}
          />
          {winCelebration.active && (
            <ThreeWinCanvas
              active={winCelebration.active}
              tier={winCelebration.tier}
              amount={winCelebration.amount}
              currency={currency}
              onComplete={() => setWinCelebration((prev) => ({ ...prev, active: false }))}
            />
          )}
        </div>

        {/* Scatter Level Progression Bar */}
        <div className="w-full max-w-[520px] sm:max-w-[540px] mx-auto px-3 py-1 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-300 bg-[#160a04]/90 rounded-lg border border-[#3d200d] shrink-0">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-semibold text-stone-200">{t.level} {currentLevel}:</span>
            <span className="text-amber-200 truncate">{currentLevelConfig.title}</span>
          </div>
          <div className="font-mono font-bold text-amber-400">
            {scattersCollected} / {currentLevelConfig.reqScatters} {t.scatters} (3+ = 10 FS)
          </div>
        </div>

        {/* CONTROLS DOCK */}
        <div className="w-full shrink-0 pt-0.5">
          <WildBountyControls
            balance={balance}
            bet={bet}
            win={currentWin}
            currency={currency}
            language={language}
            isSpinning={isSpinning || isCascading}
            isTurbo={isTurbo}
            autoSpinsRemaining={autoSpinsRemaining}
            isFreeSpins={isFreeSpins}
            remainingFreeSpins={remainingFreeSpins}
            onToggleTurbo={() => setIsTurbo((t) => !t)}
            onDecreaseBet={handleDecreaseBet}
            onIncreaseBet={handleIncreaseBet}
            onSpin={handleSpin}
            onToggleAuto={() => {
              if (isFreeSpins) return;
              if (autoSpinsRemaining > 0) {
                setAutoSpinsRemaining(0);
              } else {
                setShowAutoSpinModal(true);
              }
            }}
            onOpenMenu={() => setShowMenu(true)}
          />
        </div>
      </main>

      {/* 4. FULL HAMBURGER MENU (Deposit, Withdraw, History Tx, Setting: Sound On/Off & Language EN/ID) */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="w-84 sm:w-92 bg-[#1c0e07] border-l-2 border-[#824c20] p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-3.5">
              {/* Menu Title Bar */}
              <div className="flex items-center justify-between border-b border-[#523015] pb-2.5">
                <span className="font-western text-lg text-gold-gradient">{t.menuTitle}</span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. DEPOSIT & WITHDRAW & HISTORY TX ACTIONS */}
              <div className="grid grid-cols-2 gap-2">
                {/* Deposit Button */}
                <button
                  onClick={() => {
                    setPaymentTab('DEPOSIT');
                    setShowPayment(true);
                    setShowMenu(false);
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#2a451e] via-[#1c3014] to-[#12200c] border-2 border-emerald-500/80 text-emerald-300 hover:border-emerald-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-lg group"
                >
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black tracking-wide uppercase">{t.deposit}</span>
                </button>

                {/* Withdraw Button */}
                <button
                  onClick={() => {
                    setPaymentTab('WITHDRAW');
                    setShowPayment(true);
                    setShowMenu(false);
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#4a2e12] via-[#2f1b0a] to-[#1a0e05] border-2 border-amber-500/80 text-amber-300 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-lg group"
                >
                  <ArrowUpRight className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black tracking-wide uppercase">{t.withdraw}</span>
                </button>
              </div>

              {/* History Tx Button (Full Width displaying Tx Withdraw dan Deposit) */}
              <button
                onClick={() => {
                  setPaymentTab('HISTORY');
                  setShowPayment(true);
                  setShowMenu(false);
                }}
                className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#6b3a16] text-amber-300 hover:border-amber-400 flex items-center justify-between px-3 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                    <History className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-100">{t.historyTx}</div>
                    <div className="text-[10px] text-stone-400">{t.historyDesc}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-amber-400 font-bold">
                  {transactions.length}
                </span>
              </button>

              {/* 2. SETTING SECTION (Sound On/Off Icon Button SVG & Language EN/ID) */}
              <div className="p-3 rounded-2xl bg-[#221208] border border-[#523015] space-y-2.5">
                <div className="text-[10.5px] font-bold text-amber-400 tracking-wider uppercase border-b border-[#3d200d] pb-1">
                  ⚙️ {t.settings}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Sound On/Off (SVG Icon Button) */}
                  <button
                    onClick={handleToggleMute}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isMuted
                        ? 'bg-stone-900/90 border-stone-700 text-stone-400'
                        : 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,197,66,0.3)]'
                    }`}
                    title={isMuted ? t.soundOff : t.soundOn}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-stone-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold">
                      {isMuted ? t.soundOff : t.soundOn}
                    </span>
                  </button>

                  {/* Language (EN / Bahasa Indonesia Toggle) */}
                  <button
                    onClick={() => {
                      const nextLang: Language = language === 'ID' ? 'EN' : 'ID';
                      setLanguage(nextLang);
                      sound.playBetChange();
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#2e170a] border border-[#7a421e] text-xs font-bold text-amber-200 hover:border-amber-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Switch Language / Ganti Bahasa"
                  >
                    <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>{language === 'ID' ? '🇮🇩 ID' : '🇺🇸 EN'}</span>
                  </button>
                </div>

                {/* Secondary Option: Saloon BGM Music Toggle & Currency */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleToggleMusic}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isMusicActive
                        ? 'bg-amber-600/30 border-yellow-400 text-yellow-300'
                        : 'bg-[#2a160c] border-[#5a3014] text-stone-400'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>{isMusicActive ? t.musicOn : t.musicOff}</span>
                  </button>

                  <button
                    onClick={() => setCurrency((c) => (c === 'IDR' ? 'USD' : 'IDR'))}
                    className="py-1.5 px-2 rounded-lg bg-[#2a160c] border border-[#5a3014] text-[11px] font-semibold text-amber-300 hover:border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{currency}</span>
                  </button>
                </div>
              </div>

              {/* Current Level & Scatter Progression Card */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 to-[#291408] border border-amber-600/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>{t.level} {currentLevel}: {currentLevelConfig.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    {scattersCollected}/{currentLevelConfig.reqScatters}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-amber-900">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (scattersCollected / currentLevelConfig.reqScatters) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[9.5px] text-stone-300">
                  {t.scatterHint}
                </div>
              </div>

              {/* Game Feature Modals */}
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowFairness(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#5a3215] text-stone-200 hover:border-amber-500 flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.provablyFair}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowLeaderboard(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#5a3215] text-stone-200 hover:border-amber-500 flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>{t.leaderboard}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowPaytable(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#5a3215] text-stone-200 hover:border-amber-500 flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>{t.paytable}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowSafeBonus(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#5a3215] text-stone-200 hover:border-amber-500 flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>{t.safeBonus}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowNativeSpecs(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2a160c] border border-[#5a3215] text-stone-200 hover:border-amber-500 flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>{t.specs}</span>
                </button>
              </div>
            </div>

            <div className="text-[10.5px] text-stone-400 text-center border-t border-[#523015] pt-2.5 mt-3">
              {t.footerText}
            </div>
          </div>
        </div>
      )}

      {/* Saloon Safe Vault Heist Bonus */}
      {showSafeBonus && (
        <SaloonSafeBonus
          currentBet={bet}
          currentLevel={currentLevel}
          onFinish={(winAmt) => {
            setBalance((prev) => prev + winAmt);
            setWinCelebration({ active: true, tier: 'MEGA_WIN', amount: winAmt });
          }}
          onClose={() => setShowSafeBonus(false)}
        />
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        currentBalance={balance}
        currency={currency}
        language={language}
        onDepositSuccess={handleDepositSuccess}
        onWithdrawSuccess={handleWithdrawSuccess}
        transactions={transactions}
        initialTab={paymentTab}
      />

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showFairness}
        onClose={() => setShowFairness(false)}
        serverSeedHash={serverSeedHash}
        clientSeed={clientSeed}
        nonce={nonce}
        lastRevealedServerSeed={lastRevealedServerSeed}
        onUpdateClientSeed={(newSeed) => setClientSeed(newSeed)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        entries={leaderboard}
        playerBestWin={4800}
        playerLevel={currentLevel}
      />

      {/* Paytable Modal */}
      <PaytableModal
        isOpen={showPaytable}
        onClose={() => setShowPaytable(false)}
        currentLevel={currentLevel}
      />

      {/* Native SDK Specs Modal */}
      <NativeEngineModal
        isOpen={showNativeSpecs}
        onClose={() => setShowNativeSpecs(false)}
      />

      {/* Auto Spin Selection Modal (10, 30, 50, 80, 800) */}
      <AutoSpinModal
        isOpen={showAutoSpinModal}
        onClose={() => setShowAutoSpinModal(false)}
        onSelectAutoSpins={handleSelectAutoSpins}
        language={language}
      />
    </div>
  );
}
