// Easter eggs. Nothing here is needed to use the site.
// The CSP forbids inline styles, so the looks live in global.css and random
// values go through style.setProperty, which the CSP allows.

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const started = Date.now();
const FISH = "><(((°>";
const STILL = "holding still, as your system asked";

const between = (min: number, max: number) => min + Math.random() * (max - min);

/* Toast */
let toastTimer = 0;
function toast(text: string) {
  let el = document.querySelector<HTMLElement>(".egg-toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "egg-toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el?.remove(), 3500);
}

/* Effects. Each returns the line to show the visitor. */
function swim() {
  if (reduce.matches) return `${FISH} blub (${STILL})`;
  for (let i = 0; i < 7; i++) {
    const f = document.createElement("span");
    f.className = "egg-fish";
    f.textContent = FISH;
    f.setAttribute("aria-hidden", "true");
    f.style.setProperty("--y", `${between(8, 88)}vh`);
    f.style.setProperty("--size", `${between(0.8, 1.6)}rem`);
    f.style.setProperty("--dur", `${between(5, 10)}s`);
    f.style.setProperty("--wait", `${between(0, 2.5)}s`);
    f.addEventListener("animationend", () => f.remove());
    document.body.appendChild(f);
  }
  return `${FISH} blub`;
}

function toggleSnow() {
  const old = document.querySelector(".egg-snow");
  if (old) {
    old.remove();
    return "snow: off";
  }
  if (reduce.matches) return `snow: ${STILL}`;
  const snow = document.createElement("div");
  snow.className = "egg-snow";
  snow.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 50; i++) {
    const s = document.createElement("span");
    s.className = "egg-flake";
    s.textContent = "*";
    s.style.setProperty("--x", `${between(0, 100)}vw`);
    s.style.setProperty("--drift", `${between(-6, 6)}vw`);
    s.style.setProperty("--dur", `${between(7, 16)}s`);
    s.style.setProperty("--wait", `${between(-16, 0)}s`);
    snow.appendChild(s);
  }
  document.body.appendChild(snow);
  return "snow: on. burbot spawn under the ice, so this is good news";
}

function toggleParty() {
  if (reduce.matches) return `party: ${STILL}`;
  return root.classList.toggle("egg-party") ? "party: on" : "party: off";
}

function crash() {
  if (reduce.matches) return;
  root.classList.add("egg-crash");
  setTimeout(() => root.classList.remove("egg-crash"), 1800);
}

/* Terminal */
const wsLink = (name: string) =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>(".ws a[data-go]"))
    .find((a) => a.querySelector(".lbl")?.textContent === name);
const wsNames = () =>
  Array.from(document.querySelectorAll(".ws .lbl")).map((l) => l.textContent ?? "");
const minutesUp = () => Math.floor((Date.now() - started) / 60000);
const closeTerm = () => document.querySelector<HTMLDialogElement>(".egg-term")?.close();

// Path -> text. The jokes live here, the rest comes from /terminal.json.
const files = new Map([
  ["burbot.txt", "Burbot (Lota lota). The only freshwater member of the cod order.\nSpawns in midwinter, under the ice, while every sensible fish waits for spring.\nThat's the snowy part."],
  ["secrets.txt", "There are none. It's a static site."],
]);

let filesLoaded = false;
function loadFiles() {
  if (filesLoaded) return;
  filesLoaded = true;
  fetch("/terminal.json")
    .then((r) => r.json())
    .then((data: Record<string, string>) => Object.entries(data).forEach(([k, v]) => files.set(k, v)))
    .catch(() => { filesLoaded = false; });
}

function resolve(path: string) {
  const parts: string[] = [];
  for (const part of path.replace(/^(~|\/home\/visitor)(\/|$)/, "").split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return parts.join("/");
}

function allDirs() {
  const dirs = new Set(wsNames());
  for (const path of files.keys()) {
    const parts = path.split("/");
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/"));
  }
  return dirs;
}
const isDir = (path: string) => path === "" || allDirs().has(path);

// Names directly inside a directory. Directories come first and end in a slash.
function children(dir: string) {
  const prefix = dir ? `${dir}/` : "";
  const inside = (path: string) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/");
  const name = (path: string) => path.slice(prefix.length);
  return [
    ...[...allDirs()].filter(inside).map((d) => `${name(d)}/`),
    ...[...files.keys()].filter(inside).map(name),
  ];
}

function treeLines(dir: string, indent = ""): string[] {
  const items = children(dir);
  return items.flatMap((name, i) => {
    const last = i === items.length - 1;
    const line = `${indent}${last ? "`-- " : "|-- "}${name}`;
    if (!name.endsWith("/")) return [line];
    const sub = dir ? `${dir}/${name.slice(0, -1)}` : name.slice(0, -1);
    return [line, ...treeLines(sub, `${indent}${last ? "    " : "|   "}`)];
  });
}

function fetchInfo() {
  const light = getComputedStyle(root).colorScheme.includes("light");
  return [
    `${FISH}  visitor@snowy-burbot`,
    "",
    "wm        hyprland (in css)",
    `theme     tokyo night${light ? " day" : ""}`,
    "shell     not a real one",
    `uptime    ${minutesUp()} min`,
    "trackers  0",
  ].join("\n");
}

const leave = () => { closeTerm(); };
const noEditor = (name: string) => () => `${name}: not installed. :q still works, though.`;

const commands = new Map<string, (args: string[]) => string | void>([
  ["help", () => "help ls cd cat tree pwd echo whoami fetch date uptime theme snow burbot clear exit\nTab completes commands and paths. There are a few more. You'll find them."],
  ["ls", (args) => {
    const long = args.some((a) => /^-\w*l/.test(a));
    const targets = args.filter((a) => !a.startsWith("-"));
    return (targets.length ? targets : [""]).map((target) => {
      const path = resolve(target);
      if (!isDir(path)) return files.has(path) ? target : `ls: cannot access '${target}': No such file or directory`;
      const items = children(path);
      const body = long
        ? items.map((n) => `${n.endsWith("/") ? "drwxr-x" : "-rw-r--"}  ${n}`).join("\n")
        : items.join("  ");
      return targets.length > 1 ? `${target}:\n${body}` : body;
    }).join("\n\n");
  }],
  ["tree", (args) => {
    const path = resolve(args[0] ?? "");
    if (!isDir(path)) return `tree: ${args[0]}: Not a directory`;
    return [args[0] ?? ".", ...treeLines(path)].join("\n");
  }],
  ["tailscale", (args) => (args[0] === "status" ? files.get("about/tailscale-status.txt") : "usage: tailscale status")],
  ["git", (args) => (args[0] === "log" ? files.get("lab/git-log.txt") : "usage: git log")],
  ["pwd", () => "/home/visitor"],
  ["whoami", () => "visitor"],
  ["echo", (args) => args.join(" ")],
  ["date", () => new Date().toString()],
  ["uptime", () => `up ${minutesUp()} min, 1 user, load average: 0.00 0.00 0.00`],
  ["fetch", fetchInfo],
  ["neofetch", fetchInfo],
  ["fastfetch", fetchInfo],
  ["snow", toggleSnow],
  ["burbot", swim],
  ["party", toggleParty],
  ["theme", () => {
    document.getElementById("theme-btn")?.click();
    return `theme: ${root.getAttribute("data-theme")}`;
  }],
  ["cd", (args) => {
    const target = resolve(args[0] ?? "");
    if (!target) return "You're already home.";
    if (!isDir(target)) return `cd: ${args[0]}: ${files.has(target) ? "Not a directory" : "No such file or directory"}`;
    closeTerm();
    wsLink(target.split("/")[0])?.click();
  }],
  ["cat", (args) => {
    if (!args.length) return "=^.^=";
    return args.map((a) => {
      const path = resolve(a);
      return files.get(path) ?? `cat: ${a}: ${isDir(path) ? "Is a directory" : "No such file or directory"}`;
    }).join("\n");
  }],
  ["sudo", (args) => {
    if (args.join(" ") === "make me a sandwich") return "Okay.";
    return "visitor is not in the sudoers file. This incident will be reported.\n(The SOC is one apprentice. It'll get read after lunch.)";
  }],
  ["rm", (args) => {
    if (!args.some((a) => /^-\w*r/.test(a))) return "rm: nothing here is yours to remove";
    crash();
    return "rm: removing everything...\nrm: it's static files in a container. It'll be back in a second.";
  }],
  ["ssh", () => "ssh: Permission denied (publickey,nice-try)."],
  ["nmap", () => "nmap: this is a text box. All 0 ports are closed."],
  ["vim", noEditor("vim")],
  ["nvim", noEditor("nvim")],
  ["emacs", noEditor("emacs")],
  ["nano", noEditor("nano")],
  ["exit", leave],
  ["logout", leave],
  ["q", leave],
  [":q", leave],
  [":q!", leave],
  [":wq", leave],
]);

// Tab completion for the text before the caret. The first word is a command,
// later words are paths. Returns the new text and any options left to choose from.
function complete(before: string) {
  const start = before.search(/\S*$/);
  const word = before.slice(start);
  const isCommand = !before.slice(0, start).trim();
  const stem = isCommand ? "" : word.slice(0, word.lastIndexOf("/") + 1);
  const partial = word.slice(stem.length);
  const pool = isCommand
    ? ["clear", ...commands.keys()].filter((c) => /^[a-z]/.test(c)).sort()
    : children(resolve(stem));
  const options = pool.filter((o) => o.startsWith(partial));
  if (!options.length) return { text: before, options: [] };

  let common = options[0];
  for (const o of options) while (!o.startsWith(common)) common = common.slice(0, -1);
  const done = options.length === 1 && !common.endsWith("/");
  const text = `${before.slice(0, start)}${stem}${common}${done ? " " : ""}`;
  // Like bash: extend as far as possible first, list the options once it's stuck.
  return { text, options: options.length > 1 && common === partial ? options : [] };
}

const past: string[] = [];

function openTerm() {
  if (document.querySelector(".egg-term")) return;
  loadFiles();
  const term = document.createElement("dialog");
  term.className = "win active egg-term";
  term.setAttribute("aria-label", "Terminal");
  term.innerHTML = `
    <div class="title"><h2><span class="app">kitty</span>~</h2></div>
    <div class="egg-out" role="log"></div>
    <div class="egg-line">
      <label class="prompt" for="egg-in"><span class="u">visitor@snowy-burbot</span> ~</label>
      <input id="egg-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" />
    </div>`;
  const out = term.querySelector<HTMLElement>(".egg-out")!;
  const input = term.querySelector<HTMLInputElement>("input")!;
  let cursor = past.length;

  const print = (text: string, cls = "") => {
    const line = document.createElement("div");
    line.className = cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  };

  const run = (raw: string) => {
    const line = raw.trim();
    print(`~ ${line}`, "egg-cmd");
    if (!line) return;
    past.push(line);
    cursor = past.length;
    if (line === "clear") {
      out.textContent = "";
      return;
    }
    const [name, ...args] = line.split(/\s+/);
    const command = commands.get(name);
    const result = command ? command(args) : `bash: ${name}: command not found`;
    if (result) print(result);
  };

  // Stops desktop.ts from reacting to keys typed in here. Esc still closes the dialog.
  term.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      cursor = Math.min(past.length, Math.max(0, cursor + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = past[cursor] ?? "";
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const caret = input.selectionStart ?? input.value.length;
      const { text, options } = complete(input.value.slice(0, caret));
      const rest = input.value.slice(caret);
      input.value = text + rest;
      input.setSelectionRange(text.length, text.length);
      if (options.length) {
        print(`~ ${input.value}`, "egg-cmd");
        print(options.join("  "));
      }
    }
  });
  term.addEventListener("click", () => {
    if (!window.getSelection()?.toString()) input.focus();
  });
  term.addEventListener("close", () => term.remove());

  document.body.appendChild(term);
  term.showModal();
  input.focus();
  print("Type help to look around. Esc to leave.", "egg-cmd");
}

/* Typed codes */
const codes: [string[], () => string][] = [
  [[..."burbot"], swim],
  [[..."snow"], toggleSnow],
  [["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"], toggleParty],
];
const recent: string[] = [];

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (e.target as HTMLElement).tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if (e.key === ":") {
    e.preventDefault();
    openTerm();
    return;
  }
  recent.push(e.key.toLowerCase());
  if (recent.length > 10) recent.shift();
  for (const [seq, effect] of codes) {
    if (seq.every((k, i) => recent[recent.length - seq.length + i] === k)) toast(effect());
  }
});

/* Rapid clicks: the clock opens the terminal on phones, which have no : key to spare */
function onRapidClicks(el: Element | null, count: number, fn: () => void) {
  let n = 0;
  let last = 0;
  el?.addEventListener("click", () => {
    const now = Date.now();
    n = now - last < 600 ? n + 1 : 1;
    last = now;
    if (n >= count) {
      n = 0;
      fn();
    }
  });
}
onRapidClicks(document.querySelector(".clock"), 5, openTerm);
onRapidClicks(document.getElementById("theme-btn"), 6, () => toast("The theme is fine. Please blink."));

/* 404: a word for the scanners */
const scans: [RegExp, string][] = [
  [/wp-|wordpress|xmlrpc/i, "No WordPress here. Try the next IP on your list."],
  [/\.env|\.git|\.aws|\.ssh/i, "Nothing to leak. It's a static site."],
  [/php/i, "No PHP here. That's most of the security model."],
  [/passwd|shadow/i, "root:x:0:0:nice try:/root:/bin/false"],
  [/admin|login/i, "There is no admin panel. There is barely a panel."],
  [/burbot|fish/i, `${FISH} blub`],
];
if (document.getElementById("path")) {
  const quip = scans.find(([pattern]) => pattern.test(location.pathname))?.[1];
  if (quip) {
    const p = document.createElement("p");
    p.className = "err";
    p.textContent = quip;
    document.querySelector(".err")?.after(p);
  }
}

/* Devtools */
console.log(`%c${FISH}%c  You opened devtools, so here's one for you: press : anywhere.`, "color:#7aa2f7", "");
