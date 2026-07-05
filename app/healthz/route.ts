import { NextResponse } from "next/server";
import { count } from "@/lib/dictionary";

// Cheap liveness + readiness probe. Touching count() forces the dictionary to
// load, so a 200 here also means the data parsed successfully at boot.
export async function GET() {
  return NextResponse.json({ status: "ok", words: count() });
}
