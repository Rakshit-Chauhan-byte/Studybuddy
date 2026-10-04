"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentDocument, setStudentDocument, updateStudentTasks } from "@/lib/firebase";
import type { StudentDocument } from "@/lib/firebase";
import type { ClientTask, MissedReason, GeneratedPlan } from "@/lib/types";
import MissedModal from "@/components/MissedModal";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Missed Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToMiss, setTaskToMiss] = useState<ClientTask | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptError, setAdaptError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const doc = await getStudentDocument("demo-user");
        setData(doc);
      } catch (err) {
        console.error("Failed to load plan", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-center">
        <div className="text-white/70">
          <p className="text-xl">No study plan found. Create your plan first.</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-indigo-500"
          >
            Go to Onboarding
          </button>
        </div>
      </main>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const allTasks: ClientTask[] = data.tasks || [];

  const todayTasks = allTasks.filter(t => t.date === todayStr);
  const upcomingTasks = allTasks.filter(t => t.date > todayStr);

  const completedToday = todayTasks.filter(t => t.status === "done").length;
  const totalToday = todayTasks.length;
  const completedMinsToday = todayTasks.filter(t => t.status === "done").reduce((acc, t) => acc + t.minutes, 0);
  const totalMinsToday = todayTasks.reduce((acc, t) => acc + t.minutes, 0);

  const progressPercent = totalMinsToday === 0 ? 0 : Math.round((completedMinsToday / totalMinsToday) * 100);

  const upcomingGrouped = upcomingTasks.reduce((acc: any, task: ClientTask) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
  const upcomingDates = Object.keys(upcomingGrouped).sort();

  async function handleDone(taskId: string) {
    if (!data) return;
    const newTasks = allTasks.map(t => t.id === taskId ? { ...t, status: "done" as const } : t);
    setData({ ...data, tasks: newTasks });
    try {
      await updateStudentTasks("demo-user", newTasks);
    } catch (err) {
      console.error("Failed to update status in Firestore", err);
      setData(data); // Revert
    }
  }

  function handleMissedClick(task: ClientTask) {
    setTaskToMiss(task);
    setIsModalOpen(true);
  }

  async function handleAdaptPlan(reason: string, explanation: string) {
    if (!data || !taskToMiss) return;
    
    setIsModalOpen(false);
    setIsAdapting(true);
    setAdaptError("");

    const missedReason: MissedReason = {
      reason,
      explanation,
      taskId: taskToMiss.id,
      date: taskToMiss.date,
      timestamp: new Date().toISOString()
    };

    // Calculate pending future tasks to be replaced
    const pendingFutureTasks = allTasks.filter(t => t.date >= todayStr && t.status === "pending" && t.id !== taskToMiss.id);
    const nonPendingFutureTasks = allTasks.filter(t => t.date >= todayStr && t.status !== "pending" && t.id !== taskToMiss.id);
    const pastTasks = allTasks.filter(t => t.date < todayStr);

    // Remaining available time
    const remainingAvailableTime: Record<string, number> = {};
    const maxDate = new Date(data.deadline || new Date().toISOString());
    const dailyMins = data.dailyMinutes || 120;
    
    for (let d = new Date(todayStr); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().split("T")[0];
      const usedMins = nonPendingFutureTasks.filter(t => t.date === dStr).reduce((acc, t) => acc + t.minutes, 0);
      remainingAvailableTime[dStr] = Math.max(0, dailyMins - usedMins);
    }

    try {
      const res = await fetch("/api/adapt-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: data,
          today: todayStr,
          missedTask: taskToMiss,
          missedReason,
          recentTaskHistory: pastTasks.slice(-10),
          pendingFutureTasks,
          remainingAvailableTime
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to adapt plan");
      }

      const responseData = await res.json();
      const adaptedPlan: GeneratedPlan = responseData.plan;

      // Map to ClientTasks
      const adaptedClientTasks: ClientTask[] = adaptedPlan.tasks.map((task: any, idx: number) => ({
        ...task,
        id: `task-adapted-${Date.now()}-${idx}`,
        status: "pending"
      }));

      // Merge tasks: Past + NonPendingFuture + MissedTask(updated) + AdaptedPending
      const updatedMissedTask: ClientTask = { ...taskToMiss, status: "missed" };
      const finalTasks = [
        ...pastTasks,
        ...nonPendingFutureTasks,
        updatedMissedTask,
        ...adaptedClientTasks
      ].sort((a, b) => a.date.localeCompare(b.date));

      const newAdaptations = [...(data.adaptations || []), missedReason];
      const newVersion = (data.version || 1) + 1;

      const newData = {
        ...data,
        tasks: finalTasks,
        planMessage: adaptedPlan.message,
        version: newVersion,
        adaptations: newAdaptations
      };

      await setStudentDocument("demo-user", newData);
      setData(newData);

    } catch (err: any) {
      console.error(err);
      setAdaptError(err.message || "Failed to adapt plan. The original plan has been kept.");
    } finally {
      setIsAdapting(false);
      setTaskToMiss(null);
    }
  }

  // Find the latest missed reason if any
  const latestAdaptation = data.adaptations && data.adaptations.length > 0 
    ? data.adaptations[data.adaptations.length - 1] 
    : null;

  return (
    <main className="min-h-screen bg-gray-950 p-6 sm:p-12 text-white relative">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* HEADER */}
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hello, {data.name}</h1>
              <p className="text-lg text-white/70 mb-4">Goal: <span className="text-white">{data.goal}</span></p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="rounded-lg bg-white/10 px-3 py-1.5">
                  <span className="text-white/50">Deadline:</span> {data.deadline}
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-1.5">
                  <span className="text-white/50">Daily Limit:</span> {data.dailyMinutes} mins
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-1.5">
                  <span className="text-white/50">Version:</span> {data.version || 1}
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Gemma 3 4B • Local inference via Ollama
              </div>
            </div>
          </div>
        </header>

        {/* ADAPTATION ERROR */}
        {adaptError && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-200">
            <strong>Error adapting plan:</strong> {adaptError}
          </div>
        )}

        {/* ADAPTATION BANNER */}
        {latestAdaptation && data.planMessage && data.version && data.version > 1 && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-900/10 p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500/20 text-amber-400">
                    ✨
                  </div>
                  <h3 className="font-semibold text-amber-400 text-lg">Adaptive Planning Active</h3>
                </div>
                
                <div className="flex flex-col gap-2 mb-4 text-sm font-medium">
                  <div className="flex items-center gap-3 text-white/50 line-through">
                    <span className="w-2 h-2 rounded-full bg-white/30"></span>
                    Original Plan
                  </div>
                  <div className="flex items-center gap-3 text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-400/50"></span>
                    Missed Task: {latestAdaptation.reason}
                  </div>
                  <div className="flex items-center gap-3 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400/50"></span>
                    Adapted Plan
                  </div>
                </div>

                <div className="rounded-lg bg-black/20 p-4 border border-amber-500/10">
                  <p className="text-amber-100/90 leading-relaxed text-sm">
                    <span className="font-semibold text-amber-400">Gemma says:</span> {data.planMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADAPTING STATE */}
        {isAdapting && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-8 text-center animate-pulse">
            <h2 className="text-xl font-medium text-indigo-300">Adapting your study plan...</h2>
            <p className="text-sm text-indigo-300/70 mt-2">Redistributing tasks based on your available time.</p>
          </div>
        )}

        {/* TODAY'S PROGRESS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Today&apos;s Progress</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            {totalToday === 0 ? (
              <p className="text-white/50">No tasks scheduled for today.</p>
            ) : (
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium text-white/90">
                    {completedToday} / {totalToday} tasks
                  </span>
                  <span className="font-medium text-white/90">
                    {completedMinsToday} / {totalMinsToday} min
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* TODAY'S TASKS */}
        {totalToday > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Today&apos;s Tasks</h2>
            <div className="space-y-4">
              {todayTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onDone={() => handleDone(task.id)}
                  onMissed={() => handleMissedClick(task)}
                  missedReason={data.adaptations?.find(a => a.taskId === task.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING TASKS */}
        {upcomingDates.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white/50">Upcoming Tasks</h2>
            <div className="space-y-8">
              {upcomingDates.map(date => (
                <div key={date} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{date}</h3>
                    <span className="text-sm text-white/50">
                      {upcomingGrouped[date].reduce((sum: number, t: ClientTask) => sum + t.minutes, 0)} mins
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {upcomingGrouped[date].map((task: ClientTask) => (
                      <div key={task.id} className="p-6">
                        <TaskCard 
                          task={task} 
                          onDone={() => handleDone(task.id)}
                          onMissed={() => handleMissedClick(task)}
                          missedReason={data.adaptations?.find(a => a.taskId === task.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <MissedModal 
        isOpen={isModalOpen}
        task={taskToMiss}
        onConfirm={handleAdaptPlan}
        onCancel={() => {
          setIsModalOpen(false);
          setTaskToMiss(null);
        }}
      />
    </main>
  );
}

function TaskCard({ 
  task, 
  onDone, 
  onMissed,
  missedReason 
}: { 
  task: ClientTask, 
  onDone: () => void, 
  onMissed: () => void,
  missedReason?: MissedReason
}) {
  const isPending = task.status === "pending";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 ${task.status === "missed" ? 'opacity-75' : ''}`}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {task.topic}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70 capitalize">
            {task.kind}
          </span>
        </div>
        <h4 className={`text-lg font-medium text-white mb-1 ${task.status === "missed" ? 'line-through text-white/50' : ''}`}>
          {task.title}
        </h4>
        
        {!isPending && (
          <div className="mt-2 flex flex-col gap-1">
            <span className={`text-sm font-medium ${task.status === "done" ? "text-emerald-400" : "text-rose-400"}`}>
              Status: {task.status}
            </span>
            {task.status === "missed" && missedReason && (
              <span className="text-xs text-rose-300/70">
                Reason: {missedReason.reason}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium">
          {task.minutes} min
        </span>
        
        {isPending && (
          <div className="flex gap-2">
            <button 
              onClick={onDone}
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/30"
            >
              ✓ Done
            </button>
            <button 
              onClick={onMissed}
              className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/30"
            >
              ✗ Missed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
