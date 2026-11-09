// Shared helpers for the content scripts. Uses the yaml Document API,
// so comments and formatting in the YAML files survive an edit.
import { readFileSync, writeFileSync } from "node:fs";
import { parseDocument } from "yaml";

export function load(path) {
  return parseDocument(readFileSync(path, "utf8"));
}

export function save(path, doc) {
  writeFileSync(path, doc.toString({ lineWidth: 0 }));
}

export function today() {
  // Local date in Europe/Berlin, as YYYY-MM-DD
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

export function slug(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// The file's header comment is stored on the first list item.
// Run `change` and move that comment to whatever item ends up first.
export function keepHeader(seq, change) {
  const header = seq.items[0]?.commentBefore;
  if (seq.items[0]) seq.items[0].commentBefore = undefined;
  change();
  if (header && seq.items[0]) seq.items[0].commentBefore = header;
}
