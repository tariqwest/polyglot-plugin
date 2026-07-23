#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  chmodSync,
  lstatSync,
} from "node:fs";
import { dirname, join, resolve, relative, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = resolve(SCRIPT_DIR, "../..");

export function ensureDir(p) {
  mkdirSync(p, { recursive: true });
  return p;
}

export function readText(p) {
  return readFileSync(p, "utf8");
}

export function writeText(p, text) {
  ensureDir(dirname(p));
  writeFileSync(p, text, "utf8");
}

export function writeJson(p, obj) {
  writeText(p, JSON.stringify(obj, null, 2) + "\n");
}

export function pathExists(p) {
  return existsSync(p);
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

export function listDirs(p) {
  if (!isDir(p)) return [];
  return readdirSync(p)
    .map((n) => join(p, n))
    .filter(isDir);
}

export function listFiles(p, { recursive = false } = {}) {
  if (!isDir(p)) return [];
  const out = [];
  for (const name of readdirSync(p)) {
    const full = join(p, name);
    let st;
    try {
      st = lstatSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory() && recursive) out.push(...listFiles(full, { recursive: true }));
    else if (st.isFile()) out.push(full);
  }
  return out;
}

export function rimraf(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

export function copyTree(src, dest, { exclude = [] } = {}) {
  ensureDir(dirname(dest));
  cpSync(src, dest, {
    recursive: true,
    filter: (srcPath) => {
      const base = basename(srcPath);
      if (base === "node_modules" || base === ".git" || base === ".DS_Store") return false;
      const rel = relative(src, srcPath).split(/[/\\]/)[0];
      if (exclude.includes(base) || exclude.includes(rel)) return false;
      return true;
    },
  });
}

export function chmodExec(p) {
  try {
    const mode = statSync(p).mode;
    chmodSync(p, mode | 0o111);
  } catch {
    /* ignore */
  }
}

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else out._.push(a);
  }
  return out;
}

export function requireArg(args, key) {
  if (!args[key] || args[key] === true) {
    console.error(`Missing required --${key}`);
    process.exit(1);
  }
  return args[key];
}

export function envRootFromName(name) {
  return (
    name
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase() + "_ROOT"
  );
}

export function run(cmd, args, opts = {}) {
  const stdio = opts.stdio === "inherit" ? "inherit" : opts.stdio || ["ignore", "pipe", "pipe"];
  const res = spawnSync(cmd, args, {
    encoding: stdio === "inherit" ? undefined : "utf8",
    stdio,
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
  });
  return res;
}

export function which(cmd) {
  const res = spawnSync("bash", ["-lc", `command -v ${cmd}`], { encoding: "utf8" });
  return res.status === 0 ? res.stdout.trim() : "";
}

export const SCRIPT_EXTS = new Set([".mjs", ".js", ".cjs", ".py", ".sh"]);

export function isScriptFile(p) {
  return SCRIPT_EXTS.has(extname(p));
}

export function toPosix(p) {
  return p.split("\\").join("/");
}