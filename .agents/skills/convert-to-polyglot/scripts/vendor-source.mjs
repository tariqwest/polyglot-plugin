#!/usr/bin/env node
import { basename, join, resolve } from "node:path";
import { cpSync } from "node:fs";
import {
  copyTree,
  ensureDir,
  isDir,
  isFile,
  listDirs,
  parseArgs,
  pathExists,
  readText,
  requireArg,
  rimraf,
  writeText,
} from "./lib/fs-utils.mjs";
import { discoverSourceLayout } from "./lib/skill-md.mjs";

const args = parseArgs();
const source = resolve(requireArg(args, "source"));
const dest = resolve(requireArg(args, "dest"));
const exclude = String(args.exclude || "homepage,docs,READMEs,assets")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const runtimeSubdir =
  args["runtime-subdir"] && args["runtime-subdir"] !== true
    ? args["runtime-subdir"]
    : null;

const layout = discoverSourceLayout(source);
const hasSkills = Boolean(layout.skillsDir || (layout.skills && layout.skills.length));
const hasMcp = Boolean(layout.mcpConfig);
if (!hasSkills && !hasMcp) {
  console.error("No skills or MCP config found under", source);
  process.exit(1);
}
if (!hasSkills && hasMcp) {
  console.log("MCP-only plugin detected (no skills); vendoring MCP + synthetic skill stub");
}

const pluginRoot = resolve(layout.pluginRoot || source);

ensureDir(join(dest, ".agents/skills"));
if (layout.skills && layout.skills.length) {
  for (const s of layout.skills) {
    if (s.flatFile) {
      const targetDir = join(dest, ".agents/skills", s.name);
      rimraf(targetDir);
      ensureDir(targetDir);
      let text = readText(s.flatFile);
      if (!text.startsWith("---")) {
        const desc = (s.description || s.name).replace(/"/g, '\\"');
        text = `---\nname: ${s.name}\ndescription: "${desc}"\n---\n\n` + text;
      }
      writeText(join(targetDir, "SKILL.md"), text);
      console.log("vendored flat skill", s.name);
    } else if (isFile(join(s.path, "SKILL.md"))) {
      const target = join(dest, ".agents/skills", s.name);
      rimraf(target);
      copyTree(s.path, target, { exclude });
      console.log("vendored skill", s.name);
    } else if (isFile(s.path) && s.path.endsWith(".md")) {
      const targetDir = join(dest, ".agents/skills", s.name);
      rimraf(targetDir);
      ensureDir(targetDir);
      writeText(join(targetDir, "SKILL.md"), readText(s.path));
      console.log("vendored skill file", s.name);
    }
  }
} else if (layout.skillsDir) {
  const skillPaths = [];
  if (isFile(join(layout.skillsDir, "SKILL.md"))) skillPaths.push(layout.skillsDir);
  else for (const d of listDirs(layout.skillsDir)) skillPaths.push(d);
  for (const d of skillPaths) {
    if (!isFile(join(d, "SKILL.md"))) continue;
    const name = basename(d);
    const target = join(dest, ".agents/skills", name);
    rimraf(target);
    copyTree(d, target, { exclude });
    console.log("vendored skill", name);
  }
}

if (layout.agentsDir) {
  const target = join(dest, ".agents/agents");
  rimraf(target);
  copyTree(layout.agentsDir, target, { exclude });
  console.log("vendored agents");
} else if (layout.manifestAgentFiles && layout.manifestAgentFiles.length) {
  const target = join(dest, ".agents/agents");
  ensureDir(target);
  for (const f of layout.manifestAgentFiles) {
    if (!isFile(f)) continue;
    const base = basename(f).replace(/\.agent\.md$/i, ".md");
    cpSync(f, join(target, base));
    console.log("vendored manifest agent", base);
  }
}

if (layout.hooksDir) {
  const target = join(dest, ".agents/hooks");
  rimraf(target);
  copyTree(layout.hooksDir, target, { exclude });
  console.log("vendored hooks");
}

const commandsDir = [join(pluginRoot, "commands"), join(source, "commands")].find((p) =>
  isDir(p)
);
if (commandsDir) {
  const target = join(dest, ".agents/references/commands");
  rimraf(target);
  copyTree(commandsDir, target, { exclude });
  console.log("vendored commands");
}

let runtimeSrc = null;
if (runtimeSubdir) {
  const p = join(source, runtimeSubdir);
  if (isDir(p)) runtimeSrc = p;
}
if (!runtimeSrc && layout.hasRuntime) {
  runtimeSrc = pluginRoot;
}
if (runtimeSrc) {
  const runtimeDest = join(dest, "runtime");
  rimraf(runtimeDest);
  copyTree(runtimeSrc, runtimeDest, { exclude });
  for (const dup of ["skills", "agents", "hooks"]) {
    const p = join(runtimeDest, dup);
    if (isDir(p)) {
      rimraf(p);
      console.log("removed runtime/" + dup + " duplicate");
    }
  }
  console.log("vendored runtime from", runtimeSrc);
}

const licenseRoots = [source, pluginRoot, join(pluginRoot, ".."), join(source, "../..")];
for (const root of licenseRoots) {
  for (const f of ["LICENSE", "LICENSE.md", "install.sh", "install.ps1"]) {
    const p = join(root, f);
    const out = join(dest, f);
    if (isFile(p) && !pathExists(out)) {
      cpSync(p, out);
      console.log("copied", f, "from", root);
    }
  }
}

// Bundled MCP configs (plugin .mcp.json / mcp.json)
const mcpFiles = [];
if (layout.mcpConfig) mcpFiles.push(layout.mcpConfig);
for (const f of [".mcp.json", "mcp.json", "mcp_config.json"]) {
  for (const root of [pluginRoot, source]) {
    const p = join(root, f);
    if (isFile(p) && !mcpFiles.includes(p)) mcpFiles.push(p);
  }
}
if (mcpFiles.length) {
  ensureDir(join(dest, ".agents/references/mcp"));
  for (const p of mcpFiles) {
    const base = basename(p);
    cpSync(p, join(dest, ".agents/references/mcp", base));
    if (!pathExists(join(dest, base))) cpSync(p, join(dest, base));
    if (base !== ".mcp.json" && !pathExists(join(dest, ".mcp.json"))) {
      try { cpSync(p, join(dest, ".mcp.json")); } catch { /* ignore */ }
    }
    console.log("vendored MCP", base);
  }
}


// MCP-only: synthesize a thin skill so polyglot packages always have a skill entrypoint
{
  const skillsOut = join(dest, ".agents/skills");
  const existingSkills = listDirs(skillsOut).filter((d) => isFile(join(d, "SKILL.md")));
  if (!existingSkills.length && (layout.mcpConfig || pathExists(join(dest, ".mcp.json")) || pathExists(join(dest, "mcp.json")))) {
    let pluginName = basename(source);
    let description = `Use the ${pluginName} MCP server tools from this polyglot package.`;
    for (const man of [
      join(pluginRoot, ".claude-plugin/plugin.json"),
      join(source, ".claude-plugin/plugin.json"),
      join(pluginRoot, ".cursor-plugin/plugin.json"),
      join(source, ".cursor-plugin/plugin.json"),
    ]) {
      if (!isFile(man)) continue;
      try {
        const j = JSON.parse(readText(man));
        if (j.name) pluginName = j.name;
        if (j.description) description = j.description;
      } catch {
        /* ignore */
      }
      break;
    }
    const skillName = String(pluginName).replace(/[^a-zA-Z0-9._-]+/g, "-");
    const dir = join(skillsOut, skillName);
    ensureDir(dir);
    const esc = description.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    writeText(
      join(dir, "SKILL.md"),
      [
        "---",
        `name: ${skillName}`,
        `description: "${esc}"`,
        'version: "1.0.0"',
        'compatibility: "requires: MCP server configured in package mcp.json / .mcp.json"',
        "---",
        "",
        `# ${skillName}`,
        "",
        "This package is primarily an **MCP integration** ported to the polyglot layout.",
        "",
        "## When to use",
        "",
        description,
        "",
        "## Setup",
        "",
        "1. Set package root env (see README).",
        "2. Load `mcp.json` / `.mcp.json` in your harness.",
        "3. Complete any OAuth / API token env vars documented upstream.",
        "4. Prefer upstream MCP tools for the actual work; this skill only orients the agent.",
        "",
        "## MCP",
        "",
        "- Root configs: `mcp.json`, `.mcp.json`",
        "- Original upstream copy: `.agents/references/mcp/`",
        "",
      ].join("\n")
    );
    console.log("synthesized MCP-only skill", skillName);
  }
}

writeText(join(dest, ".agents/references/source-layout.json"), JSON.stringify(layout, null, 2) + "\n");
console.log("vendor complete ->", dest);
