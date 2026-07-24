# Tier B Harnesses — Partial / MCP-first / Instructions-first Agent Extensibility

> State of agent plugin/skill/extension systems as of **July 2026**.
> Tier B clients have **official extension surfaces**, but they are not always named `plugins,` and first-class Open Skills support varies. The safest cross-harness bridges are **MCP**, **`AGENTS.md`**, and the **`.agents/skills/<name>/SKILL.md`** Open Skills layout.

---

## `continue` — Continue (IDE extensions + `cn` CLI)

- **Catalog id:** `continue`
- **Display name(s):** Continue, Continue.dev, `cn` (CLI/TUI)
- **Aliases:** Continue IDE, `continuedev`

### What they call plugin type things
- **Rules** — always-on or glob-scoped instructions.
- **Prompts** — user-invokable slash commands (`/`).
- **MCP servers / tools** — live external capabilities (Agent mode only).
- **Context providers** and **config blocks** in `config.yaml`.
- Continue is **not** a native Open Skills host; it does not autoload `.agents/skills/<name>/SKILL.md` packages.

### Primary authoring/discovery unit and file/directory layout

| Unit | Project layout | User / global layout | Format |
|------|----------------|----------------------|--------|
| Rules | `.continue/rules/*.md` | `~/.continue/config.yaml` → `rules:` | Markdown with optional YAML frontmatter (`name`, `globs`, `regex`, `description`, `alwaysApply`) |
| Prompts | project config or hub `uses:` | `~/.continue/config.yaml` → `prompts:` | Markdown file with `name` and `invokable: true` frontmatter, or inline `prompts:` list |
| MCP servers | `.continue/mcpServers/*.yaml` (also accepts JSON from Claude/Cursor/Cline) | `mcpServers:` in `~/.continue/config.yaml` | Continue YAML block, or classic `mcpServers` JSON |
| Configuration | — | `~/.continue/config.yaml` (IDE and `cn` CLI) | `name`, `version`, `schema`, `models`, `context`, `rules`, `prompts`, `mcpServers`, `data` |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.continue/rules/*.md`, `.continue/mcpServers/` | Version-controllable; loaded per workspace |
| User | `~/.continue/config.yaml`, `~/.continue/rules/` (if used) | Personal defaults across workspaces |
| System | — | No system-wide path; Continue stores config under `~/.continue` or `%USERPROFILE%\.continue` |

### Official documentation
- [How to Create and Manage Rules](https://docs.continue.dev/customize/deep-dives/rules) — verified live.
- [How to Create and Manage Prompts](https://docs.continue.dev/customize/deep-dives/prompts) — verified live.
- [Set Up MCP in Continue](https://docs.continue.dev/customize/deep-dives/mcp) — verified live.
- [config.yaml Reference](https://docs.continue.dev/reference) — verified live.
- [`cn` CLI configuration](https://docs.continue.dev/cli/configuration) — verified live.
- [Configuration deep dive](https://docs.continue.dev/customize/deep-dives/configuration) — verified live.
- Mirror: `continue-docs.mintlify.app` hosts the same content; `docs.continue.dev` is the canonical domain.

### Polyglot bridge
1. Keep the canonical Open Skills package at `.agents/skills/<name>/SKILL.md` for other harnesses.
2. Project a **Continue rule** into `.continue/rules/<id>.md` that inlines or points to the skill body; this is the closest Continue gets to an always-on skill.
3. Register any bundled MCP server through `.continue/mcpServers/<name>.yaml` (or `config.yaml` `mcpServers:`).
4. Optionally add a **prompt** in `~/.continue/config.yaml` `prompts:` (or a project prompt file) for explicit `/` invocation.

### Portability / standardization notes
- **Open Skills `.agents/skills` is not natively discovered** by Continue. Rules and MCP are the portable surfaces.
- MCP JSON configs from Claude/Cursor/Cline can be dropped directly into `.continue/mcpServers/`; Continue supports `stdio`, `sse`, and `streamable-http` transports.
- Rules support `globs` and `regex` for scoped application, but there is no equivalent skill frontmatter for progressive disclosure.
- Best practice: maintain one canonical `SKILL.md` and generate the Continue rule + MCP YAML from it.

### Recent changes and caveats (mid-2026)
- Continue has moved most customization into `config.yaml` (`~/.continue/config.yaml`); legacy `config.json` and `config.ts` still work but are not preferred.
- MCP is **Agent mode only** in Continue.
- Rules now default to Markdown; YAML-defined rules are still supported but deprecated in docs.

---

## `cline` — Cline (VS Code extension + CLI)

- **Catalog id:** `cline`
- **Display name(s):** Cline
- **Aliases:** `claude-dev` (legacy extension id), `cline.bot`

### What they call plugin type things
- **Skills** — Open Skills packages (`SKILL.md` with YAML frontmatter).
- **Rules** — `.clinerules/` and Cline Rules.
- **Custom instructions** — legacy name, now mapped to Rules.
- **MCP servers** — local `stdio` and remote `streamableHttp` / legacy `sse`.
- **Marketplace** — curated catalog of plugins, skills, and MCP servers (`cline/marketplace` repo).
- **Plugins** — SDK-based plugins can bundle skills, agents, MCP servers, etc.

### Primary authoring/discovery unit and file/directory layout

| Unit | Project | Global / user | Format |
|------|---------|---------------|--------|
| Skills | `.cline/skills/<name>/SKILL.md` | `~/.cline/skills/<name>/SKILL.md` | `SKILL.md` folder; `name` must match directory; `description` drives auto-match |
| Compatibility skills | `.agents/skills/`, `.claude/skills/` (optional) | `~/.claude/skills/` | Same `SKILL.md` layout; loaded when compatibility is enabled |
| Rules | `.clinerules/` | `~/Documents/Cline/Rules` (post custom-instructions migration) | Markdown / rule files |
| MCP (IDE) | — | VS Code `globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` | `mcpServers` JSON |
| MCP (CLI) | — | `~/.cline/mcp.json` | `mcpServers` JSON |
| Marketplace installs | — | `~/Documents/Cline/MCP/` | One-click MCP marketplace installs |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.cline/skills/<name>/SKILL.md` | Highest priority for this project |
| User | `~/.cline/skills/<name>/SKILL.md` | Personal skills |
| Shared / compat | `.agents/skills/<name>/`, `.claude/skills/<name>/` | Loaded alongside native paths if enabled |
| System | — | No system-level skill root; IDE data lives in VS Code globalStorage |

### Official documentation
- [Skills](https://docs.cline.bot/customization/skills) — verified live; progressive loading, `name` must match directory, `/` slash invoke.
- [MCP overview](https://docs.cline.bot/mcp/mcp-overview) — verified live.
- [MCP marketplace](https://docs.cline.bot/mcp/mcp-marketplace) — verified live.
- [Writing plugins / bundling skills](https://docs.cline.bot/sdk/guides/writing-plugins) — verified live.
- [Cline SDK overview](https://docs.cline.bot/sdk/overview) — verified live.
- [cline/skills repo](https://github.com/cline/skills) — example skill collection.
- [cline/marketplace repo](https://github.com/cline/marketplace) — source of truth for marketplace catalog.
- Source: [github.com/cline/cline](https://github.com/cline/cline)

### Polyglot bridge
1. Copy or symlink the canonical skill into `.cline/skills/<name>/` **and** keep `.agents/skills/<name>/`.
2. The `SKILL.md` should already be valid for Cline if it follows the Open Skills contract (`name`, `description`, body).
3. Merge any bundled MCP server into `~/.cline/mcp.json` (CLI) or the IDE MCP settings (`cline_mcp_settings.json`).
4. Optionally add a `.clinerules/` file or Cline Rules entry for always-on policy.

### Portability / standardization notes
- Cline is a **first-class Open Skills host**; it reads the same `SKILL.md` layout as Claude Code, Cursor, Codex, OpenCode, and Pi.
- Cline supports classic `mcpServers` JSON and newer transport `type: streamableHttp`; omitting `type` defaults to legacy `sse`.
- The `cline/marketplace` repo publishes a single `catalog.json` that any client can consume.
- Cline plugins can bundle skills under `skills/<name>/SKILL.md`.

### Recent changes and caveats (mid-2026)
- Cline skills are still marked **experimental** in some builds and may require Settings → Features → Enable Skills.
- Cline has added a formal **SDK/plugin surface**; plugin packages include `package.json` and can expose skills, agents, and MCP servers.
- Marketplace transport defaults changed; set the transport `type` to `streamableHttp` explicitly for remote servers. Omitting it falls back to legacy `sse`.

---

## `roo` / `roo-code` — Roo Code

- **Catalog id:** `roo`
- **Display name(s):** Roo Code
- **Aliases:** `roo-code`, `roocode`

### What they call plugin type things
- **Custom modes** — YAML mode definitions in `.roomodes`.
- **Rules / instructions** — `.roo/rules/*.md`, mode-specific `.roo/rules-{mode}/`, legacy `.roorules`.
- **AGENTS.md** — project root `AGENTS.md` (Agent Rules).
- **MCP servers** — user and project `mcp_settings.json` / `.roo/mcp.json`.
- **Slash commands** — custom command definitions.
- Roo Code does **not** natively host full Open Skills `SKILL.md` packages.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| Rules / instructions | `.roo/rules/*.md`, `.roo/rules-{mode}/` | Markdown (mode-scoped or always-on) |
| AGENTS.md | project root `AGENTS.md` | Plain Markdown instructions |
| Custom modes | `.roomodes` | YAML mode definitions |
| MCP (IDE) | VS Code `globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json` | `mcpServers` JSON |
| MCP (project) | `.roo/mcp.json` | `mcpServers` JSON |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.roo/rules/*.md`, `AGENTS.md`, `.roomodes` | Mode and rule files; `AGENTS.md` enabled by `roo-cline.useAgentRules` |
| User | VS Code globalStorage `mcp_settings.json` | User MCP config |
| System | — | No system-level skill or rule path |

### Official documentation
- [docs.roocode.com](https://docs.roocode.com) — docs site still online, but product is **shut down**.
- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code) — repository archived / read-only as of May 2026.
- [Sunset announcement issue #12169](https://github.com/RooCodeInc/Roo-Code/issues/12169) — Roo Code Extension, Cloud, and Router sunset.
- [AGENTS.md support PR #5969](https://github.com/RooCodeInc/Roo-Code/pull/5969)
- [AGENTS.md issue #5966](https://github.com/RooCodeInc/Roo-Code/issues/5966)

### Polyglot bridge
1. Treat `AGENTS.md` as the primary instruction bridge; it is read when `roo-cline.useAgentRules` is enabled (default on).
2. Optionally add `.roo/rules/<id>.md` excerpts of the skill body for mode-scoped or always-on guidance.
3. Register any bundled MCP server in `.roo/mcp.json` (project) or the VS Code globalStorage MCP settings.
4. Do **not** rely on `SKILL.md` auto-load; it is not an official Roo Code surface.

### Portability / standardization notes
- Roo Code supports `AGENTS.md`, which is the closest cross-agent standard it adopted.
- MCP config follows the classic `mcpServers` JSON shape.
- Custom modes are Roo-specific YAML; not portable to other harnesses.
- Roo is a Cline fork; many file paths mirror Cline, but its skill surface never reached parity.

### Recent changes and caveats (mid-2026)
- **Roo Code was shut down on May 15, 2026.** The VS Code extension, Cloud, and Router services are no longer maintained.
- The team pivoted to **Roomote**, a cloud-based agent that runs end-to-end outside the IDE.
- The archived extension may still run with personal API keys, but it will drift as provider APIs change.
- **Do not promise new Roo bridges in documentation or installers.** Keep Roo entries for migration/historical completeness only.

---

## `goose` — Block Goose

- **Catalog id:** `goose`
- **Display name(s):** Goose, Block Goose
- **Aliases:** `block-goose`

### What they call plugin type things
- **Extensions** — the primary plugin concept; MCP servers (builtin, `stdio`, `sse`, streamable HTTP).
- **Recipes** — YAML workflow definitions that bundle instructions, parameters, and required extensions.
- **Built-in extensions** — `developer`, `memory`, `computercontroller`, `autovisualiser`, `tutorial`, etc.
- **Platform extensions** — e.g., Summon for skills/recipes.
- **Prompts** — server-provided MCP prompts.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location / shape | Format |
|------|------------------|--------|
| Extensions config | `~/.config/goose/config.yaml` → `extensions:` | YAML; `type: builtin | stdio | sse` |
| Recipes | `*.yaml` files with `name`, `version`, `description`, `parameters`, `extensions`, `instructions`, optional `sub_recipes` | Jinja2-templated YAML |
| Built-ins | Bundled with Goose | `developer`, `memory`, `computercontroller`, `autovisualiser`, `tutorial` |
| CLI | `goose configure`, `goose mcp`, `goose run --recipe`, `goose recipe` | — |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `*.yaml` recipe files in the working directory; per-project extensions can be declared in recipes | Recipes are the closest project-level unit |
| User | `~/.config/goose/config.yaml` → `extensions:` | User MCP / extension registry |
| System | — | No system-wide skill root; config is under `~/.config/goose` |

### Official documentation
- [Using extensions (GitHub)](https://github.com/block/goose/blob/main/documentation/docs/getting-started/using-extensions.md) — source-of-truth source.
- [MCP integration (Mintlify mirror)](https://block-goose.mintlify.app/guides/mcp-integration) — verified live.
- [Recipes (Mintlify mirror)](https://block-goose.mintlify.app/guides/recipes) — verified live.
- [Extensions overview (Mintlify mirror)](https://block-goose.mintlify.app/concepts/extensions) — verified live.
- [Recipe reference (GitHub)](https://github.com/block/goose/blob/main/documentation/docs/guides/recipes/recipe-reference.md)
- Product site: [block.github.io/goose](https://block.github.io/goose) (mirrors / redirects to Mintlify docs).

### Polyglot bridge
1. Provide an MCP server and register it under the `extensions:` map in `~/.config/goose/config.yaml` (`type: stdio` or `sse`).
2. Optionally wrap the skill as a **Goose recipe**: create a YAML recipe that loads the skill instructions as `instructions` and lists any required extensions.
3. `.agents/skills/<name>/SKILL.md` alone is **not** consumed by Goose unless a Summon/platform extension is configured to load it; document it as optional.

### Portability / standardization notes
- Goose is **MCP-native**; every extension is an MCP server. This makes tool-level portability strong.
- Recipes are Goose-specific YAML/Jinja2; they are not Open Skills packages and do not transfer to Claude/Cline/Cursor without rewriting.
- There is no canonical `.agents/skills` discovery; the lowest-common-denominator is MCP + instructions embedded in a recipe.
- If the Open Skills package includes an MCP server, Goose can use it directly.

### Recent changes and caveats (mid-2026)
- Goose supports `stdio`, `sse`, and streamable HTTP MCP transports.
- Built-in extensions have been stabilized; `computercontroller` and `autovisualiser` are still powerful and permission-sensitive.
- Recipe format supports `sub_recipes`, `parameters`, and `response` schemas for structured automation.

---

## `zed` — Zed

- **Catalog id:** `zed`
- **Display name(s):** Zed
- **Aliases:** `zed-industries`

### What they call plugin type things
- **Context servers** — Zed's name for MCP servers.
- **Skills** — reusable instruction packages (`SKILL.md` folder).
- **Instructions** — always-on guidance (`AGENTS.md`, `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `CLAUDE.md`, `GEMINI.md`, etc.).
- **Agent profiles** — tool-permission sets and reusable agent configurations.
- **MCP extensions** — Zed extensions that package MCP servers.
- **External agents** — ACP-compatible agents.
- **Tool permissions** — per-action allow/deny/confirm settings.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| MCP / context servers | `settings.json` → `context_servers` | `command`, `args`, `env`, remote URL, or extension-provided |
| Skills | project or user skill directories loaded by Zed Agent | `SKILL.md` folder with YAML frontmatter |
| Instructions | root `AGENTS.md` (preferred), also legacy rule filenames | Plain Markdown; first match wins for the legacy rule-file list |
| Agent settings | Agent Panel / `agent.*` in settings | JSON settings |
| MCP extensions | `extension.toml` → `[context_servers.my-server]` | Rust extension + `context_server_command` |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `AGENTS.md`, `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | Zed picks the first matching instruction file from a legacy list; prefer `AGENTS.md` |
| User | Zed settings `context_servers`, user skills directory | Set via `agent: open settings` or `zed: open settings file` |
| System | — | No system-wide skill path; settings live in OS-specific Zed config directories |

### Official documentation
- [MCP in Zed](https://zed.dev/docs/ai/mcp) — verified live.
- [Agent Settings](https://zed.dev/docs/ai/agent-settings) — verified live.
- [Skills](https://zed.dev/docs/ai/skills) — verified live.
- [Tools (including `skill`)](https://zed.dev/docs/ai/tools) — verified live.
- [Tool Permissions](https://zed.dev/docs/ai/tool-permissions) — verified live.
- [MCP Server Extensions](https://zed.dev/docs/extensions/mcp-extensions) — verified live.
- Source: [github.com/zed-industries/zed](https://github.com/zed-industries/zed)

### Polyglot bridge
1. Place the canonical Open Skills package under `.agents/skills/<name>/` — Zed Agent can load skills from project/user directories.
2. Add or symlink `AGENTS.md` at project root for always-on instructions.
3. Convert bundled MCP server config into `context_servers` entries in Zed `settings.json`.
4. For distribution, consider a Zed MCP extension (package an MCP server in an extension).

### Portability / standardization notes
- Zed supports the Open Skills `SKILL.md` layout and can auto-invoke skills via the `skill` tool or `/skill` slash command.
- `AGENTS.md` is the preferred always-on instruction file; the legacy rule-filename list is a compatibility concession.
- Zed implements MCP as `context_servers`; it currently supports MCP **Tools** and **Prompts** only (not Resources or Sampling).
- Remote/streamable HTTP MCP may require the `mcp-remote` bridge because Zed natively prefers stdio.

### Recent changes and caveats (mid-2026)
- Zed has replaced the older `Rules Library` concept with **Skills** and **Instructions**.
- MCP tool list changes are hot-reloaded via `notifications/tools/list_changed`.
- Zed Agent enforces explicit tool permissions; users must approve tool calls unless auto-approval is configured.

---

## `junie` / `pycharm` — JetBrains Junie + PyCharm / IntelliJ

- **Catalog ids:** `junie`, `pycharm`
- **Display name(s):** Junie, JetBrains AI Assistant, PyCharm AI Assistant
- **Aliases:** `jetbrains-junie`, `jetbrains-ai-assistant`

### What they call plugin type things
- **Guidelines / instructions** — `AGENTS.md`.
- **Junie extensions** — `extension.json` + `skills/*/SKILL.md` + optional `agents/`, `guidelines/`, `mcp/.mcp.json`.
- **MCP tools / servers** — configured in IDE settings or `.junie/mcp/mcp.json` / `.ai/mcp/mcp.json`.
- **Skills** — loaded by Claude Agent / Codex inside JetBrains, or by Junie extensions.
- **Brave mode / Debug mode** — Junie-specific agent modes.
- **ACP (Agent Client Protocol)** — external agents.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| Guidelines (Junie) | `.junie/AGENTS.md` (preferred), root `AGENTS.md`, legacy `.junie/guidelines.md` | Plain Markdown |
| Guidelines (Claude/Codex in JetBrains) | root `CLAUDE.md` or `AGENTS.md` | Plain Markdown |
| MCP (Junie) | project `.junie/mcp/mcp.json`; user `~/.junie/mcp/mcp.json` | `mcpServers` JSON |
| MCP (PyCharm / AI Assistant) | project `.ai/mcp/mcp.json`; IDE Settings → Tools → AI Assistant → Model Context Protocol | `mcpServers` JSON |
| Junie extensions | `~/.junie/extensions/<name>/` or project `.junie/extensions/<name>/` | `extension.json` + `skills/<skill>/SKILL.md` + `guidelines/` + `mcp/.mcp.json` |
| Skills directory (native) | `.junie/skills/<name>/SKILL.md`, `~/.junie/skills/<name>/SKILL.md` | Open Skills `SKILL.md` |
| JetBrains skills catalog | [JetBrains/skills](https://github.com/JetBrains/skills) | Curated example skills |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.junie/AGENTS.md`, `.junie/skills/<name>/`, `.junie/extensions/<name>/`, `.junie/mcp/mcp.json`, `.ai/mcp/mcp.json` | Version-controllable; `.junie/AGENTS.md` is preferred over root `AGENTS.md` |
| User | `~/.junie/skills/<name>/`, `~/.junie/extensions/<name>/`, `~/.junie/mcp/mcp.json` | Personal skills and extensions |
| IDE global | Settings → Tools → AI Assistant → Model Context Protocol | UI-managed MCP servers |
| System | — | No system-wide skill root |

### Official documentation
- [Junie agent](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) — verified live.
- [Agents overview](https://www.jetbrains.com/help/ai-assistant/agents.html) — verified live.
- [Junie product](https://junie.jetbrains.com) — verified live.
- [JetBrains/junie-extensions repo](https://github.com/JetBrains/junie-extensions) — extension layout source.
- [JetBrains/skills repo](https://github.com/JetBrains/skills) — example skills.
- [PyCharm MCP Server](https://www.jetbrains.com/help/pycharm/mcp-server.html) — PyCharm as an MCP server (2026-05-13).
- [AI Assistant MCP](https://www.jetbrains.com/help/ai-assistant/mcp.html) — connecting AI Assistant to external MCP servers.
- [ACP (Agent Client Protocol)](https://www.jetbrains.com/help/ai-assistant/acp.html) — external agents.

### Polyglot bridge
1. Drop the skill into `.junie/skills/<name>/SKILL.md` or wrap it as a **Junie extension** (`extension.json` + `skills/<name>/SKILL.md`).
2. Place `.junie/AGENTS.md` (or root `AGENTS.md`) for always-on instructions.
3. Put bundled MCP server config into `.junie/mcp/mcp.json` for Junie, or `.ai/mcp/mcp.json` for generic JetBrains AI Assistant / PyCharm.
4. For Claude Agent or Codex inside JetBrains, use their native skill paths (`.claude/skills/`, `.codex/skills/`) and `CLAUDE.md` / `AGENTS.md`.

### Portability / standardization notes
- Junie itself is **guidelines + MCP first**; packaged domain expertise ships as a **Junie extension** with `SKILL.md`.
- `AGENTS.md` is the portable instruction surface across Junie, Claude Agent, Codex, and GitHub Copilot inside JetBrains.
- The `.ai/mcp/mcp.json` path uses the classic `mcpServers` JSON and is the same canonical shape as Claude Desktop.
- Junie extensions are JetBrains-specific but use standard `SKILL.md` for skills.

### Recent changes and caveats (mid-2026)
- JetBrains AI Assistant now supports **MCP** with `stdio` and streamable HTTP transports.
- PyCharm 2025.2+ bundles an integrated **MCP Server** plugin, allowing external clients to drive the IDE.
- **Claude Agent and Codex** inside JetBrains respect their own skill loaders and instruction files (`CLAUDE.md` / `AGENTS.md`), not Junie's.

---

## `kiro` / `amazon-q` — Kiro (AWS, formerly Amazon Q Developer)

- **Catalog ids:** `kiro`, `amazon-q`
- **Display name(s):** Kiro, Kiro IDE, Kiro CLI, AWS Kiro
- **Aliases:** `amazon-q-developer`, `q-developer`

### What they call plugin type things
- **Steering** — markdown instruction files in `.kiro/steering/`.
- **Agent Skills** — portable `SKILL.md` packages following the Open Skills standard.
- **MCP servers** — `mcpServers` JSON in `.kiro/settings/mcp.json` or `~/.kiro/settings/mcp.json`.
- **Hooks** — event-driven automation scripts.
- **Powers** — AWS-managed capabilities.
- **Specs** — structured specifications for spec-driven development.
- **Custom subagents / agents** — specialized agent definitions.

### Primary authoring/discovery unit and file/directory layout

| Unit | Preferred location | Legacy / alternate | Format |
|------|--------------------|--------------------|--------|
| Skills | `.kiro/skills/<name>/SKILL.md`, `~/.kiro/skills/<name>/SKILL.md` | `.agents/skills/<name>/` (supported as provider dir) | `SKILL.md` folder with YAML frontmatter |
| Steering | `.kiro/steering/*.md` | `~/.kiro/steering/*.md` | Plain Markdown |
| AGENTS.md | workspace root `AGENTS.md` or `~/.kiro/steering/AGENTS.md` | — | Plain Markdown |
| MCP | `~/.kiro/settings/mcp.json`, project `.kiro/settings/mcp.json` | `~/.aws/amazonq/mcp.json` (legacy getmcp `amazon-q`) | `mcpServers` JSON |
| Config | `.kiro/config.toml`? (project-level) | `~/.kiro/` user tree | TOML / JSON / YAML depending on feature |
| Hooks | `.kiro/hooks/` | — | YAML or script |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.kiro/skills/`, `.kiro/steering/`, root `AGENTS.md` | Workspace skills and steering are loaded automatically |
| User | `~/.kiro/skills/`, `~/.kiro/steering/` | Global skills and team steering |
| System | `/etc/kiro/` (enterprise managed configs possible) | Enterprise-served defaults |

### Official documentation
- [Kiro IDE skills](https://kiro.dev/docs/skills/) — verified live.
- [Kiro CLI skills](https://kiro.dev/docs/cli/skills/) — verified live.
- [Steering (IDE)](https://kiro.dev/docs/steering/) — verified live.
- [Steering (CLI)](https://kiro.dev/docs/cli/steering/) — verified live.
- [MCP](https://kiro.dev/docs/mcp/) — verified live.
- [Kiro CLI migration from Amazon Q Developer](https://kiro.dev/docs/cli/migrating-from-q-developer/) — verified live; page updated 2026-04-30.
- [Kiro changelog / IDE 1.0](https://kiro.dev/changelog/ide/1-0/) — verified live; auto-updates paused at time of writing.
- [AWS re:Post — Kiro + MCP getting started](https://repost.aws/articles/ARuX8rkojgSx-TYCc65JyAOw/getting-started-with-kiro-and-mcp-servers-connect-your-ai-ide-to-real-world-tools)
- Source lineage: [aws/amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli)
- Product: [kiro.dev](https://kiro.dev)

### Polyglot bridge
1. Copy or symlink the canonical skill into `.kiro/skills/<name>/` and/or keep `.agents/skills/<name>/`.
2. Add a `.kiro/steering/<id>.md` file (or root `AGENTS.md`) summarizing triggers and conventions.
3. Register bundled MCP servers in `.kiro/settings/mcp.json` (project) or `~/.kiro/settings/mcp.json` (user).
4. Kiro supports the open Agent Skills standard, so a valid `SKILL.md` should work with minimal changes.

### Portability / standardization notes
- Kiro is the **official successor to Amazon Q Developer IDE plugins**; it is a full IDE/CLI built on VS Code + AWS Bedrock.
- It supports **Open Agent Skills** (`SKILL.md`), `AGENTS.md`, and `mcpServers` JSON, making it a strong polyglot target.
- Steering files are Kiro-specific but map directly to `AGENTS.md` / instruction files in other agents.
- The old `~/.aws/amazonq/mcp.json` path may still work for legacy Amazon Q CLI but should be migrated to `~/.kiro/settings/mcp.json`.

### Recent changes and caveats (mid-2026)
- **Kiro launched GA on May 7, 2026**, as a ground-up replacement for Amazon Q Developer IDE plugins.
- **Amazon Q Developer IDE plugins reach end of support on April 30, 2027.** New signups were blocked on May 15, 2026.
- Opus 4.6+ models are exclusive to Kiro as of May 29, 2026.
- Kiro auto-updates were paused around IDE 1.0; download updates directly from `kiro.dev/downloads` if needed.
- Kiro requires its own subscription; Q Developer subscriptions do not carry over.

---

## `aider` — Aider

- **Catalog id:** `aider`
- **Display name(s):** Aider
- **Aliases:** `aider-ai`, `aider-chat`

### What they call plugin type things
- **Conventions** — coding-standards file (e.g., `CONVENTIONS.md`).
- **Read-only context files** — added to the chat session with `/read` or `read:` config.
- **`.aider.conf.yml`** — YAML configuration for models, auto-commits, lint, read files, etc.
- Aider has **no first-class plugins, skills, or MCP surface**; MCP only if you shell out manually.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| Conventions | any Markdown file (convention is `CONVENTIONS.md`) | Plain Markdown |
| Config | `~/.aider.conf.yml` (user), `.aider.conf.yml` (repo root), `.aider.conf.yml` (cwd) | YAML; loaded in order, last wins |
| Read files | `read:` list in `.aider.conf.yml` or `--read <file>` CLI / `/read <file>` in chat | file paths |
| AGENTS.md | not auto-loaded; add `read: AGENTS.md` to config | Plain Markdown |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.aider.conf.yml`, `CONVENTIONS.md`, `AGENTS.md` | Repo-level config and convention files |
| User | `~/.aider.conf.yml` | Personal defaults |
| System | — | No system-wide skill or config path |

### Official documentation
- [Specifying coding conventions](https://aider.chat/docs/usage/conventions.html) — verified live.
- [`.aider.conf.yml` reference](https://aider.chat/docs/config/aider_conf.html) — verified live.
- [Aider community conventions repo](https://github.com/Aider-AI/conventions) — examples.
- Main docs: [aider.chat/docs/](https://aider.chat/docs/)

### Polyglot bridge
1. Keep the canonical `.agents/skills/<name>/SKILL.md` for other agents.
2. Emit a `CONVENTIONS.md` (or `AGENTS.md`) that extracts the skill body and conventions.
3. Add a `.aider.conf.yml` snippet that loads it:
   ```yaml
   read:
     - AGENTS.md
     - CONVENTIONS.md
   ```
4. Aider cannot invoke skills automatically; the convention file must be read into the session.

### Portability / standardization notes
- Aider is the most **instructions-first** harness in Tier B. There is no skill manifest, no MCP auto-discovery, and no marketplace.
- `AGENTS.md` is not loaded by default, but Aider's flexible `read:` config means it can consume any instruction file.
- Best practice: ship an `AGENTS.md` and a `CONVENTIONS.md` from the canonical skill, plus the `read:` YAML snippet.

### Recent changes and caveats (mid-2026)
- Aider still uses `CONVENTIONS.md` as the conventional filename, but the community is moving toward `AGENTS.md` for cross-agent compatibility.
- Aider's `read:` list can be a YAML list or a comma-separated array in brackets.
- There is no MCP-first product surface; any MCP integration requires manual shelling or external wrappers.

---

## `kilo` — Kilo Code (VS Code + JetBrains + CLI)

- **Catalog id:** `kilo`
- **Display name(s):** Kilo Code, Kilo
- **Aliases:** `kilocode`

### What they call plugin type things
- **Skills** — Open Skills packages (`SKILL.md`).
- **Agents** — specialized agent configurations.
- **Modes** — custom agent modes (Code, Architect, Review, etc.).
- **MCP servers** — configured in `kilo.jsonc`.
- **Marketplace** — curated skills, MCP servers, and agents (`Kilo-Org/kilo-marketplace`).
- **AGENTS.md** — project-level instructions.
- **Plugins** — SDK-based plugin packages.

### Primary authoring/discovery unit and file/directory layout

| Unit | Project | Global / user | Format |
|------|---------|---------------|--------|
| Skills | `.kilo/skills/<name>/SKILL.md` | `~/.kilo/skills/<name>/SKILL.md` | `SKILL.md` folder; `name` must match directory |
| Compatibility skills | `.agents/skills/`, `.claude/skills/` | `~/.claude/skills/` | Open Skills layout; loaded when Claude compatibility is enabled |
| AGENTS.md | root `AGENTS.md` / `AGENT.md` (+ nested subdirectories) | — | Plain Markdown; per-directory files loaded dynamically |
| MCP | `.kilo/kilo.jsonc` → `mcp` key | `~/.config/kilo/kilo.jsonc` | Kilo JSONC; `type: local | remote` |
| Agents | `.kilo/agents/` | `~/.config/kilo/agents/` | Agent definitions |
| Extra skill roots | `kilo.jsonc` → `skills.paths`, `skills.urls` | `~/.config/kilo/kilo.jsonc` | local paths or remote `index.json` URLs |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.kilo/skills/<name>/` | Highest priority |
| User | `~/.kilo/skills/<name>/` | Personal skills |
| Shared / compat | `.agents/skills/<name>/`, `.claude/skills/<name>/` | Loaded alongside native paths |
| Remote | URLs listed in `skills.urls` | Must serve an `index.json` manifest |
| System | `~/.config/kilo/kilo.jsonc` | User config, not system-wide |

### Official documentation
- [Skills](https://kilo.ai/docs/customize/skills) — verified live.
- [AGENTS.md](https://kilo.ai/docs/customize/agents-md) — verified live.
- [Marketplace](https://kilo.ai/docs/customize/marketplace) — verified live.
- [MCP overview](https://kilo.ai/docs/automate/mcp/overview) — verified live.
- [Using MCP in Kilo](https://kilo.ai/docs/automate/mcp/using-in-kilo-code) — verified live.
- [CLI](https://kilo.ai/docs/code-with-ai/platforms/cli) — verified live.
- [Kilo Marketplace repo](https://github.com/Kilo-Org/kilo-marketplace) — source of truth.
- Source: [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode)

### Polyglot bridge
1. Place the canonical skill under `.agents/skills/<name>/` **and/or** mirror it to `.kilo/skills/<name>/`.
2. Add or symlink `AGENTS.md` at the project root for always-on instructions.
3. Register bundled MCP servers in `kilo.jsonc` under the `mcp` map. Note that Kilo uses `type: local | remote` rather than the classic `mcpServers` shape.
4. For marketplace distribution, prepare a `Kilo-Org/kilo-marketplace` entry.

### Portability / standardization notes
- Kilo is a **near-Tier-A Open Skills host**: it implements Agent Skills, `AGENTS.md`, MCP, and a marketplace.
- `AGENTS.md` is write-protected; Kilo loads it automatically and supports nested per-directory `AGENTS.md` files.
- Kilo's MCP schema differs slightly from the classic `mcpServers` JSON; use `type: local` or `type: remote`.
- The `kilo.jsonc` config supports `skills.paths` and `skills.urls` for custom or remote skill roots.

### Recent changes and caveats (mid-2026)
- **Anaconda acquired Kilo Code on July 15, 2026.** Kilo remains available with no immediate changes to products or support.
- Kilo Code was rebuilt on a portable, open-source core shared across VS Code, JetBrains, CLI, and Cloud Agents.
- The old **Orchestrator mode** is deprecated; agents now delegate to subagents automatically.
- Kilo Memory is a new opt-in, project-scoped memory feature.

---

## `qwen` — Qwen Code

- **Catalog id:** `qwen`
- **Display name(s):** Qwen Code
- **Aliases:** `qwen-code`, `qwenlm-qwen-code`

### What they call plugin type things
- **Agent Skills** — `SKILL.md` packages with YAML frontmatter.
- **Extensions** — packages with `qwen-extension.json`, `QWEN.md`, MCP servers, custom commands, subagents, and skills.
- **Context files** — `QWEN.md` (default) or configurable `AGENTS.md`.
- **Slash commands** — user-invokable commands (`/skills`, `/mcp`, `/import-config`, etc.).
- **MCP servers** — configured in `settings.json` or `qwen-extension.json`.
- **Subagents** — specialized agents defined in extensions.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| Personal skills | `~/.qwen/skills/<name>/SKILL.md` | `SKILL.md` folder |
| Project skills | `.qwen/skills/<name>/SKILL.md` | `SKILL.md` folder |
| Shared Open Skills | `.agents/skills/<name>/SKILL.md` | Open Skills layout |
| Extensions | `~/.qwen/extensions/<name>/` (with `qwen-extension.json`) | manifest + `QWEN.md` + `skills/`, `commands/`, `agents/`, `mcp-server/` |
| Context / instructions | `QWEN.md` (default); configurable via `context.fileName` / `contextFileNames` | Markdown |
| MCP | `qwen-extension.json` → `mcpServers`, or Qwen settings | `command`, `args`, `cwd`, `${extensionPath}` variable |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.qwen/skills/<name>/` | Project-specific skills |
| User | `~/.qwen/skills/<name>/` | Personal skills |
| Shared / compat | `.agents/skills/<name>/` | Supported as provider dir (see PR #2476) |
| Extension | `~/.qwen/extensions/<name>/skills/` | Skills bundled with extensions |
| Bundled | shipped with `qwen-code` | Built-in skills like `/review`, `/loop`, `/simplify` |

### Official documentation
- [Agent Skills](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/) — verified live.
- [Repo skills docs](https://github.com/QwenLM/qwen-code/blob/main/docs/users/features/skills.md) — source.
- [Extensions](https://qwenlm.github.io/qwen-code-docs/en/developers/extensions/extension/) — verified live.
- [Getting started with extensions](https://qwenlm.github.io/qwen-code-docs/en/developers/extensions/getting-started-extensions/) — verified live.
- [Commands](https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/) — verified live.
- [`.agents/skills` support PR #2476](https://github.com/QwenLM/qwen-code/pull/2476)
- Source: [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)

### Polyglot bridge
1. `.agents/skills/<name>/SKILL.md` works natively in Qwen Code as a provider directory.
2. Optionally mirror the skill to `.qwen/skills/<name>/` for Qwen-specific packaging.
3. If you need always-on instructions, set `context.fileName` to include `AGENTS.md` (default is `QWEN.md`).
4. Bundle any MCP server into a `qwen-extension.json` `mcpServers` entry or import Claude configs with `/import-config`.

### Portability / standardization notes
- Qwen Code is an active **Open Skills host**; `SKILL.md` frontmatter requires `name` (Unicode letters/digits/`_`/`:`/`.`/`-` allowed) and `description`.
- Optional frontmatter: `priority`, `paths`, `user-invocable`, `disable-model-invocation`.
- Skills are model-invoked by default; users can invoke them with `/` slash commands.
- Extensions are the Qwen-native package format, but the skill format inside them is standard Open Skills.

### Recent changes and caveats (mid-2026)
- Qwen Code is actively developed; stable releases `v0.19.x` shipped through July 2026, with `v0.20.0-preview` in late July.
- `/import-config` can import MCP servers from Claude configs (`claude-code`, `claude-desktop`) into user or project scope.
- Qwen supports **nested sub-agents**, **auto model fallback**, and **daemon mode** (`qwen serve`) for multi-client shared agents.
- The CLI has `/update` and `qwen update` for one-click upgrades.

---

## Grok Build

- **Catalog id:** *(not a suite row; polyglot target)*
- **Display name(s):** Grok Build, Grok
- **Aliases:** `grok`, `xai-grok`, `grok-build`

### What they call plugin type things
- **Skills** — reusable `SKILL.md` packages.
- **Plugins** — bundles of skills, agents, hooks, MCP servers, and LSP servers.
- **Marketplaces** — configurable plugin marketplace sources.
- **Hooks** — project lifecycle scripts.
- **Agents** — custom agent definitions.
- **MCP servers** and **LSP servers**.
- **Compat scanning** — Grok can read Cursor and Claude harness directories.

### Primary authoring/discovery unit and file/directory layout

| Unit | Project | User / global | Format |
|------|---------|---------------|--------|
| Skills | `.grok/skills/<name>/SKILL.md` | `~/.grok/skills/<name>/SKILL.md` | `SKILL.md` folder |
| Plugins | `.grok/plugins/<name>/` | `~/.grok/plugins/<name>/`, `~/.grok/plugins/marketplaces/` | Plugin package |
| Agents | `.grok/agents/` | `~/.grok/agents/` | Agent definitions |
| Hooks | `.grok/hooks/` | `~/.grok/hooks/` | Lifecycle scripts |
| MCP / LSP | `.grok/config.toml` → `[mcp_servers]` | `~/.grok/config.toml` | TOML |
| Config | `.grok/config.toml` (project) | `~/.grok/config.toml` (`$GROK_HOME/config.toml`) | TOML; project config only contributes `[mcp_servers]`, `[plugins]`, `[permission]` |
| Compat scan | — | `~/.grok/config.toml` → `[compat.cursor]`, `[compat.claude]` | booleans for scanning Cursor/Claude directories |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| Project | `.grok/skills/<name>/` | Highest priority |
| Repo root | `<repo_root>/.grok/skills/<name>/` | Walked up to repo root |
| User | `~/.grok/skills/<name>/` | Personal skills |
| Claude compat | `~/.claude/skills/<name>/` | Loaded if `[compat.claude] skills` is true |
| Cursor compat | `.cursor/skills/`, `~/.cursor/skills/` | Loaded if `[compat.cursor] skills` is true |
| Extra | `[skills] paths` in `~/.grok/config.toml` | Additional directories |

### Official documentation
- [Skills, Plugins & Marketplaces](https://docs.x.ai/build/features/skills-plugins-marketplaces) — verified live.
- [Settings Reference](https://docs.x.ai/build/settings/reference) — verified live.
- [Modes and Commands](https://docs.x.ai/build/modes-and-commands) — verified live.
- [CLI Reference](https://docs.x.ai/build/cli/reference) — verified live.
- [Overview](https://docs.x.ai/build/overview) — verified live.
- Source: [xai-org/grok-build](https://github.com/xai-org/grok-build)

### Polyglot bridge
1. Keep `.agents/skills/<name>/SKILL.md` as the canonical package.
2. Add `.grok/config.toml` with:
   ```toml
   [skills]
   paths = ["./.agents/skills"]
   ```
3. Register bundled MCP servers under `[mcp_servers]` in `.grok/config.toml` (project) or `~/.grok/config.toml` (user).
4. Optionally enable `[compat.claude]` / `[compat.cursor]` to let Grok scan those harnesses automatically.

### Portability / standardization notes
- Grok Build discovers `.agents/skills` via the `[skills] paths` config, so Open Skills packages are portable.
- Grok can also scan Cursor and Claude directories natively, reducing the need for duplicate copies.
- Project `.grok/config.toml` is limited to `[mcp_servers]`, `[plugins]`, and `[permission]`; user config holds `[skills]` and `[compat.*]`.
- Use `grok inspect` to verify what Grok discovered (rules, skills, plugins, hooks, MCP servers).

### Recent changes and caveats (mid-2026)
- Grok Build documentation is on `docs.x.ai/build` (SpaceXAI / xAI docs) and is actively updated.
- The `grok` CLI has `grok plugin`, `grok mcp`, and `grok inspect` subcommands.
- Grok supports user-invocable skills as slash commands; if names collide, use the qualified form (`/local:<skill>`).
- Marketplace sources are configured with `[[marketplace.sources]]` in `~/.grok/config.toml` and `~/.grok/plugins/known_marketplaces.json`.

---

## Legacy OpenAI ChatGPT plugins

- **Catalog id:** *(legacy)*
- **Display name(s):** ChatGPT plugins, OpenAI plugins
- **Aliases:** `openai-plugins`, `chatgpt-plugins`

### What they call plugin type things
- **Plugins** — backend APIs exposed to ChatGPT.
- **Manifest** — `ai-plugin.json` describing capabilities and auth.
- **OpenAPI spec** — describes the API endpoints the model can call.
- This is a **deprecated** historical surface.

### Primary authoring/discovery unit and file/directory layout

| Unit | Location | Format |
|------|----------|--------|
| Manifest | `/.well-known/ai-plugin.json` on the API origin | JSON (`schema_version`, `name_for_model`, `name_for_human`, `description_for_model`, `description_for_human`, `auth`, `api`) |
| API spec | Linked from manifest (`api.url`) | OpenAPI 3 JSON or YAML |
| Example | [openai/chatgpt-retrieval-plugin](https://github.com/openai/chatgpt-retrieval-plugin) | Full working example |

### Skill discovery paths

| Level | Path | Notes |
|-------|------|-------|
| API host | `https://<api-origin>/.well-known/ai-plugin.json` | Publicly fetchable manifest |
| User | — | ChatGPT user manually enabled plugins in the legacy plugin store |
| System | — | No local system path |

### Official documentation
- [OpenAI blog — ChatGPT plugins](https://www.openai.com/blog/chatgpt-plugins) — note the deprecation banner.
- [Historical platform docs](https://platform.openai.com/docs/plugins/introduction) — not verified live; likely redirected or removed.
- [chatgpt-retrieval-plugin repo](https://github.com/openai/chatgpt-retrieval-plugin) — example `.well-known/ai-plugin.json` and `openapi.yaml`.
- [Community ai-plugin.json spec reference](https://geodocs.dev/technical/well-known-ai-plugin-manifest-spec) — useful for legacy compatibility.

### Polyglot bridge
1. For an instruction-only Open Skills package, emit `ai-plugin.json` with `api.type: none` (no actual endpoints) and a `description_for_model` that contains the skill instructions.
2. Ship the OpenAPI spec at the linked `api.url`.
3. This is purely a **backward-compatibility / historical bridge**; do not build new products on it.

### Portability / standardization notes
- ChatGPT plugins were retired by OpenAI in 2024.
- The `ai-plugin.json` format is still consumed by some open-source runtimes and LibreChat, but it is not a modern standard.
- For new integrations, pair any `ai-plugin.json` surface with an MCP server and treat the manifest as a compatibility shim.

### Recent changes and caveats (mid-2026)
- OpenAI plugins are **deprecated** and no longer available in ChatGPT.
- The manifest format remains useful as a historical reference and for some LibreChat / Custom GPT Action bridges.
- Do not advertise ChatGPT plugin support as a primary delivery channel.

---

## Research notes

### What was verified (mid-2026)
- **Continue** `docs.continue.dev` rules, prompts, MCP, and `config.yaml` reference pages are live.
- **Cline** `docs.cline.bot` skills, MCP, marketplace, and SDK pages are live.
- **Roo Code** is **shut down** as of May 15, 2026; `docs.roocode.com` still hosts static pages but the GitHub repo is archived/read-only.
- **Goose** Mintlify docs (recipes, MCP integration, extensions) are live; `block.github.io/goose` is the GitHub Pages source.
- **Zed** `zed.dev/docs/ai` pages for MCP, agent settings, skills, tools, and MCP extensions are live.
- **JetBrains Junie / PyCharm** `jetbrains.com/help/ai-assistant` pages for Junie, agents, MCP, and ACP are live; PyCharm MCP Server page dated 2026-05-13.
- **Kiro** `kiro.dev/docs` pages for skills (IDE and CLI), steering, MCP, and migration from Amazon Q are live.
- **Aider** `aider.chat/docs/usage/conventions.html` and `aider_conf.html` are live.
- **Kilo** `kilo.ai/docs` skills, AGENTS.md, marketplace, and MCP pages are live; Anaconda acquisition announced 2026-07-15.
- **Qwen** `qwenlm.github.io/qwen-code-docs` skills and extensions pages are live; GitHub repo active.
- **Grok Build** `docs.x.ai/build` skills/plugins/marketplaces, settings reference, modes/commands, and CLI reference are live.
- **Legacy OpenAI ChatGPT plugins** are deprecated; the OpenAI blog shows a deprecation notice.

### What is ambiguous or requires re-check
- **Goose** project-level skill discovery without `config.yaml` is not documented; `.agents/skills` is not a native path unless a Summon/platform extension loads it. Treat this as optional.
- **Zed** exact user-level skill directory path is configured through the Agent Panel / settings UI; the docs do not specify a fixed filesystem path. Use the UI or `agent: open skill creator`.
- **Junie** exact user extension directory path is not official; community examples use `~/.junie/extensions/` and `~/.junie/skills/`. Verify at implementation time.
- **Kilo** `kilo.jsonc` MCP `type` values are `local` / `remote` rather than the classic `mcpServers` JSON; confirm schema when generating Kilo MCP config.
- **Grok Build** project `.grok/config.toml` restrictions: only `[mcp_servers]`, `[plugins]`, and `[permission]` are read from project config; `[skills]` belongs in user config. Re-check if this changes.

### Dead or changed links
- No Tier B docs links were found to be 404 at time of research.
- **OpenAI ChatGPT plugins platform docs** (`platform.openai.com/docs/plugins/introduction`) were not re-verified; they may redirect or be removed.
- **Roo Code** docs are static/archived; expect future drift or takedown.
- `block.github.io/goose` may redirect to the Mintlify site; the Mintlify URLs are the current working mirrors.
