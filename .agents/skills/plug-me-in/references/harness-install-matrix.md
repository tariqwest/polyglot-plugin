# Harness install matrix

Per-harness extension model, disk paths, CLIs, and verification. Used by `plug-me-in` scripts and agents.

Scope keys:

- **project** — inside the workspace the user has open
- **global** — user home config that applies across projects

When both exist, prefer **project** unless the user asked for global.

---

## claude-code

**Also known as:** Claude Code, Anthropic Claude CLI

**Calls them:** plugins, skills, slash commands, hooks, MCP servers, marketplaces

**Model:** Full plugin packages (`.claude-plugin/plugin.json`) can bundle skills, agents, hooks, commands, and `.mcp.json`. Standalone skills use Open Skills `SKILL.md`. Marketplaces list many plugins.

### Paths

| Scope | Skills | Plugins / marketplaces | MCP |
|---|---|---|---|
| project | `.claude/skills/<name>/SKILL.md`, sometimes `.agents/skills/` | project plugin dirs; local marketplace refs | `.mcp.json`, `.claude/settings.json` mcp |
| global | `~/.claude/skills/` | `~/.claude/plugins/`, marketplaces under `~/.claude/plugins/marketplaces/` | user Claude settings / MCP |

### Install methods (preferred order)

1. In-session: `/plugin marketplace add <owner/repo>` then install named plugin
2. Copy or symlink skill dirs into `.claude/skills/<name>/` (name == frontmatter)
3. `npx skills add <pkg> -a claude-code -y` when package is skills-cli compatible
4. Clone Claude plugin repo and enable via Claude plugin UI/CLI
5. Merge MCP into `.mcp.json` (`mcpServers` or bare map — Claude accepts both styles in the wild)

### Manual steps

1. Skills: place `SKILL.md` under `.claude/skills/<name>/`
2. Plugin: ensure `.claude-plugin/plugin.json` + component dirs; add marketplace or local path per Claude docs
3. MCP: edit `.mcp.json`; restart session
4. Reload Claude Code session if skills don’t appear

### Verify

- Skill folder exists; `name:` matches folder
- `/plugin` list or installed plugins UI shows package
- MCP tools visible after restart

### Gotchas

- Marketplace ≠ single plugin — install one plugin unit
- Flat `skills/foo.md` works in some plugins; prefer dir + `SKILL.md`
- `${CLAUDE_PLUGIN_ROOT}` only works inside installed plugins

### skills-cli agent id

`claude-code` (also try `claude` if CLI rejects)

---

## cursor

**Calls them:** rules (`.mdc`), skills, MCP servers, (optional) Cursor plugins

**Model:** Rules are the classic extension surface. Open Skills increasingly land under `.agents/skills` or `.cursor/skills`. MCP is first-class via `.cursor/mcp.json`. Full `.cursor-plugin/plugin.json` packs exist but are less common than rules+MCP.

### Paths

| Scope | Skills / rules | MCP |
|---|---|---|
| project | `.cursor/rules/*.mdc`, `.cursor/skills/`, `.agents/skills/` | `.cursor/mcp.json` (sometimes root `mcp.json`) |
| global | `~/.cursor/` rules/skills if configured | `~/.cursor/mcp.json` |

### Install methods

1. `npx skills add <pkg> -a cursor -y`
2. Copy skill → `.agents/skills/<name>/` **and** add `.cursor/rules/<name>.mdc` that points at or inlines the skill (Cursor may not scan `.agents/` alone)
3. Merge MCP into `.cursor/mcp.json` under `mcpServers` (some files use `servers` — normalize carefully)
4. Cursor plugin: copy tree with `.cursor-plugin/plugin.json` into project or user plugins dir

### Manual mdc bridge

```markdown
---
description: <skill description>
globs:
alwaysApply: false
---

Read and follow `.agents/skills/<name>/SKILL.md`.
```

### Verify

- Rule visible in Cursor Settings → Rules
- MCP server listed in Cursor MCP settings
- Agent can read skill path

### Gotchas

- Don’t only drop files in `.agents/skills` without a rule bridge
- Merge MCP; never wipe existing servers
- `servers` vs `mcpServers` key variants

### skills-cli agent id

`cursor`

---

## codex

**Calls them:** skills, plugins, AGENTS.md instructions

**Model:** Open Skills + optional `.codex-plugin/plugin.json`. Repo-level `AGENTS.md` is important discovery. Skill list size limits may apply — keep descriptions lean.

### Paths

| Scope | Skills | Other |
|---|---|---|
| project | `.agents/skills/<name>/SKILL.md`, sometimes `.codex/skills/` | `AGENTS.md`, `.codex-plugin/` |
| global | user Codex skill dirs if documented for install | user config |

### Install methods

1. Copy skills into `.agents/skills/<name>/`
2. `npx skills add <pkg> -a codex -y` when supported
3. Ensure root `AGENTS.md` mentions the skill if the package expects it
4. MCP: merge into project MCP config if Codex session uses MCP

### Verify

- Skill appears in Codex skill list / `$skill` invocation
- Frontmatter description within size comfort zone

### skills-cli agent id

`codex`

---

## copilot

**Calls them:** plugins, custom agents, skills, copilot-instructions, MCP

**Model:** VS Code / GitHub Copilot plugins use `.github/plugin/plugin.json` or root `plugin.json`, often with `agents/*.agent.md` and `skills/`. Workspace instructions: `.github/copilot-instructions.md`. Monorepos (awesome-copilot) keep skill bodies at **repo root** while plugin manifests live under `plugins/<id>/`.

### Paths

| Scope | Content | MCP |
|---|---|---|
| project | `.github/plugin/`, `.github/copilot-instructions.md`, `skills/`, `agents/` | `.mcp.json`, VS Code MCP user/workspace settings |
| global | VS Code user profiles | user `mcp.json` |

### Install methods

1. Copy a **single plugin unit** (resolve monorepo paths upward)
2. Append condensed skill guidance into `.github/copilot-instructions.md` when full plugin install isn’t available
3. Merge MCP into VS Code / repo MCP config
4. For polyglot packages: use `.github/copilot-instructions.md` bridge already generated

### Verify

- Copilot Chat sees instructions
- Custom agents appear if `.agent.md` installed per Copilot version
- MCP tools in Copilot agent mode

### Gotchas

- Path walk-up for `skills[]` in marketplace monorepos
- `*.agent.md` naming

---

## gemini

**Calls them:** extensions, skills, commands, MCP

**Model:** `gemini-extension.json` packages context (`GEMINI.md`), skills, TOML commands, optional `mcpServers`. Workspace skills also under `.gemini/skills/`.

### Paths

| Scope | Skills | Extensions / MCP |
|---|---|---|
| project | `.gemini/skills/`, `.agents/skills/` | project extension checkout, `mcp_config.json` |
| global | `~/.gemini/skills/` | `gemini extensions` user install |

### Install methods

1. `gemini extensions install <path-or-url>` when CLI available
2. Copy skills → `.gemini/skills/<name>/` or `~/.gemini/skills/`
3. Merge MCP from `gemini-extension.json` / `mcp_config.json` into active config
4. `npx skills add …` if agent mapping includes gemini

### Verify

- `gemini extensions list` (if CLI)
- Skill path exists; restart Gemini CLI

### Gotchas

- Extension MCP is inside manifest, not always separate file
- Commands are `commands/*.toml`, not SKILL.md

---

## opencode

**Calls them:** skills, plugins

**Model:** `.opencode/skills/`, root/config plugins (`opencode.json`), or Open Skills `.agents/skills/`. Some community “skill plugins” are deprecated in favor of native skill trees.

### Paths

| Scope | Skills |
|---|---|
| project | `.opencode/skills/`, `.agents/skills/` |
| global | user OpenCode config skills dir if present |

### Install methods

1. Copy `SKILL.md` trees into `.opencode/skills/<name>/` or `.agents/skills/`
2. Register plugin in `opencode.json` only if source is a real OpenCode plugin package
3. Merge MCP per OpenCode config schema

### Verify

- Skill listed in OpenCode skill picker / docs path

---

## warp / oz

**IDs:** `warp`, `oz` (treat as same family)

**Calls them:** skills, rules, MCP, Warp Drive / agent config, workflows

**Model:** Prefers Open Skills under `.agents/skills/`. MCP configured via Warp settings / config (not always a repo file). Rules may live in Warp Drive. Oz agents load bundled + project skills.

### Paths

| Scope | Skills | MCP |
|---|---|---|
| project | `.agents/skills/<name>/SKILL.md` | project-level MCP if Warp supports workspace file; else app settings |
| global | user/Warp skill locations, Drive | Warp user MCP settings |

### Install methods

1. Copy skills into project `.agents/skills/<name>/`
2. For polyglot packages, `.agents/skills` is enough for skill discovery; still merge MCP in Warp UI
3. `npx skills add <pkg> -a warp` or generic agent if supported; else copy
4. Document MCP servers for the user to paste into Warp MCP settings when no file path exists

### Manual MCP

If no repo MCP file is authoritative, print JSON for the user to add in Warp → Settings → MCP (or current equivalent).

### Verify

- New agent session lists skill / agent can read `SKILL.md`
- MCP tools connected in Warp

### Gotchas

- Don’t assume Claude `/plugin` works in Warp
- Wrong-harness plugins need convert or skill extraction first

---

## windsurf

**Calls them:** rules, memories, MCP

**Model:** Cascade rules under `.windsurf/` (or product rules UI). MCP via Windsurf settings.

### Paths

- project rules: `.windsurf/rules/` (or current Windsurf rules path)
- MCP: app/workspace MCP config

### Install

1. Convert skill body → rule markdown in `.windsurf/rules/<name>.md`
2. Merge MCP servers into Windsurf MCP config
3. Reload window

---

## cline

**Calls them:** rules, custom instructions, MCP

### Paths

- `.clinerules`, `.clinerules/`, or `.cline/rules` (versions differ — detect which exists)
- MCP via Cline MCP settings JSON

### Install

1. Write rule file or append to `.clinerules`
2. Merge MCP
3. Restart Cline task

---

## roo

**Calls them:** rules, modes, MCP

### Paths

- `.roo/rules/`, `.roorules`
- MCP in Roo settings

### Install

Copy rule markdown; merge MCP; reload.

---

## antigravity

**Calls them:** skills, agent config

**Model:** **Singular** `.agent/` (not `.agents/`). Skills at `.agent/skills/`. MCP often `.agent/mcp_config.json`.

### Paths

| Scope | Skills | MCP |
|---|---|---|
| project | `.agent/skills/<name>/SKILL.md` | `.agent/mcp_config.json` |
| global | product-specific | product-specific |

### Install

1. Copy skills into `.agent/skills/<name>/`
2. Merge MCP into `.agent/mcp_config.json`
3. Do not use `.agents` unless a bridge exists

### Gotchas

- Singular `.agent` is the #1 install bug for this harness

---

## hermes

**Calls them:** skills

### Paths

- global-oriented: `~/.hermes/skills/<name>/SKILL.md`
- project: copy same layout if Hermes supports project override

### Install

Copy Open Skills trees into Hermes skills dir.

---

## aider

**Calls them:** conventions, read-only files — **not** a plugin system

### Paths

- `CONVENTIONS.md` at repo root (primary)
- optional `.aider.conf.yml`

### Install

1. Append a concise “Skill: <name>” section to `CONVENTIONS.md` summarizing the skill workflow
2. Optionally add skill path to aider’s read list / conf
3. MCP generally N/A — extract scripts as shell commands instead

### Gotchas

- Full SKILL.md trees are not auto-discovered; distill guidance

---

## grok

**Calls them:** skills (Grok Build)

### Paths

- `.agents/skills/`
- `.grok/config.toml` must include:

```toml
[skills]
paths = ["./.agents/skills"]
```

### Install

1. Copy skills into `.agents/skills/<name>/`
2. Ensure `.grok/config.toml` paths entry exists (create if missing)
3. MCP optional

---

## unknown / generic

**Fallback model:** Open Agent Skills standard

### Install

1. `.agents/skills/<name>/SKILL.md` (+ scripts/references)
2. Mention optional bridges: `AGENTS.md`, `.cursor/rules`, `mcp.json`
3. Offer `convert-to-polyglot` if user wants multi-harness later

---

## skills-cli agent mapping

Used by `npx skills add -a <agent>`:

| harness id | try `-a` values (in order) |
|---|---|
| claude-code | `claude-code`, `claude` |
| cursor | `cursor` |
| codex | `codex` |
| copilot | `copilot`, `github-copilot` |
| gemini | `gemini`, `gemini-cli` |
| opencode | `opencode` |
| warp / oz | `warp`, `*` |
| windsurf | `windsurf` |
| cline | `cline` |
| roo | `roo` |
| antigravity | `antigravity` |
| hermes | `hermes` |
| grok | `grok` |
| aider | (skip CLI — manual CONVENTIONS) |
| unknown | `*` (all agents) with user consent |

If CLI fails, fall back to filesystem copy from this matrix.

---

## MCP merge rules (all harnesses)

1. Read existing file (if any)
2. Parse JSON; support top-level `mcpServers`, `servers`, or bare server map
3. Normalize in-memory to `mcpServers`
4. Add/overwrite only the servers being installed (warn on overwrite)
5. Write back in the **harness’s preferred key style**
6. Backup to `*.bak-<timestamp>` before first write in a session when file existed
7. Collect `${ENV}` references and report as required secrets

### Common MCP destinations

| harness | default file (project) |
|---|---|
| claude-code | `.mcp.json` |
| cursor | `.cursor/mcp.json` |
| copilot | `.mcp.json` or VS Code mcp | 
| gemini | `mcp_config.json` / extension |
| antigravity | `.agent/mcp_config.json` |
| polyglot / generic | `mcp.json` |
| warp | app settings (print JSON) |

---

## Related

- Manifest field notes: `../../convert-to-polyglot/references/plugin-manifest-formats.md`
- Source routing: `source-routing.md`
