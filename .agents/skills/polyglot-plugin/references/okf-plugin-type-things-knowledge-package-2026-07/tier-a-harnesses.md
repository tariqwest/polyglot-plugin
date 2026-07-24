# Tier A harnesses — OKF plugin/skills knowledge package

> Scope: full, official plugin/skills/extension surfaces that are authoritative for polyglot packaging. Derived from `okf-plugin-type-things-2026-07.md` and verified against live product documentation as of July 2026. This package treats `.agents/skills/<name>/SKILL.md` as the canonical Open Skills unit and describes how to adapt it for each harness.

---

## `claude` — Claude Code

| Attribute | Value |
|-----------|-------|
| Catalog id | `claude` |
| Display name | Claude Code |
| Aliases | `claude-code` |

### What they call "plugin type things"

- **Plugins** — installable bundles of skills, agents, hooks, MCP servers, LSP servers and monitors.
- **Skills** — dynamic, on-demand capability directories with a `SKILL.md` file. Based on the [Agent Skills](https://agentskills.io) open standard.
- **Agents / subagents** — specialized worker loops that can be delegated to.
- **Hooks** — lifecycle event handlers (command, HTTP request, prompt, subagent).
- **MCP servers** — external tool integrations via Model Context Protocol.
- **LSP servers** — code-intelligence plugins for symbol navigation and diagnostics.
- **CLAUDE.md** — persistent project/personal instructions loaded every session.
- **Rules** — path-scoped instruction files under `.claude/rules/`.
- **Marketplaces** — catalogs of plugins distributed from git repositories or local paths.

### Primary authoring/discovery unit and layout

A standalone skill:

```text
<skill-name>/
├── SKILL.md              # required
├── scripts/              # optional
├── references/           # optional
└── assets/               # optional
```

A plugin:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json       # optional manifest
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── agents/
├── hooks/
├── .mcp.json
├── .lsp.json
└── commands/             # legacy; use skills/ for new work
```

- A top-level `SKILL.md` at the plugin root is loaded as a single skill if no `skills/` directory exists.
- Marketplaces use a `.claude-plugin/marketplace.json` file in the repository root.
- Local test: `claude --plugin-dir ./my-plugin`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.claude/skills/<name>/SKILL.md`, `.claude/CLAUDE.md` or `./CLAUDE.md`, `.claude/rules/*.md`, `.mcp.json` |
| User | `~/.claude/skills/<name>/SKILL.md`, `~/.claude/CLAUDE.md`, `~/.claude.json` (MCP) |
| System / Enterprise | Managed settings via `CLAUDE_CONFIG_DIR`, org-wide plugin enablement |

### Official documentation

- Create plugins — https://code.claude.com/docs/en/plugins (live)
- Plugins reference — https://code.claude.com/docs/en/plugins-reference (live)
- Discover/install plugins — https://code.claude.com/docs/en/discover-plugins (live)
- Create/distribute marketplaces — https://code.claude.com/docs/en/plugin-marketplaces (live)
- Skills — https://code.claude.com/docs/en/skills (live)
- Features overview — https://code.claude.com/docs/en/features-overview (live)
- CLAUDE.md — https://code.claude.com/docs/en/claude-md (live)
- Hooks guide — https://code.claude.com/docs/en/hooks-guide (live)
- MCP — https://code.claude.com/docs/en/mcp (live)
- Agent SDK plugins — https://code.claude.com/docs/en/agent-sdk/plugins (live)
- Platform Agent Skills — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview (live)

### Polyglot bridge

1. Place the Open Skills package at `.agents/skills/<id>/SKILL.md` and any supporting files. Claude Code reads `.agents/skills/` in addition to `.claude/skills/`.
2. If packaging as a plugin, add `.claude-plugin/plugin.json` and copy skills under `skills/`. Test locally with `--plugin-dir`.
3. For MCP, ship `.mcp.json` at the project root (top-level key `mcpServers`) or inside the plugin.
4. For always-on project context, ship `CLAUDE.md` at the repo root or `.claude/CLAUDE.md`.

### Portability, transferability and standardization

- Native Open Skills citizen; `SKILL.md` frontmatter matches `agentskills.io`.
- Plugin skills are namespaced as `/plugin-name:skill-name` to avoid collisions.
- `.mcp.json` with `mcpServers` is widely shared with other harnesses.
- `CLAUDE.md` is Claude-specific; for cross-agent portability prefer `AGENTS.md` where the target harness supports it.

### Recent changes, beta status and caveats

- `commands/` is legacy; new work should use `skills/`.
- LSP plugins are primarily consumed from the official marketplace; authoring new LSP plugins is documented but intended for languages not already covered.
- Plugin marketplace supports official (`claude-plugins-official`), community (`anthropics/claude-plugins-community`) and private/team marketplaces.
- Enterprise managed settings can enforce org-wide plugin enablement.

---

## `cursor` — Cursor

| Attribute | Value |
|-----------|-------|
| Catalog id | `cursor` |
| Display name | Cursor |
| Aliases | `cursor` |

### What they call "plugin type things"

- **Plugins** — installable bundles of rules, skills, agents, commands, MCP servers and hooks.
- **Skills** — `SKILL.md` directories loaded dynamically by the agent.
- **Rules** — `.mdc` files in `.cursor/rules/` (Always, Intelligent, Globs, Manual). `AGENTS.md` is also read as a plain alternative.
- **Agents** — custom agent configurations.
- **Commands** — slash/executable command files.
- **MCP servers** — configured in `mcp.json`.
- **Hooks** — lifecycle automation.
- **Marketplace** — official curated plugins at `cursor.com/marketplace`; team marketplaces for Teams/Enterprise.

### Primary authoring/discovery unit and layout

A plugin:

```text
my-plugin/
├── .cursor-plugin/
│   └── plugin.json       # required manifest
├── rules/
│   └── example.mdc
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── agents/
├── commands/
├── hooks/
├── mcp.json
├── assets/
├── scripts/
└── README.md
```

- Multi-plugin repositories use `.cursor-plugin/marketplace.json` at the repo root.
- Local test plugins live in `~/.cursor/plugins/local/`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.cursor/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`, `.claude/skills/` and `.codex/skills/` (compatibility reads), `.cursor/rules/*.mdc`, `AGENTS.md`, `.cursor/mcp.json` |
| User | `~/.cursor/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`, `~/.cursor/mcp.json`, user rules in dashboard |
| Team / Enterprise | Team rules in dashboard; team marketplace (Dashboard -> Plugins) |

### Official documentation

- Plugins — https://cursor.com/docs/plugins (live)
- Plugins reference — https://cursor.com/docs/reference/plugins (live)
- Skills — https://cursor.com/docs/skills (live); also https://cursor.com/help/customization/skills
- Rules — https://cursor.com/docs/rules (live; canonical at `/docs/rules.md` and `/help/customization/rules`)
- Customizing agents — https://cursor.com/learn/customizing-agents (live)
- MCP — https://cursor.com/docs/mcp (live; also `/help/customization/mcp`)
- Marketplace — https://cursor.com/marketplace (live); community index at https://cursor.directory

### Polyglot bridge

1. Copy `.agents/skills/<id>/SKILL.md` into `.cursor/skills/<id>/` or leave it in `.agents/skills/`; Cursor discovers both.
2. For always-on guidance, create `.cursor/rules/<id>.mdc` or use `AGENTS.md` as a portable fallback.
3. For distribution, wrap the plugin with `.cursor-plugin/plugin.json` and list `rules` and `skills` paths.
4. MCP goes in `.cursor/mcp.json` or the plugin's `mcp.json` (top-level `mcpServers`).

### Portability, transferability and standardization

- Strong Open Skills support; natively reads `.agents/skills`, `.claude/skills` and `.codex/skills`.
- Rules are Cursor-specific `.mdc`; `AGENTS.md` is the portable equivalent.
- Marketplace plugins are Git repositories; submissions are manually reviewed.
- Team marketplaces let organizations distribute private plugins and MCP servers.

### Recent changes, beta status and caveats

- `.mdc` files must include frontmatter; plain `.md` files in `.cursor/rules/` are ignored.
- Nested skill directories are allowed; the skill name is the directory that directly contains `SKILL.md`, not a parent category folder.
- `~/.cursor/plugins/local/` is the recommended local test path before marketplace submission.

---

## `codex` — OpenAI Codex CLI

| Attribute | Value |
|-----------|-------|
| Catalog id | `codex` |
| Display name | OpenAI Codex CLI |
| Aliases | `codex`, `openai-codex` |

### What they call "plugin type things"

- **Skills** — `SKILL.md` directories; the primary authoring unit.
- **Plugins** — `.codex-plugin/plugin.json` bundles for distribution to ChatGPT Work (web/desktop) and the Codex CLI plugin browser.
- **AGENTS.md** — hierarchical persistent instructions loaded from `~/.codex` and from the repo root down to the cwd.
- **Memories** — auto-generated context learned from prior work.
- **MCP servers** — external tools configured in `.mcp.json` or `~/.claude.json`.
- **Subagents / custom agents** — parallel or specialized delegated agents.
- **Curated skills catalog** — `openai/skills` (deprecated as a repo; still consumed via `$skill-installer`).

### Primary authoring/discovery unit and layout

A skill:

```text
<skill-name>/
├── SKILL.md              # required; name and description in frontmatter
├── agents/
│   └── openai.yaml       # UI metadata (recommended)
├── scripts/
├── references/
└── assets/
```

A plugin:

```text
my-plugin/
├── .codex-plugin/
│   └── plugin.json       # required
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── .app.json             # app mapping (optional)
├── .mcp.json
└── assets/
```

- `AGENTS.md` / `AGENTS.override.md` are discovered from `~/.codex` plus every directory from the project root to the cwd, concatenated in root-to-cwd order.
- Default total project instruction cap is 32 KiB (`project_doc_max_bytes`); fallback filenames are configurable.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.agents/skills/<name>/SKILL.md` (walks from cwd up to repo root), `AGENTS.md` along the same path, `AGENTS.override.md` |
| User | `~/.agents/skills/<name>/SKILL.md`, `~/.codex/AGENTS.md` or `~/.codex/AGENTS.override.md` |
| Admin / System | `/etc/codex/skills/` (admin); bundled `SYSTEM` skills |
| Marketplace | Plugins installed via `codex plugin install`; curated skills via `$skill-installer` |

### Official documentation

- Build skills — https://developers.openai.com/codex/skills (live)
- Customization concepts — https://developers.openai.com/codex/concepts/customization (live)
- AGENTS.md guide — https://developers.openai.com/codex/guides/agents-md (live)
- Subagents — https://developers.openai.com/codex/subagents (live); source alias `/concepts/subagents`
- Plugins — https://developers.openai.com/codex/plugins (live)
- Build plugins — https://developers.openai.com/codex/plugins/build (live)
- Plugin JSON sample/spec — https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/plugin-creator/references/plugin-json-spec.md (live)
- Skill-creator sample — https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/SKILL.md (live)
- Curated skills catalog — https://github.com/openai/skills (live but **deprecated**)

### Polyglot bridge

1. `.agents/skills/<id>/SKILL.md` is the native authoring format for Codex. Keep it there for local iteration.
2. For distribution, create `.codex-plugin/plugin.json` with `skills` pointing to the copied skills; use `@plugin-creator` or the `plugin-creator` script to scaffold.
3. For always-on repo guidance, ship `AGENTS.md` at the repo root and/or `~/.codex/AGENTS.md`.
4. For MCP, ship `.mcp.json` at the project root (top-level `mcpServers`) or inside the plugin.

### Portability, transferability and standardization

- Open Skills standard is the base skill format; `name` and `description` are required.
- `AGENTS.md` is Codex-specific but mirrored by Cursor, Devin, Warp and others.
- Plugins require app wiring (`apps`/`interface` fields) for ChatGPT Work; CLI plugin browser is simpler.
- `openai/skills` is deprecated; prefer `$skill-installer` or a local marketplace for curated skills.

### Recent changes, beta status and caveats

- Codex CLI plugin browser exists; plugins are not available in Chat, the IDE extension or mobile.
- Subagent workflows consume more tokens than single-agent runs and must be explicitly requested.
- Global `~/.agents/skills` support landed around v0.94 (mid-2026).
- `AGENTS.override.md` at a given scope replaces the base `AGENTS.md` at that scope.

---

## `copilot` + `vscode` — GitHub Copilot / Visual Studio / VS Code

| Attribute | Value |
|-----------|-------|
| Catalog id | `copilot` (CLI/cloud), `vscode` (IDE) |
| Display name | GitHub Copilot / VS Code |
| Aliases | `github-copilot`, `vs-code` |

### What they call "plugin type things"

- **Plugins** — installable bundles for Copilot CLI containing agents, skills, hooks, MCP and LSP configs.
- **Agent skills** — `SKILL.md` directories based on the open Agent Skills standard.
- **Custom agents** — `*.agent.md` files with YAML frontmatter.
- **Custom instructions** — `.github/copilot-instructions.md` and modular `*.instructions.md` files; also reads `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`.
- **Hooks** — `hooks.json` (or `hooks/hooks.json` for Claude-format plugins).
- **MCP servers** — `.mcp.json` / `.github/mcp.json` (workspace) and `~/.copilot/mcp-config.json` (user).
- **LSP servers** — `lsp.json` / `.github/lsp.json`.
- **Marketplaces** — `copilot-plugins` and `awesome-copilot` defaults; add via `copilot plugin marketplace add`.

### Primary authoring/discovery unit and layout

A plugin:

```text
my-plugin/
├── plugin.json           # required; or .github/plugin/plugin.json / .plugin/plugin.json / .claude-plugin/plugin.json
├── agents/
│   └── helper.agent.md
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── hooks.json            # or hooks/hooks.json for Claude format
├── .mcp.json             # or .github/mcp.json
└── lsp.json              # or .github/lsp.json
```

- Marketplace manifest can live at `.github/plugin/marketplace.json`, `.plugin/marketplace.json` or `.claude-plugin/marketplace.json`.
- Installed plugins are cached under `~/.copilot/installed-plugins/`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project (VS Code / Visual Studio / Cloud) | `.github/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` |
| Personal | `~/.copilot/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md` |
| Agents | `agents/` inside a plugin; `%USERPROFILE%\.github\agents` (Visual Studio) |
| Instructions | `.github/copilot-instructions.md`, `.github/instructions/**/*.instructions.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` |
| MCP | VS Code: `.vscode/mcp.json`; Copilot CLI: `.mcp.json`, `.github/mcp.json`, `~/.copilot/mcp-config.json` |

### Official documentation

- About plugins — https://docs.github.com/en/copilot/concepts/agents/about-plugins (live)
- Creating a plugin (CLI) — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating (live)
- Adding skills (CLI) — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills (live)
- Adding skills (cloud/agent) — https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills (live)
- About agent skills — https://docs.github.com/en/copilot/concepts/agents/about-agent-skills (live)
- Customize overview — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/overview (live)
- Copilot CLI plugin reference — https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference (live; source path changed)
- Adding MCP servers (CLI) — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers (live)
- VS Code Agent Skills — https://code.visualstudio.com/docs/agent-customization/agent-skills (live; canonical; source `/docs/copilot/customization/agent-skills` is an older path)
- VS Code customization overview — https://code.visualstudio.com/docs/agent-customization/overview (live)
- VS Code MCP reference — https://code.visualstudio.com/docs/copilot/reference/mcp-configuration (live)
- Visual Studio agent skills — https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills (live; requires VS 2026 18.5+)
- VS Code docs source (GitHub) — https://github.com/microsoft/vscode-docs/blob/main/docs/copilot/customization/agent-skills.md (live)

### Polyglot bridge

1. Place `.agents/skills/<id>/SKILL.md` under `.github/skills/`, `.claude/skills/` or `.agents/skills/`. All three are scanned.
2. For distribution, create a plugin with `plugin.json` at the root. To maximize cross-tool reach, also place the manifest under `.claude-plugin/plugin.json` or `.github/plugin/plugin.json` as needed.
3. For always-on instructions, ship `.github/copilot-instructions.md` for Copilot/VS Code; also include `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` for Copilot CLI and cross-agent readers.
4. For MCP, use `.vscode/mcp.json` (`servers` object) for VS Code and `.mcp.json` (`mcpServers` object) / `~/.copilot/mcp-config.json` for Copilot CLI. Note the schema key differs (`servers` vs `mcpServers`).

### Portability, transferability and standardization

- Plugin format is shared across VS Code, Copilot CLI and Claude Code; a single repo can serve all three by placing manifest copies in the correct locations.
- Hooks path differs: Copilot expects `hooks.json`; Claude expects `hooks/hooks.json`. VS Code detects format automatically.
- Plugin root tokens differ: `${CLAUDE_PLUGIN_ROOT}` vs `${COPILOT_PLUGIN_DATA}`; avoid relying on them in shared packages.
- Skill names must be plain kebab-case; namespaced prefixes can cause silent load failures.
- Custom instructions (`.github/copilot-instructions.md`) are VS Code/GitHub.com only; agent skills are portable across clients.

### Recent changes, beta status and caveats

- VS Code Agent Plugins are in preview as of mid-2026.
- Workspace `.mcp.json` is not loaded in non-interactive prompt mode unless `GITHUB_COPILOT_PROMPT_MODE_WORKSPACE_MCP=true`; it also requires folder trust.
- There is a known issue where `copilot plugin install` does not always merge a plugin's `.mcp.json` into `~/.copilot/mcp-config.json`; manual registration may be required.
- Default marketplaces (`copilot-plugins`, `awesome-copilot`) ship with the CLI.

---

## `opencode` — OpenCode

| Attribute | Value |
|-----------|-------|
| Catalog id | `opencode` |
| Display name | OpenCode |
| Aliases | `opencode`, `open-code` |

### What they call "plugin type things"

- **Skills** — `SKILL.md` directories loaded on demand via the native `skill` tool.
- **Agents** — primary agents (Build, Plan) and subagents (General, Explore, Scout) configured in Markdown or `opencode.json`.
- **Plugins** — JavaScript/TypeScript modules or npm packages extending OpenCode via hooks, tools and commands.
- **Commands** — `.opencode/commands/*.md` slash commands.
- **AGENTS.md** — persistent instructions, with `.opencode/AGENTS.md` and `~/.config/opencode/AGENTS.md` support.
- **MCP servers** — configured under the `mcp` key in `opencode.json`, or via `.mcp.json` / `.opencode/mcp/*.json` (newer).

### Primary authoring/discovery unit and layout

A skill:

```text
<skill-name>/
└── SKILL.md              # required: name, description, optional license/compatibility/metadata
```

An OpenCode config file:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@scope/plugin", "./local.ts"],
  "mcp": { "server-name": { "type": "local", "command": ["npx", "-y", "server"], "enabled": true } },
  "skills": { "paths": ["./extra-skills"], "urls": ["https://example.com/skills/"] }
}
```

- Local plugins: `.opencode/plugins/*.ts|*.js` or `~/.config/opencode/plugins/`.
- npm plugins are installed by Bun at startup and cached in `~/.cache/opencode/node_modules/`.
- HTTP skill catalogs require an `index.json` and skill files served from a same-origin base URL.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`, `.opencode/plugins/`, `.opencode/commands/`, `.opencode/AGENTS.md` |
| User | `~/.config/opencode/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`, `~/.config/opencode/plugins/`, `~/.config/opencode/commands/`, `~/.config/opencode/opencode.json`, `~/.config/opencode/AGENTS.md` |
| Remote | `skills.urls` HTTP catalogs; `index.json` + named Markdown or `SKILL.md` files |

### Official documentation

- Agent Skills — https://dev.opencode.ai/docs/skills/ (live; canonical)
- Agents — https://opencode.ai/docs/agents/ (live)
- Plugins — https://opencode.ai/docs/plugins.md (live); dev mirror https://dev.opencode.ai/docs/plugins/ (live)
- V2 plugin API (beta) — https://v2.opencode.ai/build/plugins (live)
- MCP servers — https://dev.opencode.ai/docs/mcp-servers/ (live)
- Rules / AGENTS.md — https://dev.opencode.ai/docs/rules/ (live); V2 instructions https://v2.opencode.ai/instructions (live)
- Mintlify mirror — https://anomalyco-opencode.mintlify.app/skills (live)
- Config schema — https://opencode.ai/config.json

### Polyglot bridge

1. Copy `.agents/skills/<id>/SKILL.md` to `.opencode/skills/<id>/` or keep it in `.agents/skills/`. Ensure the directory name matches the `name` frontmatter exactly.
2. For distribution, bundle skills inside an npm plugin at `src/skills/*/SKILL.md`; tools/hooks go in `src/index.ts`.
3. For always-on instructions, ship `AGENTS.md` at the repo root (or `.opencode/AGENTS.md` for OpenCode-specific guidance).
4. For MCP, add a `mcp` block to `opencode.json` or use `.mcp.json` for cross-tool sharing.

### Portability, transferability and standardization

- First-party Open Skills compatible; strictly requires `name` and `description` in frontmatter.
- Reads `.claude/skills` and `.agents/skills` for compatibility.
- Plugins are JS/TS/npm modules, not interchangeable with Claude/Cursor `plugin.json` bundles.
- V2 plugin API is beta; entry points and shapes may change.

### Recent changes, beta status and caveats

- V2 plugin API is in beta.
- Commands (`*.md` in `.opencode/commands/`) are **not** auto-discovered from npm packages; only tools, hooks and skills are.
- Unknown `SKILL.md` frontmatter fields are ignored; keep to `name`, `description`, `license`, `compatibility`, `metadata` for safety.
- Discovery order: global external (`.claude/`, `.agents/`) first, then project external, then `.opencode/`, then configured `skills.paths`/`skills.urls`.

---

## `gemini` — Gemini CLI

| Attribute | Value |
|-----------|-------|
| Catalog id | `gemini` |
| Display name | Gemini CLI |
| Aliases | `gemini`, `gemini-cli` |

### What they call "plugin type things"

- **Extensions** — installable packages (`gemini-extension.json`) bundling prompts, MCP servers, custom commands, themes, hooks, sub-agents and agent skills.
- **Agent skills** — `SKILL.md` directories based on the Agent Skills open standard.
- **Custom commands** — TOML files in `.gemini/commands/` or `~/.gemini/commands/`.
- **GEMINI.md** — hierarchical project/personal context files.
- **Hooks / themes / sub-agents** — lifecycle and UI customization inside extensions.
- **Extension gallery** — `geminicli.com/extensions/`.

### Primary authoring/discovery unit and layout

An extension:

```text
my-extension/
├── gemini-extension.json # required manifest
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── mcpServers/           # or inline in gemini-extension.json
├── commands/
├── GEMINI.md             # default context file
└── settings/             # optional config schema
```

A skill:

```text
<skill-name>/
└── SKILL.md              # required: name and description frontmatter
```

A custom command (TOML):

```toml
prompt = "..."
description = "..."
```

- Extensions are installed to `~/.gemini/extensions/` or per-project `.gemini/extensions/`.
- `gemini-extension.json` fields include `name`, `version`, `mcpServers`, `contextFileName`, `excludeTools`, `settings`, `plan.directory`, `migratedTo`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.gemini/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` (alias), `.gemini/extensions/<ext>/`, `.gemini/commands/`, `GEMINI.md`, `.gemini/settings.json` |
| User | `~/.gemini/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`, `~/.gemini/extensions/`, `~/.gemini/commands/`, `~/.gemini/settings.json` |
| Built-in / Extension | Built-in skills; skills bundled inside installed extensions |

Precedence (lowest to highest): built-in, extension, user, workspace. Within the same tier, `.agents/skills/` takes precedence over `.gemini/skills/`.

### Official documentation

- Extensions hub — https://geminicli.com/docs/extensions/ (live)
- Extension gallery — https://geminicli.com/extensions/ (live)
- Extension reference (GitHub) — https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md (live)
- Writing extensions — https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md (live)
- Agent Skills — https://geminicli.com/docs/cli/skills/ (live); GitHub source https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md
- Creating skills — https://geminicli.com/docs/cli/creating-skills/ (live)
- Skills getting started (GitHub) — https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/tutorials/skills-getting-started.md (live)
- GEMINI.md (GitHub) — https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md (live)
- Custom commands (GitHub) — https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md (live)
- Google Codelabs — https://codelabs.developers.google.com/getting-started-gemini-cli-extensions (live)

### Polyglot bridge

1. Place `.agents/skills/<id>/SKILL.md` at `.gemini/skills/<id>/` or `.agents/skills/<id>/`.
2. To distribute, wrap as an extension with `gemini-extension.json`; put skills under `skills/` and optional context under `GEMINI.md` or a custom `contextFileName`.
3. For MCP, add `mcpServers` to `gemini-extension.json` or the user/project `settings.json`.
4. To expose slash shortcuts, convert reusable prompts into TOML custom commands under `.gemini/commands/`.

### Portability, transferability and standardization

- Agent Skills open standard is supported; `.agents/skills/` alias provides interoperability.
- `gemini-extension.json` is Gemini-specific.
- `GEMINI.md` is Gemini-specific context; for cross-agent use prefer `AGENTS.md`.
- Skill activation requires user consent via the `activate_skill` tool.

### Recent changes, beta status and caveats

- Extension management commands (`gemini extensions ...`) cannot be run from inside the CLI itself; use the host shell.
- `.agents/skills/` takes precedence over `.gemini/skills/` within the same tier.
- `migratedTo` in `gemini-extension.json` redirects extension updates to a new source.
- Docs are up-to-date with at least the v0.4.0 release.

---

## `devin` + `devin-desktop`/`windsurf` — Devin CLI / Cascade / Windsurf

| Attribute | Value |
|-----------|-------|
| Catalog id | `devin` (CLI/cloud), `devin-desktop`, `windsurf` |
| Display name | Devin CLI / Devin Desktop (Cascade) / Windsurf |
| Aliases | `devin`, `devin-desktop`, `windsurf` |

### What they call "plugin type things"

- **Skills** — `SKILL.md` directories for both Devin CLI and Cascade.
- **Plugins (CLI)** — `.devin-plugin/plugin.json` bundles of skills, rules and `AGENTS.md`; install via `devin plugins install`.
- **Rules** — `.devin/rules/*.md` (preferred) or legacy `.windsurf/rules/`; activation via frontmatter (`always_on`, `model_decision`, `glob`, `manual`).
- **AGENTS.md** — location-scoped plain-markdown rules (root = always-on, subdirs = glob).
- **Workflows** — `.windsurf/workflows/*.md` manual slash-command prompt templates (Cascade only).
- **Cascade** — desktop agent with Write/Chat modes, skills, rules, workflows, memories.
- **MCP servers** — `mcpServers` in `.devin/config.json` or `~/.config/devin/config.json`.
- **Devin Local** — new local desktop agent as of mid-2026.

### Primary authoring/discovery unit and layout

A skill:

```text
<skill-name>/
└── SKILL.md              # optional frontmatter: name, description, argument-hint, model, subagent, allowed-tools, permissions, triggers
```

A CLI plugin:

```text
my-plugin/
├── .devin-plugin/
│   └── plugin.json       # required; only name is mandatory
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── rules/
└── AGENTS.md
```

Cascade desktop:

```text
project/
├── .windsurf/
│   ├── skills/<name>/SKILL.md
│   └── workflows/*.md
├── .devin/
│   ├── skills/<name>/SKILL.md
│   ├── rules/*.md
│   ├── config.json
│   └── config.local.json
└── AGENTS.md             # or agents.md
```

Global Cascade skills: `~/.codeium/windsurf/skills/<name>/SKILL.md`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project (CLI/Cloud) | `.agents/skills/<name>/SKILL.md` (recommended), `.devin/skills/<name>/SKILL.md`, `.windsurf/skills/<name>/SKILL.md`, `.github/skills/`, `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, `.cognition/skills/` |
| User (CLI) | `~/.agents/skills/<name>/SKILL.md`, `~/.config/devin/skills/<name>/SKILL.md`, `~/.codeium/<channel>/skills/<name>/SKILL.md` |
| Global (Cascade desktop) | `~/.codeium/windsurf/skills/<name>/SKILL.md` |
| Project (Cascade desktop) | `.windsurf/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` |
| Workflows | `.windsurf/workflows/*.md` (current workspace, subdirectories and parents up to git root) |
| Rules | `.devin/rules/*.md` (preferred), `.windsurf/rules/` (legacy), `AGENTS.md` / `agents.md`, `.cursor/rules` can be imported |
| Config | `.devin/config.json`, `.devin/config.local.json`, `~/.config/devin/config.json` |

### Official documentation

- Product skills — https://docs.devin.ai/product-guides/skills (live)
- CLI skills overview — https://docs.devin.ai/cli/extensibility/skills/overview (live)
- Creating skills — https://docs.devin.ai/cli/extensibility/skills/creating-skills (live)
- CLI plugins overview — https://docs.devin.ai/cli/extensibility/plugins/overview (live)
- Cascade skills — https://docs.devin.ai/desktop/cascade/skills (live)
- Cascade workflows — https://docs.devin.ai/desktop/cascade/workflows (live); also https://docs.devin.ai/windsurf/plugins/cascade/workflows (live)
- Cascade AGENTS.md — https://docs.devin.ai/desktop/cascade/agents-md (live)
- Cascade memories/rules — https://docs.devin.ai/desktop/cascade/memories (live)
- Devin Desktop FAQ (Windsurf transition) — https://docs.devin.ai/desktop/devin-desktop-faq (live)
- MCP configuration — https://docs.devin.ai/cli/extensibility/mcp/configuration (live)
- Configuration file reference — https://docs.devin.ai/cli/reference/configuration/config-file (live)
- Agent Skills spec — https://agentskills.io (live)

### Polyglot bridge

1. For Devin CLI/cloud, place `.agents/skills/<id>/SKILL.md` under `.agents/skills/` or `.devin/skills/`.
2. For Cascade desktop, also copy to `.windsurf/skills/<id>/` (legacy) or `.devin/skills/<id>/` (preferred).
3. For distribution, wrap as a `.devin-plugin/plugin.json` plugin with `skills/` and optional `rules/`/`AGENTS.md`; install with `devin plugins install`.
4. For always-on context, ship `AGENTS.md` at repo root or `.devin/rules/*.md`.
5. For MCP, add `mcpServers` to `.devin/config.json` or `~/.config/devin/config.json`.
6. Workflows should go to `.windsurf/workflows/*.md` for Cascade slash commands.

### Portability, transferability and standardization

- Strong Open Skills citizen; scans eight project-level skill paths including `.agents/skills/`, `.claude/skills/`, `.cursor/skills/` and `.codex/skills/`.
- `.agents/skills/` is the recommended cross-tool project path.
- `AGENTS.md` is first-class; root = always-on, subdirectories = glob-scoped.
- Devin CLI can import settings from Cursor, Windsurf and Claude via `read_config_from`.
- CLI plugins are installed at the user level and are available across all projects.

### Recent changes, beta status and caveats

- Devin Desktop is transitioning the Windsurf brand to Devin; `.devin/` takes precedence, while `.windsurf/` remains as a fallback.
- `AGENTS.md` is preferred over legacy `.windsurfrules`; `WARP.md`? no — `WARP.md` is Warp. For Devin, legacy single-file `.windsurfrules` still read.
- `subagent` and `agent` frontmatter fields are experimental and may change.
- Cascade remains available while Devin Local rolls out (mid-2026).
- Skill directory name is the identifier; frontmatter `name` only changes the display/invocation label.
- Cloud Devin discovers skills from all connected repositories.

---

## `warp` — Warp / Oz

| Attribute | Value |
|-----------|-------|
| Catalog id | `warp` |
| Display name | Warp / Oz |
| Aliases | `warp`, `oz` |

### What they call "plugin type things"

- **Skills** — `SKILL.md` directories discovered by Warp agents and used by the Oz CLI.
- **Rules** — Global Rules and Project Rules, read from `AGENTS.md` (preferred) or `WARP.md` (legacy).
- **Warp Drive** — shared cloud space for notebooks, workflows, prompts, rules and MCP servers.
- **Notebooks** — runnable markdown documents with executable shell blocks.
- **Workflows** — saved command/param templates.
- **MCP servers** — configured via `--mcp` or agent config `mcp_servers`.
- **Oz CLI** — command-line tool for running/configuring Warp cloud agents.
- **Agent profiles** — model/tool/permission sets for agents.

### Primary authoring/discovery unit and layout

A skill:

```text
<skill-name>/
└── SKILL.md              # YAML frontmatter + instructions; supporting files alongside
```

Project rules:

```text
project/
├── AGENTS.md             # preferred; root = always-on, subdirs = scoped
└── .warp/
    └── skills/<name>/SKILL.md
```

Oz CLI cloud run:

```bash
oz agent run-cloud -e <ENV_ID> --skill "owner/repo:skill-name" --prompt "..."
```

- Drive objects are referenced by IDs or short names (`<notebook:id>`, `<workflow:id>`, `<prompt:id>`, `<rule:id>`).
- Agent config files (YAML/JSON) can define `mcp_servers`.

### Skill discovery paths

| Scope | Paths |
|-------|-------|
| Project | `.agents/skills/<name>/SKILL.md` (recommended), `.warp/skills/<name>/SKILL.md`, `.claude/skills/`, `.codex/skills/`, `.cursor/skills/`, `.gemini/skills/`, `.copilot/skills/`, `.factory/skills/`, `.github/skills/`, `.opencode/skills/` |
| User / Team | `~/.agents/skills/<name>/SKILL.md` if supported; Global Rules and Drive objects stored in Warp Drive |
| Cloud (Oz) | `owner/repo:skill-name` or `owner/repo:path/to/SKILL.md` passed to `oz agent run-cloud --skill` |
| Rules | `AGENTS.md` / `WARP.md` in root and subdirs; Global Rules in Warp Drive |

### Official documentation

- Skills for agents — https://docs.warp.dev/agent-platform/capabilities/skills/ (live)
- Skills via Oz CLI — https://docs.warp.dev/reference/cli/skills/ (live)
- Oz CLI reference — https://docs.warp.dev/reference/cli/ (live)
- MCP servers (CLI) — https://docs.warp.dev/reference/cli/mcp-servers/ (live)
- Cloud agents MCP — https://docs.warp.dev/platform/mcp/ (live)
- Rules for agents — https://docs.warp.dev/agent-platform/capabilities/rules/ (live)
- Agent mode context / Warp Drive — https://docs.warp.dev/knowledge-and-collaboration/warp-drive/agent-mode-context/ (live)
- Warp Drive notebooks — https://docs.warp.dev/knowledge-and-collaboration/warp-drive/notebooks/ (live)
- Warp Drive CLI reference — https://docs.warp.dev/reference/cli/warp-drive/ (live)
- Warp Drive product — https://www.warp.dev/drive (live)

### Polyglot bridge

1. Copy `.agents/skills/<id>/SKILL.md` to `.agents/skills/<id>/` (recommended) or `.warp/skills/<id>/`.
2. For Oz cloud runs, reference the skill as `owner/repo:<id>` or `owner/repo:.warp/skills/<id>/SKILL.md` with `oz agent run-cloud --skill`.
3. For always-on rules, ship `AGENTS.md` at repo root (or `WARP.md` for backwards compatibility).
4. For MCP, pass `--mcp <UUID|JSON|file>` or add `mcp_servers` to an agent config file.
5. To share static guides across a team, convert them to Warp Drive notebooks or workflows.

### Portability, transferability and standardization

- Reads `.agents/skills/` and many other agent skill paths, so Open Skills packages are largely portable.
- `AGENTS.md` is preferred over `WARP.md` for cross-agent rules.
- Warp Drive objects are hosted/cloud and not file-system portable; skill and rule files are.
- No installable `plugin.json` equivalent as of mid-2026; packaging is a combination of skills, rules, MCP and Drive objects.

### Recent changes, beta status and caveats

- No public plugin manifest as of mid-2026; treat Warp as a skills + rules + MCP harness.
- Agent mode context automatically pulls from Warp Drive; this can be disabled in Settings > Agents > Knowledge.
- For local `oz agent run`, skills from the current repo are auto-discovered.
- Cloud `--skill` requires the repository to be configured in the environment; use the fully-qualified `owner/repo:skill-name` form.
- If both `WARP.md` and `AGENTS.md` exist in the same directory, `AGENTS.md` takes priority.
- Workflows are manual only.

---

## Research notes

### Verification method

- All product links were checked with `web_search`. `webfetch` was unavailable in this subagent session, so live status is based on search-indexed results and snippets rather than raw HTTP fetches.
- All Tier A harnesses have current, indexed documentation as of July 2026. No dead links were found for the URLs listed above.

### Canonical-path changes and aliases

- **Claude Code**: docs sometimes appear with a `.md` suffix (e.g. `/docs/en/plugins.md`), but the unsuffixed `/docs/en/plugins` is canonical and resolves.
- **Cursor**: `/docs/rules` resolves to `/docs/rules.md` and `/help/customization/rules`.
- **Codex**: subagents canonical is now `/codex/subagents`; the source `/codex/concepts/subagents` is an alias.
- **Copilot**: CLI plugin reference canonical is `/copilot/reference/copilot-cli-reference/cli-plugin-reference`; the older `/copilot/reference/cli-plugin-reference` segment is gone.
- **VS Code**: Agent Skills canonical is `/docs/agent-customization/agent-skills`; source `/docs/copilot/customization/agent-skills` is an older/redirected path. The GitHub source is still at `microsoft/vscode-docs/docs/copilot/customization/agent-skills.md`.
- **Devin**: Cascade workflows are reachable at both `/desktop/cascade/workflows` and `/windsurf/plugins/cascade/workflows`.
- **OpenCode**: docs are split across `dev.opencode.ai` (canonical for skills), `opencode.ai` (agents/plugins), `v2.opencode.ai` (V2 beta) and a Mintlify mirror.
- **Gemini**: GitHub source docs are canonical for detail; `geminicli.com` mirrors them and hosts the extension gallery.

### Ambiguities and open issues

- **Copilot CLI MCP merging**: an open issue notes that `copilot plugin install` does not always merge a plugin's `.mcp.json` into `~/.copilot/mcp-config.json`, so manual registration may be needed.
- **VS Code Agent Plugins**: still in preview as of mid-2026; paths and manifests may stabilize further.
- **OpenCode V2**: plugin API and instructions handling are in beta; entry points may change.
- **Warp**: no plugin manifest exists; skill support is file- and Drive-based.
- **Codex curated catalog**: the `openai/skills` repository is deprecated but still referenced by `$skill-installer`.
- **Devin global skills**: two global locations (`~/.config/devin/skills/` and `~/.codeium/<channel>/skills/`) plus the Open Skills alias `~/.agents/skills/`.

### Standards referenced

- **Agent Skills / Open Skills** — https://agentskills.io and `agentskills/agentskills` on GitHub.
- **AGENTS.md** — https://agents.md and `agentsmd/agents.md` on GitHub.
- **MCP** — Model Context Protocol; each harness uses a slightly different JSON wrapper (`mcpServers` vs `servers` vs `mcp` block).

### Source file

- Derived from `/Users/tariqwest/Developer/polyglot-plugin/.agents/skills/polyglot-plugin/references/okf-plugin-type-things-2026-07.md`, Tier A sections (lines 79-258) and the Quick matrix (lines 32-75).
