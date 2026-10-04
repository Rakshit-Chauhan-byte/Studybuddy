# StudyBuddy

### Adaptive AI Study Planner

StudyBuddy is an AI-powered study planner that creates personalized study schedules and adapts them when real life gets in the way.

Instead of expecting students to follow a rigid schedule, StudyBuddy allows the plan to change based on missed tasks, the reason they were missed, remaining study time, and future priorities.

> **The student shouldn't have to adapt to the study plan. The study plan should adapt to the student.**

---

## ✨ Features

- 📚 Personalized study plan generation
- 🎯 Goal-based planning
- ⏱️ Daily study-time limits
- 💪 Strong and weak topic prioritization
- 📊 Study progress tracking
- ✅ Task completion tracking
- ⚠️ Missed-task tracking
- 🔄 Adaptive replanning
- 📝 Missed-task reasons such as:
  - Surprise assignment
  - Exhaustion
  - Sickness
  - Not enough time
  - Other
- 🤖 AI-generated explanations for plan adaptations
- 🏠 Local AI inference using Gemma 3 4B + Ollama
- 🔒 Server-side validation of AI-generated plans

---

## 🧠 How Adaptive Planning Works

StudyBuddy does more than generate a fixed schedule.

When a student misses a task:

```text
Original Plan
      ↓
Task Missed
      ↓
Student Provides Reason
      ↓
StudyBuddy Evaluates Remaining Capacity
      ↓
Gemma Reorganizes Future Tasks
      ↓
Adapted Study Plan
