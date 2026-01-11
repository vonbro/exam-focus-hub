import { cn } from '@/lib/utils';
import type { ClockDesign } from '@/lib/storage';

interface CountdownDisplayProps {
  design: ClockDesign;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  showSeconds?: boolean;
  examName?: string;
}

export function CountdownDisplay({
  design,
  days,
  hours,
  minutes,
  seconds,
  showSeconds = true,
  examName,
}: CountdownDisplayProps) {
  const formatNumber = (n: number, pad = 2) => n.toString().padStart(pad, '0');

  const TimeBlock = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'clock-font text-clock-digit font-bold',
          design === 'flip' && 'bg-clock-flip-bg rounded-xl px-4 py-3 shadow-lg',
          design === 'minimal' && 'font-medium',
          design === 'bold' && 'font-black'
        )}
        style={{
          fontSize: design === 'bold' ? 'min(15vw, 8rem)' : 'min(12vw, 6rem)',
        }}
      >
        {value}
      </div>
      <span className="text-clock-digit-muted text-sm uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="text-clock-digit-muted text-4xl font-light self-start mt-6">:</div>
  );

  return (
    <div className="flex flex-col items-center gap-8">
      {examName && (
        <h2 className="text-clock-digit-muted text-lg sm:text-xl tracking-[0.2em] uppercase">
          {examName}
        </h2>
      )}

      <div className="flex items-start gap-2 sm:gap-4 flex-wrap justify-center">
        <TimeBlock value={formatNumber(days, days > 99 ? 3 : 2)} label="Days" />
        <Separator />
        <TimeBlock value={formatNumber(hours)} label="Hours" />
        <Separator />
        <TimeBlock value={formatNumber(minutes)} label="Minutes" />
        {showSeconds && (
          <>
            <Separator />
            <TimeBlock value={formatNumber(seconds)} label="Seconds" />
          </>
        )}
      </div>
    </div>
  );
}
