#!/usr/bin/env node
import { basename, dirname, join, resolve } from "node:path";
import {
  chmodExec,
  isDir,
  isFile,
  isScriptFile,
  listDirs,
  listFiles,
  pathExists,
  readText,
  writeText,
  ensureDir,
} from "./fs-utils.mjs";
import { renameSync } from "node:fs";

/** @typedef {{ raw: string, data: Record<string,string>, body: string, order: string[] }} ParsedSkill */

export function parseSkillMd(text) {
  if (!text.startsWith("---")) {
    return { raw: text, data: {}, body: text, order: [] };
  }
  const parts = text.split("---", 2);
  // split only peels first ---; find second fence
  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    return { raw: text, data: {}, body: text, order: [] };
  }
  const fmBlock = text.slice(4, end).replace(/^\n/, "");
  const body = text.slice(end + 4).replace(/^\n/, "");
  const data = {};
  const order = [];
  for (const line of fmBlock.split("\n")) {
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
    order.push(k);
  }
  return { raw: text, data, body, order };
}

export function serializeSkillMd(data, body, order = []) {
  const preferred = [
    "name",
    "description",
    "version",
    "author",
    "license",
    "compatibility",
    "argument-hint",
    "metadata",
  ];
  const keys = [];
  for (const k of preferred) if (k in data && !keys.includes(k)) keys.push(k);
  for (const k of order) if (k in data && !keys.includes(k)) keys.push(k);
  for (const k of Object.keys(data)) if (!keys.includes(k)) keys.push(k);

  const lines = ["---"];
  for (const k of keys) {
    const v = data[k] ?? "";
    const s = String(v);
    if (s.startsWith("[") || s.startsWith("{")) lines.push(`${k}: ${s}`);
    else if (/[:#]/.test(s) || /^\s|\s$/.test(s) || s.includes(" ") || s.includes('"')) {
      lines.push(`${k}: "${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    } else lines.push(`${k}: ${s}`);
  }
  lines.push("---");
  const bodyOut = body.startsWith("\n") ? body : "\n" + body;
  return lines.join("\n") + bodyOut.replace(/^\n/, "\n");
}

export function enhanceFrontmatter(parsed, { name, version = "1.0.0", author = "polyglot port" }) {
  const data = { ...parsed.data };
  data.name = name;
  if (!data.description) {
    data.description = `Use the ${name} skill from this polyglot plugin package.`;
  }
  if (!data.version) data.version = version;
  if (!data.author) data.author = author;
  if (!data.license) data.license = "SEE LICENSE IN LICENSE";
  if (!data.compatibility) {
    data.compatibility =
      "requires: node>=20; optional runtime build via pnpm if package includes runtime/";
  }
  return data;
}

export function rewriteHarnessPaths(text, { envRoot = "PLUGIN_ROOT" } = {}) {
  let t = text;
  const pairs = [
    ["${CLAUDE_PLUGIN_ROOT}/agents/", "${AGENTS_DIR}/"],
    ["$CLAUDE_PLUGIN_ROOT/agents/", "${AGENTS_DIR}/"],
    ["${CLAUDE_PLUGIN_ROOT}/skills/", "${PLUGIN_ROOT}/.agents/skills/"],
    ["$CLAUDE_PLUGIN_ROOT/skills/", "${PLUGIN_ROOT}/.agents/skills/"],
    ["${CLAUDE_PLUGIN_ROOT}/packages/", "${RUNTIME_ROOT}/packages/"],
    ["$CLAUDE_PLUGIN_ROOT/packages/", "${RUNTIME_ROOT}/packages/"],
    ["${PLUGIN_ROOT}/skills/", "${PLUGIN_ROOT}/.agents/skills/"],
    ["$PLUGIN_ROOT/skills/", "$PLUGIN_ROOT/.agents/skills/"],
  ];
  for (const [a, b] of pairs) t = t.split(a).join(b);
  t = t.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${PLUGIN_ROOT}");
  t = t.replace(/\$CLAUDE_PLUGIN_ROOT\b/g, "$PLUGIN_ROOT");
  t = t.split("the Task tool").join("your harness's subagent/task tool (Task, agent, or parallel run)");
  t = t.split("Task tool").join("subagent/task tool");
  // keep product name mentions; only soften standalone "Claude Code" as harness when used as runner
  t = t.replace(/\bClaude Code\b/g, "your coding agent harness");
  // expose env root in comments if useful
  if (envRoot && envRoot !== "PLUGIN_ROOT") {
    t = t.replace(
      /PLUGIN_ROOT="\$\{PLUGIN_ROOT:-\$\{CLAUDE_PLUGIN_ROOT:-\}\}"/g,
      `PLUGIN_ROOT="\${${envRoot}:-\${CLAUDE_PLUGIN_ROOT:-}}"`
    );
  }
  return t;
}

export function rootResolutionBlock(envRoot, packageName) {
  return `
## Plugin root resolution (polyglot)

Before running scripts or loading agent prompts, resolve paths with:

\`\`\`bash
# Resolve plugin root across harnesses (Claude Code, Cursor, Codex, Warp, local checkout)
PLUGIN_ROOT="\${${envRoot}:-\${CLAUDE_PLUGIN_ROOT:-}}"
if [ -z "$PLUGIN_ROOT" ] || [ ! -d "$PLUGIN_ROOT" ]; then
  CANDIDATES=(
    "\${SKILL_DIR%/skills/*}"
    "\${SKILL_DIR}/../../.."
    "$(cd "$(dirname "\${BASH_SOURCE[0]:-$0}")/../../.." 2>/dev/null && pwd)"
    "$HOME/.agents/plugins/${packageName}"
    "$HOME/Developer/harness-plugins/${packageName}"
  )
  for c in "\${CANDIDATES[@]}"; do
    if [ -n "$c" ] && [ -d "$c/.agents/skills" ]; then PLUGIN_ROOT="$(cd "$c" && pwd)"; break; fi
  done
fi
RUNTIME_ROOT="\${PLUGIN_ROOT}/runtime"
AGENTS_DIR="\${PLUGIN_ROOT}/.agents/agents"
\`\`\`

Use \`\${AGENTS_DIR}/<agent>.md\` for analyzer prompts and \`\${PLUGIN_ROOT}/.agents/skills/<skill>/scripts/...\` for skill scripts.
Build runtime once with \`pnpm install && pnpm -C "$RUNTIME_ROOT" build\` when this package vendors a \`runtime/\` tree.
`;
}

export function injectAfterH1(body, block) {
  if (body.includes("## Plugin root resolution (polyglot)") || body.includes("## Plugin layout (polyglot)")) {
    return body;
  }
  const lines = body.split("\n");
  const out = [];
  let inserted = false;
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (!inserted && lines[i].startsWith("# ")) {
      out.push(block.trimEnd());
      inserted = true;
    }
  }
  if (!inserted) return block + "\n" + body;
  return out.join("\n");
}

/**
 * Condense long skill bodies: keep headers + limited lines per section; dump full body to references.
 */
export function condenseBody(name, body, { maxSectionLines = 12, optionsLimit = 40 } = {}) {
  const bodyLines = body.split("\n");
  const condensed = [];
  let i = 0;
  while (i < bodyLines.length) {
    const line = bodyLines[i];
    if (line.startsWith("# ")) {
      condensed.push(line);
      i++;
      while (i < bodyLines.length && !bodyLines[i].startsWith("## ")) {
        condensed.push(bodyLines[i]);
        i++;
      }
      continue;
    }
    if (line.startsWith("## ")) {
      condensed.push(line);
      i++;
      const isPhase = line.toLowerCase().startsWith("## phase");
      const limit = isPhase ? maxSectionLines : optionsLimit;
      let count = 0;
      while (i < bodyLines.length && !bodyLines[i].startsWith("## ")) {
        if (count < limit) {
          condensed.push(bodyLines[i]);
          count++;
        }
        i++;
      }
      if (isPhase && count >= limit) {
        condensed.push("");
        condensed.push(
          `> **Full details:** read \`../../references/${name}-full-protocol.md\` section \`${line.replace(/^#+\s*/, "")}\`.`
        );
        condensed.push("");
      }
      continue;
    }
    condensed.push(line);
    i++;
  }

  const pointer = `
## Full protocol reference
This SKILL.md is condensed for cross-agent loading limits. **Before executing multi-phase work, read the complete protocol:** [references/${name}-full-protocol.md](../../references/${name}-full-protocol.md)
Shared agent prompts live in \`.agents/agents/\`. Runtime packages live in \`runtime/\`.
`;
  const out = [];
  let injected = false;
  for (const line of condensed) {
    out.push(line);
    if (!injected && line.startsWith("# ")) {
      out.push(pointer.trimEnd());
      injected = true;
    }
  }
  return out.join("\n") + "\n";
}

export function scriptsSection(skillName, scriptNames, { hasAgents = true } = {}) {
  const lines = ["", "## Scripts and agents (polyglot paths)", ""];
  if (scriptNames.length) {
    lines.push(`Scripts directory: \`\${PLUGIN_ROOT}/.agents/skills/${skillName}/scripts/\``);
    lines.push("");
    for (const s of scriptNames) lines.push(`- \`${s}\``);
    lines.push("");
    lines.push("Example:");
    lines.push("```bash");
    lines.push(`SCRIPTS="\${PLUGIN_ROOT}/.agents/skills/${skillName}/scripts"`);
    for (const s of scriptNames.slice(0, 8)) {
      const cmd = s.endsWith(".py") ? "python3" : "node";
      lines.push(`${cmd} "$SCRIPTS/${s}"  # see skill instructions for args`);
    }
    lines.push("```");
    lines.push("");
  }
  lines.push(
    `Canonical skill path: \`.agents/skills/${skillName}/SKILL.md\`. ` +
      (hasAgents
        ? "Shared agents: `${AGENTS_DIR}` (`.agents/agents/`)."
        : "Shared agents: optional under `.agents/agents/`.") +
      " Runtime: `${RUNTIME_ROOT}`."
  );
  lines.push("");
  return lines.join("\n");
}

export function upsertSection(body, heading, sectionText) {
  const re = new RegExp(`\\n${escapeRegExp(heading)}[\\s\\S]*?(?=\\n## |$)`);
  if (re.test("\n" + body) || body.includes(heading)) {
    return body.replace(re, "\n" + sectionText.trimEnd() + "\n");
  }
  // insert after plugin root / layout / h1
  for (const marker of [
    "## Plugin root resolution (polyglot)",
    "## Plugin layout (polyglot)",
    "## Full protocol reference",
  ]) {
    if (body.includes(marker)) {
      const pos = body.indexOf(marker);
      const nxt = body.indexOf("\n## ", pos + marker.length);
      if (nxt === -1) return body + "\n" + sectionText;
      return body.slice(0, nxt) + "\n" + sectionText + body.slice(nxt);
    }
  }
  return injectAfterH1(body, "\n" + sectionText);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeSkillScriptsDir(skillDir) {
  const scriptsDir = join(skillDir, "scripts");
  ensureDir(scriptsDir);
  const moved = [];
  for (const f of listFiles(skillDir)) {
    const base = basename(f);
    if (base === "SKILL.md") continue;
    if (!isScriptFile(f)) continue;
    // only skill-root level files
    if (join(skillDir, base) !== f) continue;
    const dest = join(scriptsDir, base);
    if (pathExists(dest)) {
      // keep existing scripts/ copy
      try {
        renameSync(f, f + ".bak-removed");
      } catch {
        /* ignore */
      }
    } else {
      renameSync(f, dest);
      moved.push(base);
    }
    chmodExec(dest);
  }
  for (const f of listFiles(scriptsDir)) chmodExec(f);
  return listFiles(scriptsDir).map((p) => basename(p)).sort();
}

export function listSkillMetas(destRoot) {
  const skillsRoot = join(destRoot, ".agents/skills");
  const metas = [];
  for (const dir of listDirs(skillsRoot)) {
    const sm = join(dir, "SKILL.md");
    if (!isFile(sm)) continue;
    const parsed = parseSkillMd(readText(sm));
    metas.push({
      name: basename(dir),
      dir,
      description: parsed.data.description || "",
      version: parsed.data.version || "1.0.0",
      path: sm,
    });
  }
  return metas.sort((a, b) => a.name.localeCompare(b.name));
}


function resolveManifestSkillPaths(sourceRoot, pluginRoot) {
  const manifests = [
    join(pluginRoot, ".github/plugin/plugin.json"),
    join(sourceRoot, ".github/plugin/plugin.json"),
    join(pluginRoot, "plugin.json"),
    join(sourceRoot, "plugin.json"),
    join(pluginRoot, ".claude-plugin/plugin.json"),
    join(sourceRoot, ".claude-plugin/plugin.json"),
    join(pluginRoot, ".cursor-plugin/plugin.json"),
    join(sourceRoot, ".cursor-plugin/plugin.json"),
  ];
  const roots = [
    pluginRoot,
    sourceRoot,
    join(pluginRoot, ".."),
    join(pluginRoot, "../.."),
    join(pluginRoot, "../../.."),
    join(sourceRoot, ".."),
    join(sourceRoot, "../.."),
    join(sourceRoot, "../../.."),
  ].map((r) => {
    try { return resolve(r); } catch { return r; }
  });
  // de-dupe
  const seenRoots = new Set();
  const uniqRoots = [];
  for (const r of roots) {
    if (seenRoots.has(r)) continue;
    seenRoots.add(r);
    uniqRoots.push(r);
  }
  const out = { skills: [], agents: [], mcpServers: null, name: null, description: null };
  for (const m of manifests) {
    if (!pathExists(m)) continue;
    let j;
    try { j = JSON.parse(readText(m)); } catch { continue; }
    if (j.name) out.name = j.name;
    if (j.description) out.description = j.description;
    const skillEntries = [].concat(j.skills || []).flatMap((s) => (typeof s === "string" ? [s] : []));
    const agentEntries = [].concat(j.agents || []).flatMap((s) => (typeof s === "string" ? [s] : []));
    for (const ent of skillEntries) {
      const rel = ent.replace(/^\.\//, "").replace(/\/$/, "");
      for (const root of uniqRoots) {
        const candDir = join(root, rel);
        const candSkill = join(candDir, "SKILL.md");
        if (isFile(candSkill)) {
          out.skills.push(candDir);
          break;
        }
        if (isFile(join(root, rel + ".md"))) {
          out.skills.push(join(root, rel + ".md"));
          break;
        }
      }
    }
    for (const ent of agentEntries) {
      const rel = ent.replace(/^\.\//, "");
      for (const root of uniqRoots) {
        const c1 = join(root, rel);
        const c2 = join(root, rel.replace(/\.md$/, "") + ".agent.md");
        const c3 = join(root, rel.replace(/\.agent\.md$/, "") + ".md");
        if (isFile(c1)) { out.agents.push(c1); break; }
        if (isFile(c2)) { out.agents.push(c2); break; }
        if (isFile(c3)) { out.agents.push(c3); break; }
      }
    }
    if (j.mcpServers) out.mcpServers = j.mcpServers;
    break;
  }
  return out;
}

export function discoverSourceLayout(sourceRoot) {
  const candidates = [
    join(sourceRoot, "skills"),
    join(sourceRoot, ".agents/skills"),
    join(sourceRoot, ".agent/skills"), // Antigravity singular
    join(sourceRoot, ".cursor/skills"),
    join(sourceRoot, ".codex/skills"),
    join(sourceRoot, ".gemini/skills"),
    join(sourceRoot, ".opencode/skills"),
    join(sourceRoot, ".windsurf/skills"),
    join(sourceRoot, ".cline/skills"),
    join(sourceRoot, ".clinerules/skills"),
    join(sourceRoot, ".roo/skills"),
    join(sourceRoot, ".kilocode/skills"),
    join(sourceRoot, ".kiro/skills"),
    join(sourceRoot, ".goose/skills"),
    join(sourceRoot, ".continue/skills"),
    join(sourceRoot, ".github/skills"),
    join(sourceRoot, ".copilot/skills"),
    join(sourceRoot, "app/skills"),
    join(sourceRoot, "agent-skills"),
  ];
  for (const d of listDirs(sourceRoot)) {
    const n = basename(d);
    if (
      n.endsWith("-plugin") ||
      n === "plugin" ||
      n === "plugins" ||
      n === "skills" ||
      n === "app" ||
      n === ".agent" ||
      n === ".agents" ||
      n === ".gemini" ||
      n === ".opencode" ||
      n === ".windsurf" ||
      n === ".cline" ||
      n === ".roo" ||
      n === ".github" ||
      pathExists(join(d, "skills")) ||
      pathExists(join(d, "SKILL.md")) ||
      pathExists(join(d, "gemini-extension.json"))
    ) {
      candidates.push(join(d, "skills"));
      candidates.push(join(d, ".agents/skills"));
      candidates.push(join(d, ".agent/skills"));
      candidates.push(join(d, ".cursor/skills"));
      candidates.push(join(d, ".gemini/skills"));
      candidates.push(join(d, ".opencode/skills"));
      candidates.push(d);
    }
  }
  candidates.push(sourceRoot);

  function isFlatSkillsDir(dir) {
    if (!isDir(dir)) return false;
    if (listDirs(dir).some((s) => isFile(join(s, "SKILL.md")))) return false;
    return listFiles(dir).some(
      (f) => f.endsWith(".md") && basename(f).toLowerCase() !== "readme.md"
    );
  }

  function hasSkillContent(dir) {
    if (!isDir(dir)) return false;
    if (isFile(join(dir, "SKILL.md"))) return true;
    if (listDirs(dir).some((s) => isFile(join(s, "SKILL.md")))) return true;
    return isFlatSkillsDir(dir);
  }

  let skillsDir = candidates.find((p) => hasSkillContent(p)) || null;
  let pluginRoot = sourceRoot;
  let flatSkillFiles = false;
  if (skillsDir) {
    if (isFile(join(skillsDir, "SKILL.md")) && basename(skillsDir) !== "skills") {
      pluginRoot = join(skillsDir, "..");
    } else if (basename(skillsDir) === "skills") {
      pluginRoot = join(skillsDir, "..");
      flatSkillFiles = isFlatSkillsDir(skillsDir);
    } else if (
      skillsDir.endsWith(".agents/skills") ||
      skillsDir.endsWith(".cursor/skills") ||
      skillsDir.endsWith(".codex/skills")
    ) {
      pluginRoot = join(skillsDir, "../..");
      flatSkillFiles = isFlatSkillsDir(skillsDir);
    }
  }

  const agentsDir = [
    join(pluginRoot, "agents"),
    join(pluginRoot, ".agents/agents"),
    join(sourceRoot, "agents"),
  ].find((p) => isDir(p));

  const hooksDir = [
    join(pluginRoot, "hooks"),
    join(pluginRoot, ".agents/hooks"),
    join(sourceRoot, "hooks"),
  ].find((p) => isDir(p));

  const packagesDir = [
    join(pluginRoot, "packages"),
    join(sourceRoot, "packages"),
  ].find((p) => isDir(p));

  const skills = [];
  if (skillsDir) {
    if (isFile(join(skillsDir, "SKILL.md"))) {
      const text = readText(join(skillsDir, "SKILL.md"));
      skills.push({
        name: basename(skillsDir),
        path: skillsDir,
        lines: text.split("\n").length,
        description: parseSkillMd(text).data.description || "",
        flatFile: null,
      });
    } else if (flatSkillFiles) {
      for (const f of listFiles(skillsDir)) {
        if (!f.endsWith(".md")) continue;
        const base = basename(f);
        if (base.toLowerCase() === "readme.md") continue;
        const text = readText(f);
        const name = base.replace(/\.md$/i, "");
        skills.push({
          name,
          path: f,
          lines: text.split("\n").length,
          description: parseSkillMd(text).data.description || "",
          flatFile: f,
        });
      }
    } else {
      for (const d of listDirs(skillsDir)) {
        const smFile = join(d, "SKILL.md");
        if (!isFile(smFile)) continue;
        const text = readText(smFile);
        skills.push({
          name: basename(d),
          path: d,
          lines: text.split("\n").length,
          description: parseSkillMd(text).data.description || "",
          flatFile: null,
        });
      }
    }
  }


  const manifest = resolveManifestSkillPaths(sourceRoot, pluginRoot);
  for (const d of manifest.skills) {
    if (isFile(join(d, "SKILL.md"))) {
      const name = basename(d);
      if (skills.some((s) => s.name === name)) continue;
      const text = readText(join(d, "SKILL.md"));
      skills.push({ name, path: d, lines: text.split("\n").length, description: parseSkillMd(text).data.description || "", flatFile: null });
    }
  }
  if (!skillsDir && skills.length) {
    skillsDir = isFile(join(skills[0].path, "SKILL.md")) ? join(skills[0].path, "..") : dirname(skills[0].path);
  }
  const manifestAgentFiles = manifest.agents || [];

  const mcpCandidates = [
    join(pluginRoot, ".mcp.json"),
    join(pluginRoot, "mcp.json"),
    join(pluginRoot, "mcp_config.json"),
    join(sourceRoot, ".mcp.json"),
    join(sourceRoot, "mcp.json"),
    join(sourceRoot, "mcp_config.json"),
    join(pluginRoot, ".agent/mcp_config.json"),
    join(sourceRoot, ".agent/mcp_config.json"),
    join(pluginRoot, "gemini-extension.json"),
  ];
  const mcpConfig = mcpCandidates.find((p) => pathExists(p)) || null;

  return {
    sourceRoot,
    pluginRoot,
    skillsDir,
    agentsDir: agentsDir || null,
    hooksDir: hooksDir || null,
    packagesDir: packagesDir || null,
    hasRuntime: Boolean(packagesDir),
    flatSkillFiles,
    mcpConfig,
    skills: skills.sort((a, b) => a.name.localeCompare(b.name)),
    manifests: {
      claude:
        pathExists(join(sourceRoot, ".claude-plugin/plugin.json")) ||
        pathExists(join(pluginRoot, ".claude-plugin/plugin.json")),
      cursor:
        pathExists(join(sourceRoot, ".cursor-plugin/plugin.json")) ||
        pathExists(join(pluginRoot, ".cursor-plugin/plugin.json")),
      copilot:
        pathExists(join(sourceRoot, ".copilot-plugin/plugin.json")) ||
        pathExists(join(sourceRoot, ".github/plugin/plugin.json")) ||
        pathExists(join(pluginRoot, ".github/plugin/plugin.json")),
    },
  };
}