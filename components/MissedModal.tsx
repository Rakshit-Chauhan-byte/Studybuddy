"use client";

import { useState } from "react";
import type { ClientTask } from "@/lib/types";

interface MissedModalProps {
  isOpen: boolean;
  task: ClientTask | null;
  onConfirm: (reason: string, explanation: string) => void;
  onCancel: () => void;
}

const REASONS = [
  "Surprise assignment",
  "Exhausted",
  "Sick",
  "Not enough time",
  "Other"
];

export default function MissedModal({
  isOpen,
  task,
  onConfirm,
  onCancel,
}: MissedModalProps) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [explanation, setExplanation] = useState("");

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Why did you miss this task?
        </h2>
        <p className="text-sm text-white/60 mb-6">
          Task: <span className="text-indigo-400">{task.title}</span>
        </p>

        <div className="space-y-3 mb-6">
          {REASONS.map(r => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="reason" 
                value={r} 
                checked={selectedReason === r}
                onChange={() => setSelectedReason(r)}
                className="text-indigo-500 focus:ring-indigo-500 bg-gray-800 border-white/20"
              />
              <span className="text-sm text-white">{r}</span>
            </label>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-white/70 mb-2">
            Tell us what happened (optional)
          </label>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="e.g., I had a surprise lab record submission..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none h-20"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedReason, explanation);
              setSelectedReason(REASONS[0]);
              setExplanation("");
            }}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Mark Missed & Adapt Plan
          </button>
        </div>
      </div>
    </div>
  );
}
