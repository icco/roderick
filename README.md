# roderick

A dictionary that promotes exploring of words. Wander from word to word via
"see also" cross-references and nearby entries, discover the word of the day,
take a random leap, or search across 100,000+ definitions.

Built with Next.js (App Router) + React. The dictionary (GCIDE, public domain)
ships as `data/dict.json.gz` and is loaded into memory at server boot.

## Development

```sh
npm install
npm run dev      # http://localhost:8080
```

## Routes

- `/` — landing page (word of the day, random, search, infinite-scroll browse)
- `/word/[word]` — shareable per-word page with see-also + nearby words
- `/api/words/[page]` — paginated browse feed (100/page)
- `/api/search?q=` — full-text search
- `/api/random` — a random word (`/random` redirects to a random word page)
- `/healthz` — liveness/readiness probe (`{ "status": "ok", "words": N }`)

## Deployment

CI (`.github/workflows/docker.yml`) builds and publishes
`ghcr.io/icco/roderick:main` on every push to `main`. The container listens on
port `8080`.

```sh
docker build -t roderick .
docker run --rm -p 8080:8080 roderick
```

## Data

`data/dict.json.gz` is a gzipped `{ word: definition }` map derived from the
GCIDE source in `gcide/`. The `gcide/` directory is kept for provenance and is
excluded from the container image.

## Dictionary Sources

 * https://raw.githubusercontent.com/sujithps/Dictionary/master/Oxford%20English%20Dictionary.txt
 * http://wordlist.aspell.net/
 * http://www.gutenberg.org/ebooks/29765
 * http://wordnet.princeton.edu/wordnet/download/
 * https://en.wikipedia.org/wiki/DICT
 * http://www.dict.org/w/databases/dict
 * http://ftp.gnu.org/gnu/gcide/
 * https://en.wiktionary.org/wiki/Wiktionary:Public_domain_sources
 * http://www.ibiblio.org/webster/
