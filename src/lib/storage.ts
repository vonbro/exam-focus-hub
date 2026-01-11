// Storage utilities for exam app persistence

export type ClockDesign = 'flip' | 'minimal' | 'bold';
export type ClockTheme = 'pure-black' | 'dark-gray' | 'soft-white';
export type TimeFormat = '12h' | '24h';

export interface ClockSettings {
  design: ClockDesign;
  theme: ClockTheme;
  timeFormat: TimeFormat;
  showSeconds: boolean;
}

export interface CustomExam {
  id: string;
  name: string;
  date: string;
  time?: string;
}

export interface CountdownSettings {
  selectedExamId: string | null;
  customExams: CustomExam[];
  clockSettings: ClockSettings;
}

export interface ExamQuestion {
  id: number;
  text: string;
  options: string[];
  selectedOption: number | null;
  correctOption?: number | null;
}

export interface ExamSession {
  questions: ExamQuestion[];
  currentQuestion: number;
  startTime: number;
  timeLimit?: number; // in seconds, undefined for stopwatch mode
  isSubmitted: boolean;
  elapsedTime: number;
}

export interface ExamResult {
  id: string;
  date: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
}

const STORAGE_KEYS = {
  CLOCK_SETTINGS: 'examprep_clock_settings',
  COUNTDOWN_SETTINGS: 'examprep_countdown_settings',
  EXAM_SESSION: 'examprep_exam_session',
  EXAM_RESULTS: 'examprep_exam_results',
} as const;

const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  design: 'flip',
  theme: 'pure-black',
  timeFormat: '24h',
  showSeconds: true,
};

const DEFAULT_COUNTDOWN_SETTINGS: CountdownSettings = {
  selectedExamId: null,
  customExams: [],
  clockSettings: DEFAULT_CLOCK_SETTINGS,
};

// Clock Settings
export function getClockSettings(): ClockSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLOCK_SETTINGS);
    if (stored) {
      return { ...DEFAULT_CLOCK_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading clock settings:', e);
  }
  return DEFAULT_CLOCK_SETTINGS;
}

export function saveClockSettings(settings: ClockSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOCK_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving clock settings:', e);
  }
}

// Countdown Settings
export function getCountdownSettings(): CountdownSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COUNTDOWN_SETTINGS);
    if (stored) {
      return { ...DEFAULT_COUNTDOWN_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading countdown settings:', e);
  }
  return DEFAULT_COUNTDOWN_SETTINGS;
}

export function saveCountdownSettings(settings: CountdownSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNTDOWN_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving countdown settings:', e);
  }
}

// Exam Session
export function getExamSession(): ExamSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXAM_SESSION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading exam session:', e);
  }
  return null;
}

export function saveExamSession(session: ExamSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving exam session:', e);
  }
}

export function clearExamSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.EXAM_SESSION);
  } catch (e) {
    console.error('Error clearing exam session:', e);
  }
}

// Exam Results
export function getExamResults(): ExamResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading exam results:', e);
  }
  return [];
}

export function saveExamResult(result: ExamResult): void {
  try {
    const results = getExamResults();
    results.unshift(result);
    // Keep only last 50 results
    const trimmed = results.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving exam result:', e);
  }
}

// Predefined exams with dates
export const PREDEFINED_EXAMS = [
  { id: 'neet-2025', name: 'NEET 2025', date: '2025-05-04', time: '14:00' },
  { id: 'jee-main-2025', name: 'JEE Main 2025', date: '2025-04-01', time: '09:00' },
  { id: 'jee-adv-2025', name: 'JEE Advanced 2025', date: '2025-05-25', time: '09:00' },
  { id: 'cuet-2025', name: 'CUET 2025', date: '2025-05-15', time: '09:00' },
  { id: 'upsc-prelims-2025', name: 'UPSC Prelims 2025', date: '2025-05-25', time: '09:30' },
  { id: 'ssc-cgl-2025', name: 'SSC CGL 2025', date: '2025-03-15', time: '09:00' },
  { id: 'ibps-po-2025', name: 'IBPS PO 2025', date: '2025-10-15', time: '09:00' },
] as const;
