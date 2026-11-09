import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

// Every piece of text on the page comes from src/content/.
// The schemas below fail the build if a YAML file is malformed,
// so a script or CI job can edit content without breaking the site silently.

const site = defineCollection({
  loader: file("src/content/site.yaml"),
  schema: z.object({
    name: z.string(),
    handle: z.string(),
    title: z.string(),
    description: z.string(),
    role: z.string(),
    focus: z.string(),
    location: z.string(),
    timezone: z.string(),
    country: z.string(),
    intro: z.string(),
    fastfetch: z.object({
      logo: z.string(),
      wave: z.string(),
      rows: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
    email: z.string(),
    github: z.string().url(),
    cv: z.string().default(""),
    draftNote: z.string().default(""),
    contact: z.string(),
    lab: z.object({
      intro: z.string(),
      diagram: z.string(),
      diagramLabel: z.string(),
    }),
    security: z.object({
      contact: z.string(),
      expires: z.string(),
      languages: z.string().default("en, de"),
    }),
    legal: z.object({
      impressum: z.string().default(""),
      datenschutz: z.string().default(""),
    }),
  }),
});

const hosts = defineCollection({
  loader: file("src/content/hosts.yaml"),
  schema: z.object({
    name: z.string(),
    os: z.string(),
    role: z.string(),
    inLab: z.boolean().default(true),
    box: z.string().optional(),
    job: z.string().optional(),
    runs: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  loader: file("src/content/projects.yaml"),
  schema: z.object({
    name: z.string(),
    group: z.enum(["main", "small"]),
    summary: z.string(),
    note: z.string().optional(),
    link: z.string().url().optional(),
    linkText: z.string().optional(),
    order: z.number().default(0),
  }),
});

const changelog = defineCollection({
  loader: file("src/content/changelog.yaml"),
  schema: z.object({
    when: z.string(), // "2026-08" or "next"
    text: z.string(),
  }),
});

const now = defineCollection({
  loader: file("src/content/now.yaml"),
  schema: z.object({
    text: z.string(),
    since: z.string(), // ISO date, e.g. 2026-11-09
  }),
});

const writeups = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/writeups" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { site, hosts, projects, changelog, now, writeups };
