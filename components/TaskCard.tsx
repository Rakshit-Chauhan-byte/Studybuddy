// ──────────────────────────────────────────────
// TaskCard – displays a single study task
// ──────────────────────────────────────────────

import type { StudyTask } from "@/lib/types";

interface TaskCardProps {
  task: StudyTask;
  onToggleComplete?: (id: string) => void;
  onMarkMissed?: (id: string) => void;
}

export default function TaskCard({
  task,
  onToggleComplete,
  onMarkMissed,
}: TaskCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        task.completed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : task.missed
          ? "border-red-500/30 bg-red-500/5"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{task.title}</h3>
          <p className="mt-1 text-sm text-white/60">{task.description}</p>
          <span className="mt-2 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/50">
            {task.durationMinutes} min · Day {task.day}
          </span>
        </div>

        <div className="flex shrink-0 gap-2">
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(task.id)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-emerald-500 hover:text-emerald-400"
            >
              {task.completed ? "Undo" : "Done"}
            </button>
          )}
          {onMarkMissed && !task.completed && (
            <button
              onClick={() => onMarkMissed(task.id)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-red-500 hover:text-red-400"
            >
              Missed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
