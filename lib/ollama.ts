// ──────────────────────────────────────────────
// StudyBuddy – Ollama API client
// ──────────────────────────────────────────────

const OLLAMA_BASE =
  process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma3:4b";

export interface StudyPlanTask {
  date: string;
  topic: string;
  title: string;
  minutes: number;
  kind: "learn" | "practice" | "review";
}

export interface GeneratedPlan {
  message: string;
  tasks: StudyPlanTask[];
}

/**
 * Ask Gemma to generate a study plan.
 * Uses plain fetch without external SDKs.
 */
export async function askGemma(prompt: string): Promise<GeneratedPlan> {
  const jsonSchema = {
    type: "object",
    properties: {
      message: { type: "string" },
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string" },
            topic: { type: "string" },
            title: { type: "string" },
            minutes: { type: "number" },
            kind: { type: "string", enum: ["learn", "practice", "review"] },
          },
          required: ["date", "topic", "title", "minutes", "kind"],
        },
      },
    },
    required: ["message", "tasks"],
  };

  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      keep_alive: "30m",
      format: jsonSchema,
      options: {
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.message?.content;

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  try {
    const parsed = JSON.parse(content) as GeneratedPlan;
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse Ollama response as JSON: ${err}`);
  }
}
