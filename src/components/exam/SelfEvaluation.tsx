import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, X, Minus, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExamQuestion } from '@/lib/storage';

interface SelfEvaluationProps {
  questions: ExamQuestion[];
  timeTaken: number;
  onComplete: (evaluatedQuestions: ExamQuestion[]) => void;
}

export function SelfEvaluation({ questions, timeTaken, onComplete }: SelfEvaluationProps) {
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<ExamQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = evaluatedQuestions[currentIndex];
  const evaluatedCount = evaluatedQuestions.filter((q) => q.correctOption !== null || q.selectedOption === null).length;
  const progress = (evaluatedCount / evaluatedQuestions.length) * 100;

  const setCorrectOption = (optionIndex: number | null) => {
    setEvaluatedQuestions((prev) =>
      prev.map((q, i) => (i === currentIndex ? { ...q, correctOption: optionIndex } : q))
    );
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    if (currentIndex < evaluatedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const canComplete = evaluatedQuestions.every(
    (q) => q.selectedOption === null || q.correctOption !== null
  );

  const getQuestionStatus = (q: ExamQuestion) => {
    if (q.selectedOption === null) return 'skipped';
    if (q.correctOption === null) return 'pending';
    if (q.selectedOption === q.correctOption) return 'correct';
    return 'wrong';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Self Evaluation</h1>
          <p className="text-xs text-muted-foreground">Mark the correct answers to calculate your score</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {evaluatedCount} of {evaluatedQuestions.length} evaluated
          </div>
          <Progress value={progress} className="w-32 h-2" />
          
          <Button onClick={() => onComplete(evaluatedQuestions)} disabled={!canComplete}>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Results
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Main Evaluation Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Card className="max-w-3xl mx-auto bg-card border-border">
            <CardContent className="p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentIndex + 1} of {evaluatedQuestions.length}
                </span>
                {currentQuestion.selectedOption === null && (
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    Skipped
                  </span>
                )}
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-lg text-foreground leading-relaxed">{currentQuestion.text}</p>
              </div>

              {/* Options with Evaluation */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isUserAnswer = currentQuestion.selectedOption === index;
                  const isMarkedCorrect = currentQuestion.correctOption === index;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center p-4 rounded-lg border transition-all',
                        isMarkedCorrect
                          ? 'border-success bg-success/10'
                          : isUserAnswer
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <span className="font-medium text-muted-foreground mr-3 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 text-foreground">{option}</span>
                      {isUserAnswer && (
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded mr-2">
                          Your Answer
                        </span>
                      )}
                      {isMarkedCorrect && (
                        <Check className="w-5 h-5 text-success" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Selection */}
              {currentQuestion.selectedOption !== null && (
                <div className="border-t border-border pt-6">
                  <Label className="text-muted-foreground mb-3 block">
                    Which option is correct?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.options.map((_, index) => (
                      <Button
                        key={index}
                        variant={currentQuestion.correctOption === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCorrectOption(index)}
                        className={cn(
                          currentQuestion.correctOption === index && 'bg-success hover:bg-success/90'
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={currentIndex === evaluatedQuestions.length - 1}
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
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Evaluation Progress</h3>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-5 gap-2">
              {evaluatedQuestions.map((q, index) => {
                const status = getQuestionStatus(q);
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      'w-10 h-10 rounded-md text-sm font-medium transition-all flex items-center justify-center',
                      isCurrent && 'ring-2 ring-primary/50',
                      status === 'correct' && 'bg-success text-success-foreground',
                      status === 'wrong' && 'bg-destructive text-destructive-foreground',
                      status === 'skipped' && 'bg-muted text-muted-foreground',
                      status === 'pending' && 'bg-warning/20 text-warning border border-warning'
                    )}
                  >
                    {status === 'correct' && <Check className="w-4 h-4" />}
                    {status === 'wrong' && <X className="w-4 h-4" />}
                    {status === 'skipped' && <Minus className="w-4 h-4" />}
                    {status === 'pending' && (index + 1)}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-success flex items-center justify-center">
                <Check className="w-3 h-3 text-success-foreground" />
              </div>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-destructive flex items-center justify-center">
                <X className="w-3 h-3 text-destructive-foreground" />
              </div>
              <span>Wrong</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-muted" />
              <span>Skipped</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-warning/20 border border-warning" />
              <span>Needs Evaluation</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
