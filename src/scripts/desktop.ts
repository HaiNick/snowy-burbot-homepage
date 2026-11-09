// Progressive enhancement only. Without JavaScript the page is a normal
// document: bar links jump to sections and everything stays readable.

import { countryOf } from "../lib/tz-country";

const root = document.documentElement;
const lightMq = window.matchMedia("(prefers-color-scheme: light)");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Theme toggle */
const themeBtn = document.getElementById("theme-btn");
const isLight = () => {
  const t = root.getAttribute("data-theme");
  return t ? t === "light" : lightMq.matches;
};
const syncTheme = () => {
  if (themeBtn) themeBtn.textContent = isLight() ? "dark" : "light";
};
themeBtn?.addEventListener("click", () => {
  const next = isLight() ? "dark" : "light";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch { /* storage blocked */ }
  syncTheme();
});
lightMq.addEventListener("change", syncTheme);
syncTheme();

/* Clock: the visitor's time and country, or the site.yaml defaults if the
   browser reports no time zone or one without a country, such as UTC. */
const clock = document.getElementById("clock");
if (clock) {
  let fmt: Intl.DateTimeFormat | null = null;
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = countryOf(zone);
    if (country) {
      clock.dataset.tz = zone;
      const where = document.getElementById("clock-where");
      if (where) where.textContent = country;
      const name = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
      clock.closest(".clock")?.setAttribute("title", `Local time in ${name}`);
    }
  } catch { /* keep the defaults */ }
  try {
    fmt = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: clock.dataset.tz });
  } catch { fmt = null; }
  const tick = () => { if (fmt) clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

/* Window focus and fullscreen (home page only) */
const wins = Array.from(document.querySelectorAll<HTMLElement>(".desk.home .win"));
const wsLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".ws a[data-go]"));
const activeTitle = document.getElementById("active-title");
let scrim: HTMLDivElement | null = null;

const titleOf = (w: HTMLElement) => {
  const h = w.querySelector(".title h2, .title h1");
  const app = h?.querySelector(".app")?.textContent ?? "";
  return (h?.textContent ?? "").slice(app.length).trim();
};

function focusWin(w: HTMLElement, scroll: boolean) {
  wins.forEach((x) => x.classList.toggle("active", x === w));
  wsLinks.forEach((a) => a.setAttribute("aria-current", a.dataset.go === w.id ? "true" : "false"));
  if (activeTitle) activeTitle.textContent = titleOf(w);
  if (scroll) {
    const r = w.getBoundingClientRect();
    if (r.top < 40 || r.bottom > window.innerHeight) {
      w.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
    }
  }
}

function unmax() {
  const m = document.querySelector<HTMLElement>(".win.max");
  if (m) {
    m.classList.remove("max");
    const b = m.querySelector(".max-btn");
    if (b) { b.textContent = "[ ]"; b.setAttribute("aria-pressed", "false"); }
  }
  scrim?.remove();
  scrim = null;
}

function toggleMax(w: HTMLElement) {
  const was = w.classList.contains("max");
  unmax();
  if (was) return;
  scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.addEventListener("click", unmax);
  document.body.appendChild(scrim);
  w.classList.add("max");
  const b = w.querySelector(".max-btn");
  if (b) { b.textContent = "[x]"; b.setAttribute("aria-pressed", "true"); }
  focusWin(w, false);
}

if (wins.length) {
  wins.forEach((w) => {
    w.addEventListener("pointerdown", () => focusWin(w, false));
    w.addEventListener("focusin", () => focusWin(w, false));
    w.querySelector(".max-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMax(w);
    });
  });

  wsLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const w = document.getElementById(a.dataset.go ?? "");
      if (!w) return;
      e.preventDefault();
      unmax();
      focusWin(w, true);
      history.replaceState(null, "", `#${w.id}`);
    });
  });

  /* Tall windows stop at a set height on wide screens; "-- more --" opens them fullscreen */
  const folds = wins
    .filter((w) => ["w-about", "w-projects", "w-lab"].includes(w.id))
    .map((w) => {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "more";
      more.textContent = "-- more --";
      more.hidden = true;
      more.setAttribute("aria-label", `Show all of ${titleOf(w)}`);
      more.addEventListener("click", () => toggleMax(w));
      w.classList.add("fold");
      w.appendChild(more);
      return { w, more, body: w.querySelector<HTMLElement>(".body") };
    });
  const syncFolds = () => {
    folds.forEach(({ w, more, body }) => {
      if (!body || w.classList.contains("max")) return;
      const clipped = body.scrollHeight > body.clientHeight + 1;
      w.classList.toggle("clipped", clipped);
      more.hidden = !clipped;
    });
  };
  syncFolds();
  window.addEventListener("resize", syncFolds);
  document.fonts?.ready.then(syncFolds);

  const fromHash = document.getElementById(location.hash.slice(1));
  if (fromHash && wins.includes(fromHash)) focusWin(fromHash, false);

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target as HTMLElement).tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    const n = Number(e.key);
    if (n >= 1 && n <= wsLinks.length) {
      const w = document.getElementById(wsLinks[n - 1].dataset.go ?? "");
      if (w) { unmax(); focusWin(w, true); }
    } else if (e.key === "f") {
      const a = document.querySelector<HTMLElement>(".win.active");
      if (a) toggleMax(a);
    } else if (e.key === "Escape") {
      unmax();
    }
  });
}

/* Copy email */
const copyBtn = document.getElementById("copy");
const mail = document.getElementById("mail");
if (copyBtn && mail) {
  copyBtn.addEventListener("click", () => {
    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents(mail);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
      copyBtn.textContent = "selected";
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(mail.textContent ?? "").then(() => { copyBtn.textContent = "copied"; }, fallback);
    } else {
      fallback();
    }
    setTimeout(() => { copyBtn.textContent = "copy"; }, 2000);
  });
}

/* 404: show the path that was requested */
const pathEl = document.getElementById("path");
if (pathEl) pathEl.textContent = location.pathname;
