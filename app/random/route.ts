import { redirect } from "next/navigation";
import { random } from "@/lib/dictionary";

// Plain link target for the "Surprise me" button — 307-redirects to a random
// word page. Works without JavaScript.
export const dynamic = "force-dynamic";

export async function GET() {
  const { word } = random();
  redirect(`/word/${encodeURIComponent(word)}`);
}
