interface BoldClockProps {
  hours: string;
  minutes: string;
  seconds?: string;
  showSeconds?: boolean;
  label?: string;
}

export function BoldClock({ hours, minutes, seconds, showSeconds = true, label }: BoldClockProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {label && (
        <p className="text-clock-digit-muted text-xl tracking-[0.3em] uppercase font-medium">{label}</p>
      )}
      <div className="clock-font text-clock-digit font-bold">
        <div className="text-[min(30vw,16rem)] leading-none tracking-tighter">
          {hours}:{minutes}
        </div>
        {showSeconds && seconds && (
          <div className="text-[min(10vw,5rem)] text-clock-digit-muted text-center mt-4">
            {seconds}
          </div>
        )}
      </div>
    </div>
  );
}
