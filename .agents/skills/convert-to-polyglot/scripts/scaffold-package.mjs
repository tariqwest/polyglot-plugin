#!/usr/bin/env node
import { join, resolve } from "node:path";
import { ensureDir, parseArgs, requireArg, writeText, pathExists } from "./lib/fs-utils.mjs";

const args = parseArgs();
const dest = resolve(requireArg(args, "dest"));
const name = requireArg(args, "name");

const dirs = [
  ".agents/skills",
  ".agents/agents",
  ".agents/hooks",
  ".agents/references",
  ".cursor/rules",
  ".github",
  ".grok",
  ".claude-plugin",
  ".cursor-plugin",
  ".copilot-plugin",
  "scripts",
  "runtime",
];
for (const d of dirs) ensureDir(join(dest, d));
if (!pathExists(join(dest, ".gitkeep"))) {
  writeText(join(dest, ".agents/references/.gitkeep"), "");
}
console.log(`Scaffolded polyglot package '${name}' at ${dest}`);
