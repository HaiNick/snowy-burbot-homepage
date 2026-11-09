import { getCollection, getEntry } from "astro:content";

export async function getSite() {
  const entry = await getEntry("site", "site");
  if (!entry) throw new Error("src/content/site.yaml needs a top-level `site:` key");
  return entry.data;
}

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getHosts() {
  return (await getCollection("hosts")).sort(byOrder);
}

export async function getProjects() {
  return (await getCollection("projects")).sort(byOrder);
}

// Newest first, with the "next" entry always on top.
export async function getChangelog() {
  const all = await getCollection("changelog");
  const rank = (w: string) => (w === "next" ? "9999-99" : w);
  return all.sort((a, b) => rank(b.data.when).localeCompare(rank(a.data.when)));
}

// Newest first.
export async function getNow() {
  const all = await getCollection("now");
  return all.sort((a, b) => b.data.since.localeCompare(a.data.since));
}

// Drafts show up in `npm run dev` but never in a production build.
export async function getWriteups() {
  const all = await getCollection("writeups", ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// Published legal pages only. Fails the build if one still has a placeholder.
export async function getLegal() {
  const all = await getCollection("legal", ({ data }) => !data.draft);
  for (const page of all) {
    const left = page.body?.match(/\[\[[^\]]+\]\]/g);
    if (left) {
      throw new Error(`src/content/legal/${page.id}.md is published but still has placeholders: ${[...new Set(left)].join(", ")}`);
    }
  }
  return all.sort((a, b) => a.id.localeCompare(b.id));
}
