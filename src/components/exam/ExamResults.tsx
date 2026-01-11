import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, Minus, RotateCcw, Home, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExamResult } from '@/lib/storage';

interface ExamResultsProps {
  result: ExamResult;
  onRetry: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function ExamResults({ result, onRetry, onHome }: ExamResultsProps) {
  const scorePercentage = (result.score / result.maxScore) * 100;
  const isPositiveScore = result.score > 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exam Complete!</h1>
          <p className="text-muted-foreground">
            Here's how you performed
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground mb-2">
                {result.score}
                <span className="text-2xl text-muted-foreground">/{result.maxScore}</span>
              </div>
              <Progress
                value={Math.max(0, scorePercentage)}
                className="h-3 mt-4 max-w-md mx-auto"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {scorePercentage.toFixed(1)}% of maximum marks
              </p>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Accuracy */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Target className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{result.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>

              {/* Time Taken */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{formatTime(result.timeTaken)}</div>
                <div className="text-xs text-muted-foreground">Time Taken</div>
              </div>

              {/* Attempted */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {result.attempted}/{result.totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Attempted</div>
              </div>

              {/* Per Question */}
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {(result.timeTaken / result.totalQuestions).toFixed(0)}s
                </div>
                <div className="text-xs text-muted-foreground">Per Question</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Correct */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{result.correct}</div>
                  <div className="text-sm text-muted-foreground">
                    Correct (+{result.correct * 4})
                  </div>
                </div>
              </div>

              {/* Wrong */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{result.wrong}</div>
                  <div className="text-sm text-muted-foreground">
                    Wrong (−{result.wrong})
                  </div>
                </div>
              </div>

              {/* Skipped */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted border border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Minus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{result.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped (0)</div>
                </div>
              </div>
            </div>

            {/* Score Calculation */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Score Calculation</h4>
              <div className="flex items-center gap-2 text-foreground font-mono">
                <span className="text-success">+{result.correct * 4}</span>
                <span className="text-muted-foreground">−</span>
                <span className="text-destructive">{result.wrong}</span>
                <span className="text-muted-foreground">=</span>
                <span className={cn('font-bold', isPositiveScore ? 'text-success' : 'text-destructive')}>
                  {result.score}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={onHome}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
