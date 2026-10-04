// ──────────────────────────────────────────────
// StudyBuddy – fallback plan generator
// ──────────────────────────────────────────────
// Used when Ollama is unreachable so the app still works.

import type { LearnerProfile, StudyTask } from "./types";

/**
 * Generate a deterministic placeholder plan without hitting any LLM.
 * This keeps the app functional for demo / offline scenarios.
 */
export function generateFallbackPlan(profile: LearnerProfile): StudyTask[] {
  const target = new Date(profile.targetDate || new Date().toISOString());
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const daysToGenerate = Math.min(totalDays, 14); // cap at 2 weeks

  const tasks: StudyTask[] = [];
  let id = 1;

  for (let day = 1; day <= daysToGenerate; day++) {
    const minutesAvailable = (profile.dailyHours || 1) * 60;
    const sessionsPerDay = Math.max(1, Math.floor(minutesAvailable / 45));

    for (let s = 0; s < sessionsPerDay; s++) {
      tasks.push({
        id: `fallback-${id++}`,
        title: `${profile.subject} – Session ${s + 1}`,
        description: `Study ${profile.subject} for ~45 min (${profile.learningStyle} style). Review key concepts and practice.`,
        durationMinutes: 45,
        day,
        completed: false,
        missed: false,
      });
    }
  }

  return tasks;
}
