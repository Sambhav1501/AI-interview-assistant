// frontend/types/interview.ts

export type InterviewType = 'technical' | 'behavioral' | 'both';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Basis = 'resume' | 'jd' | 'both';
export type InterviewStatus = 'saved' | 'in_progress' | 'completed' | 'abandoned';

export interface InterviewConfig {
  interviewType: InterviewType;
  difficulty: Difficulty;
  basis: Basis;
  questionCount: number;
  questionDistribution: {
    technical: number;
    behavioral: number;
  };
}

export interface Question {
  questionId: string;
  questionText: string;
  category: 'technical' | 'behavioral' | 'hr';
  difficulty: Difficulty;
  source: 'bank' | 'ai_generated';
  askedAt: Date;
  userAnswer?: UserAnswer;
  followUps?: FollowUpQuestion[];
  evaluation?: QuestionEvaluation;
}

export interface UserAnswer {
  transcript: string;
  audioMetadata: {
    duration: number;
    fillerWords: {
      um: number;
      uh: number;
      like: number;
      youKnow: number;
      total: number;
    };
    pauseDuration: number;
    wordsPerMinute: number;
  };
}

export interface FollowUpQuestion {
  questionText: string;
  answer: string;
  askedAt: Date;
}

export interface QuestionEvaluation {
  score: number;
  breakdown: {
    technicalAccuracy: number;
    communicationClarity: number;
    answerCompleteness: number;
    confidence: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
}

export interface Interview {
  interviewId: string;
  userId: string;
  createdAt: Date;
  status: InterviewStatus;
  config: InterviewConfig;
  resumeId?: string;
  jdId?: string;
  savedUntil?: Date;
  canEdit: boolean;
  startedAt?: Date;
  completedAt?: Date;
  questions: Question[];
  performance?: InterviewPerformance;
}

export interface InterviewPerformance {
  overallScore: number;
  categoryScores: {
    technical: number;
    behavioral: number;
    communication: number;
  };
  totalFillerWords: number;
  averageResponseTime: number;
  strengths: string[];
  weaknesses: string[];
  areasToImprove: string[];
}

export interface SavedInterviewOption {
  duration: '7days' | '30days' | 'forever';
}

