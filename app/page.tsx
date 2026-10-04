"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import type { LearnerProfile, ClientPlan, ClientTask } from "@/lib/types";
import { setStudentDocument } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(profile: LearnerProfile) {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, today }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }

      const data = await res.json();
      const plan = data.plan;

      const clientTasks: ClientTask[] = plan.tasks.map((task: any, idx: number) => ({
        ...task,
        id: `task-${Date.now()}-${idx}`,
        status: "pending"
      }));

      const planData = {
        name: profile.name,
        goal: profile.goal,
        deadline: profile.deadline,
        dailyMinutes: profile.dailyMinutes,
        constraints: profile.constraints,
        strongTopics: profile.strongTopics,
        weakTopics: profile.weakTopics,
        planMessage: plan.message,
        version: 1,
        tasks: clientTasks,
        adaptations: [],
        createdAt: new Date().toISOString()
      };

      await setStudentDocument("demo-user", planData);
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Hero */}
        {!showForm ? (
          <div className="text-center">
            {/* Floating icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-lg shadow-indigo-500/10 backdrop-blur-sm">
              📚
            </div>

            <h1 className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold leading-tight text-transparent">
              StudyBuddy
            </h1>

            <p className="mx-auto mt-4 max-w-md text-lg text-white/50">
              Your AI-powered study planner. Tell us what you&apos;re learning,
              and we&apos;ll create a personalised, adaptive plan — powered
              by local AI.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-10 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              Get Started →
            </button>

            <p className="mt-4 text-xs text-white/30">
              No sign-up required. Runs locally with Ollama.
            </p>
          </div>
        ) : (
          /* Onboarding form */
          <div>
            <button
              onClick={() => {
                if (!loading) setShowForm(false);
              }}
              className="mb-6 text-sm text-white/40 transition hover:text-white/70"
            >
              ← Back
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-sm sm:p-8">
              <h2 className="text-2xl font-bold text-white">
                Set Up Your Plan
              </h2>
              
              <div className="mt-6">
                {!loading ? (
                  <ProfileForm onSubmit={handleSubmit} />
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent mb-4" />
                    <p className="text-lg font-medium text-indigo-400">Gemma is building your study plan...</p>
                    <p className="text-sm text-white/50 mt-2">This may take a minute.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
