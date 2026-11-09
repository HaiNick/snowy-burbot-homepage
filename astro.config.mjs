// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeMermaid from "rehype-mermaid";
import rehypeMermaidCsp from "./src/lib/rehype-mermaid-csp.mjs";

// Boxes are sized from these at build time. Keep the font size in step with
// .mermaid-fig svg in global.css.
const MERMAID_FONT = '"Google Sans Code Variable", monospace';
const MERMAID_FONT_SIZE = 13;

export default defineConfig({
  site: "https://snowy-burbot.com",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
    inlineStylesheets: "never",
  },
  markdown: {
    // Prism outputs classes. Shiki outputs style="" attributes, which the CSP blocks.
    syntaxHighlight: { type: "prism", excludeLangs: ["math", "mermaid"] },
    processor: unified({
      rehypePlugins: [
        [rehypeMermaid, {
          strategy: "inline-svg",
          css: import.meta.resolve("@fontsource-variable/google-sans-code/index.css"),
          mermaidConfig: {
            fontFamily: MERMAID_FONT,
            fontSize: MERMAID_FONT_SIZE,
            htmlLabels: false,
            themeVariables: { fontFamily: MERMAID_FONT, fontSize: `${MERMAID_FONT_SIZE}px` },
            flowchart: { htmlLabels: false },
            sequence: {
              actorFontSize: MERMAID_FONT_SIZE,
              messageFontSize: MERMAID_FONT_SIZE,
              noteFontSize: MERMAID_FONT_SIZE,
            },
          },
        }],
        rehypeMermaidCsp,
      ],
    }),
  },
  // External files only, so nginx can send a strict Content-Security-Policy
  // without unsafe-inline.
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
