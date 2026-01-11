import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Plus, Trash2, Save, Check } from 'lucide-react';
import type { ExamQuestion } from '@/lib/storage';

interface QuestionEditorProps {
  questions: ExamQuestion[];
  onSave: (questions: ExamQuestion[]) => void;
  onBack: () => void;
}

export function QuestionEditor({ questions, onSave, onBack }: QuestionEditorProps) {
  const [editedQuestions, setEditedQuestions] = useState<ExamQuestion[]>(questions);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentQuestion = editedQuestions[selectedIndex];

  const updateQuestion = (updates: Partial<ExamQuestion>) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) => (i === selectedIndex ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = value;
    updateQuestion({ options: newOptions });
  };

  const addQuestion = () => {
    const newQuestion: ExamQuestion = {
      id: editedQuestions.length + 1,
      text: '',
      options: ['', '', '', ''],
      selectedOption: null,
      correctOption: null,
    };
    setEditedQuestions((prev) => [...prev, newQuestion]);
    setSelectedIndex(editedQuestions.length);
  };

  const deleteQuestion = (index: number) => {
    if (editedQuestions.length <= 1) return;
    setEditedQuestions((prev) => prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, id: i + 1 })));
    if (selectedIndex >= editedQuestions.length - 1) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
  };

  const handleSave = () => {
    onSave(editedQuestions);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Setup
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Question Navigator */}
        <Card className="w-64 bg-card border-border flex-shrink-0">
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-foreground">Questions ({editedQuestions.length})</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-3rem)]">
            <div className="p-2 space-y-1">
              {editedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-sm">
                    {q.text.slice(0, 30) || 'Empty question'}
                  </span>
                  {q.text && q.options.every((o) => o) && (
                    <Check className="w-4 h-4 text-success" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQuestion(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Question Editor */}
        <Card className="flex-1 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Question {selectedIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Question Text</Label>
              <Textarea
                value={currentQuestion.text}
                onChange={(e) => updateQuestion({ text: e.target.value })}
                placeholder="Enter the question text..."
                className="min-h-[120px] bg-secondary border-border resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Options</Label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="bg-secondary border-border"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
