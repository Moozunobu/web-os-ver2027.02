import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Cpu, Users, User, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

export interface Opponent {
  id: string;
  name: string;
  grid: number[][];
  score: number;
  isGameOver: boolean;
  lastActive: number;
}

// --- Supabase Credentials ---
const SUPABASE_URL = 'https://nsyvlftqcciyetsbhymg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lkhrFuMlNyEmUX4RTFApKw_AhD1sAkV';

const getSRSKicks = (pieceId: number, fromRot: number, toRot: number): { dx: number; dy: number }[] => {
  if (pieceId === 4) { // O-piece
    return [{ dx: 0, dy: 0 }];
  }

  const key = `${fromRot}->${toRot}`;

  if (pieceId === 1) { // I-piece
    // SRS for I-piece
    switch (key) {
      case '0->1': return [{ dx: 0, dy: 0 }, { dx: -2, dy: 0 }, { dx: 1, dy: 0 }, { dx: -2, dy: 1 }, { dx: 1, dy: -2 }];
      case '1->0': return [{ dx: 0, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: 0 }, { dx: 2, dy: -1 }, { dx: -1, dy: 2 }];
      case '1->2': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: -2 }, { dx: 2, dy: 1 }];
      case '2->1': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 1, dy: 2 }, { dx: -2, dy: -1 }];
      case '2->3': return [{ dx: 0, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: 0 }, { dx: 2, dy: -1 }, { dx: -1, dy: 2 }];
      case '3->2': return [{ dx: 0, dy: 0 }, { dx: -2, dy: 0 }, { dx: 1, dy: 0 }, { dx: -2, dy: 1 }, { dx: 1, dy: -2 }];
      case '3->0': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 1, dy: 2 }, { dx: -2, dy: -1 }];
      case '0->3': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: 2, dy: 0 }, { dx: -1, dy: -2 }, { dx: 2, dy: 1 }];
      default: return [{ dx: 0, dy: 0 }];
    }
  }

  // J, L, S, T, Z pieces
  switch (key) {
    case '0->1': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: 0, dy: 2 }, { dx: -1, dy: 2 }];
    case '1->0': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 }];
    case '1->2': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 }];
    case '2->1': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: 0, dy: 2 }, { dx: -1, dy: 2 }];
    case '2->3': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: -1 }, { dx: 0, dy: 2 }, { dx: 1, dy: 2 }];
    case '3->2': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 }, { dx: 0, dy: -2 }, { dx: -1, dy: -2 }];
    case '3->0': return [{ dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 }, { dx: 0, dy: -2 }, { dx: -1, dy: -2 }];
    case '0->3': return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: -1 }, { dx: 0, dy: 2 }, { dx: 1, dy: 2 }];
    default: return [{ dx: 0, dy: 0 }];
  }
};

// Tetromino definitions (1-indexed for color mapping)
const SHAPES = [
  [], // Empty
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ], // I (Cyan)
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ], // J (Blue)
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ], // L (Orange)
  [
    [4, 4],
    [4, 4]
  ], // O (Yellow)
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ], // S (Green)
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ], // T (Purple)
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]  // Z (Red)
];

const COLORS = [
  'bg-transparent border-transparent', // 0
  'bg-cyan-500 border-cyan-400 shadow-cyan-500/50', // 1: I
  'bg-blue-600 border-blue-500 shadow-blue-600/50', // 2: J
  'bg-orange-500 border-orange-400 shadow-orange-500/50', // 3: L
  'bg-yellow-500 border-yellow-400 shadow-yellow-500/50', // 4: O
  'bg-green-500 border-green-400 shadow-green-500/50', // 5: S
  'bg-purple-600 border-purple-500 shadow-purple-600/50', // 6: T
  'bg-red-600 border-red-500 shadow-red-600/50', // 7: Z
  'bg-zinc-600 border-zinc-500 shadow-zinc-600/40 pattern-garbage' // 8: Garbage block
];

interface ActivePiece {
  shape: number[][];
  x: number;
  y: number;
  id: number;
  rotation: number;
}

export function TetrisApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState<'single' | 'ai' | 'online'>('single');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'normal' | 'hard' | 'grandmaster'>('normal');

  // Player state
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [holdPiece, setHoldPiece] = useState<number | null>(null);
  const [nextPieces, setNextPieces] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasHeld, setHasHeld] = useState(false);
  const [activeMessage, setActiveMessage] = useState<{ id: number; text: string; subtext?: string; color: string } | null>(null);

  // Combo tracking state
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);

  // Opponent state (for VS AI and Online modes)
  const [opponentGrid, setOpponentGrid] = useState<number[][]>(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [opponentIsGameOver, setOpponentIsGameOver] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'connected' | 'ended'>('idle');

  // Active piece reference/state
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);

  // Websocket client reference
  const wsRef = useRef<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // --- Online Multiplayer State (Supabase) ---
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [onlineIsCreator, setOnlineIsCreator] = useState<boolean>(false);
  const [onlinePlayerId, setOnlinePlayerId] = useState<'p1' | 'p2'>('p1');
  const [onlineStatusText, setOnlineStatusText] = useState<string>('');
  const [onlineErrorText, setOnlineErrorText] = useState<string>('');
  const [onlineSetupState, setOnlineSetupState] = useState<'menu' | 'setup' | 'room' | 'playing'>('menu');
  const supabaseRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // --- Up to 5 Players Multiplayer State ---
  const myPlayerId = useRef<string>('p_' + Math.random().toString(36).substr(2, 6));
  const myUsername = localStorage.getItem('wetalks_logged_in_user') || 'Player_' + Math.random().toString(36).substr(2, 4);
  const [opponents, setOpponents] = useState<Record<string, Opponent>>({});

  const getSupabaseClient = () => {
    if (supabaseRef.current) return supabaseRef.current;
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseRef.current = client;
      return client;
    } catch (err) {
      console.error('Supabase init failed:', err);
      return null;
    }
  };

  // References for game loop
  const gridRef = useRef<number[][]>(grid);
  const activePieceRef = useRef<ActivePiece | null>(null);
  const holdPieceRef = useRef<number | null>(null);
  const hasHeldRef = useRef<boolean>(false);
  const isGameOverRef = useRef<boolean>(false);
  const nextPiecesRef = useRef<number[]>([]);
  const garbageQueueRef = useRef<number>(0); // Lines of garbage waiting to be injected

  // Lock delay references
  const lockDelayTimeoutRef = useRef<any>(null);
  const firstTouchTimeRef = useRef<number | null>(null);
  const lastActionTimeRef = useRef<number | null>(null);
  const lastActionWasRotateRef = useRef<boolean>(false);

  // Sync references
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { activePieceRef.current = activePiece; }, [activePiece]);
  useEffect(() => { holdPieceRef.current = holdPiece; }, [holdPiece]);
  useEffect(() => { hasHeldRef.current = hasHeld; }, [hasHeld]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { nextPiecesRef.current = nextPieces; }, [nextPieces]);

  // Clean up lock delay timeout on unmount
  useEffect(() => {
    return () => {
      if (lockDelayTimeoutRef.current) {
        clearTimeout(lockDelayTimeoutRef.current);
      }
      if (channelRef.current && supabaseRef.current) {
        try {
          supabaseRef.current.removeChannel(channelRef.current);
        } catch (e) {}
      }
    };
  }, []);

  // Auto-clear T-spin / Special notification messages
  useEffect(() => {
    if (activeMessage) {
      const timer = setTimeout(() => {
        setActiveMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeMessage]);

  // Audio synthesizer for classic retro sound effects
  const playSound = useCallback((type: 'move' | 'rotate' | 'clear' | 'hold' | 'gameover' | 'level' | 'garbage') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'rotate') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'clear') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.16);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'hold') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'level') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'garbage') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context disabled
    }
  }, [soundEnabled]);

  // Check collision helper
  const checkCollision = useCallback((board: number[][], shape: number[][], px: number, py: number): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = px + c;
          const boardY = py + r;
          if (boardX < 0 || boardX >= 10 || boardY >= 20) {
            return true;
          }
          if (boardY >= 0 && board[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Generate random piece ID queue
  const generateNewQueue = useCallback(() => {
    const ids = [1, 2, 3, 4, 5, 6, 7];
    // Shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, []);

  // Spawn new piece
  const spawnPiece = useCallback((currentNextQueue: number[]) => {
    let queue = [...currentNextQueue];
    if (queue.length < 5) {
      queue = [...queue, ...generateNewQueue()];
    }
    const nextId = queue.shift()!;
    const nextShape = SHAPES[nextId];
    
    // Calculate initial centered X coordinate
    const startX = Math.floor((10 - nextShape[0].length) / 2);
    const startY = 0;

    const newPiece: ActivePiece = {
      shape: nextShape,
      x: startX,
      y: startY,
      id: nextId,
      rotation: 0
    };

    if (checkCollision(gridRef.current, nextShape, startX, startY)) {
      setIsGameOver(true);
      playSound('gameover');
      if (gameMode === 'online' && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'tetris_gameover',
          payload: { playerId: myPlayerId.current }
        });
      }
    } else {
      // Reset lock delay refs for the new piece
      if (lockDelayTimeoutRef.current) {
        clearTimeout(lockDelayTimeoutRef.current);
        lockDelayTimeoutRef.current = null;
      }
      firstTouchTimeRef.current = null;
      lastActionTimeRef.current = null;
      lastActionWasRotateRef.current = false;

      setActivePiece(newPiece);
      activePieceRef.current = newPiece;
      setNextPieces(queue);
      setHasHeld(false);
    }
  }, [generateNewQueue, checkCollision, playSound, gameMode, roomId]);

  // Inject pending garbage lines
  const injectGarbageLines = useCallback(() => {
    const linesToInject = garbageQueueRef.current;
    if (linesToInject <= 0) return;
    
    setGrid((prevGrid) => {
      let nextGrid = prevGrid.map((row) => [...row]);
      // Remove top rows to accommodate the new garbage lines
      nextGrid.splice(0, linesToInject);

      // Create garbage lines
      const holeCol = Math.floor(Math.random() * 10);
      for (let i = 0; i < linesToInject; i++) {
        const garbageRow = Array(10).fill(8); // 8 is garbage block
        garbageRow[holeCol] = 0; // Empty slot for the hole
        nextGrid.push(garbageRow);
      }

      garbageQueueRef.current = 0;
      playSound('garbage');
      return nextGrid;
    });
  }, [playSound]);

  // Rotate piece matrix counter-clockwise
  const rotateMatrix = (matrix: number[][]): number[][] => {
    const r = matrix.length;
    const c = matrix[0].length;
    const rotated = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        rotated[j][r - 1 - i] = matrix[i][j];
      }
    }
    return rotated;
  };

  const rotateMatrixCCW = (matrix: number[][]): number[][] => {
    const r = matrix.length;
    const c = matrix[0].length;
    const rotated = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        rotated[c - 1 - j][i] = matrix[i][j];
      }
    }
    return rotated;
  };

  // Helper to find the center of a T-piece shape
  const findTCenter = (shape: number[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 6) {
          let count = 0;
          if (r > 0 && shape[r - 1][c] === 6) count++;
          if (r < shape.length - 1 && shape[r + 1][c] === 6) count++;
          if (c > 0 && shape[r][c - 1] === 6) count++;
          if (c < shape[r].length - 1 && shape[r][c + 1] === 6) count++;
          if (count === 3) {
            return { r, c };
          }
        }
      }
    }
    return null;
  };

  // Helper to check if a corner cell around T-piece is occupied (by wall, floor, or grid block)
  const isCornerOccupied = (board: number[][], x: number, y: number): boolean => {
    if (x < 0 || x >= 10 || y >= 20) {
      return true; // Wall or floor is occupied
    }
    if (y < 0) {
      return false; // Ceiling / above playfield is empty
    }
    return board[y][x] !== 0;
  };

  // Lock active piece onto grid, check for line clears, and update stats
  const lockPiece = useCallback((piece: ActivePiece) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => [...row]);
      
      // Place piece
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c] !== 0) {
            const boardY = piece.y + r;
            const boardX = piece.x + c;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              nextGrid[boardY][boardX] = piece.id;
            }
          }
        }
      }

      // T-spin detection
      let isTSpin = false;
      let isMini = false;
      if (piece.id === 6 && lastActionWasRotateRef.current) {
        const cy = piece.y + 1;
        const cx = piece.x + 1;

        let occupiedCorners = 0;
        if (isCornerOccupied(nextGrid, cx - 1, cy - 1)) occupiedCorners++; // Top-Left
        if (isCornerOccupied(nextGrid, cx + 1, cy - 1)) occupiedCorners++; // Top-Right
        if (isCornerOccupied(nextGrid, cx - 1, cy + 1)) occupiedCorners++; // Bottom-Left
        if (isCornerOccupied(nextGrid, cx + 1, cy + 1)) occupiedCorners++; // Bottom-Right

        if (occupiedCorners >= 3) {
          isTSpin = true;
          
          // Check if it's a T-Spin Mini based on standard front-corner rule:
          // The pointing tip of T-piece (rotation 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT)
          // must have BOTH front corners occupied to be a full T-Spin. Otherwise it's Mini.
          let frontCorners = 0;
          if (piece.rotation === 0) { // pointing UP
            if (isCornerOccupied(nextGrid, cx - 1, cy - 1)) frontCorners++;
            if (isCornerOccupied(nextGrid, cx + 1, cy - 1)) frontCorners++;
          } else if (piece.rotation === 1) { // pointing RIGHT
            if (isCornerOccupied(nextGrid, cx + 1, cy - 1)) frontCorners++;
            if (isCornerOccupied(nextGrid, cx + 1, cy + 1)) frontCorners++;
          } else if (piece.rotation === 2) { // pointing DOWN
            if (isCornerOccupied(nextGrid, cx - 1, cy + 1)) frontCorners++;
            if (isCornerOccupied(nextGrid, cx + 1, cy + 1)) frontCorners++;
          } else if (piece.rotation === 3) { // pointing LEFT
            if (isCornerOccupied(nextGrid, cx - 1, cy - 1)) frontCorners++;
            if (isCornerOccupied(nextGrid, cx - 1, cy + 1)) frontCorners++;
          }
          isMini = frontCorners < 2;
        }
      }

      // Detect fully cleared rows
      let linesCleared = 0;
      const filteredGrid = nextGrid.filter((row) => {
        const isFull = row.every((cell) => cell !== 0);
        if (isFull) linesCleared++;
        return !isFull;
      });

      // Refill top with empty rows
      while (filteredGrid.length < 20) {
        filteredGrid.unshift(Array(10).fill(0));
      }

      // Combo evaluation
      let nextCombo = comboRef.current;
      if (linesCleared > 0) {
        nextCombo++;
      } else {
        nextCombo = 0;
      }
      comboRef.current = nextCombo;
      setCombo(nextCombo);

      // Score and special message determination
      let gain = 0;
      let messageText = '';
      let messageColor = '';

      if (isTSpin) {
        if (isMini) {
          if (linesCleared === 0) {
            gain = 100 * level;
            messageText = 'T-SPIN MINI!';
            messageColor = 'text-fuchsia-400 bg-fuchsia-950/60 border border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/20';
          } else if (linesCleared === 1) {
            gain = 200 * level;
            messageText = 'T-SPIN MINI SINGLE!';
            messageColor = 'text-fuchsia-400 bg-fuchsia-950/60 border border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/20';
          } else if (linesCleared === 2) {
            gain = 400 * level;
            messageText = 'T-SPIN MINI DOUBLE!';
            messageColor = 'text-fuchsia-400 bg-fuchsia-950/60 border border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/20';
          }
        } else {
          if (linesCleared === 0) {
            gain = 400 * level;
            messageText = 'T-SPIN!';
            messageColor = 'text-purple-400 bg-purple-950/60 border border-purple-500/40 shadow-lg shadow-purple-500/20';
          } else if (linesCleared === 1) {
            gain = 800 * level;
            messageText = 'T-SPIN SINGLE!';
            messageColor = 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 shadow-lg shadow-cyan-500/20';
          } else if (linesCleared === 2) {
            gain = 1200 * level;
            messageText = 'T-SPIN DOUBLE!';
            messageColor = 'text-amber-400 bg-amber-950/60 border border-amber-500/40 shadow-lg shadow-amber-500/20';
          } else if (linesCleared >= 3) {
            gain = 1600 * level;
            messageText = 'T-SPIN TRIPLE!';
            messageColor = 'text-red-400 bg-red-950/60 border border-red-500/40 shadow-lg shadow-red-500/20';
          }
        }
      } else {
        if (linesCleared === 4) {
          gain = 800 * level;
          messageText = 'TETRIS!';
          messageColor = 'text-pink-400 bg-pink-950/60 border border-pink-500/40 shadow-lg shadow-pink-500/20';
        } else if (linesCleared > 0) {
          const blocksInRow = 10;
          const totalBlocksCleared = linesCleared * blocksInRow;
          const scorePerBlock = 10; // 10 points per block, so 100 points per row
          gain = totalBlocksCleared * scorePerBlock * level;
        }
      }

      // Add combo score bonus
      let comboBonus = 0;
      if (linesCleared > 0 && nextCombo > 1) {
        comboBonus = 50 * (nextCombo - 1) * level;
        gain += comboBonus;
      }

      if (gain > 0) {
        setScore((prev) => prev + gain);
      }

      if (linesCleared > 0) {
        playSound('clear');
        setLines((prev) => {
          const nextLines = prev + linesCleared;
          const targetLevel = Math.floor(nextLines / 10) + 1;
          if (targetLevel > level) {
            setLevel(targetLevel);
            playSound('level');
          }
          return nextLines;
        });
      }

      if (messageText !== '') {
        let subText = `+${gain} PTS`;
        if (nextCombo > 1) {
          subText = `${nextCombo - 1} COMBO! ` + subText;
        }
        setActiveMessage({
          id: Date.now(),
          text: messageText,
          subtext: subText,
          color: messageColor,
        });
      } else if (linesCleared > 0 && nextCombo > 1) {
        setActiveMessage({
          id: Date.now(),
          text: `${nextCombo - 1} COMBO!`,
          subtext: `+${gain} PTS`,
          color: 'text-zinc-200 bg-zinc-900/80 border border-zinc-700/50 shadow-md shadow-black/40',
        });
      }

      // Garbage transmission rules based on standard competitive Tetris:
      let garbageToSend = 0;
      if (isTSpin) {
        if (isMini) {
          if (linesCleared === 1) garbageToSend = 1;
          else if (linesCleared === 2) garbageToSend = 2;
        } else {
          if (linesCleared === 1) garbageToSend = 2;
          else if (linesCleared === 2) garbageToSend = 4;
          else if (linesCleared >= 3) garbageToSend = 6;
        }
      } else {
        if (linesCleared === 2) garbageToSend = 1;
        else if (linesCleared === 3) garbageToSend = 2;
        else if (linesCleared === 4) garbageToSend = 4;
      }

      // Add combo-based attack power (combos consecutively increase lines sent!)
      let comboGarbage = 0;
      if (linesCleared > 0 && nextCombo > 1) {
        comboGarbage = Math.min(5, Math.floor(nextCombo / 2));
      }

      const totalGarbage = garbageToSend + comboGarbage;

      if (totalGarbage > 0) {
        if (gameMode === 'ai') {
          triggerAIGarbage(totalGarbage);
        } else if (gameMode === 'online' && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'tetris_send_garbage',
            payload: { lines: totalGarbage }
          });
        }
      }

      // Sync updated state to online opponent
      if (gameMode === 'online' && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'tetris_sync_grid',
          payload: {
            playerId: myPlayerId.current,
            username: myUsername,
            grid: filteredGrid,
            score: score + gain,
            isGameOver: isGameOverRef.current
          }
        });
      }

      return filteredGrid;
    });

    // Handle any incoming garbage lines and spawn next piece
    setTimeout(() => {
      injectGarbageLines();
      spawnPiece(nextPiecesRef.current);
    }, 0);
  }, [level, playSound, spawnPiece, gameMode, roomId, injectGarbageLines, score]);

  // Update lock delay timeout and evaluation
  const updateLockDelay = useCallback((piece: ActivePiece) => {
    const isTouchingGround = checkCollision(gridRef.current, piece.shape, piece.x, piece.y + 1);
    
    // Clear any existing timeout
    if (lockDelayTimeoutRef.current) {
      clearTimeout(lockDelayTimeoutRef.current);
      lockDelayTimeoutRef.current = null;
    }

    if (!isTouchingGround) {
      // Not touching ground, reset times
      firstTouchTimeRef.current = null;
      lastActionTimeRef.current = null;
      return;
    }

    // Touching ground!
    const now = Date.now();
    if (firstTouchTimeRef.current === null) {
      firstTouchTimeRef.current = now;
    }
    if (lastActionTimeRef.current === null) {
      lastActionTimeRef.current = now;
    }

    const elapsedFromFirstTouch = now - firstTouchTimeRef.current;
    
    // Calculate how much time remains until the 1.5s limit
    const timeUntilMaxCeiling = Math.max(0, 1500 - elapsedFromFirstTouch);
    
    // Calculate how much time remains until the 0.5s (500ms) action limit
    const elapsedFromLastAction = now - lastActionTimeRef.current;
    const timeUntilActionTimeout = Math.max(0, 500 - elapsedFromLastAction);

    // Target remaining delay is the minimum of both
    const remainingDelay = Math.min(timeUntilMaxCeiling, timeUntilActionTimeout);

    if (remainingDelay <= 0) {
      // Lock immediately
      lockPiece(piece);
      firstTouchTimeRef.current = null;
      lastActionTimeRef.current = null;
    } else {
      // Schedule lock
      lockDelayTimeoutRef.current = setTimeout(() => {
        // Double check if it's still the same piece and still touching
        const current = activePieceRef.current;
        if (current && current.id === piece.id) {
          const stillTouching = checkCollision(gridRef.current, current.shape, current.x, current.y + 1);
          if (stillTouching) {
            lockPiece(current);
            firstTouchTimeRef.current = null;
            lastActionTimeRef.current = null;
          }
        }
      }, remainingDelay);
    }
  }, [checkCollision, lockPiece]);

  // Handle active piece state updates smoothly
  const updateActivePieceState = useCallback((nextPiece: ActivePiece, isAction: boolean) => {
    const current = activePieceRef.current;
    const hasChanged = !current ||
      nextPiece.x !== current.x ||
      nextPiece.y !== current.y ||
      nextPiece.shape !== current.shape ||
      nextPiece.rotation !== current.rotation;

    setActivePiece(nextPiece);
    activePieceRef.current = nextPiece; // Synchronous ref update

    if (hasChanged && isAction) {
      lastActionTimeRef.current = Date.now();
    }

    updateLockDelay(nextPiece);
  }, [updateLockDelay]);

  const handleRotate = useCallback((direction: 'cw' | 'ccw' = 'cw') => {
    if (!activePieceRef.current || isGameOverRef.current) return;
    const current = activePieceRef.current;
    const rotated = direction === 'cw' ? rotateMatrix(current.shape) : rotateMatrixCCW(current.shape);
    
    const currentRotation = current.rotation || 0;
    const nextRotation = direction === 'cw' 
      ? (currentRotation + 1) % 4 
      : (currentRotation + 3) % 4;

    const kickPossibilities = getSRSKicks(current.id, currentRotation, nextRotation);
    for (const kick of kickPossibilities) {
      if (!checkCollision(gridRef.current, rotated, current.x + kick.dx, current.y + kick.dy)) {
        updateActivePieceState({ 
          ...current, 
          shape: rotated, 
          x: current.x + kick.dx, 
          y: current.y + kick.dy,
          rotation: nextRotation
        }, true);
        lastActionWasRotateRef.current = true;
        playSound('rotate');
        return;
      }
    }
  }, [checkCollision, playSound, updateActivePieceState]);

  const handleMoveX = useCallback((dir: number) => {
    if (!activePieceRef.current || isGameOverRef.current) return;
    const current = activePieceRef.current;
    if (!checkCollision(gridRef.current, current.shape, current.x + dir, current.y)) {
      updateActivePieceState({ ...current, x: current.x + dir }, true);
      lastActionWasRotateRef.current = false;
      playSound('move');
    }
  }, [checkCollision, playSound, updateActivePieceState]);

  const handleSoftDrop = useCallback(() => {
    if (!activePieceRef.current || isGameOverRef.current) return;
    const current = activePieceRef.current;
    if (!checkCollision(gridRef.current, current.shape, current.x, current.y + 1)) {
      updateActivePieceState({ ...current, y: current.y + 1 }, false);
      // Soft drop is a vertical move, do not reset lastActionWasRotateRef so T-spins can be registered on lock
    } else {
      updateActivePieceState(current, false);
    }
  }, [checkCollision, updateActivePieceState]);

  // Hard drop instantly slides the active piece down to the bottom
  const handleHardDrop = useCallback(() => {
    if (!activePieceRef.current || isGameOverRef.current) return;
    const current = activePieceRef.current;
    let dropY = current.y;
    while (!checkCollision(gridRef.current, current.shape, current.x, dropY + 1)) {
      dropY++;
    }
    
    // Clear lock delay references on hard drop
    if (lockDelayTimeoutRef.current) {
      clearTimeout(lockDelayTimeoutRef.current);
      lockDelayTimeoutRef.current = null;
    }
    firstTouchTimeRef.current = null;
    lastActionTimeRef.current = null;
    // Hard drop is a vertical move, do not reset lastActionWasRotateRef so T-spins can be registered on lock

    const finalPiece = { ...current, y: dropY };
    setActivePiece(finalPiece);
    activePieceRef.current = finalPiece; // Synchronous ref update
    playSound('move');
    lockPiece(finalPiece);
  }, [checkCollision, lockPiece, playSound]);

  // Hold active piece (swap or store)
  const handleHold = useCallback(() => {
    if (!activePieceRef.current || isGameOverRef.current || hasHeldRef.current) return;
    playSound('hold');

    // Clear lock delay references
    if (lockDelayTimeoutRef.current) {
      clearTimeout(lockDelayTimeoutRef.current);
      lockDelayTimeoutRef.current = null;
    }
    firstTouchTimeRef.current = null;
    lastActionTimeRef.current = null;
    lastActionWasRotateRef.current = false;

    const currentId = activePieceRef.current.id;
    const currentHold = holdPieceRef.current;

    setHoldPiece(currentId);
    setHasHeld(true);

    if (currentHold === null) {
      // Spawn new piece since there is no piece stored
      spawnPiece(nextPiecesRef.current);
    } else {
      // Recall piece from hold
      const retrievedShape = SHAPES[currentHold];
      const startX = Math.floor((10 - retrievedShape[0].length) / 2);
      const retrievedPiece: ActivePiece = {
        shape: retrievedShape,
        x: startX,
        y: 0,
        id: currentHold,
        rotation: 0
      };
      setActivePiece(retrievedPiece);
      activePieceRef.current = retrievedPiece; // Synchronous ref update
      updateLockDelay(retrievedPiece);
    }
  }, [spawnPiece, playSound, updateLockDelay]);

  // Calculate the projection / ghost landing point
  const getGhostY = (): number => {
    if (!activePiece) return 0;
    let ghostY = activePiece.y;
    while (!checkCollision(grid, activePiece.shape, activePiece.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  };

  // Keyboard controls handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      
      let handled = false;

      // Robust check for Spacebar (Standard space, code, full-width Japanese IME space, or old Spacebar)
      if (e.code === 'Space' || e.key === ' ' || e.key === '　' || e.key === 'Spacebar') {
        e.preventDefault();
        
        // Blur any active element (like buttons) so pressing Space doesn't trigger button click
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        
        handleHardDrop();
        handled = true;
      } else {
        const keyMap: Record<string, () => void> = {
          ArrowLeft: () => handleMoveX(-1),
          ArrowRight: () => handleMoveX(1),
          ArrowUp: () => handleRotate('cw'),
          ArrowDown: () => handleSoftDrop(),
          c: () => handleHold(),
          C: () => handleHold(),
          z: () => handleRotate('ccw'),
          Z: () => handleRotate('ccw'),
        };

        const codeMap: Record<string, () => void> = {
          ArrowLeft: () => handleMoveX(-1),
          ArrowRight: () => handleMoveX(1),
          ArrowUp: () => handleRotate('cw'),
          ArrowDown: () => handleSoftDrop(),
          KeyC: () => handleHold(),
          KeyZ: () => handleRotate('ccw'),
        };

        if (keyMap[e.key]) {
          e.preventDefault();
          keyMap[e.key]();
          handled = true;
        } else if (codeMap[e.code]) {
          e.preventDefault();
          codeMap[e.code]();
          handled = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleMoveX, handleRotate, handleSoftDrop, handleHardDrop, handleHold]);

  // Automatic falling tick based on current level speed
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    // Speeds up as the level advances
    const intervalMs = Math.max(50, 1000 - (level - 1) * 90);
    const tick = setInterval(() => {
      handleSoftDrop();
    }, intervalMs);

    return () => clearInterval(tick);
  }, [isPlaying, isGameOver, level, handleSoftDrop]);


  // ==========================================
  // LOCAL AI SIMULATED OPPONENT LOGIC
  // ==========================================
  const aiTickRef = useRef<NodeJS.Timeout | null>(null);
  const aiGridRef = useRef<number[][]>(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
  const aiScoreRef = useRef(0);
  const aiActiveRef = useRef<{ id: number; shape: number[][]; x: number; y: number } | null>(null);

  // Evaluates placement fitness scoring
  const evaluateAIPosition = (board: number[][], shape: number[][], targetX: number): { score: number; dropY: number } => {
    let dropY = 0;
    // Check if valid start
    if (checkCollision(board, shape, targetX, 0)) {
      return { score: -999999, dropY: 0 };
    }

    // Find dropped Y position
    while (!checkCollision(board, shape, targetX, dropY + 1)) {
      dropY++;
    }

    // Clone grid
    const tempGrid = board.map(r => [...r]);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = dropY + r;
          const boardX = targetX + c;
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            tempGrid[boardY][boardX] = 1;
          }
        }
      }
    }

    // Heuristics calculations
    const heights = Array(10).fill(0);
    for (let c = 0; c < 10; c++) {
      for (let r = 0; r < 20; r++) {
        if (tempGrid[r][c] !== 0) {
          heights[c] = 20 - r;
          break;
        }
      }
    }

    const aggregateHeight = heights.reduce((sum, h) => sum + h, 0);
    
    // Count holes
    let holes = 0;
    for (let c = 0; c < 10; c++) {
      let blockFound = false;
      for (let r = 0; r < 20; r++) {
        if (tempGrid[r][c] !== 0) blockFound = true;
        else if (blockFound && tempGrid[r][c] === 0) holes++;
      }
    }

    // Count line clears
    let linesCleared = 0;
    for (let r = 0; r < 20; r++) {
      if (tempGrid[r].every(cell => cell !== 0)) linesCleared++;
    }

    // Bumpiness
    let bumpiness = 0;
    for (let c = 0; c < 9; c++) {
      bumpiness += Math.abs(heights[c] - heights[c + 1]);
    }

    // AI weight coefficient score based on difficulty
    let heuristicScore = 0;
    if (aiDifficulty === 'easy') {
      const noise = (Math.random() - 0.5) * 8.0;
      heuristicScore = -0.51 * aggregateHeight + 0.76 * linesCleared - 0.36 * holes - 0.18 * bumpiness + noise;
    } else if (aiDifficulty === 'normal') {
      heuristicScore = -0.51 * aggregateHeight + 0.76 * linesCleared - 0.36 * holes - 0.18 * bumpiness;
    } else if (aiDifficulty === 'hard') {
      heuristicScore = -0.65 * aggregateHeight + 1.2 * linesCleared - 0.6 * holes - 0.22 * bumpiness;
    } else { // grandmaster
      heuristicScore = -0.75 * aggregateHeight + 2.5 * linesCleared - 1.8 * holes - 0.45 * bumpiness;
    }

    return { score: heuristicScore, dropY };
  };

  // Triggers sending garbage rows to AI
  const triggerAIGarbage = (linesCount: number) => {
    let nextAIGrid = aiGridRef.current.map(r => [...r]);
    nextAIGrid.splice(0, linesCount);
    
    const holeCol = Math.floor(Math.random() * 10);
    for (let i = 0; i < linesCount; i++) {
      const garbageRow = Array(10).fill(8);
      garbageRow[holeCol] = 0;
      nextAIGrid.push(garbageRow);
    }
    aiGridRef.current = nextAIGrid;
    setOpponentGrid(nextAIGrid);
  };

  // Triggers garbage injection to local Player
  const sendGarbageToPlayer = (linesCount: number) => {
    garbageQueueRef.current += linesCount;
  };

  // AI Game Cycle Ticker
  const runAIGameLoop = useCallback(() => {
    if (!isPlaying || isGameOver || gameMode !== 'ai') return;

    // If AI has no active piece, spawn one
    if (!aiActiveRef.current) {
      const nextId = Math.floor(Math.random() * 7) + 1;
      const nextShape = SHAPES[nextId];
      const startX = Math.floor((10 - nextShape[0].length) / 2);
      
      if (checkCollision(aiGridRef.current, nextShape, startX, 0)) {
        setOpponentIsGameOver(true);
        return;
      }

      aiActiveRef.current = { id: nextId, shape: nextShape, x: startX, y: 0 };
    }

    const currentPiece = aiActiveRef.current!;
    
    // Evaluate optimal rotation and column offset
    let bestScore = -Infinity;
    let optimalX = currentPiece.x;
    let optimalShape = currentPiece.shape;

    // Test 4 rotations
    let rotatedShape = currentPiece.shape;
    for (let rot = 0; rot < 4; rot++) {
      for (let x = -2; x < 10; x++) {
        // Must fit boundaries
        if (x >= 0 && x + rotatedShape[0].length <= 10) {
          const evalResult = evaluateAIPosition(aiGridRef.current, rotatedShape, x);
          if (evalResult.score > bestScore) {
            bestScore = evalResult.score;
            optimalX = x;
            optimalShape = rotatedShape;
          }
        }
      }
      rotatedShape = rotateMatrix(rotatedShape);
    }

    // Step AI block towards optimal target
    let activeX = currentPiece.x;
    if (aiDifficulty === 'grandmaster') {
      activeX = optimalX; // Teleport instantly to target column
    } else {
      if (activeX < optimalX) activeX++;
      else if (activeX > optimalX) activeX--;
    }

    // Update active state
    aiActiveRef.current = {
      ...currentPiece,
      x: activeX,
      shape: optimalShape,
    };

    // If target horizontal position is reached, drop instantly
    if (activeX === optimalX) {
      let finalY = 0;
      while (!checkCollision(aiGridRef.current, optimalShape, optimalX, finalY + 1)) {
        finalY++;
      }

      // Lock block to AI grid
      const nextAIGrid = aiGridRef.current.map(r => [...r]);
      for (let r = 0; r < optimalShape.length; r++) {
        for (let c = 0; c < optimalShape[r].length; c++) {
          if (optimalShape[r][c] !== 0) {
            const by = finalY + r;
            const bx = optimalX + c;
            if (by >= 0 && by < 20 && bx >= 0 && bx < 10) {
              nextAIGrid[by][bx] = currentPiece.id;
            }
          }
        }
      }

      // Handle line clears on AI
      let cleared = 0;
      const filteredGrid = nextAIGrid.filter(row => {
        const full = row.every(cell => cell !== 0);
        if (full) cleared++;
        return !full;
      });

      while (filteredGrid.length < 20) {
        filteredGrid.unshift(Array(10).fill(0));
      }

      aiGridRef.current = filteredGrid;
      setOpponentGrid(filteredGrid);
      
      if (cleared > 0) {
        const blocksInRow = 10;
        const totalBlocksCleared = cleared * blocksInRow;
        const scorePerBlock = 10; // 10 points per block, same as player
        aiScoreRef.current += totalBlocksCleared * scorePerBlock * level;
        setOpponentScore(aiScoreRef.current);
        // Send garbage to the player
        sendGarbageToPlayer(cleared);
      }

      aiActiveRef.current = null; // Spawns new piece in next tick
    }

    // Dynamic AI speed based on difficulty level
    let delay = 450;
    if (aiDifficulty === 'easy') delay = 500;
    else if (aiDifficulty === 'normal') delay = 350;
    else if (aiDifficulty === 'hard') delay = 180;
    else if (aiDifficulty === 'grandmaster') delay = 100;

    aiTickRef.current = setTimeout(runAIGameLoop, delay);
  }, [isPlaying, isGameOver, gameMode, level, checkCollision, aiDifficulty]);

  useEffect(() => {
    if (gameMode === 'ai' && isPlaying && !isGameOver) {
      const names = {
        easy: 'AI Core Lite (Easy)',
        normal: 'AI Core Beta (Normal)',
        hard: 'AI Core Expert (Hard)',
        grandmaster: 'AI Grandmaster 🔥'
      };
      setOpponentName(names[aiDifficulty]);
      aiGridRef.current = Array.from({ length: 20 }, () => Array(10).fill(0));
      aiScoreRef.current = 0;
      aiActiveRef.current = null;
      setOpponentGrid(aiGridRef.current);
      setOpponentScore(0);
      setOpponentIsGameOver(false);
      
      let initialDelay = 450;
      if (aiDifficulty === 'easy') initialDelay = 500;
      else if (aiDifficulty === 'normal') initialDelay = 350;
      else if (aiDifficulty === 'hard') initialDelay = 180;
      else if (aiDifficulty === 'grandmaster') initialDelay = 100;

      aiTickRef.current = setTimeout(runAIGameLoop, initialDelay);
    }
    return () => {
      if (aiTickRef.current) {
        clearTimeout(aiTickRef.current);
      }
    };
  }, [gameMode, isPlaying, isGameOver, runAIGameLoop, aiDifficulty]);


  // ==========================================
  // REAL-TIME SUPABASE MULTIPLAYER ROOMS
  // ==========================================

  // --- Create/Join Online Room Helper ---
  const connectToRoom = async (code: string, isCreator: boolean) => {
    playSound('move');
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      setOnlineErrorText('部屋コードを入力してください。');
      return;
    }
    setOnlineErrorText('');
    setOnlineStatusText('接続中...');

    const client = getSupabaseClient();
    if (!client) {
      setOnlineErrorText('Supabaseへの接続に失敗しました。');
      return;
    }

    // Clean up any existing channel
    if (channelRef.current && supabaseRef.current) {
      try {
        supabaseRef.current.removeChannel(channelRef.current);
      } catch (e) {}
      channelRef.current = null;
    }

    try {
      setOnlineIsCreator(isCreator);
      setOpponents({}); // Clear previous opponents

      const channel = client.channel(`tetris-room-${cleanCode}`, {
        config: { broadcast: { self: false } },
      });

      channelRef.current = channel;

      const sessionUser = localStorage.getItem('wetalks_logged_in_user') || 'Player_' + Math.random().toString(36).substr(2, 4);

      channel
        .on('broadcast', { event: 'tetris_join' }, (payload: any) => {
          playSound('level');
          const newPlayerId = payload.payload.playerId;
          const newPlayerName = payload.payload.username;

          setOpponents(prev => {
            if (Object.keys(prev).length >= 4 && !prev[newPlayerId]) {
              return prev; // limit to 4 opponents (5 players total)
            }
            const next = { ...prev };
            next[newPlayerId] = {
              id: newPlayerId,
              name: newPlayerName,
              grid: Array.from({ length: 20 }, () => Array(10).fill(0)),
              score: 0,
              isGameOver: false,
              lastActive: Date.now()
            };
            return next;
          });

          // Reply with our own presence
          channel.send({
            type: 'broadcast',
            event: 'tetris_presence_reply',
            payload: {
              playerId: myPlayerId.current,
              username: sessionUser,
            },
          });
        })
        .on('broadcast', { event: 'tetris_presence_reply' }, (payload: any) => {
          const remotePlayerId = payload.payload.playerId;
          const remotePlayerName = payload.payload.username;

          setOpponents(prev => {
            if (Object.keys(prev).length >= 4 && !prev[remotePlayerId]) {
              return prev;
            }
            const next = { ...prev };
            next[remotePlayerId] = {
              id: remotePlayerId,
              name: remotePlayerName,
              grid: payload.payload.grid || prev[remotePlayerId]?.grid || Array.from({ length: 20 }, () => Array(10).fill(0)),
              score: payload.payload.score || prev[remotePlayerId]?.score || 0,
              isGameOver: payload.payload.isGameOver || prev[remotePlayerId]?.isGameOver || false,
              lastActive: Date.now()
            };
            return next;
          });
        })
        .on('broadcast', { event: 'tetris_start_match' }, () => {
          playSound('level');
          setMatchStatus('connected');
          setOnlineSetupState('playing');
          setIsPlaying(true);
          resetPlayerGame();
        })
        .on('broadcast', { event: 'tetris_sync_grid' }, (payload: any) => {
          const remoteId = payload.payload.playerId;
          setOpponents(prev => {
            const next = { ...prev };
            if (next[remoteId]) {
              next[remoteId] = {
                ...next[remoteId],
                grid: payload.payload.grid,
                score: payload.payload.score,
                isGameOver: payload.payload.isGameOver ?? next[remoteId].isGameOver,
                lastActive: Date.now()
              };
            } else if (Object.keys(prev).length < 4) {
              next[remoteId] = {
                id: remoteId,
                name: payload.payload.username || 'Opponent',
                grid: payload.payload.grid,
                score: payload.payload.score,
                isGameOver: payload.payload.isGameOver || false,
                lastActive: Date.now()
              };
            }
            return next;
          });
        })
        .on('broadcast', { event: 'tetris_send_garbage' }, (payload: any) => {
          // Add garbage to our grid if we are playing and not gameover
          if (!isGameOverRef.current) {
            garbageQueueRef.current += payload.payload.lines;
            playSound('garbage');
          }
        })
        .on('broadcast', { event: 'tetris_gameover' }, (payload: any) => {
          const remoteId = payload.payload.playerId;
          setOpponents(prev => {
            const next = { ...prev };
            if (next[remoteId]) {
              next[remoteId] = {
                ...next[remoteId],
                isGameOver: true
              };
            }
            return next;
          });
        })
        .on('broadcast', { event: 'tetris_leave' }, (payload: any) => {
          const remoteId = payload.payload.playerId;
          setOpponents(prev => {
            const next = { ...prev };
            delete next[remoteId];
            return next;
          });
        });

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          // Broadcast our join event
          channel.send({
            type: 'broadcast',
            event: 'tetris_join',
            payload: {
              playerId: myPlayerId.current,
              username: sessionUser,
            },
          });
          setOnlineSetupState('room');
          setOnlineStatusText(`部屋 [${cleanCode.toUpperCase()}] に接続しました。メンバーを待っています...`);
        } else {
          setOnlineErrorText('接続に失敗しました。');
        }
      });
    } catch (e: any) {
      setOnlineErrorText(e.message || 'エラーが発生しました。');
    }
  };

  // --- Create Online Room ---
  const handleCreateOnlineRoom = async () => {
    await connectToRoom(onlineRoomCode, true);
  };

  // --- Join Online Room ---
  const handleJoinOnlineRoom = async () => {
    await connectToRoom(onlineRoomCode, false);
  };

  const handleStartMultiplayerMatch = () => {
    playSound('level');
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'tetris_start_match',
        payload: {}
      });
    }
    setMatchStatus('connected');
    setOnlineSetupState('playing');
    setIsPlaying(true);
    resetPlayerGame();
  };

  // --- Leave Online Room ---
  const handleLeaveOnlineRoom = () => {
    playSound('move');
    if (channelRef.current && supabaseRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'tetris_leave',
          payload: { playerId: myPlayerId.current },
        });
        supabaseRef.current.removeChannel(channelRef.current);
      } catch (e) {}
    }
    channelRef.current = null;
    setOnlineSetupState('menu');
    setGameMode('single');
    setIsPlaying(false);
    setIsGameOver(false);
    setMatchStatus('idle');
    setOpponents({});
  };

  // Helper to clear and restart player states
  const resetPlayerGame = () => {
    const cleanGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    setGrid(cleanGrid);
    gridRef.current = cleanGrid; // Synchronously update ref to prevent stale collision on restart!

    setScore(0);
    setLines(0);
    setLevel(1);
    setHoldPiece(null);
    setHasHeld(false);
    
    setCombo(0);
    comboRef.current = 0;
    
    setIsGameOver(false);
    isGameOverRef.current = false; // Synchronously update ref to avoid stale gameover checks!
    
    garbageQueueRef.current = 0;

    // Reset lock delay references on fresh game start
    if (lockDelayTimeoutRef.current) {
      clearTimeout(lockDelayTimeoutRef.current);
      lockDelayTimeoutRef.current = null;
    }
    firstTouchTimeRef.current = null;
    lastActionTimeRef.current = null;
    lastActionWasRotateRef.current = false;

    const initialQueue = generateNewQueue();
    setNextPieces(initialQueue);
    spawnPiece(initialQueue);
  };

  const handleStartGame = (mode: 'single' | 'ai' | 'online') => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setGameMode(mode);
    if (mode === 'online') {
      if (onlineSetupState === 'playing') {
        // Already in online room, reset game and sync clean board
        resetPlayerGame();
        setOpponentIsGameOver(false);
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'tetris_sync_grid',
            payload: {
              grid: Array.from({ length: 20 }, () => Array(10).fill(0)),
              score: 0
            }
          });
        }
      } else {
        setOnlineSetupState('setup');
      }
    } else {
      setOnlineSetupState('menu');
      setMatchStatus('idle');
      setIsPlaying(true);
      resetPlayerGame();
    }
  };

  const handleQuitGame = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    handleLeaveOnlineRoom();
  };

  return (
    <div className="w-full h-full bg-[#0a0a0f] text-gray-100 flex flex-col justify-between overflow-y-auto font-sans p-4 relative" id="tetris-web-container">
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:24px_24px]" />

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-purple-600 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 text-lg select-none">
            🔲
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              NEO TETRIS <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase font-mono">VS Engine</span>
            </h1>
            <p className="text-[10px] text-zinc-400">Next-gen cyber competitive puzzle block game</p>
          </div>
        </div>

        {/* AUDIO / MUTING CONTROLS */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border transition ${soundEnabled ? 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/15' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/40'}`}
          title="Sound FX Mute toggle"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* LOBBY MENU DISPLAY */}
      {!isPlaying && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 z-10 w-full">
          {onlineSetupState === 'setup' ? (
            /* ONLINE ROOM CONFIGURATION SCREEN */
            <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('move');
                    setOnlineSetupState('menu');
                    setGameMode('single');
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-white tracking-tight">オンライン対人戦設定 (Online Room)</h2>
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-850 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-400">部屋同期用コード (Room Code)</label>
                  <input
                    type="text"
                    placeholder="部屋コードを入力 (例: 777)"
                    value={onlineRoomCode}
                    onChange={(e) => setOnlineRoomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-center text-sm font-black tracking-widest placeholder:tracking-normal placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-all uppercase"
                  />
                </div>

                {onlineErrorText && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/30 text-red-400 text-[11px] rounded-lg">
                    <span>{onlineErrorText}</span>
                  </div>
                )}

                {onlineStatusText && (
                  <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-[11px] rounded-lg text-center font-mono">
                    {onlineStatusText}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={handleCreateOnlineRoom}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                  >
                    部屋を作る
                  </button>
                  <button
                    onClick={handleJoinOnlineRoom}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                  >
                    部屋に入る
                  </button>
                </div>
              </div>
            </div>
          ) : onlineSetupState === 'room' ? (
            /* WAITING ROOM SCREEN */
            <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">📡</div>
              </div>
              <div className="space-y-2 w-full">
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
                  対戦待機中 ({Object.keys(opponents).length + 1}/5人)
                </h3>
                <p className="text-zinc-400 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850 inline-block">
                  部屋コード: <span className="text-pink-400 font-bold">{onlineRoomCode.toUpperCase()}</span>
                </p>
                {onlineStatusText && (
                  <p className="text-zinc-500 text-[10px] italic mt-1">{onlineStatusText}</p>
                )}
              </div>

              {/* Connected players list */}
              <div className="w-full bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 text-left space-y-2.5">
                <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-1">参加メンバー (Players)</div>
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>• {myUsername} (あなた)</span>
                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-mono">Host / You</span>
                </div>
                {(Object.values(opponents) as Opponent[]).map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between text-xs text-zinc-300">
                    <span>• {opp.name}</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono">Ready</span>
                  </div>
                ))}
                {Object.keys(opponents).length === 0 && (
                  <p className="text-[10px] text-zinc-500 italic text-center py-2">他のプレイヤーが部屋コードを入力して入るのを待っています...</p>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full pt-2">
                <button
                  onClick={handleStartMultiplayerMatch}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                >
                  ゲームスタート
                </button>
                <button
                  onClick={handleLeaveOnlineRoom}
                  className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
                >
                  待機をキャンセル
                </button>
              </div>
            </div>
          ) : (
            /* CHOOSE YOUR FIGHT LOBBY MENU */
            <>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
                  CHOOSE YOUR FIGHT
                </h2>
                <p className="text-zinc-400 text-xs">Battle against high-tier machine agents or test offline speed endurance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {/* SINGLE PLAYER CARD */}
                <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:scale-[1.01] transition duration-300 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="bg-cyan-500/10 text-cyan-400 w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-500/20 mb-2">
                      <User size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">一人プレイ (Single Player)</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Train speed limits, clear garbage, level-up blocks, and score high multipliers without interference.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartGame('single')}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    <Play size={14} /> Play Solo
                  </button>
                </div>

                {/* VS AI MODE CARD */}
                <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:scale-[1.01] transition duration-300 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="bg-purple-500/10 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center border border-purple-500/20">
                      <Cpu size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">AI勝負 (VS AI agent)</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Compete with our heuristic intelligence matrix. Clearing rows transfers solid garbage rows directly to the AI opponent!
                    </p>
                    
                    {/* DIFFICULTY SELECTOR */}
                    <div className="pt-2 border-t border-zinc-800/50">
                      <span className="text-[10px] font-bold text-purple-400 block mb-2 uppercase tracking-wider">AI DIFFICULTY (AI難易度)</span>
                      <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        {(['easy', 'normal', 'hard', 'grandmaster'] as const).map((diff) => {
                          const label = {
                            easy: 'Easy',
                            normal: 'Normal',
                            hard: 'Hard',
                            grandmaster: 'G.Master'
                          }[diff];
                          const color = {
                            easy: 'text-green-400 border-green-500/20 hover:bg-green-500/5',
                            normal: 'text-blue-400 border-blue-500/20 hover:bg-blue-500/5',
                            hard: 'text-orange-400 border-orange-500/20 hover:bg-orange-500/5',
                            grandmaster: 'text-red-400 border-red-500/20 hover:bg-red-500/5'
                          }[diff];
                          const activeBg = {
                            easy: 'bg-green-500/15 border-green-500/30 text-green-300 font-bold',
                            normal: 'bg-blue-500/15 border-blue-500/30 text-blue-300 font-bold',
                            hard: 'bg-orange-500/15 border-orange-500/30 text-orange-300 font-bold',
                            grandmaster: 'bg-red-500/15 border-red-500/30 text-red-300 font-bold animate-pulse'
                          }[diff];
                          const isSelected = aiDifficulty === diff;
                          return (
                            <button
                              key={diff}
                              onClick={() => setAiDifficulty(diff)}
                              className={`text-[9px] py-1 rounded-lg border transition text-center cursor-pointer ${
                                isSelected ? activeBg : `border-transparent text-zinc-500 ${color}`
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartGame('ai')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    <Play size={14} /> VS Machine AI
                  </button>
                </div>

                {/* ONLINE MATCH CARD */}
                <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:scale-[1.01] transition duration-300 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="bg-pink-500/10 text-pink-400 w-10 h-10 rounded-xl flex items-center justify-center border border-pink-500/20 mb-2">
                      <Users size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">オンライン対人戦 (Multiplayer)</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Join real-time custom rooms with codes! Share room codes with friends to play together on separate devices.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartGame('online')}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    <Play size={14} /> Online Rooms
                  </button>
                </div>
              </div>

              {/* GAME CONTROLS SCHEME */}
              <div className="bg-zinc-900/45 border border-zinc-800/60 rounded-xl p-4 max-w-lg w-full flex flex-col space-y-3.5">
                <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-cyan-400" /> Game Controls Scheme (操作方法)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded border border-zinc-700 font-mono text-[10px]">← →</span>
                    <span className="text-zinc-400">左右移動</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded border border-zinc-700 font-mono text-[10px]">↑</span>
                    <span className="text-zinc-400">右回転 (時計回り)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20 font-mono text-[10px]">Z</span>
                    <span className="text-zinc-400">左回転 (反時計回り)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded border border-zinc-700 font-mono text-[10px]">↓</span>
                    <span className="text-zinc-400">落下加速 (ソフトドロップ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 text-zinc-200 px-2.5 py-1 rounded border border-zinc-700 font-mono text-[10px]">Space</span>
                    <span className="text-zinc-400">一瞬で落とす (ハードドロップ)</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2 border-t border-zinc-800/50 pt-2">
                    <span className="bg-zinc-800 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 font-mono text-[10px]">C</span>
                    <span className="text-zinc-400">ホールド / 取り出し (Hold)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ACTIVE PUZZLE VIEWPORT */}
      {isPlaying && (gameMode !== 'online' || matchStatus === 'connected') && (
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-4 select-none max-w-6xl mx-auto w-full">
          
          {/* PLAYER CONTAINER (THE CENTERED BOARD & FLOATING SIDEBARS) */}
          <div className="flex items-start justify-center gap-4">
            {/* LEFT COLUMN: HOLD & STATS */}
            <div className="flex flex-col gap-3 w-24 md:w-28 text-right select-none mt-8">
              {/* HOLD BOX */}
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3 flex flex-col items-end relative shadow-lg">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">HOLD</span>
                <div className="w-16 h-16 flex items-center justify-center mt-2 bg-black/40 rounded-lg border border-zinc-800/80">
                  {holdPiece !== null ? (
                    <div className="grid gap-0.5 scale-[0.85]" style={{ gridTemplateColumns: `repeat(${SHAPES[holdPiece][0].length}, minmax(0, 1fr))` }}>
                      {SHAPES[holdPiece].map((row, rIdx) =>
                        row.map((val, cIdx) => (
                          <div
                            key={`hold-${rIdx}-${cIdx}`}
                            className={`w-3.5 h-3.5 rounded-sm border ${val !== 0 ? COLORS[holdPiece] : 'bg-transparent border-transparent'}`}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-zinc-600 uppercase font-mono tracking-wider">EMPTY</span>
                  )}
                </div>
                <span className="text-[8px] text-zinc-600 mt-1 font-mono">KEY [C]</span>
              </div>

              {/* STATS PANEL */}
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2.5 shadow-lg">
                <div>
                  <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase block">SCORE</span>
                  <span className="text-lg font-black text-white font-mono leading-none tracking-tight">{score}</span>
                </div>
                <div className="border-t border-zinc-800/40 pt-1.5">
                  <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase block">LINES</span>
                  <span className="text-base font-black text-purple-400 font-mono leading-none">{lines}</span>
                </div>
                <div className="border-t border-zinc-800/40 pt-1.5">
                  <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase block">LEVEL</span>
                  <span className="text-base font-black text-cyan-400 font-mono leading-none">{level}</span>
                </div>
                {combo > 1 && (
                  <div className="border-t border-zinc-800/40 pt-2 flex flex-col items-end">
                    <span className="text-[8px] font-black text-orange-400 tracking-widest uppercase animate-pulse">COMBO</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black text-orange-500 font-mono leading-none drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-bounce">{combo - 1}</span>
                      <span className="text-[9px] text-zinc-400 font-bold font-mono">x</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER COLUMN: WARNING BAR + BOARD CONTAINER */}
            <div className="flex items-stretch gap-1.5">
              {/* WARNING BAR (INCOMING ATTACKS) */}
              <div className="w-1.5 bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-900 relative flex flex-col justify-end shadow-inner" title={`${garbageQueueRef.current} lines of garbage pending`}>
                {Array.from({ length: 20 }).map((_, idx) => {
                  const reverseIdx = 19 - idx;
                  const isFilled = reverseIdx < garbageQueueRef.current;
                  return (
                    <div
                      key={`warning-segment-${idx}`}
                      className={`h-[5%] w-full transition-all duration-200 ${
                        isFilled
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse border-b border-red-600/30'
                          : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* PLAYER GRID CANVAS */}
              <div className="w-[240px] md:w-[260px] bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-1.5 shadow-2xl relative">
                <div className="absolute top-2 left-4 text-[8px] font-extrabold text-cyan-400 uppercase tracking-widest z-10 flex items-center gap-1.5 bg-zinc-950/60 px-2 py-0.5 rounded-md border border-cyan-500/10 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> PLAYER
                </div>

                <div className="grid grid-cols-10 gap-[1px] bg-zinc-900/40 rounded-lg overflow-hidden mt-6 aspect-[10/20] border border-zinc-800/40 relative">
                  {/* Render Cells */}
                  {grid.map((row, r) =>
                    row.map((cellVal, c) => {
                      let activeVal = cellVal;
                      let isActiveCell = false;
                      let isGhostCell = false;
                      const ghostY = getGhostY();

                      if (activePiece && !isGameOver) {
                        const { shape, x, y, id } = activePiece;
                        const pr = r - y;
                        const pc = c - x;
                        if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[pr].length && shape[pr][pc] !== 0) {
                          activeVal = id;
                          isActiveCell = true;
                        }

                        const gpr = r - ghostY;
                        if (!isActiveCell && gpr >= 0 && gpr < shape.length && pc >= 0 && pc < shape[gpr].length && shape[gpr][pc] !== 0) {
                          activeVal = id;
                          isGhostCell = true;
                        }
                      }

                      return (
                        <div
                          key={`player-cell-${r}-${c}`}
                          className={`aspect-square w-full rounded-[1px] relative transition-all duration-75 ${
                            isActiveCell
                              ? COLORS[activeVal] + ' shadow-[inset_0_0_6px_rgba(255,255,255,0.4)]'
                              : isGhostCell
                              ? 'bg-transparent border border-dashed border-cyan-400/40'
                              : activeVal !== 0
                              ? COLORS[activeVal] + ' border-[0.5px] border-black/30'
                              : 'bg-[#0f0f14]/85 border-[0.5px] border-zinc-900/30'
                          }`}
                        >
                          {activeVal === 8 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-40 text-[7px]">
                              💀
                            </div>
                          )}
                          {isGhostCell && (
                            <div className="absolute inset-0 bg-cyan-400/5 rounded-[1px]" />
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* SPECIAL MOVE OVERLAYS */}
                  <AnimatePresence>
                    {activeMessage && (
                      <motion.div
                        key={activeMessage.id}
                        initial={{ opacity: 0, scale: 0.7, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -25 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                        className={`absolute left-2 right-2 top-[35%] flex flex-col items-center justify-center p-3 rounded-xl text-center backdrop-blur-md shadow-2xl z-20 border ${activeMessage.color}`}
                      >
                        <span className="text-[10px] font-black tracking-widest uppercase">{activeMessage.text}</span>
                        {activeMessage.subtext && (
                          <span className="text-[8px] font-extrabold text-white/90 mt-1 font-mono tracking-wider">{activeMessage.subtext}</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* GAME OVER OVERLAY */}
                  {isGameOver && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center space-y-4 rounded-lg z-20 backdrop-blur-sm animate-fadeIn">
                      <div className="text-center">
                        <p className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest animate-pulse">GAME OVER</p>
                        <h3 className="text-lg font-black text-white leading-none tracking-tight">DEFEAT</h3>
                      </div>
                      <button
                        onClick={() => handleStartGame(gameMode)}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-cyan-600 border border-zinc-700 hover:border-cyan-500 text-white rounded-lg text-[10px] flex items-center gap-1.5 transition duration-150 cursor-pointer active:scale-95"
                      >
                        <RotateCcw size={10} /> RETRY
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: NEXT QUEUE (5 BLOCKS) */}
            <div className="flex flex-col gap-3 w-24 md:w-28 text-left select-none mt-8">
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3 flex flex-col items-start relative shadow-lg">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">NEXT</span>
                
                <div className="space-y-3 mt-2 w-full flex flex-col items-center">
                  {nextPieces.slice(0, 5).map((pieceId, idx) => (
                    <div
                      key={`next-queue-${idx}`}
                      className={`w-14 h-11 flex items-center justify-center bg-black/40 rounded-lg border border-zinc-850/80 transition-all ${
                        idx === 0 ? 'border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'opacity-65'
                      }`}
                    >
                      <div className="grid gap-0.5 scale-[0.65]" style={{ gridTemplateColumns: `repeat(${SHAPES[pieceId][0].length}, minmax(0, 1fr))` }}>
                        {SHAPES[pieceId].map((row, rIdx) =>
                          row.map((val, cIdx) => (
                            <div
                              key={`next-block-${idx}-${rIdx}-${cIdx}`}
                              className={`w-3 h-3 rounded-sm border ${val !== 0 ? COLORS[pieceId] : 'bg-transparent border-transparent'}`}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EXIT MATCH BUTTON */}
              <button
                onClick={handleQuitGame}
                className="w-full bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 font-bold py-2 rounded-xl text-[9px] transition tracking-wider uppercase cursor-pointer"
              >
                Quit Game
              </button>
            </div>
          </div>

          {/* OPPONENT CONTAINER (IF ANY) */}
          {gameMode !== 'single' && (
            <div className="flex items-start justify-center gap-3">
              {/* OPPONENT GRID CANVAS */}
              <div className="w-[180px] md:w-[200px] bg-zinc-950/95 border border-zinc-800/80 rounded-xl p-1.5 shadow-2xl relative select-none">
                <div className="absolute top-2 left-4 text-[8px] font-extrabold text-pink-400 uppercase tracking-widest z-10 flex items-center gap-1.5 bg-zinc-950/60 px-2 py-0.5 rounded-md border border-pink-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" /> {gameMode === 'ai' ? opponentName : 'OPPONENT'}
                </div>

                {gameMode === 'ai' ? (
                  <div className="grid grid-cols-10 gap-[0.5px] bg-zinc-900/20 rounded-lg overflow-hidden mt-6 aspect-[10/20] border border-zinc-850 relative p-0.5">
                    {opponentGrid.map((row, r) =>
                      row.map((cellVal, c) => (
                        <div
                          key={`opp-ai-cell-${r}-${c}`}
                          className={`aspect-square w-full rounded-[1px] ${
                            cellVal !== 0
                              ? COLORS[cellVal] + ' scale-[0.95] border-[0.5px] border-black/20'
                              : 'bg-[#0a0a0d] border-[0.2px] border-zinc-950/30'
                          }`}
                        />
                      ))
                    )}

                    {/* OPPONENT GAME OVER SCREEN */}
                    {opponentIsGameOver && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-1 rounded-lg z-20 backdrop-blur-[1px]">
                        <p className="text-[9px] text-green-400 font-extrabold uppercase tracking-widest animate-bounce">VICTORY!</p>
                        <h3 className="text-xs font-black text-white tracking-tight">K.O.</h3>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ONLINE OPPONENTS MULTIPLAYER LIST */
                  <div className="mt-6 w-full flex flex-col gap-3 min-h-[300px] justify-center">
                    {Object.keys(opponents).length === 0 ? (
                      <div className="text-center text-zinc-500 text-[10px] italic py-8 bg-[#0a0a0d] rounded-lg border border-zinc-900">
                        Waiting for other<br/>players to join...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 w-full">
                        {(Object.values(opponents) as Opponent[]).map((opp) => (
                          <div key={opp.id} className="bg-zinc-900/20 border border-zinc-850 rounded-lg p-1.5 flex flex-col items-center relative">
                            <div className="text-[8px] font-extrabold text-pink-400 truncate w-full text-center mb-1 flex items-center justify-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${opp.isGameOver ? 'bg-zinc-600' : 'bg-pink-500 animate-pulse'}`} />
                              {opp.name}
                            </div>
                            
                            {/* COMPACT OPPONENT GRID */}
                            <div className="grid grid-cols-10 gap-[0.5px] bg-zinc-950/80 rounded-md overflow-hidden aspect-[10/20] w-[75px] border border-zinc-850 p-0.5 relative">
                              {opp.grid.map((row, r) =>
                                row.map((cellVal, c) => (
                                  <div
                                    key={`opp-grid-cell-${opp.id}-${r}-${c}`}
                                    className={`aspect-square w-full rounded-[0.5px] ${
                                      cellVal !== 0
                                        ? COLORS[cellVal] + ' scale-[0.95]'
                                        : 'bg-[#07070a] border-[0.1px] border-zinc-950/30'
                                    }`}
                                  />
                                ))
                              )}
                              {opp.isGameOver && (
                                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center rounded-md z-20">
                                  <p className="text-[8px] text-red-500 font-black tracking-widest uppercase">KO</p>
                                </div>
                              )}
                            </div>
                            <div className="text-[7px] text-zinc-500 font-bold mt-1 font-mono">
                              PTS: {opp.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* OPPONENT MINIFIED STATS */}
                {gameMode === 'ai' && (
                  <div className="mt-2 text-center bg-[#07070a]/60 py-1 rounded-lg border border-zinc-900">
                    <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">OPPONENT SCORE</span>
                    <p className="text-xs font-extrabold text-zinc-300 font-mono leading-none mt-0.5">{opponentScore}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
