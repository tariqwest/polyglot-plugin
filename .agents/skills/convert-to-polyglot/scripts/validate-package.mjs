#!/usr/bin/env node
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  isDir,
  isFile,
  listDirs,
  listFiles,
  parseArgs,
  pathExists,
  readText,
  requireArg,
} from "./lib/fs-utils.mjs";
import { parseSkillMd } from "./lib/skill-md.mjs";

const args = parseArgs();
const dest = resolve(requireArg(args, "dest"));
const errors = [];
const warnings = [];

const skillsRoot = join(dest, ".agents/skills");
if (!isDir(skillsRoot)) errors.push("missing .agents/skills");

let skillCount = 0;
for (const d of listDirs(skillsRoot)) {
  const name = basename(d);
  const sm = join(d, "SKILL.md");
  if (!isFile(sm)) {
    errors.push(`missing SKILL.md in ${name}`);
    continue;
  }
  skillCount++;
  const text = readText(sm);
  const parsed = parseSkillMd(text);
  if (parsed.data.name !== name) {
    errors.push(`name mismatch: folder=${name} frontmatter=${parsed.data.name}`);
  }
  const lines = text.split("\n").length;
  if (lines > 500) warnings.push(`SKILL.md >500 lines: ${name} (${lines})`);
  // scripts should not sit at skill root
  for (const f of listFiles(d)) {
    if (/\.(mjs|js|py|sh)$/.test(f) && basename(f) !== "SKILL.md") {
      // only root-level
      if (join(d, basename(f)) === f) {
        errors.push(`script at skill root (move to scripts/): ${name}/${basename(f)}`);
      }
    }
  }
  console.log(`OK ${name} lines=${lines} name=${parsed.data.name}`);
}

const required = [
  "AGENTS.md",
  "ai-plugin.json",
  "mcp.json",
  "README.md",
  ".grok/config.toml",
  ".github/copilot-instructions.md",
];
for (const r of required) {
  if (!pathExists(join(dest, r))) errors.push(`missing ${r}`);
  else console.log("present", r);
}

const cursorRules = listFiles(join(dest, ".cursor/rules")).filter((f) => f.endsWith(".mdc"));
if (!cursorRules.length) errors.push("no .cursor/rules/*.mdc");

for (const dup of ["runtime/skills", "runtime/agents", "runtime/hooks"]) {
  if (isDir(join(dest, dup))) errors.push(`duplicate canonical tree: ${dup}`);
}

// MCP smoke
const mcp = join(dest, "scripts/mcp-server.mjs");
if (isFile(mcp)) {
  const payload =
    '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"validate","version":"0"}}}\n' +
    '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n';
  const res = spawnSync("node", [mcp], {
    input: payload,
    encoding: "utf8",
    env: { ...process.env },
    cwd: dest,
  });
  if (res.status !== 0) {
    warnings.push(`MCP smoke non-zero exit: ${res.stderr || res.status}`);
  } else if (!res.stdout.includes("tools")) {
    warnings.push("MCP smoke: unexpected output");
  } else {
    console.log("MCP smoke OK");
  }
}

console.log("---");
console.log(`skills=${skillCount}`);
if (warnings.length) {
  console.log("WARNINGS:");
  for (const w of warnings) console.log(" ", w);
}
if (errors.length) {
  console.log("ERRORS:");
  for (const e of errors) console.log(" ", e);
  process.exit(1);
}
console.log("Validation passed");
