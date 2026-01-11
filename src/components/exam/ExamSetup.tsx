import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, Clock, Timer, AlertCircle, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ExamQuestion } from '@/lib/storage';

export type ExamMode = 'timer' | 'stopwatch';

interface ExamSetupProps {
  questions: ExamQuestion[];
  onStartExam: (mode: ExamMode, timeLimit?: number) => void;
  onEditQuestions: () => void;
}

export function ExamSetup({ questions, onStartExam, onEditQuestions }: ExamSetupProps) {
  const [examMode, setExamMode] = useState<ExamMode>('timer');
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);

  const handleStart = () => {
    if (examMode === 'timer') {
      const timeLimit = hours * 3600 + minutes * 60;
      onStartExam('timer', timeLimit);
    } else {
      onStartExam('stopwatch');
    }
  };

  const totalTimeInMinutes = hours * 60 + minutes;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Questions Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Questions Loaded
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {questions.length} questions ready for the exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Questions with 4 options: {questions.filter(q => q.options.length === 4).length}
            </div>
            <Button variant="outline" size="sm" onClick={onEditQuestions}>
              Review & Edit Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exam Mode Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Exam Mode</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose how you want to take the exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={examMode}
            onValueChange={(value) => setExamMode(value as ExamMode)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="timer" id="timer" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="timer" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Fixed Timer Mode</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Set a time limit. The exam will auto-submit when time runs out.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="stopwatch" id="stopwatch" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="stopwatch" className="flex items-center gap-2 cursor-pointer">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Stopwatch Mode</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  No time limit. Tracks how long you take to complete the exam.
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Time Input for Timer Mode */}
          {examMode === 'timer' && (
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground mb-3 block">Set Exam Duration</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={12}
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                    className="w-20 bg-secondary border-border text-center"
                  />
                  <span className="text-muted-foreground text-sm">hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                    className="w-20 bg-secondary border-border text-center"
                  />
                  <span className="text-muted-foreground text-sm">minutes</span>
                </div>
              </div>
              {totalTimeInMinutes > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Total: {totalTimeInMinutes} minutes ({(totalTimeInMinutes / questions.length).toFixed(1)} min/question)
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marking Scheme Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Marking Scheme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="text-2xl font-bold text-success">+4</div>
              <div className="text-xs text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">−1</div>
              <div className="text-xs text-muted-foreground mt-1">Wrong</div>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="text-2xl font-bold text-muted-foreground">0</div>
              <div className="text-xs text-muted-foreground mt-1">Unattempted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        size="lg"
        className="w-full h-14 text-lg"
        onClick={handleStart}
        disabled={examMode === 'timer' && totalTimeInMinutes === 0}
      >
        <Play className="w-5 h-5 mr-2" />
        Start Exam
      </Button>

      {examMode === 'timer' && totalTimeInMinutes === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please set a valid time duration for the exam.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
