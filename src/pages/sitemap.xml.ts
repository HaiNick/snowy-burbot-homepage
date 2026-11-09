import type { APIContext } from "astro";
import { getSite, getWriteups, isoDate } from "../lib/content";

// One entry per real page. Drafts, the 404 page, rss.xml, terminal.json and
// security.txt are left out on purpose: they're not pages a search engine should list.
export async function GET(context: APIContext) {
  const site = await getSite();
  const base = context.site!.toString().replace(/\/$/, "");
  const posts = (await getWriteups()).filter((p) => !p.data.draft);
  const newest = posts[0] ? isoDate(posts[0].data.date) : undefined;

  const pages: { path: string; lastmod?: string }[] = [
    { path: "/" },
    { path: "/writeups", lastmod: newest },
    ...posts.map((p) => ({ path: `/writeups/${p.id}`, lastmod: isoDate(p.data.date) })),
  ];
  for (const legal of [site.legal.impressum, site.legal.datenschutz]) {
    if (legal.startsWith("/")) pages.push({ path: legal });
  }

  const urls = pages
    .map((p) => `  <url>\n    <loc>${base}${p.path}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ""}\n  </url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
