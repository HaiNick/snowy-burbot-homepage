import type { APIContext } from "astro";
import { getSite } from "../../lib/content";

// RFC 9116. Values come from site.yaml, so bumping `expires` is a one-line change.
export async function GET(context: APIContext) {
  const site = await getSite();
  const base = context.site!.toString().replace(/\/$/, "");
  const body = [
    `Contact: ${site.security.contact}`,
    `Expires: ${site.security.expires}`,
    `Preferred-Languages: ${site.security.languages}`,
    `Canonical: ${base}/.well-known/security.txt`,
    "",
    "# Scope: snowy-burbot.com (this static site).",
    "# Please report issues privately. No bug bounty, but credit on request.",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
