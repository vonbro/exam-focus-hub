import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FlipDigitProps {
  value: string;
  prevValue: string;
}

function FlipDigit({ value, prevValue }: FlipDigitProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className="relative w-[1em] h-[1.4em] perspective-1000">
      {/* Static background */}
      <div className="absolute inset-0 bg-clock-flip-bg rounded-lg shadow-lg" />
      
      {/* Top half (static) */}
      <div className="absolute top-0 left-0 right-0 h-[0.7em] bg-clock-flip-bg rounded-t-lg overflow-hidden border-b border-background/20">
        <div className="absolute inset-0 flex items-end justify-center pb-[0.02em]">
          <span className="text-clock-digit font-bold leading-none">{value}</span>
        </div>
      </div>

      {/* Bottom half (static) */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.7em] bg-clock-flip-bg rounded-b-lg overflow-hidden">
        <div className="absolute inset-0 flex items-start justify-center">
          <span className="text-clock-digit font-bold leading-none" style={{ transform: 'translateY(-0.68em)' }}>
            {value}
          </span>
        </div>
      </div>

      {/* Flipping top */}
      {isFlipping && (
        <div 
          className="absolute top-0 left-0 right-0 h-[0.7em] bg-clock-flip-bg rounded-t-lg overflow-hidden origin-bottom animate-flip-top z-10"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 flex items-end justify-center pb-[0.02em]">
            <span className="text-clock-digit font-bold leading-none">{prevValue}</span>
          </div>
        </div>
      )}

      {/* Flipping bottom */}
      {isFlipping && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-[0.7em] bg-clock-flip-bg rounded-b-lg overflow-hidden origin-top z-10"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(90deg)',
            animation: 'flip-bottom 0.3s ease-out 0.3s forwards'
          }}
        >
          <div className="absolute inset-0 flex items-start justify-center">
            <span className="text-clock-digit font-bold leading-none" style={{ transform: 'translateY(-0.68em)' }}>
              {value}
            </span>
          </div>
        </div>
      )}

      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-background/30 -translate-y-1/2 z-20" />
    </div>
  );
}

interface FlipClockProps {
  hours: string;
  minutes: string;
  seconds?: string;
  showSeconds?: boolean;
  label?: string;
}

export function FlipClock({ hours, minutes, seconds, showSeconds = true, label }: FlipClockProps) {
  const prevHoursRef = useRef(hours);
  const prevMinutesRef = useRef(minutes);
  const prevSecondsRef = useRef(seconds);

  useEffect(() => {
    prevHoursRef.current = hours;
    prevMinutesRef.current = minutes;
    prevSecondsRef.current = seconds;
  });

  const prevHours = prevHoursRef.current;
  const prevMinutes = prevMinutesRef.current;
  const prevSeconds = prevSecondsRef.current;

  return (
    <div className="flex flex-col items-center gap-8">
      {label && (
        <p className="text-clock-digit-muted text-lg tracking-widest uppercase">{label}</p>
      )}
      <div className="flex items-center gap-4 clock-font text-[min(20vw,12rem)]">
        {/* Hours */}
        <div className="flex gap-2">
          <FlipDigit value={hours[0]} prevValue={prevHours[0]} />
          <FlipDigit value={hours[1]} prevValue={prevHours[1]} />
        </div>

        {/* Separator */}
        <div className="flex flex-col gap-3 -mt-2">
          <div className="w-3 h-3 bg-clock-digit rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-clock-digit rounded-full animate-pulse" />
        </div>

        {/* Minutes */}
        <div className="flex gap-2">
          <FlipDigit value={minutes[0]} prevValue={prevMinutes[0]} />
          <FlipDigit value={minutes[1]} prevValue={prevMinutes[1]} />
        </div>

        {/* Seconds */}
        {showSeconds && seconds && (
          <>
            <div className="flex flex-col gap-3 -mt-2">
              <div className="w-3 h-3 bg-clock-digit rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-clock-digit rounded-full animate-pulse" />
            </div>
            <div className="flex gap-2">
              <FlipDigit value={seconds[0]} prevValue={prevSeconds?.[0] || '0'} />
              <FlipDigit value={seconds[1]} prevValue={prevSeconds?.[1] || '0'} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
