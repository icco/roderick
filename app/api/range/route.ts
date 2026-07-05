import { NextResponse } from "next/server";
import { range } from "@/lib/dictionary";

// Index-windowed browse feed for bidirectional infinite scroll.
// start = global index of the first entry to return; count is clamped 1..200.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawStart = parseInt(searchParams.get("start") ?? "0", 10);
  const rawCount = parseInt(searchParams.get("count") ?? "50", 10);
  const start = Number.isFinite(rawStart) ? Math.max(0, rawStart) : 0;
  const count = Number.isFinite(rawCount)
    ? Math.min(Math.max(rawCount, 1), 200)
    : 50;
  return NextResponse.json({ start, entries: range(start, count) });
}
