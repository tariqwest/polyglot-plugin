#!/usr/bin/env node
import { join } from "node:path";
import {
  writeJson,
  writeText,
  ensureDir,
  pathExists,
  readText,
  chmodExec,
} from "./fs-utils.mjs";
import { listSkillMetas } from "./skill-md.mjs";

export function generateAllBridges({
  dest,
  name,
  envRoot,
  description,
  version = "1.0.0",
  upstreamUrl = "",
}) {
  const metas = listSkillMetas(dest);
  const desc =
    description ||
    metas.map((m) => m.description).filter(Boolean)[0] ||
    `${name} polyglot agent plugin`;

  writeCursorRules(dest, name, metas, desc);
  writeCopilot(dest, name, metas);
  writeGrok(dest, name, desc);
  writeAgentsMd(dest, name, envRoot, metas, upstreamUrl);
  writeAiPlugin(dest, name, desc, version, upstreamUrl, metas);
  writeMcp(dest, name, envRoot);
  writeCompatManifests(dest, name, desc, version);
  writeRootPackageJson(dest, name, version, desc, upstreamUrl);
  writeReadme(dest, name, envRoot, metas, desc, version, upstreamUrl);
  writeMcpServer(dest, name, envRoot, version);
  mergeUpstreamMcp(dest, name, envRoot);
  adaptHooks(dest, envRoot);
}

function mergeUpstreamMcp(dest, name, envRoot) {
  const candidates = [
    join(dest, ".mcp.json"),
    join(dest, "mcp.json"),
    join(dest, "mcp_config.json"),
    join(dest, ".agents/references/mcp/.mcp.json"),
    join(dest, ".agents/references/mcp/mcp.json"),
    join(dest, ".agents/references/mcp/mcp_config.json"),
  ];
  let upstream = null;
  for (const p of candidates) {
    if (!pathExists(p)) continue;
    try {
      const j = JSON.parse(readText(p));
      let servers = j.mcpServers || j.servers || null;
      // Official Claude plugins often use bare { serverName: config } without mcpServers wrapper
      if (!servers && j && typeof j === "object") {
        const keys = Object.keys(j);
        const looksLikeServers =
          keys.length > 0 &&
          keys.every((k) => {
            const v = j[k];
            return v && typeof v === "object" && (v.command || v.url || v.type);
          });
        if (looksLikeServers) servers = j;
      }
      if (servers && typeof servers === "object") {
        upstream = servers;
        break;
      }
    } catch {
      /* ignore */
    }
  }
  const mcpPath = join(dest, "mcp.json");
  let current = { mcpServers: {} };
  if (pathExists(mcpPath)) {
    try {
      current = JSON.parse(readText(mcpPath));
    } catch {
      /* ignore */
    }
  }
  if (!current.mcpServers) current.mcpServers = {};
  if (!current.mcpServers[name]) {
    current.mcpServers[name] = {
      command: "node",
      args: ["./scripts/mcp-server.mjs"],
      cwd: ".",
      env: { [envRoot]: "." },
    };
  }
  if (upstream) {
    for (const [k, val] of Object.entries(upstream)) {
      if (k === name) continue;
      current.mcpServers[k] = val;
    }
    writeText(
      join(dest, ".agents/references/mcp/README.md"),
      [
        "# Upstream MCP (vendored)",
        "",
        "Servers came from the source plugin.",
        "Rewrite `${CLAUDE_PLUGIN_ROOT}` and relative paths to `${" + envRoot + "}` or absolute package paths before use.",
        "Merged into root `mcp.json` / `.mcp.json` alongside the polyglot helper server.",
        "",
      ].join("\n")
    );
  }
  writeJson(mcpPath, current);
  writeJson(join(dest, ".mcp.json"), current);
}


function writeCursorRules(dest, name, metas, desc) {
  const dir = ensureDir(join(dest, ".cursor/rules"));
  for (const m of metas) {
    writeText(
      join(dir, `${m.name}.mdc`),
      `---
description: ${escapeYaml(m.description || m.name)}
globs:
alwaysApply: false
---
# ${m.name}

Use this rule when the user intent matches: ${m.description || m.name}

## Canonical skill
Read and follow: \`.agents/skills/${m.name}/SKILL.md\`

## Package context
- Package: \`${name}\`
- Agents: \`.agents/agents/\`
- Runtime: \`runtime/\` (if present)
`
    );
  }
  writeText(
    join(dir, `${name}.mdc`),
    `---
description: ${escapeYaml(desc)}
globs:
alwaysApply: false
---
# ${name}

## Skills
${metas.map((m) => `- **${m.name}**: ${m.description}`).join("\n")}

## How to load
1. Set package root env var (see README).
2. Open \`.agents/skills/<name>/SKILL.md\`.
3. Agents in \`.agents/agents/\`; build \`runtime/\` if present.
`
  );
}

function writeCopilot(dest, name, metas) {
  const lines = [
    `# GitHub Copilot instructions — ${name} (polyglot port)`,
    "",
    "Polyglot agent skill bundle. Load matching `.agents/skills/*/SKILL.md` when intent matches.",
    "",
    "## Skills",
    "",
  ];
  for (const m of metas) {
    lines.push(`### ${m.name}`, m.description, `Follow: \`.agents/skills/${m.name}/SKILL.md\``, "");
  }
  lines.push(
    "## Shared resources",
    "- `.agents/agents/`",
    "- `runtime/` (optional)",
    "- `.agents/references/`",
    ""
  );
  writeText(join(dest, ".github/copilot-instructions.md"), lines.join("\n"));
}

function writeGrok(dest, name, desc) {
  writeText(
    join(dest, ".grok/config.toml"),
    `# Grok Build — Open Agent Skills
[skills]
paths = ["./.agents/skills"]

[project]
name = "${name}"
description = ${JSON.stringify(desc)}
`
  );
}

function writeAgentsMd(dest, name, envRoot, metas, upstreamUrl) {
  const lines = [
    `# AGENTS.md — ${name}`,
    "",
    upstreamUrl ? `Polyglot port of ${upstreamUrl}.` : `Polyglot package: ${name}.`,
    "Skills: `.agents/skills/` (folder name == frontmatter `name:`).",
    "",
    "## Environment",
    "",
    "```bash",
    `export ${envRoot}="$(pwd)"`,
    "```",
    "",
    "## Runtime (if present)",
    "",
    "```bash",
    "cd runtime && pnpm install && pnpm build",
    "```",
    "",
    "## Skills",
    "",
  ];
  for (const m of metas) {
    lines.push(`### \`${m.name}\``, "", m.description || "", "", `- \`.agents/skills/${m.name}/SKILL.md\``, "");
  }
  writeText(join(dest, "AGENTS.md"), lines.join("\n"));
}

function writeAiPlugin(dest, name, desc, version, upstreamUrl, metas) {
  writeJson(join(dest, "ai-plugin.json"), {
    schema_version: "v1",
    name_for_human: titleize(name),
    name_for_model: name.replace(/-/g, "_"),
    description_for_human: desc,
    description_for_model:
      `Use for ${name}. Skills: ${metas.map((m) => m.name).join(", ")}. ${desc}`,
    auth: { type: "none" },
    api: { type: "none" },
    logo_url: "",
    contact_email: "",
    legal_info_url: upstreamUrl || "",
    metadata: {
      version,
      skills_path: ".agents/skills",
      agents_path: ".agents/agents",
      runtime_path: "runtime",
      upstream: upstreamUrl || "",
    },
  });
}

function writeMcp(dest, name, envRoot) {
  writeJson(join(dest, "mcp.json"), {
    mcpServers: {
      [name]: {
        command: "node",
        args: ["./scripts/mcp-server.mjs"],
        cwd: ".",
        env: { [envRoot]: "." },
      },
    },
  });
}

function writeCompatManifests(dest, name, desc, version) {
  const body = {
    name,
    description: desc,
    version,
    skills: "./.agents/skills/",
    agents: "./.agents/agents/",
  };
  writeJson(join(dest, ".claude-plugin/plugin.json"), {
    ...body,
    author: { name: "polyglot port" },
    hooks: "./.agents/hooks/hooks.json",
  });
  writeJson(join(dest, ".cursor-plugin/plugin.json"), body);
  writeJson(join(dest, ".copilot-plugin/plugin.json"), body);
}

function writeRootPackageJson(dest, name, version, desc, upstreamUrl) {
  const pkg = {
    name: `${name}-polyglot`,
    version,
    private: true,
    description: desc,
    type: "module",
    scripts: {
      mcp: "node ./scripts/mcp-server.mjs",
      "runtime:install": "pnpm -C runtime install",
      "runtime:build": "pnpm -C runtime build",
    },
    keywords: ["agent-skills", "polyglot-plugin", name, "mcp"],
    license: "SEE LICENSE IN LICENSE",
  };
  if (upstreamUrl) pkg.repository = { type: "git", url: upstreamUrl };
  writeJson(join(dest, "package.json"), pkg);
}

function writeReadme(dest, name, envRoot, metas, desc, version, upstreamUrl) {
  const skillTable = metas
    .map((m) => `| \`${m.name}\` | ${m.description || "—"} |`)
    .join("\n");
  writeText(
    join(dest, "README.md"),
    `# ${titleize(name)} (Polyglot Plugin)

${desc}

${upstreamUrl ? `Polyglot port of ${upstreamUrl}.` : ""}
Version: **${version}**.

## Layout

\`\`\`text
${name}/
├── .agents/skills/
├── .agents/agents/
├── .agents/hooks/
├── .agents/references/
├── .cursor/rules/
├── .github/copilot-instructions.md
├── .grok/config.toml
├── AGENTS.md
├── ai-plugin.json
├── mcp.json
├── scripts/mcp-server.mjs
├── runtime/
└── README.md
\`\`\`

## Skills

| Skill | Trigger |
|---|---|
${skillTable}

## Quick start

\`\`\`bash
cd /path/to/${name}
export ${envRoot}="$(pwd)"
pnpm runtime:install && pnpm runtime:build   # if runtime/ exists
\`\`\`

| Harness | Entry |
|---|---|
| Claude Code | \`.claude-plugin/plugin.json\` |
| Cursor | \`.cursor/rules/*.mdc\` |
| Codex / Devin / OpenCode | \`AGENTS.md\` |
| Grok Build | \`.grok/config.toml\` |
| Copilot | \`.github/copilot-instructions.md\` |
| MCP | \`mcp.json\` |

## Differences from single-harness upstream

1. Canonical \`.agents/skills\` + multi-harness bridges
2. Root via \`${envRoot}\` / \`PLUGIN_ROOT\`
3. Scripts under each skill's \`scripts/\`
4. Large skills condensed; full text in \`.agents/references/\`
5. Thin JS MCP helpers

## License

See \`LICENSE\` when present. Upstream: ${upstreamUrl || "(local)"}.
`
  );
}

function writeMcpServer(dest, name, envRoot, version) {
  const p = join(dest, "scripts/mcp-server.mjs");
  const content = `#!/usr/bin/env node
/**
 * Minimal stdio MCP server for ${name} polyglot package.
 */
import { createInterface } from "node:readline";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(
  process.env[${JSON.stringify(envRoot)}] || join(__dirname, "..")
);

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\\n");
}
function ok(id, result) {
  send({ jsonrpc: "2.0", id, result });
}
function err(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function listSkills() {
  const skillsDir = join(ROOT, ".agents/skills");
  const out = [];
  if (!existsSync(skillsDir)) return out;
  for (const n of readdirSync(skillsDir)) {
    const sm = join(skillsDir, n, "SKILL.md");
    if (!existsSync(sm)) continue;
    const text = readFileSync(sm, "utf8");
    const m = text.match(/^description:\\s*"?(.+?)"?\\s*$/m);
    out.push({ name: n, description: m ? m[1] : "", path: ".agents/skills/" + n + "/SKILL.md" });
  }
  return out;
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;
  if (method === "initialize") {
    ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: ${JSON.stringify(name)}, version: ${JSON.stringify(version)} },
    });
    return;
  }
  if (method === "notifications/initialized" || method === "initialized") return;
  if (method === "tools/list") {
    ok(id, {
      tools: [
        {
          name: "ua_package_info",
          description: "Return polyglot package root and key paths.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
        },
        {
          name: "ua_list_skills",
          description: "List skills and descriptions.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
        },
      ],
    });
    return;
  }
  if (method === "tools/call") {
    const tool = params?.name;
    try {
      if (tool === "ua_package_info") {
        ok(id, {
          content: [{
            type: "text",
            text: JSON.stringify({
              root: ROOT,
              skills: join(ROOT, ".agents/skills"),
              agents: join(ROOT, ".agents/agents"),
              runtime: join(ROOT, "runtime"),
            }, null, 2),
          }],
        });
        return;
      }
      if (tool === "ua_list_skills") {
        ok(id, { content: [{ type: "text", text: JSON.stringify(listSkills(), null, 2) }] });
        return;
      }
      err(id, -32601, "Unknown tool: " + tool);
    } catch (e) {
      ok(id, { content: [{ type: "text", text: String(e?.message || e) }], isError: true });
    }
    return;
  }
  if (id !== undefined) err(id, -32601, "Method not found: " + method);
});
`;
  writeText(p, content);
  chmodExec(p);
}

export function adaptHooks(dest, envRoot) {
  const hooksJson = join(dest, ".agents/hooks/hooks.json");
  if (!pathExists(hooksJson)) return;
  let t = readText(hooksJson);
  t = t.split("${CLAUDE_PLUGIN_ROOT}").join(`\${${envRoot}:-\${CLAUDE_PLUGIN_ROOT}}`);
  t = t.split("/hooks/").join("/.agents/hooks/");
  writeText(hooksJson, t);
  writeText(
    join(dest, ".agents/hooks/README.md"),
    `# Hooks (optional harness bridge)

Claude-style lifecycle hooks. Other harnesses: approximate via AGENTS.md or wrappers.
Set \`${envRoot}\` to this package root.
`
  );
}

function titleize(name) {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function escapeYaml(s) {
  return String(s).replace(/\n/g, " ").trim();
}
