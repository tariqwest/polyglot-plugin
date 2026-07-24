#!/usr/bin/env node
import {
  HARNESS_IDS,
  boolFlag,
  detectHarness,
  flag,
  loadHarnessMatrixSection,
  parseArgs,
  printJson,
  skillInstallDir,
  mcpDest,
  SKILLS_CLI_AGENTS,
} from "./lib/shared.mjs";
import { resolve } from "node:path";

const LABELS = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  copilot: "GitHub Copilot",
  gemini: "Gemini CLI",
  opencode: "OpenCode",
  warp: "Warp / Oz",
  oz: "Warp / Oz",
  windsurf: "Windsurf",
  cline: "Cline",
  roo: "Roo",
  antigravity: "Antigravity",
  hermes: "Hermes",
  aider: "Aider",
  grok: "Grok Build",
  unknown: "Unknown / generic Open Skills",
};

const MODELS = {
  "claude-code":
    "Plugins (skills + agents + hooks + MCP + marketplaces); also standalone SKILL.md.",
  cursor: "Rules (.mdc), skills, MCP servers, optional Cursor plugins.",
  codex: "Open Skills + AGENTS.md; optional Codex plugins.",
  copilot: "VS Code/GitHub plugins, copilot-instructions, agents, MCP.",
  gemini: "Extensions (gemini-extension.json), skills, TOML commands, MCP.",
  opencode: "Native skills trees and config plugins.",
  warp: "Open Skills under .agents/skills plus MCP in Warp settings; Warp Drive rules.",
  oz: "Open Skills under .agents/skills plus MCP in Warp settings; Warp Drive rules.",
  windsurf: "Cascade rules and MCP.",
  cline: "Rule files and MCP.",
  roo: "Rules/modes and MCP.",
  antigravity: "Skills under singular .agent/skills plus mcp_config.json.",
  hermes: "User-level Open Skills directories.",
  aider: "CONVENTIONS.md guidance (no real plugin loader).",
  grok: "Open Skills via .agents/skills and .grok/config.toml.",
  unknown: "Fallback: install Open Skills into .agents/skills.",
};

const args = parseArgs();
const cwd = resolve(String(flag(args, "cwd", process.cwd())));
const asJson = boolFlag(args, "json");
let harness = flag(args, "harness");

if (!harness) {
  const det = detectHarness({ cwd });
  harness = det.harness;
}

harness = String(harness);
if (harness === "oz") harness = "warp";

if (!HARNESS_IDS.includes(harness) && harness !== "warp") {
  console.error(`Unknown harness: ${harness}`);
  console.error(`Known: ${HARNESS_IDS.join(", ")}`);
  process.exit(2);
}

const section = loadHarnessMatrixSection(harness);
const projectSkills = skillInstallDir(harness, "project", cwd);
const globalSkills = skillInstallDir(harness, "global", cwd);
const mcp = mcpDest(harness, cwd);

const out = {
  harness,
  label: LABELS[harness] || harness,
  pluginModel: MODELS[harness] || MODELS.unknown,
  paths: {
    projectSkills,
    globalSkills,
    mcp: mcp.path,
    mcpPrintOnly: Boolean(mcp.printOnly),
  },
  skillsCliAgents: SKILLS_CLI_AGENTS[harness] || [],
  matrixSection: section,
};

if (asJson) {
  printJson(out);
} else {
  console.log(`# ${out.label} (${out.harness})\n`);
  console.log(`Plugin model: ${out.pluginModel}\n`);
  console.log("Install paths (this machine):");
  console.log(`  project skills: ${out.paths.projectSkills}`);
  console.log(`  global skills:  ${out.paths.globalSkills}`);
  console.log(
    `  MCP config:     ${out.paths.mcp || "(print JSON for app settings)"}`,
  );
  if (out.skillsCliAgents.length) {
    console.log(
      `  npx skills -a:  ${out.skillsCliAgents.join(" | ")}`,
    );
  }
  console.log("\n---\n");
  console.log(section);
}
