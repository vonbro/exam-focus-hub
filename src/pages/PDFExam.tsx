import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigation } from '@/components/layout/Navigation';
import { ExamSetup, type ExamMode } from '@/components/exam/ExamSetup';
import { QuestionEditor } from '@/components/exam/QuestionEditor';
import { ExamInterface } from '@/components/exam/ExamInterface';
import { SelfEvaluation } from '@/components/exam/SelfEvaluation';
import { ExamResults } from '@/components/exam/ExamResults';
import { Upload, FileText, AlertCircle, Loader2, Plus, BookOpen } from 'lucide-react';
import { parsePDFFile } from '@/lib/pdfParser';
import {
  type ExamQuestion,
  type ExamSession,
  type ExamResult,
  saveExamSession,
  clearExamSession,
  saveExamResult,
} from '@/lib/storage';
import { cn } from '@/lib/utils';

type ExamStage = 'upload' | 'setup' | 'edit' | 'exam' | 'evaluate' | 'results';

export default function PDFExam() {
  const [stage, setStage] = useState<ExamStage>('upload');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parsePDFFile(file);
      
      if (parsed.questions.length === 0) {
        // If no questions found, create empty ones for manual entry
        const emptyQuestions: ExamQuestion[] = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          text: '',
          options: ['', '', '', ''],
          selectedOption: null,
          correctOption: null,
        }));
        setQuestions(emptyQuestions);
        setError('Could not extract questions automatically. Please enter them manually.');
        setStage('edit');
      } else {
        setQuestions(parsed.questions);
        setStage('setup');
      }
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Failed to parse PDF. Please try a different file or enter questions manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleStartManual = () => {
    const emptyQuestions: ExamQuestion[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      text: '',
      options: ['', '', '', ''],
      selectedOption: null,
      correctOption: null,
    }));
    setQuestions(emptyQuestions);
    setStage('edit');
  };

  const handleStartExam = (mode: ExamMode, timeLimit?: number) => {
    const newSession: ExamSession = {
      questions: questions.map((q) => ({ ...q, selectedOption: null, correctOption: null })),
      currentQuestion: 0,
      startTime: Date.now(),
      timeLimit: mode === 'timer' ? timeLimit : undefined,
      isSubmitted: false,
      elapsedTime: 0,
    };
    setSession(newSession);
    saveExamSession(newSession);
    setStage('exam');
  };

  const handleUpdateSession = (updatedSession: ExamSession) => {
    setSession(updatedSession);
    saveExamSession(updatedSession);
  };

  const handleSubmitExam = () => {
    if (!session) return;
    
    const submittedSession = { ...session, isSubmitted: true };
    setSession(submittedSession);
    saveExamSession(submittedSession);
    setStage('evaluate');
  };

  const handleEvaluationComplete = (evaluatedQuestions: ExamQuestion[]) => {
    if (!session) return;

    // Calculate results
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    for (const q of evaluatedQuestions) {
      if (q.selectedOption === null) {
        skipped++;
      } else if (q.selectedOption === q.correctOption) {
        correct++;
      } else {
        wrong++;
      }
    }

    const score = correct * 4 - wrong;
    const maxScore = evaluatedQuestions.length * 4;
    const attempted = evaluatedQuestions.length - skipped;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    const examResult: ExamResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      totalQuestions: evaluatedQuestions.length,
      attempted,
      correct,
      wrong,
      skipped,
      score,
      maxScore,
      accuracy,
      timeTaken: session.elapsedTime,
    };

    saveExamResult(examResult);
    clearExamSession();
    setResult(examResult);
    setStage('results');
  };

  const handleRetry = () => {
    setSession(null);
    setResult(null);
    setStage('setup');
  };

  const handleHome = () => {
    setQuestions([]);
    setSession(null);
    setResult(null);
    setStage('upload');
  };

  // Render based on stage
  if (stage === 'exam' && session) {
    return (
      <ExamInterface
        session={session}
        onUpdateSession={handleUpdateSession}
        onSubmit={handleSubmitExam}
      />
    );
  }

  if (stage === 'evaluate' && session) {
    return (
      <SelfEvaluation
        questions={session.questions}
        timeTaken={session.elapsedTime}
        onComplete={handleEvaluationComplete}
      />
    );
  }

  if (stage === 'results' && result) {
    return <ExamResults result={result} onRetry={handleRetry} onHome={handleHome} />;
  }

  return (
    <div className="min-h-screen pt-14">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {stage === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">PDF → Exam</h1>
              <p className="text-muted-foreground">
                Convert your MCQ PDFs into real exam simulations
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Area */}
            <Card
              className={cn(
                'bg-card border-2 border-dashed transition-all cursor-pointer',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="py-16">
                <div className="flex flex-col items-center text-center">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="text-foreground font-medium">Processing PDF...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Extracting questions and options
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-foreground font-medium">
                        Drop your PDF here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports MCQ format PDFs with questions and options
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Or divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Entry Option */}
            <Card className="bg-card border-border hover:border-muted-foreground transition-colors cursor-pointer" onClick={handleStartManual}>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Enter Questions Manually</p>
                    <p className="text-sm text-muted-foreground">
                      Type or paste your questions and options directly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">PDF Parsing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-extract MCQs from PDFs
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Self Evaluation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mark correct answers after exam
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <AlertCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">+4/−1 Scoring</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Real exam marking scheme
                </p>
              </div>
            </div>
          </div>
        )}

        {stage === 'setup' && (
          <ExamSetup
            questions={questions}
            onStartExam={handleStartExam}
            onEditQuestions={() => setStage('edit')}
          />
        )}

        {stage === 'edit' && (
          <QuestionEditor
            questions={questions}
            onSave={(edited) => {
              setQuestions(edited);
              setStage('setup');
            }}
            onBack={() => setStage(questions.length > 0 ? 'setup' : 'upload')}
          />
        )}
      </main>
    </div>
  );
}
