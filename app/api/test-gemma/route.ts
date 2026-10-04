import { NextResponse } from "next/server";
import { askGemma } from "@/lib/ollama";

export async function GET() {
  try {
    const prompt = "Create a short 2-day plan for learning basic React. Include 2 tasks total.";
    const result = await askGemma(prompt);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "An unknown error occurred",
    }, { status: 500 });
  }
}
