import Link from "next/link";

type Entry = { word: string; definition: string };

// One dictionary entry. The highlighted (anchor) entry is emphasized with the
// theme primary color + a left rule, carries an optional badge and "see also"
// chips, and gets id="dict-anchor" so Dictionary can scroll it to center.
export default function EntryRow({
  entry,
  highlighted = false,
  badge,
  related,
}: {
  entry: Entry;
  highlighted?: boolean;
  badge?: string;
  related?: string[];
}) {
  return (
    <article
      id={highlighted ? "dict-anchor" : undefined}
      className={
        "border-b border-base-300 py-4" +
        (highlighted ? " -ml-4 border-l-4 border-l-primary pl-4" : "")
      }
    >
      {highlighted && badge && (
        <span className="badge badge-primary badge-sm mb-2">{badge}</span>
      )}
      <Link
        href={`/word/${encodeURIComponent(entry.word)}`}
        scroll={false}
        className={
          highlighted
            ? "block text-2xl font-semibold text-primary hover:underline"
            : "block text-lg font-medium hover:text-primary hover:underline"
        }
      >
        {entry.word}
      </Link>
      <p className="mt-1 leading-relaxed text-base-content/90">
        {entry.definition}
      </p>
      {highlighted && related && related.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {related.map((w) => (
            <li key={w}>
              <Link
                href={`/word/${encodeURIComponent(w)}`}
                scroll={false}
                className="badge badge-outline hover:badge-primary"
              >
                {w}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
