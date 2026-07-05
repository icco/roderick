import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lookup, relatedTo, windowAround } from "@/lib/dictionary";
import Dictionary from "@/components/Dictionary";

export const dynamic = "force-dynamic";

const RADIUS = 60;

type Params = { params: Promise<{ word: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { word } = await params;
  const entry = lookup(decodeURIComponent(word));
  if (!entry) return { title: "Word not found" };
  const description = entry.definition.slice(0, 155);
  return {
    title: entry.word,
    description,
    openGraph: {
      title: `${entry.word} · Roderick`,
      description,
      type: "article",
    },
  };
}

export default async function WordPage({ params }: Params) {
  const { word } = await params;
  const entry = lookup(decodeURIComponent(word));
  if (!entry) notFound();

  const win = windowAround(entry.word, RADIUS);
  if (!win) notFound();

  return (
    <Dictionary
      key={entry.word}
      initial={win.entries}
      initialStart={win.start}
      total={win.total}
      anchor={entry.word}
      related={relatedTo(entry.word)}
    />
  );
}
