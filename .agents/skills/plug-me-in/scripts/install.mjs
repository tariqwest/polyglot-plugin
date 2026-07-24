#!/usr/bin/env node
/**
 * Install a skill/plugin/MCP source into a target harness.
 *
 * Usage:
 *   node install.mjs --source <url|path> --harness <id> [--scope project|global]
 *     [--cwd <dir>] [--name <skill-or-plugin>] [--dest <convert-dest>]
 *     [--convert] [--skills-only] [--mcp-only] [--no-skills-cli]
 *     [--dry-run] [--yes] [--json]
 */
import { basename, join, resolve } from "node:path";
import { homedir } from "node:os";
import {
  NATIVE_TYPE_TO_HARNESS,
  appendAiderConventions,
  appendCopilotInstructions,
  boolFlag,
  classifyLocalTree,
  copySkillToDest,
  detectHarness,
  ensureGrokConfig,
  flag,
  githubShorthand,
  mcpDest,
  mergeMcpIntoFile,
  parseArgs,
  pathExists,
  printJson,
  printReport,
  resolveSourceTree,
  runConvert,
  skillInstallDir,
  slugify,
  trySkillsCli,
  writeCursorBridge,
} from "./lib/shared.mjs";

const args = parseArgs();
const source = flag(args, "source") || args._[0];
const cwd = resolve(String(flag(args, "cwd", process.cwd())));
const scope = String(flag(args, "scope", "project")) === "global" ? "global" : "project";
const nameFilter = flag(args, "name") ? String(flag(args, "name")) : null;
const dryRun = boolFlag(args, "dry-run") || boolFlag(args, "dryRun");
const wantConvert = boolFlag(args, "convert");
const skillsOnly = boolFlag(args, "skills-only") || boolFlag(args, "skillsOnly");
const mcpOnly = boolFlag(args, "mcp-only") || boolFlag(args, "mcpOnly");
const noSkillsCli = boolFlag(args, "no-skills-cli") || boolFlag(args, "noSkillsCli");
const asJson = boolFlag(args, "json");
const yes = boolFlag(args, "yes") || true;

let harness = flag(args, "harness");
if (!harness) {
  harness = detectHarness({ cwd }).harness;
}
harness = String(harness);
if (harness === "oz") harness = "warp";

if (!source) {
  console.error(
    "Usage: install.mjs --source <url-or-path> [--harness <id>] [--scope project|global] [--name <n>] [--convert] [--dry-run]",
  );
  process.exit(2);
}

const report = {
  harness,
  harnessLabel: harness,
  source: String(source),
  type: "unknown",
  strategy: "pending",
  actions: [],
  paths: [],
  activate: [],
  verify: [],
  stillNeeded: [],
  pluginModel: null,
  dryRun,
};

function pickStrategy(classification) {
  const type = classification.type;
  if (mcpOnly || type === "mcp-only") return "merge_mcp";
  if (type === "marketplace") return "list_and_choose_unit";

  const nativeFor = NATIVE_TYPE_TO_HARNESS[type] || [];
  const isNative = nativeFor.includes(harness);

  if (
    type === "open-skill" ||
    type === "skills-repo" ||
    type === "polyglot"
  ) {
    const sh = githubShorthand(String(source));
    if (sh && !noSkillsCli && !dryRun) return "skills_cli_or_copy";
    return "copy_skills";
  }

  if (isNative && !wantConvert && !skillsOnly) return "native_plugin_install";
  if (
    (type.endsWith("-plugin") || type === "gemini-extension") &&
    !isNative
  ) {
    if (skillsOnly) return "extract_skills_and_copy";
    if (wantConvert) return "convert_then_install";
    // default: extract skills + mcp (lighter); note convert available
    return "extract_skills_and_copy";
  }

  if (isNative && skillsOnly) return "extract_skills_and_copy";
  if (classification.skills.length) return "copy_skills";
  if (classification.mcpServerIds.length) return "merge_mcp";
  return "manual";
}

function filterSkills(skills) {
  if (!nameFilter) return skills;
  const hit = skills.filter(
    (s) => s.name.toLowerCase() === nameFilter.toLowerCase(),
  );
  if (!hit.length) {
    report.stillNeeded.push(
      `No skill named "${nameFilter}". Candidates: ${skills.map((s) => s.name).join(", ") || "(none)"}`,
    );
  }
  return hit;
}

function installSkillsFromClassification(classification, skillsRoot) {
  const skills = filterSkills(classification.skills);
  if (!skills.length) {
    report.actions.push("No skills to copy");
    return;
  }
  for (const skill of skills) {
    if (harness === "aider") {
      const r = appendAiderConventions(cwd, skill, { dryRun });
      report.actions.push(`Aider CONVENTIONS ${r.status}: ${r.path}`);
      report.paths.push(r.path);
      continue;
    }

    // rule-style harnesses: still copy markdown as skill-like file when possible
    const destRoot =
      harness === "windsurf" || harness === "cline" || harness === "roo"
        ? skillsRoot
        : skillsRoot;

    const { destDir } = copySkillToDest(skill, destRoot, { dryRun });
    report.actions.push(
      `${dryRun ? "Would copy" : "Copied"} skill ${skill.name} → ${destDir}`,
    );
    report.paths.push(destDir);

    if (harness === "cursor" && scope === "project") {
      const bridge = writeCursorBridge(cwd, skill, { dryRun });
      report.actions.push(
        `${dryRun ? "Would write" : "Wrote"} Cursor rule bridge ${bridge}`,
      );
      report.paths.push(bridge);
    }
    if (harness === "grok" && scope === "project") {
      const g = ensureGrokConfig(cwd, { dryRun });
      report.actions.push(`Grok config ${g.status}: ${g.path}`);
      report.paths.push(g.path);
    }
    if (harness === "copilot" && scope === "project") {
      const c = appendCopilotInstructions(cwd, skill, { dryRun });
      report.actions.push(`Copilot instructions ${c.status}: ${c.path}`);
      report.paths.push(c.path);
    }
  }
}

function installMcp(classification) {
  let servers = { ...classification.mcpServers };
  if (nameFilter && servers[nameFilter]) {
    servers = { [nameFilter]: servers[nameFilter] };
  } else if (nameFilter && !classification.skills.some((s) => s.name === nameFilter)) {
    // name might be mcp id only
    if (Object.keys(servers).length && !servers[nameFilter]) {
      /* keep all if filter is for skills */
    }
  }
  if (!Object.keys(servers).length) {
    report.actions.push("No MCP servers found on source");
    return;
  }

  const dest = mcpDest(harness, cwd);
  if (dest.printOnly || !dest.path) {
    report.actions.push(
      "Warp/app MCP is settings-based — paste the following into Warp MCP settings:",
    );
    report.stillNeeded.push("Add MCP JSON via Warp Settings → MCP");
    const block = JSON.stringify({ mcpServers: servers }, null, 2);
    report.actions.push("```json\n" + block + "\n```");
    report.paths.push("(warp-settings-mcp)");
    return;
  }

  const result = mergeMcpIntoFile(dest.path, servers, {
    preferredKey: dest.preferredKey,
    dryRun,
  });
  report.actions.push(
    `${dryRun ? "Would merge" : "Merged"} MCP → ${result.destPath}` +
      (result.overwrites.length
        ? ` (overwrote: ${result.overwrites.join(", ")})`
        : ""),
  );
  report.paths.push(result.destPath);
  for (const e of result.envVars) {
    report.stillNeeded.push(`Set env var ${e} (do not commit secrets)`);
  }
}

function activationHints() {
  switch (harness) {
    case "claude-code":
      report.activate.push("- Start a new Claude Code session or reload plugins");
      report.verify.push("- Check skill under .claude/skills or /plugin list");
      break;
    case "cursor":
      report.activate.push("- Reload Cursor window (Developer: Reload Window)");
      report.verify.push("- Settings → Rules / MCP should list new entries");
      break;
    case "warp":
      report.activate.push("- Start a new Warp agent turn so skills are rescanned");
      report.verify.push("- Confirm .agents/skills/<name>/SKILL.md is readable");
      report.verify.push("- Confirm MCP tools if configured in Warp settings");
      break;
    case "codex":
      report.activate.push("- Restart Codex / new thread");
      report.verify.push("- Skill should appear in skill list");
      break;
    case "gemini":
      report.activate.push("- Restart Gemini CLI; run extensions list if used");
      break;
    default:
      report.activate.push("- Reload the agent session / window");
      report.verify.push("- Confirm installed paths exist");
  }
}

// --- main ---
let resolved;
try {
  resolved = resolveSourceTree(String(source));
} catch (e) {
  console.error(String(e?.message || e));
  process.exit(1);
}

let classification = classifyLocalTree(resolved.localPath);
report.type = classification.type;

// Marketplace short-circuit
if (classification.type === "marketplace") {
  report.strategy = "list_and_choose_unit";
  if (nameFilter) {
    const plug = classification.marketplacePlugins.find(
      (p) => p.name.toLowerCase() === nameFilter.toLowerCase(),
    );
    if (!plug) {
      report.actions.push("Marketplace plugin name not found");
      report.stillNeeded.push(
        "Choose one of: " +
          classification.marketplacePlugins.map((p) => p.name).join(", "),
      );
      finish(1);
    }
    const srcPath =
      typeof plug.source === "string" && !plug.source.startsWith("http")
        ? resolve(classification.root, plug.source)
        : plug.source;
    report.actions.push(`Selected marketplace unit ${plug.name} → ${srcPath}`);
    if (typeof srcPath === "string" && pathExists(String(srcPath))) {
      classification = classifyLocalTree(String(srcPath));
      report.type = classification.type;
      resolved = { ...resolved, localPath: String(srcPath) };
    } else {
      report.stillNeeded.push(
        `Resolve marketplace source for ${plug.name}: ${JSON.stringify(plug.source)}`,
      );
      finish(1);
    }
  } else {
    report.actions.push(
      "Source is a marketplace — pick one plugin unit (pass --name <plugin>)",
    );
    for (const p of classification.marketplacePlugins.slice(0, 40)) {
      report.actions.push(
        `  candidate: ${p.name} (${typeof p.source === "string" ? p.source : "complex source"})`,
      );
    }
    report.stillNeeded.push("Re-run with --name <plugin-name>");
    finish(0);
  }
}

const strategy = pickStrategy(classification);
report.strategy = strategy;
const skillsRoot =
  flag(args, "dest-skills") ||
  skillInstallDir(harness, scope, cwd);

report.actions.push(`Using skills root: ${skillsRoot}`);

if (strategy === "skills_cli_or_copy") {
  const sh = githubShorthand(String(source));
  report.actions.push(`Trying npx skills add ${sh} for harness ${harness}`);
  const cli = trySkillsCli({
    shorthand: sh,
    harness,
    skillName: nameFilter,
    globalScope: scope === "global",
    yes,
  });
  if (cli.ok) {
    report.actions.push(`skills-cli OK via -a ${cli.agent}`);
    report.strategy = "skills_cli";
    if (cli.stdout?.trim()) report.actions.push(cli.stdout.trim().slice(0, 400));
    // still merge MCP from tree if present
    if (!skillsOnly && classification.mcpServerIds.length) {
      installMcp(classification);
    }
    // Cursor bridge if skills landed in .agents
    if (harness === "cursor" && classification.skills.length && scope === "project") {
      for (const skill of filterSkills(classification.skills)) {
        const bridge = writeCursorBridge(cwd, skill, { dryRun });
        report.paths.push(bridge);
        report.actions.push(`Cursor bridge ${bridge}`);
      }
    }
    activationHints();
    finish(0);
  }
  report.actions.push(
    `skills-cli failed; falling back to copy_skills (${JSON.stringify(cli.errors || cli.reason).slice(0, 300)})`,
  );
  report.strategy = "copy_skills";
  installSkillsFromClassification(classification, skillsRoot);
  if (!skillsOnly && classification.mcpServerIds.length) installMcp(classification);
  activationHints();
  finish(0);
}

if (strategy === "copy_skills" || strategy === "extract_skills_and_copy") {
  if (strategy === "extract_skills_and_copy") {
    report.actions.push(
      "Extracting skills (and MCP) from foreign/native plugin; hooks/agents may be skipped. Pass --convert for full polyglot port.",
    );
  }
  installSkillsFromClassification(classification, skillsRoot);
  if (!skillsOnly && classification.mcpServerIds.length) installMcp(classification);
  activationHints();
  finish(0);
}

if (strategy === "merge_mcp") {
  installMcp(classification);
  activationHints();
  finish(0);
}

if (strategy === "convert_then_install") {
  const pkgName =
    nameFilter ||
    classification.skillNames[0] ||
    slugify(basename(resolved.localPath)) ||
    "converted-plugin";
  const dest =
    String(flag(args, "dest", "")) ||
    join(homedir(), "Developer", "harness-plugins", pkgName);
  report.actions.push(
    `${dryRun ? "Would convert" : "Converting"} → ${dest} (name=${pkgName})`,
  );
  if (dryRun) {
    report.paths.push(dest);
    report.stillNeeded.push("Re-run without --dry-run to convert and install");
    finish(0);
  }
  const conv = runConvert({
    source: resolved.localPath,
    dest,
    name: pkgName,
  });
  if (!conv.ok) {
    report.actions.push(
      `convert failed: ${(conv.stderr || conv.reason || "").slice(0, 500)}`,
    );
    report.actions.push("Falling back to extract_skills_and_copy");
    installSkillsFromClassification(classification, skillsRoot);
    if (classification.mcpServerIds.length) installMcp(classification);
    activationHints();
    finish(1);
  }
  report.actions.push(`Converted package at ${dest}`);
  report.paths.push(dest);
  const poly = classifyLocalTree(dest);
  installSkillsFromClassification(poly, skillsRoot);
  if (poly.mcpServerIds.length) installMcp(poly);
  activationHints();
  finish(0);
}

if (strategy === "native_plugin_install") {
  report.actions.push(
    `Source looks native for ${harness}. Automated full plugin enablement varies by CLI; installing skills+MCP into standard paths, plus native hints.`,
  );
  installSkillsFromClassification(classification, skillsRoot);
  if (classification.mcpServerIds.length) installMcp(classification);

  if (harness === "claude-code") {
    report.stillNeeded.push(
      "If you need the full Claude plugin (hooks/marketplace): /plugin marketplace add <owner/repo> then install the plugin by name",
    );
    report.stillNeeded.push(
      `Or keep plugin checkout and point Claude at: ${resolved.localPath}`,
    );
  }
  if (harness === "gemini") {
    report.stillNeeded.push(
      `Try: gemini extensions install ${resolved.remote || resolved.localPath}`,
    );
  }
  if (harness === "cursor" && classification.bridges.cursorPlugin) {
    report.stillNeeded.push(
      "Cursor plugin manifest detected — ensure project contains .cursor-plugin/ and reload Cursor",
    );
  }
  activationHints();
  finish(0);
}

// manual
report.strategy = "manual";
report.actions.push(
  "Could not auto-install this layout. Classification dump follows for manual steps from harness-install-matrix.md",
);
report.actions.push(
  `type=${classification.type} skills=${classification.skillNames.join(",") || "-"} mcp=${classification.mcpServerIds.join(",") || "-"}`,
);
report.stillNeeded.push("Read references/harness-install-matrix.md for " + harness);
report.stillNeeded.push(`Source tree: ${resolved.localPath}`);
activationHints();
finish(1);

function finish(code) {
  if (asJson) {
    printJson(report);
  } else {
    printReport(report);
  }
  process.exit(code);
}
