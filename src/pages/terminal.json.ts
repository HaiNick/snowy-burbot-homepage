import { getChangelog, getHosts, getNow, getProjects, getSite, getWriteups, isoDate } from "../lib/content";

// The files behind the hidden terminal (src/scripts/eggs.ts): path -> text.
// Only text that is already on the page belongs here.
const lines = (...parts: (string | undefined)[]) => parts.filter(Boolean).join("\n");

export async function GET() {
  const [site, hosts, projects, changelog, now, writeups] = await Promise.all([
    getSite(), getHosts(), getProjects(), getChangelog(), getNow(), getWriteups(),
  ]);
  const files: Record<string, string> = {};

  files["about/README.md"] = `${site.intro}\n\n${site.role}. ${site.focus}. ${site.location}.`;
  files["about/tailscale-status.txt"] = hosts
    .map((h) => `100.x.x.x  ${h.data.name.padEnd(10)}  ${h.data.os.padEnd(5)}  ${h.data.role}`)
    .join("\n");

  for (const p of projects) {
    const path = p.data.group === "main" ? `projects/${p.data.name}/README.md` : `projects/small/${p.data.name}`;
    files[path] = lines(p.data.summary, p.data.note, p.data.link);
  }

  files["lab/README.md"] = site.lab.intro;
  files["lab/diagram.txt"] = site.lab.diagram;
  files["lab/git-log.txt"] = changelog.map((c) => `${c.data.when.padEnd(7)}  ${c.data.text}`).join("\n");
  for (const h of hosts.filter((x) => x.data.inLab)) {
    files[`lab/${h.data.name}.txt`] = lines(
      h.data.box && `box   ${h.data.box}`,
      h.data.job && `job   ${h.data.job}`,
      h.data.runs.length ? `runs  ${h.data.runs.join(", ")}` : undefined,
    );
  }

  for (const w of writeups) {
    files[`writeups/${w.id}.md`] = lines(w.data.title, isoDate(w.data.date), "", w.data.summary, "", `/writeups/${w.id}`);
  }

  files["now/now.txt"] = now.map((n) => `[ ] ${n.data.text} (since ${n.data.since})`).join("\n");
  files["contact/README.md"] = site.contact;
  files["contact/email.txt"] = site.email;

  return new Response(JSON.stringify(files), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
