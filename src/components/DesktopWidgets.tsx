import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, CloudSun, CloudRain, Cloud, Clock, StickyNote, X, GripHorizontal, Move, RefreshCw
} from 'lucide-react';
import { SettingsState } from '../types';
import { WEATHER_DATA } from '../data/weather';
import { AnalogClock } from './AnalogClock';

interface DesktopWidgetsProps {
  settings: SettingsState;
  onUpdateSettings: (newSettings: SettingsState) => void;
  isDarkTheme?: boolean;
  language?: 'ja' | 'en';
}

interface Position {
  x: number;
  y: number;
}

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({
  settings,
  onUpdateSettings,
  language = 'ja',
}) => {
  const isJa = language === 'ja';

  // Live clock
  const [now, setNow] = useState(new Date());

  // Quick note state synced with LocalStorage
  const [quickNote, setQuickNote] = useState(() => {
    try {
      return localStorage.getItem('abord_start_quick_note') || (isJa ? '・重要タスクをメモ\n・新機能をチェック' : '• Important task notes\n• Check new updates');
    } catch {
      return '• Quick note';
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to quick note changes in localStorage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const val = localStorage.getItem('abord_start_quick_note');
        if (val !== null) setQuickNote(val);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleNoteChange = (text: string) => {
    setQuickNote(text);
    try {
      localStorage.setItem('abord_start_quick_note', text);
    } catch (e) {
      console.error(e);
    }
  };

  // Draggable positions
  const defaultPositions: Record<string, Position> = {
    weather: { x: 260, y: 30 },
    clock: { x: 540, y: 30 },
    notes: { x: 780, y: 30 },
  };

  const [positions, setPositions] = useState<Record<string, Position>>(() => {
    try {
      const saved = localStorage.getItem('abord_desktop_widget_positions');
      if (saved) return JSON.parse(saved);
      return settings.desktopWidgetPositions || defaultPositions;
    } catch {
      return defaultPositions;
    }
  });

  const draggingWidgetRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    draggingWidgetRef.current = widgetId;
    const currentPos = positions[widgetId] || defaultPositions[widgetId] || { x: 100, y: 100 };
    dragOffsetRef.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingWidgetRef.current) return;
      const id = draggingWidgetRef.current;
      const newX = Math.max(10, Math.min(window.innerWidth - 200, moveEvent.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, moveEvent.clientY - dragOffsetRef.current.y));

      setPositions((prev) => {
        const updated = { ...prev, [id]: { x: newX, y: newY } };
        try {
          localStorage.setItem('abord_desktop_widget_positions', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });
    };

    const handleMouseUp = () => {
      draggingWidgetRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const weatherCity = settings.weatherCity || 'Tokyo';
  const cityData = WEATHER_DATA[weatherCity] || WEATHER_DATA.Tokyo;
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = now.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' });

  const showWeather = settings.showDesktopWeatherWidget ?? false;
  const showClock = settings.showDesktopClockWidget ?? false;
  const showNotes = settings.showDesktopNotesWidget ?? false;

  if (!showWeather && !showClock && !showNotes) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden" id="desktop-widgets-canvas">
      {/* 🌤️ DESKTOP WEATHER WIDGET */}
      {showWeather && (
        <div
          style={{
            position: 'absolute',
            left: `${positions.weather?.x ?? defaultPositions.weather.x}px`,
            top: `${positions.weather?.y ?? defaultPositions.weather.y}px`,
          }}
          className="pointer-events-auto w-64 bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-blue-950/80 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-2xl text-white group hover:border-blue-400/50 transition-colors"
          id="desktop-widget-weather"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div
              onMouseDown={(e) => handleMouseDown('weather', e)}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-bold text-sky-200"
            >
              <GripHorizontal className="w-3.5 h-3.5 text-sky-300/60 group-hover:text-sky-300" />
              <span>{isJa ? '天気予報' : 'Weather'}</span>
              <span className="text-[9px] bg-sky-500/20 text-sky-200 px-1.5 py-0.2 rounded font-mono">
                {weatherCity}
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showDesktopWeatherWidget: false })}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={isJa ? 'デスクトップから削除' : 'Hide from Desktop'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weather Details */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{cityData.temp}</div>
              <p className="text-xs text-sky-200 font-medium">
                {isJa ? cityData.conditionJa : cityData.conditionEn}
              </p>
            </div>
            <div>
              {cityData.iconType === 'sun' && <Sun className="w-8 h-8 text-amber-300 drop-shadow-md" />}
              {cityData.iconType === 'cloud-sun' && <CloudSun className="w-8 h-8 text-sky-200 drop-shadow-md" />}
              {cityData.iconType === 'rain' && <CloudRain className="w-8 h-8 text-sky-300 drop-shadow-md" />}
              {cityData.iconType === 'cloud' && <Cloud className="w-8 h-8 text-gray-300 drop-shadow-md" />}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-3 text-[10px] text-sky-200/80 font-mono text-center">
            <div>
              <span className="block opacity-60">最高/最低</span>
              <span className="font-bold text-white">{cityData.highLow}</span>
            </div>
            <div>
              <span className="block opacity-60">湿度</span>
              <span className="font-bold text-white">{cityData.humidity}</span>
            </div>
            <div>
              <span className="block opacity-60">風速</span>
              <span className="font-bold text-white">{cityData.wind}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🕒 DESKTOP CLOCK WIDGET */}
      {showClock && (
        <div
          style={{
            position: 'absolute',
            left: `${positions.clock?.x ?? defaultPositions.clock.x}px`,
            top: `${positions.clock?.y ?? defaultPositions.clock.y}px`,
          }}
          className="pointer-events-auto w-56 bg-gradient-to-br from-slate-900/80 via-purple-950/80 to-slate-950/80 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-2xl text-white group hover:border-purple-400/50 transition-colors"
          id="desktop-widget-clock"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div
              onMouseDown={(e) => handleMouseDown('clock', e)}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-bold text-purple-200"
            >
              <GripHorizontal className="w-3.5 h-3.5 text-purple-300/60 group-hover:text-purple-300" />
              <span>{isJa ? '時計 & 日付' : 'Clock & Date'}</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showDesktopClockWidget: false })}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={isJa ? 'デスクトップから削除' : 'Hide from Desktop'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {settings.clockWidgetType === 'analog' ? (
            <div className="flex items-center justify-between gap-3 py-1 px-1">
              <AnalogClock date={now} size={64} />
              <div className="text-right flex-1 min-w-0">
                <p className="text-lg font-black text-white font-mono tracking-wider">{formattedTime}</p>
                <p className="text-xs text-purple-200 font-semibold mt-0.5">{formattedDate}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <p className="text-2xl font-black text-white font-mono tracking-wider text-shadow-sm">{formattedTime}</p>
              <p className="text-xs text-purple-200 font-semibold mt-0.5">{formattedDate}</p>
            </div>
          )}
        </div>
      )}

      {/* 📝 DESKTOP QUICK STICKY NOTES WIDGET */}
      {showNotes && (
        <div
          style={{
            position: 'absolute',
            left: `${positions.notes?.x ?? defaultPositions.notes.x}px`,
            top: `${positions.notes?.y ?? defaultPositions.notes.y}px`,
          }}
          className="pointer-events-auto w-64 bg-gradient-to-br from-amber-900/85 via-amber-950/85 to-zinc-900/85 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3.5 shadow-2xl text-white group hover:border-amber-400/60 transition-colors"
          id="desktop-widget-notes"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
            <div
              onMouseDown={(e) => handleMouseDown('notes', e)}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-bold text-amber-200"
            >
              <GripHorizontal className="w-3.5 h-3.5 text-amber-300/60 group-hover:text-amber-300" />
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              <span>{isJa ? 'クイックメモ' : 'Desktop Memo'}</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showDesktopNotesWidget: false })}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={isJa ? 'デスクトップから削除' : 'Hide from Desktop'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            value={quickNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={isJa ? 'メモを入力...' : 'Type notes here...'}
            className="w-full h-24 bg-black/30 text-amber-100 placeholder-amber-200/40 text-xs p-2.5 rounded-xl resize-none border border-amber-500/20 outline-none focus:border-amber-400/60 focus:bg-black/45 custom-scrollbar font-sans"
          />
        </div>
      )}
    </div>
  );
};
