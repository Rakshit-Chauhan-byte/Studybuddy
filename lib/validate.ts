// ──────────────────────────────────────────────
// StudyBuddy – input validation helpers
// ──────────────────────────────────────────────

import type { LearnerProfile } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

/** Validate a LearnerProfile and return a list of errors (empty = valid). */
export function validateProfile(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [{ field: "root", message: "Request body must be an object" }];
  }

  const d = data as Record<string, unknown>;

  if (!d.name || typeof d.name !== "string" || d.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (
    !d.subject ||
    typeof d.subject !== "string" ||
    d.subject.trim().length === 0
  ) {
    errors.push({ field: "subject", message: "Subject is required" });
  }

  if (
    typeof d.dailyHours !== "number" ||
    d.dailyHours < 0.5 ||
    d.dailyHours > 16
  ) {
    errors.push({
      field: "dailyHours",
      message: "Daily hours must be between 0.5 and 16",
    });
  }

  if (!d.targetDate || typeof d.targetDate !== "string") {
    errors.push({ field: "targetDate", message: "Target date is required" });
  } else {
    const target = new Date(d.targetDate);
    if (isNaN(target.getTime()) || target <= new Date()) {
      errors.push({
        field: "targetDate",
        message: "Target date must be a valid future date",
      });
    }
  }

  const validStyles = ["visual", "reading", "practice", "mixed"];
  if (!d.learningStyle || !validStyles.includes(d.learningStyle as string)) {
    errors.push({
      field: "learningStyle",
      message: `Learning style must be one of: ${validStyles.join(", ")}`,
    });
  }

  return errors;
}

/** Type-guard: narrow unknown data to LearnerProfile after validation */
export function isValidProfile(data: unknown): data is LearnerProfile {
  return validateProfile(data).length === 0;
}
