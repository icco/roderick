import { fixupPluginRules } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next's bundled babel parser returns a pre-ESLint-10 scope
// manager (no addGlobals); reuse its typescript-eslint parser everywhere.
const tsParser = nextCoreWebVitals.find(
  (c) => c.languageOptions?.parser?.meta?.name === "typescript-eslint/parser",
)?.languageOptions?.parser;

// eslint-config-next's bundled react plugin still calls the pre-ESLint-10
// getFilename() API; wrap it so it runs under ESLint 10.
const next = nextCoreWebVitals.map((c) => {
  const r = { ...c, files: c.files ?? ["**/*.{js,jsx,ts,tsx}"] };
  if (r.plugins?.react) {
    r.plugins = { ...r.plugins, react: fixupPluginRules(r.plugins.react) };
  }
  if (
    tsParser &&
    r.languageOptions?.parser?.meta?.name === "eslint-config-next/parser"
  ) {
    r.languageOptions = { ...r.languageOptions, parser: tsParser };
  }
  return r;
});

const config = [{ ignores: [".next/**", "node_modules/**"] }, ...next];

export default config;
