#!/usr/bin/env node
// Update the "now" window.
//
//   npm run now -- "Setting up fail2ban"          replace the list with one item
//   npm run now -- --add "Porting Bioma"          add an item at the top
//   npm run now -- --done homepage                remove the item with this id
//   npm run now -- --list                         print the current items
//
// The list is capped at 5 items; the oldest drop off.
import { load, save, today, slug, fail, keepHeader } from "./lib.mjs";
import { YAMLSeq } from "yaml";

const FILE = "src/content/now.yaml";
const MAX = 5;
const args = process.argv.slice(2);
const doc = load(FILE);
let seq = doc.contents;
if (!(seq instanceof YAMLSeq)) { seq = new YAMLSeq(); doc.contents = seq; }

const item = (text) => doc.createNode({ id: slug(text) || `item-${Date.now()}`, since: today(), text });

if (args[0] === "--list" || args.length === 0) {
  for (const n of seq.items) console.log(`${n.get("id")}\t${n.get("since")}\t${n.get("text")}`);
  process.exit(0);
}

keepHeader(seq, () => {
if (args[0] === "--done") {
  const id = args[1] ?? fail("Usage: npm run now -- --done ID");
  const before = seq.items.length;
  seq.items = seq.items.filter((n) => n.get("id") !== id);
  if (seq.items.length === before) fail(`No item with id "${id}". Run: npm run now -- --list`);
} else if (args[0] === "--add") {
  const text = args.slice(1).join(" ").trim() || fail("Usage: npm run now -- --add \"text\"");
  seq.items.unshift(item(text));
  seq.items = seq.items.slice(0, MAX);
} else {
  const text = args.join(" ").trim();
  seq.items = [item(text)];
}
});

// Keep dates quoted so YAML doesn't turn them into Date objects.
for (const n of seq.items) {
  const s = n.get("since", true);
  if (s) s.type = "QUOTE_DOUBLE";
}

save(FILE, doc);
console.log(`Updated ${FILE} (${seq.items.length} item${seq.items.length === 1 ? "" : "s"}).`);
