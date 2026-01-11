import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountdownDisplay } from '@/components/countdown/CountdownDisplay';
import { ClockSettings } from '@/components/clocks/ClockSettings';
import { Navigation } from '@/components/layout/Navigation';
import { Maximize, Minimize, Plus, X, Calendar } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  getCountdownSettings,
  saveCountdownSettings,
  PREDEFINED_EXAMS,
  type CountdownSettings as CountdownSettingsType,
  type CustomExam,
} from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function calculateTimeRemaining(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

export default function ExamCountdown() {
  const [settings, setSettings] = useState<CountdownSettingsType>(getCountdownSettings);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [showControls, setShowControls] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', date: '', time: '' });
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Get all exams (predefined + custom)
  const allExams = useMemo(() => {
    const predefined = PREDEFINED_EXAMS.map((exam) => ({
      ...exam,
      isPredefined: true,
    }));
    const custom = settings.customExams.map((exam) => ({
      ...exam,
      isPredefined: false,
    }));
    return [...predefined, ...custom];
  }, [settings.customExams]);

  // Get selected exam
  const selectedExam = useMemo(() => {
    return allExams.find((exam) => exam.id === settings.selectedExamId) || allExams[0];
  }, [allExams, settings.selectedExamId]);

  // Calculate target date
  const targetDate = useMemo(() => {
    if (!selectedExam) return new Date();
    const [year, month, day] = selectedExam.date.split('-').map(Number);
    const [hours = 0, minutes = 0] = (selectedExam.time || '00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }, [selectedExam]);

  // Update countdown every second
  useEffect(() => {
    const update = () => setTimeRemaining(calculateTimeRemaining(targetDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Save settings when they change
  useEffect(() => {
    saveCountdownSettings(settings);
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
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFullscreen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    f: toggleFullscreen,
  });

  const handleSelectExam = (examId: string) => {
    setSettings((prev) => ({ ...prev, selectedExamId: examId }));
  };

  const handleAddCustomExam = () => {
    if (!newExam.name || !newExam.date) return;

    const customExam: CustomExam = {
      id: `custom-${Date.now()}`,
      name: newExam.name,
      date: newExam.date,
      time: newExam.time || undefined,
    };

    setSettings((prev) => ({
      ...prev,
      customExams: [...prev.customExams, customExam],
      selectedExamId: customExam.id,
    }));

    setNewExam({ name: '', date: '', time: '' });
    setIsAddDialogOpen(false);
  };

  const handleDeleteCustomExam = (examId: string) => {
    setSettings((prev) => ({
      ...prev,
      customExams: prev.customExams.filter((e) => e.id !== examId),
      selectedExamId: prev.selectedExamId === examId ? null : prev.selectedExamId,
    }));
  };

  const themeClass = {
    'pure-black': 'theme-pure-black',
    'dark-gray': 'theme-dark-gray',
    'soft-white': 'theme-soft-white',
  }[settings.clockSettings.theme];

  return (
    <div className={cn('min-h-screen', !isFullscreen && 'pt-14')}>
      {!isFullscreen && <Navigation />}

      <div
        className={cn(
          'flex flex-col min-h-screen bg-clock-bg transition-colors duration-300',
          themeClass,
          isFullscreen && 'fixed inset-0 z-50'
        )}
      >
        {/* Exam Selector (hidden in fullscreen unless controls visible) */}
        {(!isFullscreen || showControls) && (
          <div
            className={cn(
              'p-4 border-b border-border/30 transition-opacity duration-300',
              isFullscreen && !showControls && 'opacity-0'
            )}
          >
            <div className="container mx-auto">
              <div className="flex flex-wrap items-center gap-2">
                {allExams.map((exam) => (
                  <div key={exam.id} className="relative group">
                    <Button
                      variant={selectedExam?.id === exam.id ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => handleSelectExam(exam.id)}
                      className={cn(
                        'text-xs',
                        !exam.isPredefined && 'pr-8'
                      )}
                    >
                      {exam.name}
                    </Button>
                    {!exam.isPredefined && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomExam(exam.id);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Add Custom Exam</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Exam Name</Label>
                        <Input
                          placeholder="e.g., NEET Mock Test"
                          value={newExam.name}
                          onChange={(e) => setNewExam((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Exam Date</Label>
                        <Input
                          type="date"
                          value={newExam.date}
                          onChange={(e) => setNewExam((prev) => ({ ...prev, date: e.target.value }))}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Exam Time (Optional)</Label>
                        <Input
                          type="time"
                          value={newExam.time}
                          onChange={(e) => setNewExam((prev) => ({ ...prev, time: e.target.value }))}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <Button onClick={handleAddCustomExam} className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Add Countdown
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Display */}
        <div className="flex-1 flex items-center justify-center p-8">
          {timeRemaining.isExpired ? (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-clock-digit mb-4">Exam Day!</h2>
              <p className="text-clock-digit-muted">Good luck with your exam!</p>
            </div>
          ) : (
            <CountdownDisplay
              design={settings.clockSettings.design}
              days={timeRemaining.days}
              hours={timeRemaining.hours}
              minutes={timeRemaining.minutes}
              seconds={timeRemaining.seconds}
              showSeconds={settings.clockSettings.showSeconds}
              examName={selectedExam?.name}
            />
          )}
        </div>

        {/* Controls */}
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border transition-opacity duration-300',
            !showControls && 'opacity-0 pointer-events-none'
          )}
        >
          <ClockSettings
            settings={settings.clockSettings}
            onSettingsChange={(clockSettings) =>
              setSettings((prev) => ({ ...prev, clockSettings }))
            }
          />
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
