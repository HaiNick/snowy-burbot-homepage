import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getSite, getWriteups } from "../lib/content";

export async function GET(context: APIContext) {
  const site = await getSite();
  const posts = await getWriteups();
  return rss({
    title: `${site.title} writeups`,
    description: site.description,
    site: context.site!,
    items: posts
      .filter((p) => !p.data.draft)
      .map((p) => ({
        title: p.data.title,
        pubDate: p.data.date,
        description: p.data.summary,
        link: `/writeups/${p.id}`,
        categories: p.data.tags,
      })),
  });
}
