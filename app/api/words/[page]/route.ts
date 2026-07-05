import { NextResponse } from "next/server";
import { page as loadPage } from "@/lib/dictionary";

// Paginated browse feed for infinite scroll. Preserves the old
// /words/:page.json contract (100 entries/page, 1-indexed).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  const n = parseInt(page, 10);
  return NextResponse.json(loadPage(Number.isFinite(n) ? n : 1));
}
