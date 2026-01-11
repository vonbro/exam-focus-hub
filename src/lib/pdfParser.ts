import type { ExamQuestion } from './storage';

export interface ParsedPDF {
  questions: ExamQuestion[];
  rawText: string;
}

export async function parsePDFFile(file: File): Promise<ParsedPDF> {
  // For now, return empty - PDF parsing requires complex setup
  // Users can manually enter questions
  return { 
    questions: [], 
    rawText: '' 
  };
}

export function createManualQuestion(id: number): ExamQuestion {
  return {
    id,
    text: '',
    options: ['', '', '', ''],
    selectedOption: null,
    correctOption: null,
  };
}
