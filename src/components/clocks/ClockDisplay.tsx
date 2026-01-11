import { FlipClock } from './FlipClock';
import { MinimalClock } from './MinimalClock';
import { BoldClock } from './BoldClock';
import type { ClockDesign } from '@/lib/storage';

interface ClockDisplayProps {
  design: ClockDesign;
  hours: string;
  minutes: string;
  seconds?: string;
  showSeconds?: boolean;
  label?: string;
}

export function ClockDisplay({ design, hours, minutes, seconds, showSeconds = true, label }: ClockDisplayProps) {
  switch (design) {
    case 'flip':
      return (
        <FlipClock
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          showSeconds={showSeconds}
          label={label}
        />
      );
    case 'minimal':
      return (
        <MinimalClock
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          showSeconds={showSeconds}
          label={label}
        />
      );
    case 'bold':
      return (
        <BoldClock
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          showSeconds={showSeconds}
          label={label}
        />
      );
    default:
      return (
        <FlipClock
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          showSeconds={showSeconds}
          label={label}
        />
      );
  }
}
