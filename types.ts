

export type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';
export type Category = 'Aquecimento' | 'Pé' | 'Sentado' | 'Inversão' | 'Restaurativa' | 'Core' | 'Finalização' | 'Respiração';
export type Goal = 'Flexibilidade' | 'Força' | 'Relaxamento' | 'Alívio de Dor';
export type Duration = 15 | 30 | 45;
export type Discomfort = 'Lombar' | 'Joelhos' | 'Pescoço/Ombros' | 'Punhos' | 'Nenhum';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Media {
  thumbnailUrl: string;
  videoEmbedUrl: string;
}

export interface Pose {
  id: string;
  sanskritName: string;
  portugueseName: string;
  difficulty: Difficulty;
  category: Category;
  benefits: string[];
  media: Media;
  durationDefault: number; // in seconds
  description: string;
}

export interface UserPreferences {
  userId?: string; // Link preferences to a user
  level: Difficulty;
  goal: Goal;
  duration: Duration;
  frequency: number; // Days per week (1-7)
  age?: number;
  weight?: number;
  discomforts: Discomfort[];
  hasOnboarded: boolean;
  autoAdvance?: boolean; // If true, automatically moves to next pose when timer ends
  startDate?: string; // ISO Date string of when they started the plan
}

export interface Routine {
  id: string;
  name: string;
  poses: Pose[];
  totalDuration: number;
  createdAt: Date;
}

// New Types for Calendar and Plan
export interface SessionRecord {
  id: string;
  userId?: string; // Link session to a user
  planId?: string; // Link session to a specific plan
  date: string; // ISO String YYYY-MM-DD
  routineName: string;
  duration: number; // minutes
  mood?: 'happy' | 'calm' | 'tired' | 'energized';
  feedback?: FeedbackRecord; // Link feedback to session
}

export interface PlanDay {
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  activityType: 'Rest' | 'Active';
  practiceName?: string; // Nome da Prática (ex: Detox Twist)
  focus?: string; // Foco Técnico (ex: Digestão / Torções)
  description?: string;
  weekLabel?: number; // Para identificar a semana visualmente
}

export interface PlanPathway {
  id: string;
  title: string;
  description: string;
  reason: string;
  targetGoal: Goal;
  targetLevel: Difficulty;
  targetStage: number; // 1 to 5
}

export interface TrainingPlan {
  id: string;
  userId?: string; // Link plan to a user
  name: string;
  description: string;
  schedule: PlanDay[]; // Fallback / Current Display Schedule
  weeks?: PlanDay[][]; // Array of weekly schedules (e.g., 4 weeks)
  durationWeeks?: number;
  reasoning?: string[]; // Explicações do porquê este plano foi gerado

  // Explicit Metadata for Logic Engine
  metadata?: {
    goal: Goal;
    level: Difficulty;
  };

  // Evolution Fields
  stage?: number; // 1 (I), 2 (II), 3 (III)...
  status?: 'active' | 'completed' | 'archived';
  progress?: number; // 0 to 100 percentage
  completedSessions?: number;
  totalPlannedSessions?: number;

  // Next Steps Options (Calculated when complete)
  nextPaths?: PlanPathway[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO Date
  likes: number;
  likedBy: string[]; // List of user IDs who liked
  replies?: Comment[]; // Nested replies
}

export interface Article {
  id: string;
  userId?: string; // Author ID (if user generated)
  title: string;
  excerpt: string;
  content: string[]; // Array of paragraphs
  category: 'Filosofia' | 'Benefícios' | 'Inspiração' | 'Anatomia';
  readTime: string;
  imageUrl: string;
  author: string;
  isPremium?: boolean;
  isUserGenerated?: boolean;
  mediaType?: 'image' | 'video' | 'none'; // New field for social posts

  // Social
  likes: number;
  likedBy: string[]; // List of user IDs who liked
  comments: Comment[];
}

// --- NEW FEEDBACK / STORIES TYPES ---

export type StoryType = 'POST_PRACTICE' | 'WEEKLY_CHECKIN' | 'WEEKLY_REVIEW';

export interface FeedbackRecord {
  type: StoryType;
  date: string;
  responses: {
    question: string;
    answer: string;
    score?: number; // Optional numeric score for adaptation logic
  }[];
}

export interface Memory {
  id: string;
  userId?: string;
  caption: string;
  mediaUrl: string; // URL da foto ou vídeo
  type: 'photo' | 'video';
  date: string;
}

export type ViewState = 'AUTH' | 'ONBOARDING' | 'DASHBOARD' | 'PLAYER' | 'LIBRARY' | 'POSE_DETAIL' | 'JOURNEY' | 'PLAN_EDITOR' | 'ROUTINE_EDITOR' | 'LEARNING' | 'STORIES';