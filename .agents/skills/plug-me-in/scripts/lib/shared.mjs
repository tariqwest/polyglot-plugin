#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { basename, dirname, join, resolve, relative, sep } from "node:path";
import { homedir, tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = resolve(SCRIPT_DIR, "../..");
export const REFS_DIR = join(SKILL_ROOT, "references");
export const CONVERT_SCRIPTS = resolve(
  SKILL_ROOT,
  "../convert-to-polyglot/scripts",
);

/** @typedef {'claude-code'|'cursor'|'codex'|'copilot'|'gemini'|'opencode'|'warp'|'oz'|'windsurf'|'cline'|'roo'|'antigravity'|'hermes'|'aider'|'grok'|'unknown'} HarnessId */

export const HARNESS_IDS = [
  "claude-code",
  "cursor",
  "codex",
  "copilot",
  "gemini",
  "opencode",
  "warp",
  "oz",
  "windsurf",
  "cline",
  "roo",
  "antigravity",
  "hermes",
  "aider",
  "grok",
  "unknown",
];

/** skills-cli -a candidates */
export const SKILLS_CLI_AGENTS = {
  "claude-code": ["claude-code", "claude"],
  cursor: ["cursor"],
  codex: ["codex"],
  copilot: ["copilot", "github-copilot"],
  gemini: ["gemini", "gemini-cli"],
  opencode: ["opencode"],
  warp: ["warp"],
  oz: ["warp"],
  windsurf: ["windsurf"],
  cline: ["cline"],
  roo: ["roo"],
  antigravity: ["antigravity"],
  hermes: ["hermes"],
  grok: ["grok"],
  aider: [],
  unknown: ["*"],
};

export const NATIVE_TYPE_TO_HARNESS = {
  "claude-plugin": ["claude-code"],
  "cursor-plugin": ["cursor"],
  "codex-plugin": ["codex"],
  "copilot-plugin": ["copilot"],
  "gemini-extension": ["gemini"],
};

export function parseArgs(argv = process.argv.slice(2)) {
  /** @type {Record<string, string|boolean>} */
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") continue;
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq !== -1) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
          out[key] = true;
        } else {
          out[key] = next;
          i++;
        }
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

export function flag(args, name, fallback = undefined) {
  if (args[name] === undefined) return fallback;
  return args[name];
}

export function boolFlag(args, name) {
  const v = args[name];
  if (v === undefined || v === false) return false;
  if (v === true || v === "true" || v === "1" || v === "yes") return true;
  return false;
}

export function pathExists(p) {
  try {
    return existsSync(p);
  } catch {
    return false;
  }
}

export function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

export function readText(p) {
  return readFileSync(p, "utf8");
}

export function writeText(p, text) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text, "utf8");
}

export function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

export function listDir(p) {
  if (!isDir(p)) return [];
  return readdirSync(p);
}

export function walkFiles(root, { maxDepth = 6 } = {}) {
  /** @type {string[]} */
  const files = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const full = join(dir, ent.name);
      if (ent.isDirectory()) walk(full, depth + 1);
      else if (ent.isFile()) files.push(full);
    }
  }
  if (isDir(root)) walk(root, 0);
  return files;
}

export function parseSkillFrontmatter(text) {
  if (!text.startsWith("---")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: text };
  const fm = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, "");
  /** @type {Record<string,string>} */
  const data = {};
  for (const line of fm.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    data[k] = v;
  }
  return { data, body };
}

export function skillNameFromPath(skillMdPath) {
  try {
    const { data } = parseSkillFrontmatter(readText(skillMdPath));
    if (data.name) return data.name;
  } catch {
    /* ignore */
  }
  const dir = dirname(skillMdPath);
  if (basename(skillMdPath) === "SKILL.md") return basename(dir);
  return basename(skillMdPath, ".md");
}

/**
 * Find SKILL.md files and flat skill md under skills/
 */
export function findSkills(root) {
  const files = walkFiles(root, { maxDepth: 8 });
  /** @type {{ name: string, path: string, dir: string, kind: 'dir'|'flat' }[]} */
  const skills = [];
  const seen = new Set();

  for (const f of files) {
    const base = basename(f);
    const rel = relative(root, f);
    if (base === "SKILL.md") {
      const name = skillNameFromPath(f);
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      skills.push({ name, path: f, dir: dirname(f), kind: "dir" });
    }
  }

  // flat skills/*.md (not SKILL.md)
  for (const f of files) {
    const rel = relative(root, f).split(sep).join("/");
    if (!/^(.+\/)?skills\/[^/]+\.md$/i.test(rel)) continue;
    if (basename(f) === "SKILL.md") continue;
    const name = skillNameFromPath(f);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills.push({ name, path: f, dir: dirname(f), kind: "flat" });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function readJsonSafe(p) {
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

export function isServerConfig(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return (
    "command" in obj ||
    "url" in obj ||
    obj.type === "http" ||
    obj.type === "sse" ||
    obj.type === "stdio"
  );
}

/** Normalize any MCP file shape → { mcpServers: Record<string, object> } */
export function normalizeMcp(raw) {
  if (!raw || typeof raw !== "object") return { mcpServers: {} };
  if (raw.mcpServers && typeof raw.mcpServers === "object") {
    return { mcpServers: { ...raw.mcpServers } };
  }
  if (raw.servers && typeof raw.servers === "object") {
    return { mcpServers: { ...raw.servers } };
  }
  // bare map
  const keys = Object.keys(raw).filter((k) => !k.startsWith("_"));
  if (keys.length && keys.every((k) => isServerConfig(raw[k]))) {
    /** @type {Record<string, object>} */
    const mcpServers = {};
    for (const k of keys) mcpServers[k] = raw[k];
    return { mcpServers };
  }
  return { mcpServers: {} };
}

export function collectEnvRefs(obj, out = new Set()) {
  const s = JSON.stringify(obj);
  const re = /\$\{([A-Z0-9_]+)\}/g;
  let m;
  while ((m = re.exec(s))) out.add(m[1]);
  return out;
}

export function mergeMcpIntoFile(destPath, servers, { preferredKey = "mcpServers", dryRun = false } = {}) {
  const existing = pathExists(destPath) ? readJsonSafe(destPath) : null;
  const norm = normalizeMcp(existing || {});
  const overwrites = [];
  for (const [id, cfg] of Object.entries(servers)) {
    if (norm.mcpServers[id]) overwrites.push(id);
    norm.mcpServers[id] = cfg;
  }
  /** @type {Record<string, unknown>} */
  let out;
  if (preferredKey === "servers") {
    out = { ...(existing && !existing.mcpServers ? existing : {}), servers: norm.mcpServers };
    delete out.mcpServers;
  } else if (preferredKey === "bare") {
    out = { ...norm.mcpServers };
  } else {
    out = { ...(existing || {}), mcpServers: norm.mcpServers };
    // drop bare-only confusion
    if (out.servers && out.mcpServers) {
      /* keep both only if existing had servers — prefer mcpServers */
    }
  }

  const text = JSON.stringify(out, null, 2) + "\n";
  const envVars = [...collectEnvRefs(servers)];
  if (!dryRun) {
    if (pathExists(destPath)) {
      const bak = `${destPath}.bak-${Date.now()}`;
      cpSync(destPath, bak);
    }
    writeText(destPath, text);
  }
  return { destPath, overwrites, envVars, text, dryRun };
}

/**
 * Resolve project skill install directory for a harness.
 * @param {HarnessId} harness
 * @param {'project'|'global'} scope
 * @param {string} cwd
 */
export function skillInstallDir(harness, scope, cwd) {
  const home = homedir();
  const h = harness === "oz" ? "warp" : harness;

  if (scope === "global") {
    switch (h) {
      case "claude-code":
        return join(home, ".claude", "skills");
      case "cursor":
        return join(home, ".cursor", "skills");
      case "gemini":
        return join(home, ".gemini", "skills");
      case "hermes":
        return join(home, ".hermes", "skills");
      case "antigravity":
        return join(home, ".agent", "skills");
      default:
        return join(home, ".agents", "skills");
    }
  }

  // project
  switch (h) {
    case "claude-code":
      return join(cwd, ".claude", "skills");
    case "cursor":
      return join(cwd, ".agents", "skills");
    case "codex":
    case "warp":
    case "grok":
    case "unknown":
      return join(cwd, ".agents", "skills");
    case "copilot":
      return join(cwd, "skills");
    case "gemini":
      return join(cwd, ".gemini", "skills");
    case "opencode":
      return join(cwd, ".opencode", "skills");
    case "antigravity":
      return join(cwd, ".agent", "skills");
    case "windsurf":
      return join(cwd, ".windsurf", "rules");
    case "cline":
      if (pathExists(join(cwd, ".clinerules")) && isDir(join(cwd, ".clinerules"))) {
        return join(cwd, ".clinerules");
      }
      return join(cwd, ".cline", "rules");
    case "roo":
      return join(cwd, ".roo", "rules");
    case "hermes":
      return join(home, ".hermes", "skills");
    case "aider":
      return cwd; // CONVENTIONS.md special-case
    default:
      return join(cwd, ".agents", "skills");
  }
}

/**
 * MCP destination for harness (project). null => print-only
 * @returns {{ path: string|null, preferredKey: 'mcpServers'|'servers'|'bare', printOnly?: boolean }}
 */
export function mcpDest(harness, cwd) {
  const h = harness === "oz" ? "warp" : harness;
  switch (h) {
    case "claude-code":
      return { path: join(cwd, ".mcp.json"), preferredKey: "mcpServers" };
    case "cursor":
      return { path: join(cwd, ".cursor", "mcp.json"), preferredKey: "mcpServers" };
    case "copilot":
      return { path: join(cwd, ".mcp.json"), preferredKey: "mcpServers" };
    case "gemini":
      return { path: join(cwd, "mcp_config.json"), preferredKey: "mcpServers" };
    case "antigravity":
      return { path: join(cwd, ".agent", "mcp_config.json"), preferredKey: "mcpServers" };
    case "warp":
      return { path: null, preferredKey: "mcpServers", printOnly: true };
    default:
      return { path: join(cwd, "mcp.json"), preferredKey: "mcpServers" };
  }
}

export function detectHarness({ cwd = process.cwd(), env = process.env } = {}) {
  /** @type {{ id: HarnessId, score: number, reasons: string[] }[]} */
  const scores = HARNESS_IDS.filter((id) => id !== "unknown").map((id) => ({
    id,
    score: 0,
    reasons: [],
  }));
  const byId = Object.fromEntries(scores.map((s) => [s.id, s]));

  const bump = (id, n, reason) => {
    if (!byId[id]) return;
    byId[id].score += n;
    byId[id].reasons.push(reason);
  };

  // Env clues
  if (env.CLAUDECODE || env.CLAUDE_CODE || env.ANTHROPIC_CLAUDE_CODE) {
    bump("claude-code", 50, "Claude Code env");
  }
  if (env.CURSOR_TRACE_ID || env.CURSOR_AGENT || env.CURSOR_SESSION_ID) {
    bump("cursor", 50, "Cursor env");
  }
  if (env.CODEX_HOME || env.CODEX_SHELL) bump("codex", 40, "Codex env");
if (env.GEMINI_CLI || (env.GEMINI_API_KEY && String(env.TERM_PROGRAM || "").toLowerCase().includes("gemini"))) {
    bump("gemini", 30, "Gemini env");
  }
  if (env.WARP_SESSION_ID || env.WARP_HONORED_SESSION_ID || env.WARP_IS_LOCAL_SHELL_SESSION) {
    bump("warp", 55, "Warp env");
  }
  if (env.OPENCODE || env.OPENCODE_SESSION) bump("opencode", 40, "OpenCode env");
  if (env.AIDER_MODEL || env.AIDER) bump("aider", 40, "Aider env");

  // TERM / process
  const tp = String(env.TERM_PROGRAM || "").toLowerCase();
  if (tp.includes("warp")) bump("warp", 40, "TERM_PROGRAM=Warp");
  if (tp.includes("vscode") || env.VSCODE_PID) {
    bump("copilot", 15, "VS Code family");
    bump("cursor", 10, "VS Code family (cursor possible)");
  }

  // CWD markers
  const markers = [
    [".claude", "claude-code", 25],
    [".cursor", "cursor", 25],
    [".codex", "codex", 20],
    [".gemini", "gemini", 20],
    [".opencode", "opencode", 20],
    [".agent", "antigravity", 22],
    [".windsurf", "windsurf", 22],
    [".roo", "roo", 18],
    [".cline", "cline", 18],
    [".clinerules", "cline", 18],
    [".grok", "grok", 18],
    [".github/copilot-instructions.md", "copilot", 15],
    ["CONVENTIONS.md", "aider", 12],
    ["AGENTS.md", "codex", 8],
    ["AGENTS.md", "warp", 5],
    [".agents/skills", "warp", 6],
    [".agents/skills", "codex", 6],
    [".agents/skills", "grok", 4],
  ];

  for (const [rel, id, n] of markers) {
    if (pathExists(join(cwd, rel))) bump(id, n, `cwd has ${rel}`);
  }

  // Parent process heuristic via env already; optional

  const ranked = Object.values(byId).sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  const ambiguous =
    !best ||
    best.score < 10 ||
    (second && best.score - second.score < 8 && second.score >= 10);

  return {
    harness: best && best.score > 0 ? best.id : "unknown",
    confidence: ambiguous ? "low" : best.score >= 40 ? "high" : "medium",
    score: best?.score ?? 0,
    reasons: best?.reasons ?? [],
    ranked: ranked.filter((r) => r.score > 0).slice(0, 6),
    cwd,
    ambiguous,
  };
}

export function loadHarnessMatrixSection(harnessId) {
  const md = readText(join(REFS_DIR, "harness-install-matrix.md"));
const id = harnessId === "oz" ? "warp" : harnessId;
  // Headings: "## claude-code" or "## warp / oz"
  const re =
    id === "warp"
      ? /^## warp \/ oz[\s\S]*?(?=^## |\Z)/im
      : new RegExp(`^## ${id}[\s\S]*?(?=^## |\Z)`, "im");
  const m = md.match(re);
  if (m) return m[0].trim();
  const m3 = md.match(/^## unknown \/ generic[\s\S]*?(?=^## |\Z)/im);
  return m3 ? m3[0].trim() : md.slice(0, 800);
}

export function githubShorthand(source) {
  const s = String(source).trim();
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(s)) return s;
  const m = s.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:\.git)?/i,
  );
  if (m) return `${m[1]}/${m[2].replace(/\.git$/, "")}`;
  return null;
}

export function parseGithubTreePath(source) {
  const m = String(source).match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/[^/]+\/(.+?)\/?$/i,
  );
  if (!m) return null;
  return {
    shorthand: `${m[1]}/${m[2]}`,
    subpath: m[3].replace(/\/$/, ""),
    url: `https://github.com/${m[1]}/${m[2]}.git`,
  };
}

export function isProbablyRemote(source) {
  const s = String(source);
  return (
    /^https?:\/\//i.test(s) ||
    /^git@/i.test(s) ||
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(s)
  );
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Clone remote source to temp if needed. Returns local path + meta.
 */
export function resolveSourceTree(source, { keep = true } = {}) {
  const src = String(source).trim();
  if (!isProbablyRemote(src) && pathExists(resolve(src))) {
    return {
      localPath: resolve(src),
      remote: null,
      subpath: null,
      cloned: false,
    };
  }

  const tree = parseGithubTreePath(src);
  let url = src;
  let subpath = null;
  let sh = githubShorthand(src);

  if (tree) {
    url = tree.url;
    subpath = tree.subpath;
    sh = tree.shorthand;
  } else if (sh) {
    url = `https://github.com/${sh}.git`;
  } else if (!/^https?:\/\//i.test(src) && !/^git@/i.test(src)) {
    throw new Error(`Cannot resolve source: ${src}`);
  }

  const hash = createHash("sha1").update(url).digest("hex").slice(0, 10);
  const dest = join(tmpdir(), `plug-me-in-${slugify(sh || "src")}-${hash}`);

  if (!pathExists(join(dest, ".git"))) {
    if (pathExists(dest)) rmSync(dest, { recursive: true, force: true });
    execFileSync("git", ["clone", "--depth", "1", url, dest], {
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  const localPath = subpath ? join(dest, subpath) : dest;
  if (!pathExists(localPath)) {
    throw new Error(`Subpath not found after clone: ${subpath}`);
  }

  return {
    localPath,
    remote: url,
    shorthand: sh,
    subpath,
    cloned: true,
    cloneRoot: dest,
    keep,
  };
}

export function findMcpFiles(root) {
  const candidates = [
    ".mcp.json",
    "mcp.json",
    "mcp_config.json",
    join(".agent", "mcp_config.json"),
    join(".cursor", "mcp.json"),
  ];
  /** @type {string[]} */
  const found = [];
  for (const c of candidates) {
    const p = join(root, c);
    if (isFile(p)) found.push(p);
  }
  // also gemini-extension inline
  return found;
}

export function extractMcpServers(root) {
  /** @type {Record<string, object>} */
  const servers = {};
  for (const f of findMcpFiles(root)) {
    const raw = readJsonSafe(f);
    Object.assign(servers, normalizeMcp(raw).mcpServers);
  }
  const gem = join(root, "gemini-extension.json");
  if (isFile(gem)) {
    const g = readJsonSafe(gem);
    if (g?.mcpServers) Object.assign(servers, g.mcpServers);
  }
  return servers;
}

export function classifyLocalTree(root) {
  const r = resolve(root);
  const skills = findSkills(r);
  const mcpServers = extractMcpServers(r);
  const mcpIds = Object.keys(mcpServers);

  const has = (rel) => pathExists(join(r, rel));
  const readMkt = (rel) => {
    const p = join(r, rel);
    if (!isFile(p)) return null;
    return readJsonSafe(p);
  };

  const marketplaces = [
    ".claude-plugin/marketplace.json",
    ".github/plugin/marketplace.json",
    ".cursor-plugin/marketplace.json",
    ".agents/plugins/marketplace.json",
  ]
    .map((rel) => ({ rel, json: readMkt(rel) }))
    .filter((x) => x.json && Array.isArray(x.json.plugins));

  /** @type {string} */
  let type = "unknown";
  /** @type {string|null} */
  let nativeHarness = null;
  /** @type {{name:string,source:unknown,description?:string}[]} */
  let marketplacePlugins = [];

  if (marketplaces.length) {
    type = "marketplace";
    for (const m of marketplaces) {
      for (const p of m.json.plugins) {
        marketplacePlugins.push({
          name: p.name,
          source: p.source,
          description: p.description,
        });
      }
    }
  } else {
    const bridgeHits = [
      has("AGENTS.md"),
      has("ai-plugin.json"),
      isDir(join(r, ".cursor", "rules")),
      has(".grok/config.toml"),
      has(".claude-plugin/plugin.json"),
      has(".cursor-plugin/plugin.json"),
      has(".copilot-plugin/plugin.json"),
    ].filter(Boolean).length;

    const polyglotSkills = isDir(join(r, ".agents", "skills")) && skills.length > 0;

    if (polyglotSkills && bridgeHits >= 2) {
      type = "polyglot";
    } else if (has(".claude-plugin/plugin.json")) {
      type = "claude-plugin";
      nativeHarness = "claude-code";
    } else if (has(".cursor-plugin/plugin.json")) {
      type = "cursor-plugin";
      nativeHarness = "cursor";
    } else if (has(".codex-plugin/plugin.json")) {
      type = "codex-plugin";
      nativeHarness = "codex";
    } else if (
      has(".github/plugin/plugin.json") ||
      (has("plugin.json") &&
        (isDir(join(r, "skills")) || isDir(join(r, "agents"))))
    ) {
      type = "copilot-plugin";
      nativeHarness = "copilot";
    } else if (has("gemini-extension.json")) {
      type = "gemini-extension";
      nativeHarness = "gemini";
    } else if (mcpIds.length && skills.length === 0) {
      type = "mcp-only";
    } else if (skills.length === 1) {
      type = "open-skill";
    } else if (skills.length > 1) {
      type = "skills-repo";
    } else if (mcpIds.length) {
      type = "mcp-only";
    } else {
      type = "unknown";
    }
  }

  let recommendedStrategy = "manual";
  if (type === "marketplace") recommendedStrategy = "list_and_choose_unit";
  else if (type === "mcp-only") recommendedStrategy = "merge_mcp";
  else if (
    type === "open-skill" ||
    type === "skills-repo" ||
    type === "polyglot"
  ) {
    recommendedStrategy = "copy_skills";
  } else if (type.endsWith("-plugin") || type === "gemini-extension") {
    recommendedStrategy = "native_or_convert";
  }

  return {
    root: r,
    type,
    nativeHarness,
    skillNames: skills.map((s) => s.name),
    skills,
    mcpServerIds: mcpIds,
    mcpServers,
    marketplacePlugins,
    recommendedStrategy,
    bridges: {
      agentsMd: has("AGENTS.md"),
      aiPlugin: has("ai-plugin.json"),
      cursorRules: isDir(join(r, ".cursor", "rules")),
      grok: has(".grok/config.toml"),
      claudePlugin: has(".claude-plugin/plugin.json"),
      cursorPlugin: has(".cursor-plugin/plugin.json"),
    },
  };
}

export function copySkillToDest(skill, destSkillsRoot, { dryRun = false } = {}) {
  const destDir = join(destSkillsRoot, skill.name);
  if (dryRun) {
    return { destDir, dryRun: true };
  }
  ensureDir(destSkillsRoot);
  if (pathExists(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
  if (skill.kind === "flat") {
    ensureDir(destDir);
    const text = readText(skill.path);
    let body = text;
    const { data } = parseSkillFrontmatter(text);
    if (!data.name) {
      body = `---\nname: ${skill.name}\ndescription: "Installed by plug-me-in"\n---\n\n${text}`;
    }
    writeText(join(destDir, "SKILL.md"), body);
  } else {
    cpSync(skill.dir, destDir, { recursive: true });
    // ensure name match: if folder was different, we already use skill.name as dest
  }
  // chmod scripts
  const scriptsDir = join(destDir, "scripts");
  if (isDir(scriptsDir)) {
    for (const f of listDir(scriptsDir)) {
      const p = join(scriptsDir, f);
      if (isFile(p)) {
        try {
          chmodSync(p, 0o755);
        } catch {
          /* ignore */
        }
      }
    }
  }
  return { destDir, dryRun: false };
}

export function writeCursorBridge(cwd, skill, { dryRun = false } = {}) {
  const rulesDir = join(cwd, ".cursor", "rules");
  const dest = join(rulesDir, `${skill.name}.mdc`);
  let description = skill.name;
  try {
    const { data } = parseSkillFrontmatter(readText(skill.path));
    if (data.description) description = data.description;
  } catch {
    /* ignore */
  }
  const relSkill = `.agents/skills/${skill.name}/SKILL.md`;
  const text = `---
description: ${JSON.stringify(description)}
globs:
alwaysApply: false
---

Read and follow \`${relSkill}\`.
`;
  if (!dryRun) writeText(dest, text);
  return dest;
}

export function ensureGrokConfig(cwd, { dryRun = false } = {}) {
  const p = join(cwd, ".grok", "config.toml");
  const snippet = `[skills]\npaths = ["./.agents/skills"]\n`;
  if (pathExists(p)) {
    const cur = readText(p);
    if (cur.includes(".agents/skills")) return { path: p, status: "ok" };
    if (!dryRun) writeText(p, cur.trimEnd() + "\n\n" + snippet);
    return { path: p, status: "appended" };
  }
  if (!dryRun) writeText(p, snippet);
  return { path: p, status: "created" };
}

export function appendCopilotInstructions(cwd, skill, { dryRun = false } = {}) {
  const p = join(cwd, ".github", "copilot-instructions.md");
  const block = `\n\n## Skill: ${skill.name}\n\nFollow the workflow in \`skills/${skill.name}/SKILL.md\` or \`.agents/skills/${skill.name}/SKILL.md\` when relevant.\n`;
  if (pathExists(p)) {
    const cur = readText(p);
    if (cur.includes(`Skill: ${skill.name}`)) return { path: p, status: "exists" };
    if (!dryRun) writeText(p, cur.trimEnd() + block);
    return { path: p, status: "appended" };
  }
  if (!dryRun) writeText(p, `# Copilot instructions\n${block}`);
  return { path: p, status: "created" };
}

export function appendAiderConventions(cwd, skill, { dryRun = false } = {}) {
  const p = join(cwd, "CONVENTIONS.md");
  let summary = skill.name;
  try {
    const { data, body } = parseSkillFrontmatter(readText(skill.path));
    summary = data.description || body.split("\n").slice(0, 8).join("\n");
  } catch {
    /* ignore */
  }
  const block = `\n\n## Skill: ${skill.name}\n\n${summary}\n`;
  if (pathExists(p)) {
    const cur = readText(p);
    if (cur.includes(`Skill: ${skill.name}`)) return { path: p, status: "exists" };
    if (!dryRun) writeText(p, cur.trimEnd() + block);
    return { path: p, status: "appended" };
  }
  if (!dryRun) writeText(p, `# Conventions\n${block}`);
  return { path: p, status: "created" };
}

export function trySkillsCli({
  shorthand,
  harness,
  skillName,
  globalScope,
  yes = true,
}) {
  const agents = SKILLS_CLI_AGENTS[harness] || SKILLS_CLI_AGENTS.unknown;
  if (!agents.length) {
    return { ok: false, reason: "skills-cli not applicable for harness" };
  }
  const errors = [];
  for (const agent of agents) {
    const args = ["skills", "add", shorthand, "-a", agent];
    if (skillName) args.push("-s", skillName);
    if (globalScope) args.push("-g");
    if (yes) args.push("-y");
    const res = spawnSync("npx", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, npm_config_yes: "true" },
    });
    if (res.status === 0) {
      return {
        ok: true,
        agent,
        stdout: res.stdout,
        stderr: res.stderr,
        args,
      };
    }
    errors.push({
      agent,
      status: res.status,
      stderr: (res.stderr || "").slice(0, 500),
    });
  }
  return { ok: false, errors };
}

export function runConvert({ source, dest, name }) {
  const convert = join(CONVERT_SCRIPTS, "convert.mjs");
  if (!pathExists(convert)) {
    return { ok: false, reason: `convert.mjs not found at ${convert}` };
  }
  const args = [convert, "--source", source, "--dest", dest, "--name", name];
  const res = spawnSync(process.execPath, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: res.status === 0,
    status: res.status,
    stdout: res.stdout,
    stderr: res.stderr,
    dest,
  };
}

export function printJson(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

export function printReport(report) {
  const lines = [
    "## Harness",
    `- Detected: ${report.harnessLabel || report.harness} (${report.harness})`,
    report.pluginModel ? `- Plugin model: ${report.pluginModel}` : null,
    "",
    "## Source",
    `- Input: ${report.source}`,
    `- Classified as: ${report.type}`,
    `- Strategy: ${report.strategy}`,
    "",
    "## Actions taken",
    ...(report.actions || []).map((a) => `- ${a}`),
    "",
    "## Installed paths",
    ...(report.paths || []).length
      ? report.paths.map((p) => `- ${p}`)
      : ["- (none)"],
    "",
    "## Activate",
    ...(report.activate || ["- Reload the agent session / window"]),
    "",
    "## Verify",
    ...(report.verify || ["- Confirm files exist and MCP servers list"]),
    "",
    "## Still needed (if any)",
    ...(report.stillNeeded || []).length
      ? report.stillNeeded.map((s) => `- ${s}`)
      : ["- none"],
  ].filter((x) => x !== null);
  console.log(lines.join("\n"));
}
