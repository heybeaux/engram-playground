import { NextResponse } from "next/server";
import { createDemoSession } from "@/lib/demo-session";

export async function POST() {
  const session = createDemoSession();
  return NextResponse.json(session);
}
