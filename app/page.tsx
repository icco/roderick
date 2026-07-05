import { relatedTo, windowAround, wordOfTheDay } from "@/lib/dictionary";
import Dictionary from "@/components/Dictionary";

// Landing page: the dictionary anchored on the word of the day.
export const dynamic = "force-dynamic";

const RADIUS = 60;

export default function Home() {
  const dateKey = new Date().toISOString().slice(0, 10);
  const wotd = wordOfTheDay(dateKey);
  const win = windowAround(wotd.word, RADIUS)!;

  return (
    <Dictionary
      key={wotd.word}
      initial={win.entries}
      initialStart={win.start}
      total={win.total}
      anchor={wotd.word}
      badge="Word of the day"
      related={relatedTo(wotd.word)}
    />
  );
}
