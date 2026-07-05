import { describe, expect, it } from "vitest";

import {
  count,
  indexOf,
  lookup,
  range,
  search,
  windowAround,
} from "./dictionary";

describe("dictionary", () => {
  it("loads a non-trivial number of entries", () => {
    expect(count()).toBeGreaterThan(1000);
  });

  it("looks up case-insensitively and returns null for unknowns", () => {
    const a = lookup("happy");
    expect(a).not.toBeNull();
    expect(lookup("HAPPY")?.word).toBe(a?.word);
    expect(lookup("zzzznotaword")).toBeNull();
  });

  it("range clamps to bounds", () => {
    expect(range(-10, 5)).toHaveLength(5); // clamps start up to 0
    expect(range(count() - 2, 100)).toHaveLength(2); // clamps end to length
  });

  it("indexOf agrees with browse order", () => {
    const first = range(0, 1)[0];
    expect(indexOf(first.word)).toBe(0);
    expect(indexOf("zzzznotaword")).toBe(-1);
  });

  it("windowAround centers the word and reports total", () => {
    const word = range(500, 1)[0].word;
    const win = windowAround(word, 10);
    expect(win).not.toBeNull();
    expect(win!.entries[win!.index - win!.start].word).toBe(word);
    expect(win!.total).toBe(count());
    expect(windowAround("zzzznotaword", 10)).toBeNull();
  });

  it("search finds a known headword", () => {
    const results = search("happy", 10);
    expect(results.some((e) => e.word.toLowerCase() === "happy")).toBe(true);
  });
});
