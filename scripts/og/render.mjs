// Renders public/og.png (1200x630) from og.html.
// Needs a Playwright browser: npx playwright install chromium
// Run from the repo root: node scripts/og/render.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
const here = new URL(".", import.meta.url);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(new URL("og.html", here).href);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: fileURLToPath(new URL("../../public/og.png", here)) });
await b.close();
