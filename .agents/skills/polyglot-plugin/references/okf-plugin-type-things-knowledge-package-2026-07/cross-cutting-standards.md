# Cross-cutting standards for portable agent knowledge

**Status:** living OKF fragment
**As-of:** 2026-07
**Scope:** recurring standards and portability patterns across AI agent plugin/skill/extension systems
**Source:** `okf-plugin-type-things-2026-07.md` in the same references directory

This document collects the standards that show up in more than one agent harness: Open Skills / `SKILL.md`, MCP, instruction files, plugin manifests, and the polyglot package strategy of deriving per-harness bridges from one canonical source.

---

## 1. Open Skills / `SKILL.md` specification and portability model

Open Skills is the `SKILL.md` folder convention maintained at [agentskills.io](https://agentskills.io). It is the closest thing to a cross-tool format for reusable task knowledge.

### 1.1. What a skill is

A skill is a directory that contains, at minimum, a `SKILL.md` file. The directory name and the `name` frontmatter field must match. Supporting files live next to `SKILL.md` and are loaded only when referenced.

Canonical layout:

```text
.agents/skills/<skill-name>/
  SKILL.md              # metadata + instructions
  references/           # deep reference material (loaded on demand)
  scripts/              # helper scripts the skill may invoke
  assets/               # images, schemas, templates
```

`SKILL.md` is Markdown with a YAML frontmatter block between `---` delimiters.

### 1.2. Required and optional frontmatter

| Field | Required | Constraints | Purpose |
|-------|----------|-------------|---------|
| `name` | yes | max 64 chars; lowercase letters, numbers, hyphens; no leading/trailing hyphen; must match the parent directory name | skill id and invocation |
| `description` | yes | max 1024 chars; non-empty; should say what the skill does and when to use it | model trigger for skill selection |
| `license` | no | license name (e.g. `MIT`) or a path to a bundled license file | provenance |
| `compatibility` | no | max 500 chars; environment notes (OS packages, network, intended products) | guardrails |
| `metadata` | no | arbitrary key-value mapping | version, author, tags, etc. |
| `allowed-tools` | no | space-delimited list of pre-approved tool names (experimental) | permission hint |

Minimal example:

```markdown
---
name: run-tests
description: Run the project's test suite, interpret failures, and suggest fixes. Use when the user asks about tests, CI, or debugging failures.
---

## When to use

Activate this skill when the user mentions tests, `pytest`, `vitest`, CI failures, or wants to verify changes.

## Steps

1. Identify the test runner from `package.json`, `pyproject.toml`, or obvious config files.
2. Run the appropriate test command in the project root.
3. Summarize results; if failures exist, read relevant source and propose fixes.
```

### 1.3. Progressive disclosure

Agents load skills in three tiers so context is only consumed when needed.

| Tier | Loaded | When | Token budget |
|------|--------|------|--------------|
| Catalog | `name`, `description`, path | session start | ~50-100 tokens per skill |
| Instructions | full `SKILL.md` body | skill activated | < 5000 tokens recommended |
| Resources | `references/`, `scripts/`, `assets/` | instructions reference them | on demand |

Implications for authors:

- Keep `SKILL.md` lean (under 500 lines). Move long reference material to `references/`.
- Make `description` a clear trigger, not marketing copy.
- Do not put secrets or environment-specific values in `SKILL.md`.

### 1.4. Discovery locations

Most Open Skills hosts scan more than one root. The canonical shared location is `.agents/skills/<name>/SKILL.md`. Common host-specific roots include:

- `.claude/skills/`, `~/.claude/skills/`
- `.github/skills/`, `~/.copilot/skills/`
- `.codex/skills/`, `~/.codex/skills/`
- `.cursor/skills/`, `~/.cursor/skills/`
- `.cline/skills/`, `~/.cline/skills/`
- `.kilo/skills/`, `~/.kilo/skills/`
- `.qwen/skills/`, `~/.qwen/skills/`
- `.gemini/skills/`, `~/.gemini/skills/`
- `.opencode/skills/`, `~/.config/opencode/skills/`
- `.windsurf/skills/`, `.devin/skills/`

When a harness scans multiple roots, the first skill with a given `name` usually wins; duplicates are not merged.

### 1.5. Portability rules

1. Folder name **must equal** frontmatter `name`.
2. `description` is a trigger for the model, not a tagline.
3. Do not embed secrets; use environment references or ask the user to set values.
4. Keep the skill body under the recommended token budget and split reference docs out.
5. Use only Markdown and YAML frontmatter; avoid harness-specific syntax in the canonical skill.

---

## 2. MCP: protocol basics, transports, security, and per-client config shapes

### 2.1. Protocol basics

The Model Context Protocol (MCP) is an open standard for exposing tools, resources, and prompts to an agent at runtime. An MCP server speaks JSON-RPC over a transport; the client discovers capabilities and invokes tools.

Core primitives:

- **Tools** — functions the agent can call (`tools/list`, `tools/call`).
- **Resources** — addressable data the agent can read (`resources/list`, `resources/read`).
- **Prompts** — reusable prompt templates (`prompts/list`, `prompts/get`).

### 2.2. Transports

The MCP specification (2025-11-25) defines two standard transports. The older HTTP+SSE transport from 2024-11-05 was deprecated in 2025-03-26 and should not be used for new servers.

| Transport | Use case | Server lifecycle | Notes |
|-----------|----------|------------------|-------|
| **stdio** | local tools, CLI wrappers, one client per server | client spawns the server as a subprocess | preferred for portability; no network, no auth plumbing |
| **Streamable HTTP** | remote or multi-tenant services | server runs independently; client POSTs to one endpoint, optional GET SSE stream | use for OAuth-protected APIs, team-shared services |
| **HTTP+SSE (legacy)** | backward compatibility only | two-endpoint design (`/sse` + `/messages`) | deprecated; migrate to Streamable HTTP |

Client preference summary:

- **stdio** is the default and most portable choice for local, project-specific tools.
- **Streamable HTTP** is the current remote transport.
- Many clients still accept legacy **SSE** URLs; new servers should not expose them.

### 2.3. Security

- **No secrets in manifests.** API keys, tokens, and passwords must be passed via environment variables or OAuth, never hard-coded in `.mcp.json`, `plugin.json`, or `settings.json`.
- Use `env` references and platform variable interpolation (`${VAR}`, `${env:VAR}`, `${VAR:-default}`).
- For remote servers, prefer OAuth flows or headers populated at runtime.
- Review tool permissions and `autoApprove`/`alwaysAllow` lists; do not whitelist `*`.

### 2.4. Canonical `mcpServers` shape

The most common JSON form is a map of server names to transport configs:

```json
{
  "mcpServers": {
    "local-tool": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {
        "EXAMPLE_API_KEY": "${EXAMPLE_API_KEY}"
      }
    },
    "remote-tool": {
      "type": "streamable-http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${EXAMPLE_TOKEN}"
      }
    }
  }
}
```

`type` values seen in clients include `stdio`, `http`, `streamable-http`, `streamableHttp`, `sse`, `ws`.

### 2.5. Per-client MCP config shapes

| Client | Project config | User / global config | Root key | stdio shape | remote shape | Notes |
|--------|----------------|----------------------|----------|-------------|--------------|-------|
| **Claude Code** | `.mcp.json` | `~/.claude.json` | `mcpServers` | `command`, `args`, `env`, optional `cwd` | `type` (`stdio`/`http`/`streamable-http`/`sse`/`ws`), `url`, `headers` | `CLAUDE_PROJECT_DIR` injected; `${VAR}` and `${VAR:-default}` expansion |
| **Claude Desktop** | — | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS), `%APPDATA%\Claude\claude_desktop_config.json` (Windows), `~/.config/Claude/claude_desktop_config.json` (Linux) | `mcpServers` | same as Claude Code | same as Claude Code | can be imported into Claude Code with `claude mcp add-from-claude-desktop` |
| **Cursor** | `.cursor/mcp.json` | `~/.cursor/mcp.json` | `mcpServers` | `command`, `args`, `env`, `cwd` | `url`, `headers`; supports `stdio`/`http`/`sse` | supports `${env:NAME}`, `${userHome}`, `${workspaceFolder}`, `${workspaceFolderBasename}` |
| **Cline** | — (IDE config panel) | `~/.cline/mcp.json` (CLI), VS Code globalStorage `.../cline_mcp_settings.json` (IDE) | `mcpServers` | `command`, `args`, `env`, `cwd`, `autoApprove`, `disabled`, `timeout` | `type` (`streamableHttp` or `sse`), `url`, `headers`, `autoApprove`, `disabled`, `timeout` | defaults to legacy `sse` if `type` is omitted |
| **Roo Code** | `.roo/mcp.json` | VS Code globalStorage `.../mcp_settings.json` | `mcpServers` | same as Cline | same as Cline | Cline fork; same JSON shape |
| **Continue** | `config.yaml`, `.continue/mcpServers/*.json` | `~/.continue/config.yaml` | `mcpServers` (YAML array) or JSON map | `name`, `type: stdio`, `command`, `args`, `env`, `cwd` | `type: sse`/`streamable-http`, `url`, `requestOptions.headers`, `apiKey` | accepts Claude/Cursor-style JSON directly; MCP only in Agent mode |
| **Zed** | `.zed/settings.json` | `~/.config/zed/settings.json` | `context_servers` | `command`, `args`, `env` | `url`, `headers` | also per-profile under `agent.profiles.*.context_servers` |
| **Kilo Code** | `kilo.jsonc` or `.kilo/kilo.jsonc` | `~/.config/kilo/kilo.jsonc` | `mcp` | `type: local`, `command: [...]`, `environment: {...}`, `enabled`, `timeout` | `type: remote`, `url`, `headers`, `oauth`, `enabled` | deep-merged; legacy `mcpServers` may also be parsed |
| **Goose** | `.goosehints` (context hints) | `~/.config/goose/config.yaml` | `extensions` | `type: stdio`, `cmd`, `args`, `env`, `cwd` | `type: sse`/`streamable_http`, `url`, `headers` | also `builtin`, `platform`, `inline_python`; recipes bundle extensions |
| **Junie / JetBrains** | `.junie/mcp/mcp.json` | `~/.junie/mcp/mcp.json` | `mcpServers` | `command`, `args` | `type: streamable-http`, `url`, `headers` | PyCharm AI uses `.ai/mcp/mcp.json`; JetBrains IDE can auto-config client files |
| **GitHub Copilot / VS Code** | `.mcp.json` or `.github/mcp.json` | `~/.copilot/...` (CLI) | `mcpServers` | `command`, `args`, `env` | `url` | can also be inline in `plugin.json` |

**Authoring recommendation:** author a generic `mcp.json` (or `.mcp.json`) with `mcpServers` in the canonical shape, then use a per-harness adapter to translate into `context_servers`, `extensions`, `mcp`, etc.

---

## 3. Instruction files

Instruction files are always-on or scoped guidance. They are not the same as skills (which are loaded on demand).

### 3.1. Comparison table

| File | Primary clients | Scope | Format | Activation | Use for |
|------|-----------------|-------|--------|------------|---------|
| `AGENTS.md` | Codex, Kilo, Roo, Zed, Junie, OpenCode, many CLIs | project root; some clients walk root→cwd or support subdirs | plain Markdown | auto-loaded at session/task start | project norms, build/test commands, conventions, security guardrails |
| `CLAUDE.md` | Claude Code, Kilo (compat), Zed (fallback), Devin (imports) | user `~/.claude/CLAUDE.md` or project root / `.claude/CLAUDE.md` | plain Markdown | always-on session context | same as `AGENTS.md` but for Claude; user/project/org scopes load in order |
| `CONVENTIONS.md` | Aider (via `read:`), generic | project | Markdown | only if listed in `.aider.conf.yml` or `/read` | coding style, preferred libraries, testing conventions |
| `.cursor/rules/*.mdc` | Cursor, Devin (imports) | project | Markdown + YAML frontmatter (`description`, `globs`, `alwaysApply`) | always, glob-matched, agent-selected, or `@`-mentioned | scoped rules; file-type or task-specific guidance |
| `.github/copilot-instructions.md` | GitHub Copilot cloud, CLI, VS Code | repo `.github` | Markdown | always-on repo context | repo-wide guidance; path-specific `.github/instructions/*.instructions.md` also supported |

### 3.2. `AGENTS.md` conventions for Codex, Roo, Kilo, Zed, and Junie

| Client | File(s) | Discovery | Notes |
|--------|---------|-----------|-------|
| **Codex** | `AGENTS.md` / `AGENTS.override.md` in `~/.codex`; project root → cwd | root-to-cwd concatenation; at most one file per directory; stops at `project_doc_max_bytes` (32 KiB default) | override files win at each scope |
| **Roo Code** | root `AGENTS.md`; also `.roo/rules/*.md` and `.roomodes` | `roo-cline.useAgentRules` default on | `AGENTS.md` content added to the rules section of the system prompt |
| **Kilo Code** | `AGENTS.md` / `AGENT.md` at root, `.kilo/`; subdirectories dynamically | loaded alongside `kilo.jsonc` `instructions`; priority below agent prompt / `instructions` key | also recognizes `CLAUDE.md` and `CONTEXT.md` |
| **Zed** | root `AGENTS.md`; global `~/.config/zed/AGENTS.md`; legacy `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, `AGENT.md`, `CLAUDE.md`, `GEMINI.md` | global first, then project; first legacy match wins | reusable "Rules" moved to Skills; Instructions are always-on |
| **Junie** | `.junie/AGENTS.md` or `AGENTS.md`; legacy `.junie/guidelines.md` | project settings or auto-discovered; custom path configurable | instructions added to every task |

### 3.3. Common `AGENTS.md` subset

The most portable instruction file is a plain Markdown `AGENTS.md` at the project root.

- Supported by Codex, Kilo, Roo, Zed, Junie, OpenCode, and many other agents.
- No required frontmatter or special syntax; natural language is enough.
- Keep it concise (under 32 KiB where that limit applies).
- Put project-wide norms, build/test commands, and high-level guardrails here.
- Use subdirectories or tool-specific files (`.cursor/rules/*.mdc`, `.junie/AGENTS.md`) only when you need scoped overrides.

### 3.4. `CLAUDE.md`

`CLAUDE.md` is Claude Code's native always-on instruction file. It loads at session start and stays in context.

- **User:** `~/.claude/CLAUDE.md` — personal preferences across all projects.
- **Project:** `./CLAUDE.md` or `./.claude/CLAUDE.md` — team-shared project norms.
- **Local:** `./CLAUDE.local.md` — personal override, typically gitignored.
- Subdirectory `CLAUDE.md` files load on demand when Claude reads files under that directory.

Use `CLAUDE.md` for build commands, directory layout, monorepo structure, and conventions that are true for the whole project. If guidance is only relevant for a sub-tree, use `.claude/rules/` or a subdir `CLAUDE.md`.

### 3.5. `CONVENTIONS.md`

`CONVENTIONS.md` is an Aider convention: a Markdown file loaded as read-only context. It is not auto-discovered; you must list it in `.aider.conf.yml`:

```yaml
read:
  - CONVENTIONS.md
```

Use it for coding style, library preferences, type-hint rules, and testing conventions. Other agents can treat `CONVENTIONS.md` as a generic instruction file if their loader reads Markdown from disk.

### 3.6. `.cursor/rules/*.mdc`

Cursor rules are Markdown files with YAML frontmatter. They live in `.cursor/rules/` and use the `.mdc` extension.

Frontmatter:

| Field | Type | Effect |
|-------|------|--------|
| `alwaysApply` | boolean | `true` = included in every chat |
| `globs` | comma-separated string | auto-attached when a referenced or edited file matches |
| `description` | string | agent decides relevance based on the description |

Behavior matrix:

| `alwaysApply` | `description` | `globs` | Behavior |
|---------------|---------------|---------|----------|
| `true` | any | any | Always included |
| `false` | omitted | provided | Auto-attached on glob match |
| `false` | provided | omitted | Agent-selected by description |
| `false` | omitted | omitted | Manual (`@rule-name`) |

`globs` is a comma-separated string, not a YAML list. Legacy `.cursorrules` at the repo root still works but is deprecated; do not mix the two.

### 3.7. `.github/copilot-instructions.md`

GitHub Copilot reads this file for repository-wide context in Copilot Chat, the Copilot CLI, and the cloud agent.

- Repository-wide: `.github/copilot-instructions.md`
- Path-specific: `.github/instructions/**/*.instructions.md` with an `applyTo` field
- User-level: `$HOME/.copilot/copilot-instructions.md`

Use it for project overview, tech stack, coding standards, and build/test commands. Keep instructions short because they are sent with every chat message.

---

## 4. Plugin manifests

A plugin is a distributable bundle of skills, rules, agents, hooks, MCP/LSP configs, and commands. Each harness uses its own manifest schema.

### 4.1. Manifest comparison

| Harness | Manifest path | Required fields | Component keys | MCP / tools key | Notes |
|---------|---------------|-----------------|----------------|-----------------|-------|
| **Claude Code** | `.claude-plugin/plugin.json` | `name` | `skills`, `agents`, `commands`, `hooks`, `mcpServers`, `lspServers`, `outputStyles` | `mcpServers` (path string or inline object) | manifest optional; components auto-discovered from default dirs; loaded as plugin `@skills-dir` when placed under a skills root |
| **Cursor** | `.cursor-plugin/plugin.json` | `name` | `rules`, `skills`, `agents`, `commands`, `hooks`, `mcpServers` | `mcpServers` | supports `.cursor-plugin/marketplace.json` for multi-plugin repos |
| **GitHub Copilot** | `plugin.json` (root), `.github/plugin.json`, or `.github/plugin/plugin.json` | `name` | `agents`, `skills`, `commands`, `hooks`, `extensions`, `mcpServers`, `lspServers` | `mcpServers` or root `.mcp.json` | runtime merges plugin extensions; skills are Open Skills folders |
| **Devin CLI** | `.devin-plugin/plugin.json` | `name` | (none; skills auto-loaded from `skills/` at plugin root) | none in manifest | dependency governance fields `requiredPlugins`, `optionalPlugins`, `forbiddenPlugins`; install from repo / URL / path |
| **Gemini CLI** | `gemini-extension.json` under `~/.gemini/extensions/<name>/` | `name` | `mcpServers`, `contextFileName`, `excludeTools`, `plan`, `settings` | `mcpServers` | not a `plugin.json`; `${extensionPath}` variable; `settings` array declares env vars |
| **Legacy OpenAI** | `/.well-known/ai-plugin.json` | `schema_version`, `name_for_model`, `name_for_human`, `description_for_model`, `description_for_human`, `auth`, `api` | n/a | n/a | deprecated ChatGPT Plugins; still useful as a generic bridge with `auth.type: "none"` for instruction-only packages |

### 4.2. Claude Code `plugin.json`

Location: `.claude-plugin/plugin.json` at the plugin root.

Key fields:

- `name` (required)
- `displayName`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`
- `skills`, `commands`, `agents` — paths to component directories or arrays
- `hooks` — path to `hooks.json` or inline object
- `mcpServers` — path to `.mcp.json` or inline object
- `lspServers` — path to `.lsp.json` or inline object

Default layout:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── agents/
├── hooks/
│   └── hooks.json
└── .mcp.json
```

### 4.3. Cursor `plugin.json`

Location: `.cursor-plugin/plugin.json`.

Minimal manifest:

```json
{
  "name": "my-plugin",
  "description": "Custom development tools",
  "version": "1.0.0",
  "author": { "name": "Your Name" }
}
```

Components are discovered from default directories (`rules/`, `skills/`, `agents/`, `commands/`, `hooks/`, `mcp.json`). Use the manifest only to override paths or add metadata.

### 4.4. GitHub Copilot `plugin.json`

Location: `plugin.json` at the plugin root, or `.github/plugin.json` / `.github/plugin/plugin.json` to avoid root clutter.

Example:

```json
{
  "name": "my-dev-tools",
  "description": "React development utilities",
  "version": "1.2.0",
  "author": { "name": "Jane Doe", "email": "jane@example.com" },
  "license": "MIT",
  "keywords": ["react", "frontend"],
  "agents": "agents/",
  "skills": ["skills/", "extra-skills/"],
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

A plugin can also be a single `SKILL.md` at the root for skill-only packages.

### 4.5. Devin CLI `plugin.json`

Location: `.devin-plugin/plugin.json`.

Devin plugins focus on dependency governance more than component routing:

```jsonc
{
  "name": "review-tools",
  "version": "1.0.0",
  "description": "Code-review skills for our team",
  "requiredPlugins": ["acme/secure-base"],
  "optionalPlugins": [{ "source": "url", "url": "https://gitlab.com/acme/extra.git" }],
  "forbiddenPlugins": ["sketchy-org/bad-plugin"]
}
```

Skills are loaded from the plugin's `skills/` directory by convention. There is no `skills` path field.

### 4.6. Gemini `gemini-extension.json`

Location: inside an extension directory under `~/.gemini/extensions/<name>/`.

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My awesome extension",
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}/my-server.js"],
      "cwd": "${extensionPath}"
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command"],
  "settings": [
    {
      "name": "API Key",
      "description": "The API key for the service.",
      "envVar": "MY_SERVICE_API_KEY",
      "sensitive": true
    }
  ]
}
```

`${extensionPath}` expands to the extension's installation directory. `contextFileName` points to a `GEMINI.md`-style instruction file.

### 4.7. Legacy `ai-plugin.json`

The ChatGPT Plugins manifest is hosted at `/.well-known/ai-plugin.json` and points to an OpenAPI specification.

Required-ish fields:

- `schema_version` (usually `v1`)
- `name_for_model`, `name_for_human`
- `description_for_model`, `description_for_human`
- `auth` with `type` (`none`, `service_http`, `user_http`, `oauth`)
- `api` with `type` (`openapi`) and `url`
- `logo_url`, `contact_email`, `legal_info_url`

Use it today only as a compatibility bridge. For new integrations, expose an MCP server and ship an `ai-plugin.json` with `auth.type: "none"` when a legacy client needs a discovery handle.

---

## 5. Polyglot package strategy

### 5.1. Canonical source of truth

The recommended canonical source for a portable capability package is:

```text
.agents/skills/<name>/SKILL.md
```

with supporting files under `.agents/skills/<name>/references/`, `scripts/`, and `assets/`.

Why:

- Recognized by the widest set of harnesses (Codex, Cursor, Cline, Kilo, Qwen, Devin, Gemini alias, OpenCode, Copilot, Zed in various modes).
- The `SKILL.md` frontmatter already contains the `name` and `description` needed by every other manifest.
- The body is the natural instruction source for `AGENTS.md`, `.cursor/rules/*.mdc`, `.continue/rules/*.md`, and other instruction bridges.

### 5.2. Bridge artifact mapping

| Target | Bridge artifact | How to derive it from the canonical skill |
|--------|-----------------|-------------------------------------------|
| Open Skills hosts | `.agents/skills/<name>/SKILL.md` | canonical; copy or symlink to `.claude/skills/`, `.github/skills/`, `.cline/skills/`, `.kilo/skills/`, `.qwen/skills/`, `.gemini/skills/`, `.cursor/skills/` as needed |
| Claude Code plugin | `.claude-plugin/plugin.json` + `skills/<name>/SKILL.md` | copy canonical skill into plugin `skills/`; set `mcpServers` if needed |
| Cursor plugin | `.cursor-plugin/plugin.json` + `skills/<name>/SKILL.md` + `.cursor/rules/*.mdc` | mirror skill; create `.mdc` rule with frontmatter derived from `description` |
| GitHub Copilot | `plugin.json` or `.github/plugin.json` + `.github/skills/<name>/` + `.github/copilot-instructions.md` | skill goes under `.github/skills/`; instructions go to `copilot-instructions.md` |
| Devin CLI | `.devin-plugin/plugin.json` + `skills/<name>/SKILL.md` + `AGENTS.md` | skills at plugin root `skills/`; AGENTS.md as rules bridge |
| Gemini CLI | `gemini-extension.json` + `.gemini/skills/<name>/` + `GEMINI.md` | extension manifest references skill dir and MCP; `GEMINI.md` as context |
| Continue | `.continue/rules/<id>.md` + `.continue/mcpServers/*.json` | Continue does not auto-load `SKILL.md`; project skill body as a rule; MCP config as JSON |
| Roo Code | `.roo/rules/<id>.md` + `.roo/mcp.json` + `AGENTS.md` | rule per skill; AGENTS.md for common instructions; verify product status |
| Zed | `.zed/settings.json` `context_servers` + `AGENTS.md` | MCP via `context_servers`; AGENTS.md for always-on instructions |
| Goose | `~/.config/goose/config.yaml` `extensions` or recipe YAML | package as MCP extension or a recipe that loads the skill instructions |
| Kilo Code | `.kilo/skills/<name>/` + `kilo.jsonc` `mcp` + `AGENTS.md` | mirror skill; translate MCP to `mcp` object with `type: local|remote` |
| Junie | `.junie/AGENTS.md` + `.junie/mcp/mcp.json` | AGENTS.md bridge; MCP in `.junie/mcp/mcp.json` |
| Aider | `CONVENTIONS.md` + `.aider.conf.yml` `read:` | extract conventions; add `read: [AGENTS.md, CONVENTIONS.md]` |
| Legacy OpenAI | `ai-plugin.json` | instruction-only bridge with `auth.type: "none"` |

### 5.3. Keeping descriptions and metadata consistent

1. **Single source for `name` and `description`**: derive all manifest `name`/`description` fields from `SKILL.md` frontmatter.
2. **Use `description` as a trigger everywhere**: "Use when ...", "Helps with ...". Do not use marketing language.
3. **Author/license/license/keywords**: keep one metadata file (e.g., a root `package.json` or `polyglot.json`) and render into each `plugin.json` / `gemini-extension.json`.
4. **Versioning**: bump the same version in every manifest on release; do not let manifests drift.
5. **Body reuse**: do not copy the full `SKILL.md` body into every instruction file. For `AGENTS.md` and rules, summarize the essential always-on context; for full instructions, let the agent load the canonical `SKILL.md`.
6. **MCP once**: write one generic `mcp.json` and translate per client; never hard-code secrets in any generated file.
7. **One skill per plugin**: a plugin should expose one focused skill or a small, related set. Do not ship an entire marketplace as one plugin unit.

---

## 6. Recommendations for authoring portable, transferable, and standardized knowledge

1. **Start with Open Skills.** Author `.agents/skills/<name>/SKILL.md` before creating any plugin manifest or instruction file.
2. **Add `AGENTS.md`.** For most projects, a root `AGENTS.md` is the lowest-friction instruction bridge across Codex, Kilo, Roo, Zed, Junie, and others.
3. **Use per-harness rules only when needed.** `.cursor/rules/*.mdc` is powerful for scoped guidance; `CLAUDE.md` is the right place for Claude-specific always-on context; `CONVENTIONS.md` works for Aider and generic read-only contexts.
4. **Prefer stdio MCP.** For local, project-specific tooling, use stdio. Use Streamable HTTP only for remote or shared services.
5. **Never commit secrets.** Use environment references (`${VAR}`), OAuth, or IDE-managed keyrings. Review `autoApprove`/`alwaysAllow` lists.
6. **Keep `SKILL.md` lean.** Move reference docs to `references/`. Keep `description` trigger-focused.
7. **Generate bridges.** Do not hand-edit five manifest files per release. Use a generator that reads the canonical `SKILL.md` and one metadata file, then emits per-harness artifacts.
8. **Validate and test.** Run a linter for MCP configs (no hardcoded secrets, required fields, no duplicate names). Load the package in the target clients before publishing.
9. **Document compatibility.** Maintain a README table that lists which harnesses are Tier A (auto), Tier B (bridge/manual), and Tier C (unverified).
10. **Refresh quarterly.** Paths and schemas churn quickly; re-verify official docs each quarter or after major client releases.

---

## 7. Research notes

### Verified facts

- **agentskills.io / Open Skills:** `SKILL.md` uses YAML frontmatter followed by Markdown. Required fields are `name` and `description`. Optional fields are `license`, `compatibility`, `metadata`, and `allowed-tools`. Progressive disclosure has three tiers: catalog metadata, full instructions on activation, and resources loaded on demand. (sources: agentskills.io/specification, agentskills/agentskills GitHub docs)
- **MCP transports:** the 2025-11-25 MCP spec defines `stdio` and `Streamable HTTP`. The 2024-11-05 `HTTP+SSE` transport was deprecated in 2025-03-26. Clients should support stdio when possible. (sources: modelcontextprotocol.io/specification, multiple transport explainers)
- **MCP config shapes:** Claude Code/Cursor/Cline/Roo/Junie/Copilot use `mcpServers`; Continue uses `mcpServers` in YAML or JSON; Zed uses `context_servers`; Kilo uses a top-level `mcp` object with `type: local|remote`; Goose uses `extensions` in YAML. (sources: official docs per harness, client-matrix, mcp-config-check)
- **AGENTS.md common subset:** Codex (hierarchical, 32 KiB limit), Roo (`roo-cline.useAgentRules`), Kilo (root + subdir, priority below config `instructions`), Zed (global + project, also legacy rule files), and Junie (`.junie/AGENTS.md` or `guidelines.md`) all support a root `AGENTS.md` or equivalent. (sources: openai.com/codex/guides/agents-md, kilo.ai/docs, docs.roocode.com PR/issue, zed.dev docs, JetBrains docs)
- **Cursor `.mdc` rules:** frontmatter fields `description`, `globs`, `alwaysApply` determine activation (always, glob-match, agent-selected, or `@`-mention). `globs` is a comma-separated string. (source: cursor.com/docs/rules)
- **Aider `CONVENTIONS.md`:** loaded via `read:` in `.aider.conf.yml` or `/read` command. (source: aider.chat/docs/usage/conventions)
- **Plugin manifests:**
  - Claude Code `.claude-plugin/plugin.json` schema documented at code.claude.com/docs/en/plugins-reference.
  - Cursor `.cursor-plugin/plugin.json` documented at cursor.com/docs/reference/plugins.
  - GitHub Copilot `plugin.json` documented at docs.github.com/copilot/reference/cli-plugin-reference.
  - Devin `.devin-plugin/plugin.json` documented at docs.devin.ai/cli/extensibility/plugins/overview.
  - Gemini `gemini-extension.json` documented at geminicli.com/docs/extensions/reference.
  - Legacy `ai-plugin.json` documented in OpenAI's retired ChatGPT Plugins docs and community mirrors.

### Ambiguities and churn

- Cursor local plugin install path and marketplace schema continue to evolve; verify before shipping Cursor-specific claims.
- Devin CLI plugins are still in beta as of this review; GA behavior may change.
- Roo Code product status and path stability have been flagged as uncertain; treat Roo bridges as best-effort.
- Kiro (Amazon Q lineage) skill directory conventions are not fully pinned; steering files vs skill dirs need re-check.
- Zed default on-disk skill directory names and whether `.agents/skills` is auto-loaded need confirmation.
- Cline auto-loading of `.agents/skills` without a copy to `.cline/skills` is unconfirmed.
- Qwen, Kilo, Devin, and several Tier C clients ship docs at custom domains or GitHub Pages that redirect or restructure frequently.

### Dead or changed links

- `agent-rules.org` / `agent-rules/agent-rules` is deprecated; use `AGENTS.md` / `github.com/openai/agents.md` instead.
- OpenAI ChatGPT Plugins program was retired in 2024; `ai-plugin.json` remains as a compatibility bridge.
- `agentskills.mintlify.app` appears to be a stale mirror; prefer `agentskills.io` or the `agentskills/agentskills` GitHub repo.
- Several harness-specific docs (cursor.com/docs, docs.devin.ai, kilo.ai, qwenlm.github.io, roocode.com, docs.cline.bot) should be re-fetched each quarter because they move or version rapidly.
