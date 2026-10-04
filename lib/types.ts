// ──────────────────────────────────────────────
// StudyBuddy – shared type definitions
// ──────────────────────────────────────────────

export interface LearnerProfile {
  name: string;
  goal: string;
  deadline: string; // YYYY-MM-DD
  dailyMinutes: number;
  constraints: string;
  strongTopics: string[];
  weakTopics: string[];
  // Legacy fields
  subject?: string;
  targetDate?: string;
  dailyHours?: number;
  learningStyle?: string;
}

export interface GeneratedTask {
  date: string;
  topic: string;
  title: string;
  minutes: number;
  kind: "learn" | "practice" | "review";
}

export interface GeneratedPlan {
  message: string;
  tasks: GeneratedTask[];
}

export interface ClientTask extends GeneratedTask {
  id: string;
  status: "pending" | "done" | "missed";
}

export interface MissedReason {
  reason: string;
  explanation: string;
  taskId: string;
  date: string;
  timestamp: string;
}

export interface ClientPlan {
  id: string;
  profile: LearnerProfile;
  tasks: ClientTask[];
  createdAt: string;
  version?: number;
  planMessage?: string;
  adaptations?: MissedReason[];
}

// ──────────────────────────────────────────────
// Legacy Types for other parts of the app
// ──────────────────────────────────────────────

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  day: number;
  completed: boolean;
  missed: boolean;
}

export interface StudyPlan {
  id: string;
  profile: any;
  tasks: StudyTask[];
  createdAt: string;
  modelUsed: string;
}

export interface AdaptPlanResponse {
  plan: StudyPlan;
  adapted: boolean;
  model: string;
}

