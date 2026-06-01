import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endsAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isEnded) {
    return (
      <div className="font-orbitron text-red-500 font-bold uppercase tracking-widest text-sm border border-red-500/30 px-4 py-2 bg-red-500/5 shadow-inner">
        FLASH SALE BERAKHIR
      </div>
    );
  }

  const timeBlocks = [
    { label: "HARI", value: timeLeft.days },
    { label: "JAM", value: timeLeft.hours },
    { label: "MENIT", value: timeLeft.minutes },
    { label: "DETIK", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2 sm:gap-4 items-center">
      {timeBlocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          <div className="flex flex-col items-center">
            <div className="bg-cyber-surface border border-accent-primary/30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center font-orbitron font-bold text-lg sm:text-2xl text-accent-primary relative glow-cyan">
              {/* Outer decorative line element */}
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-accent-primary" />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-accent-secondary" />
              {String(block.value).padStart(2, "0")}
            </div>
            <span className="text-[9px] sm:text-[10px] font-orbitron tracking-wider text-cyber-muted mt-1.5">
              {block.label}
            </span>
          </div>
          {idx < timeBlocks.length - 1 && (
            <span className="font-orbitron font-bold text-accent-secondary text-lg sm:text-2xl -mt-4 animate-pulse">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
