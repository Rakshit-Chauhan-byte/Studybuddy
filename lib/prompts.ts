// ──────────────────────────────────────────────
// StudyBuddy – LLM prompt templates
// ──────────────────────────────────────────────

import type { LearnerProfile, StudyTask } from "./types";

/**
 * Build the prompt that asks the LLM to generate a study plan.
 * The response format is constrained to JSON for easy parsing.
 */
export function buildGeneratePlanPrompt(profile: LearnerProfile): string {
  return `You are StudyBuddy, an AI study planner. Generate a study plan as a JSON array of tasks.

Student profile:
- Name: ${profile.name}
- Subject: ${profile.subject}
- Daily study hours: ${profile.dailyHours}
- Target date: ${profile.targetDate}
- Learning style: ${profile.learningStyle}

Respond ONLY with a JSON array of objects. Each object must have:
- "title": short task title
- "description": what to do
- "durationMinutes": estimated minutes
- "day": day number (starting from 1)

Example format:
[{"title":"...","description":"...","durationMinutes":30,"day":1}]

Generate a realistic, actionable plan. Do not include any text outside the JSON array.`;
}

/**
 * Build the prompt that asks the LLM to adapt an existing plan
 * after the student missed certain tasks.
 */
export function buildAdaptPlanPrompt(
  profile: LearnerProfile,
  missedTasks: StudyTask[],
  remainingTasks: StudyTask[]
): string {
  return `You are StudyBuddy, an AI study planner. The student missed some tasks and needs an adapted plan.

Student profile:
- Name: ${profile.name}
- Subject: ${profile.subject}
- Daily study hours: ${profile.dailyHours}
- Target date: ${profile.targetDate}
- Learning style: ${profile.learningStyle}

Missed tasks:
${JSON.stringify(missedTasks, null, 2)}

Remaining tasks:
${JSON.stringify(remainingTasks, null, 2)}

Create an adapted plan that:
1. Redistributes missed content across remaining days
2. Keeps daily study time within ${profile.dailyHours} hours
3. Prioritises the most important missed topics

Respond ONLY with a JSON array of task objects (same format as above). Do not include any text outside the JSON array.`;
}
