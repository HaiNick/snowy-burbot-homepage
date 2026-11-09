#!/usr/bin/env node
// Add a changelog entry (the git log window).
//
//   npm run log -- "Moved Pocket ID to the NAS"            uses the current month
//   npm run log -- 2026-12 "Moved Pocket ID to the NAS"    explicit month
//   npm run log -- next "Akashi replaces Caddy"            replaces the "next" entry
//
// Entries stay newest first. The "next" entry always stays on top.
import { load, save, today, slug, fail, keepHeader } from "./lib.mjs";

const FILE = "src/content/changelog.yaml";
const args = process.argv.slice(2);
if (args.length === 0) fail('Usage: npm run log -- [YYYY-MM|next] "text"');

let when = today().slice(0, 7);
if (/^\d{4}-\d{2}$/.test(args[0]) || args[0] === "next") when = args.shift();
const text = args.join(" ").trim() || fail("Missing text.");

const doc = load(FILE);
const seq = doc.contents;
const node = doc.createNode({ id: when === "next" ? "next" : `${when}-${slug(text)}`, when, text });
node.get("when", true).type = "QUOTE_DOUBLE";

keepHeader(seq, () => {
if (when === "next") {
  seq.items = seq.items.filter((n) => n.get("when") !== "next");
  seq.items.unshift(node);
} else {
  const hasNext = seq.items[0]?.get("when") === "next";
  seq.items.splice(hasNext ? 1 : 0, 0, node);
}
});

save(FILE, doc);
console.log(`Added to ${FILE}: ${when}  ${text}`);
