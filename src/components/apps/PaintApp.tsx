import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Square,
  Circle,
  Eraser,
  Trash2,
  Download,
  Save,
  Palette,
  Undo2,
  Redo2,
  Pipette,
  PaintBucket,
  Pencil,
  Type,
  Minus,
  ArrowUpRight,
  ImagePlus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FilePlus,
  Check,
  Sparkles,
  Maximize2,
  Brush,
  Highlighter,
  Feather,
  Cloud,
  Settings2
} from 'lucide-react';
import { VirtualFile } from '../../types';
import { downloadFileAndOpenGitHub } from '../../utils/fileDownload';

export type ToolType =
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'picker'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text';

export type BrushStyle = 'pencil' | 'pen' | 'marker' | 'spray' | 'watercolor' | 'standard';

export type FillStyle = 'outline' | 'filled' | 'both';

interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

const CANVAS_PRESETS: CanvasSize[] = [
  { width: 960, height: 600, label: '標準 (960 x 600)' },
  { width: 1280, height: 720, label: 'HD (1280 x 720)' },
  { width: 1920, height: 1080, label: 'FHD (1920 x 1080)' },
  { width: 800, height: 800, label: '正方形 (800 x 800)' },
  { width: 600, height: 800, label: '縦長 (600 x 800)' }
];

export const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Colors & Canvas Background
  const [primaryColor, setPrimaryColor] = useState('#0078d4');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Tool & Brush Settings
  const [tool, setTool] = useState<ToolType>('brush');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('standard');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [fontSize, setFontSize] = useState<number>(24);
  const [fillStyle, setFillStyle] = useState<FillStyle>('both');

  // Auto Correct / Smart Shape Correction
  const [autoCorrect, setAutoCorrect] = useState<boolean>(true);

  // Canvas Dimensions
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 960,
    height: 600
  });
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(960);
  const [customHeight, setCustomHeight] = useState<number>(600);

  // Zoom & View
  const [zoom, setZoom] = useState<number>(1);

  // History for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Interaction States
  const [isDrawing, setIsDrawing] = useState(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const strokePoints = useRef<{ x: number; y: number; time: number }[]>([]);
  const snapshotData = useRef<ImageData | null>(null);

  // Text Tool Overlay State
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean; value: string }>({
    x: 0,
    y: 0,
    visible: false,
    value: ''
  });

  const presetColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b5e61d', '#96c2f1', '#ffc90e', '#efe4b0', '#16a085', '#2ecc71', '#3498db', '#9b59b6',
    '#e74c3c', '#e67e22', '#f1c40f', '#1289a7', '#121212', '#2d3436', '#636e72', '#b2bec3', '#00cec9', '#0984e3'
  ];

  // Helper: Save state to history stack
  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        if (newHistory.length >= 25) {
          newHistory.shift();
        }
        return [...newHistory, currentData];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 24));
    } catch (e) {
      console.error('Failed to save history state:', e);
    }
  }, [historyIndex]);

  // Initial Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryIndex(0);
  }, []);

  // Handle Resize of Canvas Dimension
  const applyCanvasResize = (newWidth: number, newHeight: number, keepContent = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let previousData: ImageData | null = null;
    if (keepContent) {
      previousData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    setCanvasDimensions({ width: newWidth, height: newHeight });
    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, newWidth, newHeight);

    if (keepContent && previousData) {
      ctx.putImageData(previousData, 0, 0);
    }

    saveHistoryState();
    setShowSizeModal(false);
  };

  // Change Background Color
  const handleChangeBackgroundColor = (colorHex: string) => {
    setBackgroundColor(colorHex);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.confirm('キャンバス背景色を変更します。現在の背景部分を塗りつぶしますか？')) {
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistoryState();
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIndex(newIdx);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIndex(newIdx);
  };

  // Canvas Mouse Coordinates Transformer
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
      time: Date.now()
    };
  };

  // Flood Fill Algorithm
  const executeFloodFill = (startX: number, startY: number, targetColorHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const dummy = document.createElement('canvas');
    const dummyCtx = dummy.getContext('2d')!;
    dummyCtx.fillStyle = targetColorHex;
    dummyCtx.fillRect(0, 0, 1, 1);
    const fillRgb = dummyCtx.getImageData(0, 0, 1, 1).data;

    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    if (
      startR === fillRgb[0] &&
      startG === fillRgb[1] &&
      startB === fillRgb[2] &&
      startA === fillRgb[3]
    ) {
      return;
    }

    const colorMatch = (pos: number) => {
      return (
        Math.abs(data[pos] - startR) < 18 &&
        Math.abs(data[pos + 1] - startG) < 18 &&
        Math.abs(data[pos + 2] - startB) < 18 &&
        Math.abs(data[pos + 3] - startA) < 18
      );
    };

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = y * width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const pos = idx * 4;
      if (colorMatch(pos)) {
        data[pos] = fillRgb[0];
        data[pos + 1] = fillRgb[1];
        data[pos + 2] = fillRgb[2];
        data[pos + 3] = fillRgb[3];

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveHistoryState();
  };

  // Eyedropper / Color Picker
  const executeEyedropper = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
        .toString(16)
        .slice(1)}`;
      setPrimaryColor(hex);
      setTool('brush');
    } catch (e) {
      console.error(e);
    }
  };

  // Helper: Draw smooth curves connecting stroke points without jagged edges
  const drawSmoothedPath = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length === 0) return;
    ctx.beginPath();

    if (points.length === 1) {
      ctx.arc(points[0].x, points[0].y, Math.max(1, ctx.lineWidth / 2), 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
      return;
    }

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  };

  // Render complete current stroke cleanly onto canvas
  const renderCurrentStroke = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number; time?: number }[]
  ) => {
    if (points.length === 0) return;
    ctx.save();

    if (tool === 'eraser') {
      ctx.strokeStyle = secondaryColor;
      ctx.fillStyle = secondaryColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawSmoothedPath(ctx, points);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = primaryColor;

    switch (brushStyle) {
      case 'pencil':
        ctx.lineWidth = Math.max(1, Math.round(brushSize / 2));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawSmoothedPath(ctx, points);
        ctx.stroke();
        break;

      case 'pen': // Calligraphy Fountain Pen (万年筆) with 45° chisel nib effect
        if (points.length === 1) {
          ctx.beginPath();
          ctx.arc(points[0].x, points[0].y, Math.max(1.5, brushSize), 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          const nibAngle = Math.PI / 4; // 45 degrees chisel angle
          for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const angle = Math.atan2(dy, dx);
            const factor = Math.abs(Math.sin(angle - nibAngle));
            // Dynamic thickness: thin on 45° diagonal, thick on perpendicular moves
            const w = Math.max(1.5, brushSize * (0.35 + 1.65 * factor));
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        break;

      case 'marker': // Semi-transparent Highlighter (マーカー) - SINGLE PASS TO PREVENT OVERLAPPING CIRCLE BEADS
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = brushSize * 2.2;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        drawSmoothedPath(ctx, points);
        ctx.stroke();
        break;

      case 'watercolor': // Semi-transparent Water Color (水彩) - SINGLE PASS TO PREVENT OVERLAPPING CIRCLE BEADS
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = brushSize * 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawSmoothedPath(ctx, points);
        ctx.stroke();
        break;

      case 'spray': // Airbrush / Spray paint effect
        const latestP = points[points.length - 1];
        const density = Math.min(45, brushSize * 4);
        for (let i = 0; i < density; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 2.5;
          const offsetY = (Math.random() - 0.5) * brushSize * 2.5;
          ctx.fillRect(latestP.x + offsetX, latestP.y + offsetY, 1.5, 1.5);
        }
        break;

      case 'standard':
      default:
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawSmoothedPath(ctx, points);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  // Smart Shape Recognition & Auto-Correction Algorithm (Accurate Circle vs Rectangle Detection)
  const processAutoShapeCorrection = (points: { x: number; y: number }[]) => {
    if (points.length < 8 || !snapshotData.current) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // 1. Smooth points to filter out high-frequency mouse/touch jitter
    const smoothedPoints: { x: number; y: number }[] = [];
    const windowSize = 2;
    for (let i = 0; i < points.length; i++) {
      let sumX = 0, sumY = 0, count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(points.length - 1, i + windowSize); j++) {
        sumX += points[j].x;
        sumY += points[j].y;
        count++;
      }
      smoothedPoints.push({ x: sumX / count, y: sumY / count });
    }

    const startP = smoothedPoints[0];
    const endP = smoothedPoints[smoothedPoints.length - 1];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let totalPathLength = 0;

    for (let i = 0; i < smoothedPoints.length; i++) {
      const p = smoothedPoints[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;

      if (i > 0) {
        const prev = smoothedPoints[i - 1];
        totalPathLength += Math.hypot(p.x - prev.x, p.y - prev.y);
      }
    }

    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 14 || height < 14) return false;

    const startEndDist = Math.hypot(endP.x - startP.x, endP.y - startP.y);
    const isClosed = startEndDist < 55 || startEndDist / Math.max(width, height) < 0.48;

    // Check 1: Straight Line
    if (!isClosed && startEndDist / (totalPathLength || 1) > 0.85) {
      ctx.putImageData(snapshotData.current, 0, 0);
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(endP.x, endP.y);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // Check 2: Closed Shape -> Distinguish Rectangle vs Circle/Ellipse
    if (isClosed) {
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      // Calculate Shoelace area & radial distances
      let shoelaceArea = 0;
      let cornerPointCount = 0;
      let maxDistFromCenter = 0;

      for (let i = 0; i < smoothedPoints.length; i++) {
        const p1 = smoothedPoints[i];
        const p2 = smoothedPoints[(i + 1) % smoothedPoints.length];
        shoelaceArea += (p1.x * p2.y - p2.x * p1.y);

        const normX = (p1.x - centerX) / (rx || 1);
        const normY = (p1.y - centerY) / (ry || 1);
        const distFromCenter = Math.hypot(normX, normY);
        if (distFromCenter > maxDistFromCenter) maxDistFromCenter = distFromCenter;

        // Bounding box corners have normalized dist ≈ 1.414
        if (distFromCenter > 1.15) {
          cornerPointCount++;
        }
      }

      shoelaceArea = Math.abs(shoelaceArea) / 2;
      const bboxArea = width * height;
      const areaRatio = bboxArea > 0 ? shoelaceArea / bboxArea : 0;
      const cornerPointRatio = cornerPointCount / smoothedPoints.length;

      // Rectangle has Area/BBoxArea ≈ 1.0 (vs Circle ≈ 0.785) & corner points extending past r
      const isRectangle = areaRatio >= 0.85 || cornerPointRatio > 0.08 || maxDistFromCenter > 1.28;

      ctx.putImageData(snapshotData.current, 0, 0);
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isRectangle) {
        // Correct to Rectangle (Stroke only, no fill)
        ctx.strokeRect(minX, minY, width, height);
      } else {
        // Correct to Circle or Ellipse (Stroke only, no fill)
        const aspectRatio = width / height;
        const isCircle = aspectRatio >= 0.75 && aspectRatio <= 1.33;

        ctx.beginPath();
        if (isCircle) {
          const r = (width + height) / 4;
          ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        } else {
          ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
        }
        ctx.stroke();
      }

      ctx.restore();
      return true;
    }

    return false;
  };

  // Mouse Down / Touch Start Handler
  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    startPos.current = coords;
    strokePoints.current = [coords];
    setIsDrawing(true);

    snapshotData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === 'fill') {
      executeFloodFill(coords.x, coords.y, primaryColor);
      setIsDrawing(false);
      return;
    }

    if (tool === 'picker') {
      executeEyedropper(coords.x, coords.y);
      setIsDrawing(false);
      return;
    }

    if (tool === 'text') {
      setTextInput({
        x: coords.x,
        y: coords.y,
        visible: true,
        value: ''
      });
      setIsDrawing(false);
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      renderCurrentStroke(ctx, strokePoints.current);
    }
  };

  // Mouse Move / Touch Move Handler
  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    strokePoints.current.push(coords);

    if (tool === 'brush' || tool === 'eraser') {
      if (brushStyle !== 'spray' && snapshotData.current) {
        ctx.putImageData(snapshotData.current, 0, 0);
      }
      renderCurrentStroke(ctx, strokePoints.current);
      return;
    }

    // Shape Preview
    if (snapshotData.current) {
      ctx.putImageData(snapshotData.current, 0, 0);
    }

    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = secondaryColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const sx = startPos.current.x;
    const sy = startPos.current.y;
    const cx = coords.x;
    const cy = coords.y;

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    } else if (tool === 'arrow') {
      const headLength = Math.max(10, brushSize * 3);
      const angle = Math.atan2(cy - sy, cx - sx);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx - headLength * Math.cos(angle - Math.PI / 6),
        cy - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        cx - headLength * Math.cos(angle + Math.PI / 6),
        cy - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = primaryColor;
      ctx.fill();
    } else if (tool === 'rectangle') {
      const width = cx - sx;
      const height = cy - sy;

      if (fillStyle === 'filled' || fillStyle === 'both') {
        ctx.fillRect(sx, sy, width, height);
      }
      if (fillStyle === 'outline' || fillStyle === 'both') {
        ctx.strokeRect(sx, sy, width, height);
      }
    } else if (tool === 'circle') {
      const radiusX = Math.abs(cx - sx) / 2;
      const radiusY = Math.abs(cy - sy) / 2;
      const centerX = Math.min(sx, cx) + radiusX;
      const centerY = Math.min(sy, cy) + radiusY;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

      if (fillStyle === 'filled' || fillStyle === 'both') {
        ctx.fill();
      }
      if (fillStyle === 'outline' || fillStyle === 'both') {
        ctx.stroke();
      }
    }
  };

  // Mouse Up / Touch End Handler
  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Run Auto Shape Correction if active and using Brush
    if (autoCorrect && tool === 'brush') {
      processAutoShapeCorrection(strokePoints.current);
    }

    saveHistoryState();
  };

  // Apply Text to Canvas
  const applyTextToCanvas = () => {
    if (!textInput.value.trim()) {
      setTextInput({ ...textInput, visible: false });
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.textBaseline = 'top';
    ctx.fillText(textInput.value, textInput.x, textInput.y);

    setTextInput({ x: 0, y: 0, visible: false, value: '' });
    saveHistoryState();
  };

  // Import / Upload local image onto Canvas
  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (img.width > canvas.width || img.height > canvas.height) {
          canvas.width = Math.max(canvas.width, img.width);
          canvas.height = Math.max(canvas.height, img.height);
          setCanvasDimensions({ width: canvas.width, height: canvas.height });
        }

        ctx.drawImage(img, 0, 0);
        saveHistoryState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (!window.confirm('キャンバス全体をクリアしますか？ / Clear canvas?')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  // Export / Download PNG to PC
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    downloadFileAndOpenGitHub('my-drawing.png', dataUrl, 'image/png');
  };

  // Save to WebOS Virtual File System
  const handleSaveToVfs = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const fileName = prompt('イラストの名前を入力してください (Pictures フォルダに保存):', 'drawing.png');
    if (!fileName) return;

    let sanitizedName = fileName.trim();
    if (!sanitizedName.toLowerCase().endsWith('.png')) {
      sanitizedName += '.png';
    }

    try {
      const stored = localStorage.getItem('webos_files');
      let files: VirtualFile[] = stored ? JSON.parse(stored) : [];

      const existingIndex = files.findIndex(
        (f) => f.name.toLowerCase() === sanitizedName.toLowerCase() && f.path === 'Pictures'
      );

      const newFile: VirtualFile = {
        name: sanitizedName,
        path: 'Pictures',
        content: dataUrl,
        type: 'image',
        createdAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        files[existingIndex] = newFile;
      } else {
        files.push(newFile);
      }

      localStorage.setItem('webos_files', JSON.stringify(files));
      window.dispatchEvent(new Event('webos_fs_updated'));
      alert(`「Pictures」フォルダに "${sanitizedName}" として保存しました！`);
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。画像サイズが大きすぎる可能性があります。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] text-slate-800 font-sans select-none overflow-hidden" id="paint-app">
      {/* Top Ribbon Control Bar */}
      <div className="bg-white border-b border-slate-300 shadow-sm flex flex-wrap items-center justify-between px-3 py-2 gap-2 text-xs z-10">
        {/* Left Section: File, Canvas Dimensions & History */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = backgroundColor;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  saveHistoryState();
                }
              }
            }}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-700 font-medium transition-colors"
            title="新規キャンバス (New Canvas)"
          >
            <FilePlus className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">新規</span>
          </button>

          <button
            onClick={() => {
              setCustomWidth(canvasDimensions.width);
              setCustomHeight(canvasDimensions.height);
              setShowSizeModal(true);
            }}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-700 font-medium transition-colors border border-slate-200"
            title="キャンバスサイズの変更"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono text-[11px]">{canvasDimensions.width}x{canvasDimensions.height}</span>
          </button>

          <label className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-700 font-medium cursor-pointer transition-colors">
            <ImagePlus className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">画像挿入</span>
            <input type="file" accept="image/*" onChange={handleImageImport} className="hidden" />
          </label>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-700 transition-colors"
            title="元に戻す (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-700 transition-colors"
            title="やり直し (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Auto Correct / Smart Shape Correction Toggle Button */}
          <button
            onClick={() => setAutoCorrect(!autoCorrect)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] transition-all shadow-sm ${
              autoCorrect
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
            title="手書きした円や四角形、直線をきれいな正円や図形に自動補正します"
          >
            <Sparkles className={`w-3.5 h-3.5 ${autoCorrect ? 'animate-pulse' : ''}`} />
            <span>自動補正 {autoCorrect ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Center Section: Main Tools Selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setTool('brush')}
            className={`p-1.5 rounded transition-all flex items-center gap-1 font-semibold ${
              tool === 'brush' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="ブラシ / 描画ツール (Brush)"
          >
            <Palette className="w-4 h-4" />
            <span className="text-[11px] hidden md:inline">ブラシ</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded transition-all flex items-center gap-1 font-semibold ${
              tool === 'eraser' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="消しゴム (Eraser)"
          >
            <Eraser className="w-4 h-4" />
            <span className="text-[11px] hidden md:inline">消しゴム</span>
          </button>

          <button
            onClick={() => setTool('fill')}
            className={`p-1.5 rounded transition-all flex items-center gap-1 font-semibold ${
              tool === 'fill' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="バケツ塗りつぶし (Flood Fill)"
          >
            <PaintBucket className="w-4 h-4" />
            <span className="text-[11px] hidden md:inline">塗りつぶし</span>
          </button>

          <button
            onClick={() => setTool('picker')}
            className={`p-1.5 rounded transition-all flex items-center gap-1 font-semibold ${
              tool === 'picker' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="スポイト色取得 (Eyedropper)"
          >
            <Pipette className="w-4 h-4" />
            <span className="text-[11px] hidden md:inline">スポイト</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Shapes */}
          <button
            onClick={() => setTool('line')}
            className={`p-1.5 rounded transition-all ${
              tool === 'line' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="直線 (Straight Line)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            className={`p-1.5 rounded transition-all ${
              tool === 'arrow' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="矢印 (Arrow)"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('rectangle')}
            className={`p-1.5 rounded transition-all ${
              tool === 'rectangle' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="四角形 (Rectangle)"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded transition-all ${
              tool === 'circle' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="円 / 楕円 (Circle)"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-1.5 rounded transition-all ${
              tool === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="テキスト追加 (Text Tool)"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section: Save & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCanvas}
            className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded transition-colors"
            title="キャンバスクリア"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveToVfs}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium shadow-sm"
            title="Picturesフォルダに保存"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">保存</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors font-medium shadow-sm"
            title="PCにダウンロード＆GitHubで開く"
          >
            <Download className="w-4 h-4" />
            <span>GitHub / DL</span>
          </button>
        </div>
      </div>

      {/* Secondary Ribbon: Brush Style Types & Parameters */}
      <div className="bg-slate-50 border-b border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brush Type Selector & Parameters */}
        <div className="flex items-center gap-4 flex-wrap">
          {tool === 'brush' && (
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1">描画の種類:</span>
              <button
                onClick={() => setBrushStyle('standard')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'standard' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Brush className="w-3.5 h-3.5" />
                <span>標準ブラシ</span>
              </button>

              <button
                onClick={() => setBrushStyle('pencil')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'pencil' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>鉛筆</span>
              </button>

              <button
                onClick={() => setBrushStyle('pen')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'pen' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>万年筆ペン</span>
              </button>

              <button
                onClick={() => setBrushStyle('marker')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'marker' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>マーカー</span>
              </button>

              <button
                onClick={() => setBrushStyle('spray')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'spray' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>スプレー</span>
              </button>

              <button
                onClick={() => setBrushStyle('watercolor')}
                className={`px-2 py-1 rounded flex items-center gap-1 font-semibold ${
                  brushStyle === 'watercolor' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-cyan-500" />
                <span>水彩</span>
              </button>
            </div>
          )}

          {/* Size Slider */}
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-300">
            <span className="text-slate-600 font-medium">太さ:</span>
            <input
              type="range"
              min="1"
              max="60"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-blue-600 h-1.5 rounded bg-slate-200 cursor-pointer"
            />
            <span className="w-7 font-mono text-[11px] text-slate-700 font-bold">{brushSize}px</span>
          </div>

          {/* Text Font Size */}
          {tool === 'text' && (
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300">
              <span className="text-slate-600 font-medium">文字サイズ:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="bg-transparent font-mono font-semibold text-slate-800 cursor-pointer outline-none"
              >
                <option value={14}>14px</option>
                <option value={18}>18px</option>
                <option value={24}>24px</option>
                <option value={32}>32px</option>
                <option value={48}>48px</option>
                <option value={64}>64px</option>
              </select>
            </div>
          )}

          {/* Shape Fill Style selector */}
          {(tool === 'rectangle' || tool === 'circle') && (
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-1">
              <button
                onClick={() => setFillStyle('both')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  fillStyle === 'both' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                枠＋塗り
              </button>
              <button
                onClick={() => setFillStyle('outline')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  fillStyle === 'outline' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                枠線のみ
              </button>
              <button
                onClick={() => setFillStyle('filled')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  fillStyle === 'filled' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                塗りつぶし
              </button>
            </div>
          )}
        </div>

        {/* Color Palette & Background Color Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-300">
            {/* Primary / Foreground */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-bold">描画色</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-5 h-5 border border-slate-400 rounded cursor-pointer"
                title="描画色 (メインカラー)"
              />
            </div>

            <button
              onClick={() => {
                const temp = primaryColor;
                setPrimaryColor(secondaryColor);
                setSecondaryColor(temp);
              }}
              className="px-1 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-600"
              title="描画色とサブ色を入れ替え"
            >
              ⇄
            </button>

            {/* Secondary Color */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-bold">サブ色</span>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-5 h-5 border border-slate-400 rounded cursor-pointer"
                title="サブ色 (枠/塗りつぶし用)"
              />
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Canvas Background Color */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-blue-600 font-bold">背景色</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleChangeBackgroundColor(e.target.value)}
                className="w-5 h-5 border border-blue-400 rounded cursor-pointer"
                title="キャンバス自体の背景色を変更"
              />
            </div>
          </div>

          {/* Quick Swatches */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
            {presetColors.slice(0, 14).map((c) => (
              <button
                key={c}
                onClick={() => setPrimaryColor(c)}
                className={`w-4 h-4 border rounded-sm transition-transform shrink-0 ${
                  primaryColor === c ? 'scale-125 ring-1 ring-blue-600 border-white z-10' : 'border-slate-300'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-200 overflow-auto flex items-center justify-center p-6 relative cursor-crosshair"
      >
        <div
          className="relative shadow-2xl rounded border border-slate-300 transition-all duration-150"
          style={{
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="block touch-none rounded"
            style={{ backgroundColor: backgroundColor }}
            id="paint-canvas-element"
          />

          {/* Text Tool Overlay Popover */}
          {textInput.visible && (
            <div
              className="absolute z-30 bg-white border border-blue-500 shadow-xl rounded p-1 flex items-center gap-1"
              style={{
                left: `${(textInput.x / canvasDimensions.width) * 100}%`,
                top: `${(textInput.y / canvasDimensions.height) * 100}%`
              }}
            >
              <input
                type="text"
                autoFocus
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyTextToCanvas();
                  if (e.key === 'Escape') setTextInput({ ...textInput, visible: false });
                }}
                placeholder="テキストを入力..."
                className="text-xs px-2 py-1 outline-none font-sans border-b border-slate-300 min-w-[150px]"
                style={{ color: primaryColor, fontSize: `${Math.min(fontSize, 22)}px` }}
              />
              <button
                onClick={applyTextToCanvas}
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                title="配置"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur border border-slate-300 rounded-full shadow-lg p-1 flex items-center gap-1 z-20 text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] font-bold px-1 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700"
            title="拡大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700 ml-0.5"
            title="リセット (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Size Settings Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-600" />
                キャンバス解像度 / サイズ変更
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">プリセットから選択:</label>
                <div className="grid grid-cols-2 gap-2">
                  {CANVAS_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setCustomWidth(preset.width);
                        setCustomHeight(preset.height);
                      }}
                      className={`p-2 rounded border text-left font-medium transition-all ${
                        customWidth === preset.width && customHeight === preset.height
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">カスタム入力 (ピクセル):</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-slate-500">幅:</span>
                    <input
                      type="number"
                      min="200"
                      max="3840"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 200)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-800"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">×</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-slate-500">高さ:</span>
                    <input
                      type="number"
                      min="200"
                      max="2160"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 200)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowSizeModal(false)}
                className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-medium text-xs"
              >
                キャンセル
              </button>
              <button
                onClick={() => applyCanvasResize(customWidth, customHeight, true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-sm"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
