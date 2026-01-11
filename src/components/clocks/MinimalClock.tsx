interface MinimalClockProps {
  hours: string;
  minutes: string;
  seconds?: string;
  showSeconds?: boolean;
  label?: string;
}

export function MinimalClock({ hours, minutes, seconds, showSeconds = true, label }: MinimalClockProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      {label && (
        <p className="text-clock-digit-muted text-lg tracking-widest uppercase">{label}</p>
      )}
      <div className="clock-font text-clock-digit font-medium tracking-tight">
        <span className="text-[min(25vw,14rem)]">
          {hours}
          <span className="mx-2 opacity-60">:</span>
          {minutes}
          {showSeconds && seconds && (
            <>
              <span className="mx-2 opacity-60">:</span>
              <span className="opacity-80">{seconds}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
