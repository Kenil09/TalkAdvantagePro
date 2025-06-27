import { generateRealtimeToken } from "@/lib/assemblyai/utils";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server: ASSEMBLYAI_API_KEY not set" },
        { status: 500 }
      );
    }
    try {
      const token = await generateRealtimeToken(apiKey);
      return NextResponse.json({ token });
    } catch (error) {
      console.error("Error generating token:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to generate token",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in token API route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
