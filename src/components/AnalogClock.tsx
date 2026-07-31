import React from 'react';

interface AnalogClockProps {
  date?: Date;
  size?: number;
  className?: string;
  showSeconds?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  date = new Date(),
  size = 70,
  className = '',
  showSeconds = true,
}) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const secDeg = seconds * 6;
  const minDeg = (minutes + seconds / 60) * 6;
  const hourDeg = ((hours % 12) + minutes / 60) * 30;

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* Clock Dial Background */}
        <circle cx="50" cy="50" r="46" className="fill-slate-950/80 stroke-purple-400/30" strokeWidth="2.5" />
        
        {/* Inner glow ring */}
        <circle cx="50" cy="50" r="42" className="fill-none stroke-white/10" strokeWidth="1" />

        {/* Hour tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="9"
            x2="50"
            y2={deg % 90 === 0 ? "15" : "12"}
            transform={`rotate(${deg} 50 50)`}
            className={deg % 90 === 0 ? "stroke-purple-200" : "stroke-white/40"}
            strokeWidth={deg % 90 === 0 ? "2" : "1"}
            strokeLinecap="round"
          />
        ))}

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="28"
          transform={`rotate(${hourDeg} 50 50)`}
          className="stroke-white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          transform={`rotate(${minDeg} 50 50)`}
          className="stroke-purple-300"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Second Hand */}
        {showSeconds && (
          <line
            x1="50"
            y1="55"
            x2="50"
            y2="14"
            transform={`rotate(${secDeg} 50 50)`}
            className="stroke-amber-400"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}

        {/* Center Pin */}
        <circle cx="50" cy="50" r="3.5" className="fill-amber-300 stroke-slate-900" strokeWidth="1" />
      </svg>
    </div>
  );
};
