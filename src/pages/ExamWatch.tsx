import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ClockDisplay } from '@/components/clocks/ClockDisplay';
import { ClockSettings } from '@/components/clocks/ClockSettings';
import { Navigation } from '@/components/layout/Navigation';
import { Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getClockSettings, saveClockSettings, type ClockSettings as ClockSettingsType } from '@/lib/storage';
import { cn } from '@/lib/utils';

function formatTime(date: Date, format: '12h' | '24h') {
  let hours = date.getHours();
  
  if (format === '12h') {
    hours = hours % 12 || 12;
  }
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: date.getMinutes().toString().padStart(2, '0'),
    seconds: date.getSeconds().toString().padStart(2, '0'),
  };
}

export default function ExamWatch() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<ClockSettingsType>(getClockSettings);
  const [showControls, setShowControls] = useState(true);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveClockSettings(settings);
  }, [settings]);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowControls(true);
    }
  }, [isFullscreen]);

  // Handle mouse movement to show controls
  useEffect(() => {
    if (!isFullscreen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFullscreen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    f: toggleFullscreen,
  });

  const { hours, minutes, seconds } = formatTime(time, settings.timeFormat);

  const themeClass = {
    'pure-black': 'theme-pure-black',
    'dark-gray': 'theme-dark-gray',
    'soft-white': 'theme-soft-white',
  }[settings.theme];

  return (
    <div className={cn('min-h-screen', !isFullscreen && 'pt-14')}>
      {!isFullscreen && <Navigation />}
      
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-screen bg-clock-bg transition-colors duration-300',
          themeClass,
          isFullscreen && 'fixed inset-0 z-50'
        )}
      >
        {/* Clock Display */}
        <div className="flex-1 flex items-center justify-center w-full p-8">
          <ClockDisplay
            design={settings.design}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            showSeconds={settings.showSeconds}
          />
        </div>

        {/* Controls */}
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border transition-opacity duration-300',
            !showControls && 'opacity-0 pointer-events-none'
          )}
        >
          <ClockSettings settings={settings} onSettingsChange={setSettings} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Keyboard hints */}
        {showControls && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded">F</kbd> for fullscreen
          </div>
        )}
      </div>
    </div>
  );
}
