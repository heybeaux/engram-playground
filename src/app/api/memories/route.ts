import { NextRequest, NextResponse } from "next/server";
import { storeMemory, queryMemories, listMemories } from "@/lib/engram";
import { SIMULATED_MEMORIES } from "@/lib/demo-session";

// Store a memory
export async function POST(req: NextRequest) {
  try {
    const { userId, content, layer, isLive } = await req.json();

    if (!isLive) {
      // Simulated: return a fake memory
      const simMemory = {
        id: `sim-${Date.now()}`,
        raw: content,
        layer: layer || "EPISODIC",
        importanceScore: Math.random() * 0.5 + 0.4,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(simMemory);
    }

    const result = await storeMemory(userId, content, layer);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Memory store error:", error);
    return NextResponse.json(
      { error: "Failed to store memory" },
      { status: 500 }
    );
  }
}

// Query memories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const query = searchParams.get("query") || "";
    const isLive = searchParams.get("isLive") !== "false";

    if (!isLive) {
      return NextResponse.json({ memories: SIMULATED_MEMORIES });
    }

    if (query) {
      const result = await queryMemories(userId, query);
      return NextResponse.json(result);
    }

    const result = await listMemories(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Memory query error:", error);
    return NextResponse.json(
      { error: "Failed to query memories" },
      { status: 500 }
    );
  }
}
