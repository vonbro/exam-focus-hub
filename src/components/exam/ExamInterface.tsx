import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Flag, Send, Maximize, Minimize, Clock, Timer } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { cn } from '@/lib/utils';
import type { ExamQuestion, ExamSession } from '@/lib/storage';

interface ExamInterfaceProps {
  session: ExamSession;
  onUpdateSession: (session: ExamSession) => void;
  onSubmit: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ExamInterface({ session, onUpdateSession, onSubmit }: ExamInterfaceProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const currentQuestion = session.questions[session.currentQuestion];
  const isTimerMode = session.timeLimit !== undefined;

  // Update timer/stopwatch
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      
      if (isTimerMode) {
        const remaining = Math.max(0, session.timeLimit! - elapsed);
        setDisplayTime(remaining);
        
        // Auto-submit when time runs out
        if (remaining === 0) {
          onSubmit();
        }
      } else {
        setDisplayTime(elapsed);
      }
      
      // Update elapsed time in session
      onUpdateSession({ ...session, elapsedTime: elapsed });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startTime, session.timeLimit, isTimerMode]);

  const selectOption = (optionIndex: number) => {
    const updatedQuestions = session.questions.map((q, i) =>
      i === session.currentQuestion ? { ...q, selectedOption: optionIndex } : q
    );
    onUpdateSession({ ...session, questions: updatedQuestions });
  };

  const goToQuestion = (index: number) => {
    onUpdateSession({ ...session, currentQuestion: index });
  };

  const nextQuestion = () => {
    if (session.currentQuestion < session.questions.length - 1) {
      goToQuestion(session.currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (session.currentQuestion > 0) {
      goToQuestion(session.currentQuestion - 1);
    }
  };

  const attemptedCount = session.questions.filter((q) => q.selectedOption !== null).length;
  const unattemptedCount = session.questions.length - attemptedCount;

  // Time warning (last 5 minutes)
  const isTimeWarning = isTimerMode && displayTime < 300 && displayTime > 0;

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', isFullscreen && 'fixed inset-0 z-50')}>
      {/* Header */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
              isTimerMode
                ? isTimeWarning
                  ? 'bg-destructive/10 text-destructive animate-pulse'
                  : 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isTimerMode ? <Clock className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
            {formatTime(displayTime)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="text-success">{attemptedCount} answered</span>
            {' • '}
            <span>{unattemptedCount} remaining</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          <Button variant="destructive" onClick={() => setShowSubmitDialog(true)}>
            <Send className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Main Question Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Card className="max-w-3xl mx-auto bg-card border-border">
            <CardContent className="p-6">
              {/* Question Number */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {session.currentQuestion + 1} of {session.questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-lg text-foreground leading-relaxed">{currentQuestion.text}</p>
              </div>

              {/* Options */}
              <RadioGroup
                value={currentQuestion.selectedOption?.toString() || ''}
                onValueChange={(value) => selectOption(parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer',
                      currentQuestion.selectedOption === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                    )}
                    onClick={() => selectOption(index)}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-foreground"
                    >
                      <span className="font-medium text-muted-foreground mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={session.currentQuestion === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => selectOption(-1)}
                  className="text-muted-foreground"
                >
                  Clear Selection
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={session.currentQuestion === session.questions.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Question Palette */}
        <aside className="w-72 border-l border-border bg-card p-4 flex-shrink-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Question Palette</h3>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-5 gap-2">
              {session.questions.map((q, index) => {
                const isAnswered = q.selectedOption !== null;
                const isCurrent = index === session.currentQuestion;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      'w-10 h-10 rounded-md text-sm font-medium transition-all',
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                        : isAnswered
                        ? 'bg-exam-answered text-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-exam-answered" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-muted" />
              <span>Not Answered</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You have answered {attemptedCount} out of {session.questions.length} questions.
              {unattemptedCount > 0 && (
                <span className="block mt-2 text-warning">
                  {unattemptedCount} questions are still unanswered.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
