import { NextResponse } from "next/server";
import { random } from "@/lib/dictionary";

// Never cache — every hit should return a fresh random word.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(random());
}
