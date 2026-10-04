"use client";

import { useState } from "react";
import type { LearnerProfile } from "@/lib/types";

interface ProfileFormProps {
  onSubmit: (profile: LearnerProfile) => void;
}

export default function ProfileForm({ onSubmit }: ProfileFormProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [constraints, setConstraints] = useState("");
  const [strongTopics, setStrongTopics] = useState("");
  const [weakTopics, setWeakTopics] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parseTopics = (str: string) => 
      str.split(",").map(t => t.trim()).filter(t => t.length > 0);

    onSubmit({
      name,
      goal,
      deadline,
      dailyMinutes,
      constraints,
      strongTopics: parseTopics(strongTopics),
      weakTopics: parseTopics(weakTopics),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Goal</label>
        <textarea
          required
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Prepare for software engineering internship interviews"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Deadline</label>
        <input
          required
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Daily Study Time (minutes): {dailyMinutes}</label>
        <input
          required
          type="number"
          min={15}
          max={600}
          step={15}
          value={dailyMinutes}
          onChange={(e) => setDailyMinutes(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Constraints</label>
        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="e.g., College during daytime; prefer evening study"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Strong Topics (comma-separated)</label>
        <input
          type="text"
          value={strongTopics}
          onChange={(e) => setStrongTopics(e.target.value)}
          placeholder="e.g., Arrays, Strings"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Weak Topics (comma-separated)</label>
        <input
          type="text"
          value={weakTopics}
          onChange={(e) => setWeakTopics(e.target.value)}
          placeholder="e.g., Graphs, Dynamic Programming"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none"
      >
        Generate My Study Plan
      </button>
    </form>
  );
}
