# OKF knowledgebase — state of "plugin type things" (2026-07 / July 2026)

**Status:** living mini-OKF  
**As-of:** `2026-07` (July 2026)  
**Last reviewed:** 2026-07-24 (Tier B/C deep dive same day)  
**Owner skill:** `polyglot-plugin`  
**Source client catalog:** `~/Developer/config-clis/.agents/plans/config-clis.md` (suite client ids)  
**Related suite plans:** [config-plugins.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-plugins.md), [config-skills.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-skills.md)

## How to use / update this KB

1. **Read this file** when authoring polyglot bridges, validating discovery paths, or answering “what does X call plugins?”
2. Prefer **official docs links** below over blog posts; if a link 404s, replace it and bump **Last reviewed**.
3. When the config-clis catalog gains/renames a client id, add/rename the matching section and update the **Quick matrix**.
4. Keep each client section: **names**, **primary unit**, **paths**, **official docs**, **polyglot bridge**, **notes**.
5. Bump the filename month only on a major refresh (`okf-plugin-type-things-YYYY-MM.md`); keep a one-line pointer in older files if renamed.
6. Cross-check install paths with sibling skill `plug-me-in/references/harness-install-matrix.md`.

## Vocabulary (July 2026)

| Term | Meaning |
|------|---------|
| **Agent Skills / Open Skills** | Portable `SKILL.md` folders (agentskills.io). Progressive disclosure: metadata always, body on invoke. |
| **Plugin (package)** | Distributable bundle: skills + optional agents, hooks, MCP/LSP, commands, rules. Manifest varies by vendor. |
| **Rules / instructions** | Always-on or scoped guidance (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, copilot instructions). Not the same as skills. |
| **MCP** | Live tools/resources/prompts via Model Context Protocol (stdio preferred for portability). |
| **Marketplace** | Registry of many plugins; install **one unit**, never the whole catalog as one package. |
| **Polyglot package** | This skill’s layout: canonical `.agents/skills/**/SKILL.md` + per-harness bridges. |

**Open standard hub:** [https://agentskills.io](https://agentskills.io)

## Quick matrix (catalog id → plugin-type things)

| Catalog id | Display | What they call “plugin type things” | Primary discovery | Official entry docs |
|------------|---------|--------------------------------------|-------------------|---------------------|
| `cursor` | Cursor | plugins, skills, rules, MCP, hooks | `.cursor-plugin/`, `.cursor/skills`, `.agents/skills`, `.cursor/rules` | [Plugins](https://cursor.com/docs/plugins), [Skills](https://cursor.com/docs/skills), [Rules](https://cursor.com/docs/rules) |
| `claude` | Claude Code | plugins, skills, agents, hooks, MCP, LSP, marketplaces | `.claude-plugin/plugin.json`, `skills/`, `~/.claude/skills`, `.claude/skills` | [Plugins](https://code.claude.com/docs/en/plugins), [Plugins ref](https://code.claude.com/docs/en/plugins-reference), [Skills](https://code.claude.com/docs/en/skills) |
| `vscode` | VS Code + Copilot Chat | agent skills, custom instructions, MCP | `.github/skills`, workspace instructions | [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) (also GitHub Copilot docs) |
| `copilot` | GitHub Copilot CLI | plugins, agent skills, agents, hooks, MCP | `plugin.json`, `.github/skills`, `~/.copilot/skills` | [About plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins), [Add skills (CLI)](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) |
| `claude-desktop` | Claude Desktop | custom skills (upload), MCP | app settings + desktop MCP JSON | [Agent Skills overview (platform)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) |
| `devin-desktop` / `windsurf` | Devin Desktop / Cascade | skills, rules, workflows, plugins (IDE) | `.windsurf/skills`, `.agents/skills` | [Cascade Skills](https://docs.devin.ai/desktop/cascade/skills) |
| `devin` | Devin CLI / cloud | skills, plugins (beta) | `.devin/skills`, `.agents/skills`, multi-path scan | [Skills overview](https://docs.devin.ai/cli/extensibility/skills/overview), [Product skills](https://docs.devin.ai/product-guides/skills), [Plugins](https://docs.devin.ai/cli/extensibility/plugins/overview) |
| `codex` | OpenAI Codex CLI | skills, plugins, AGENTS.md, MCP, subagents | `.agents/skills`, `~/.agents/skills`, `AGENTS.md` | [Build skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Customization](https://developers.openai.com/codex/concepts/customization) |
| `gemini` | Gemini CLI | extensions, agent skills, custom commands, GEMINI.md | `gemini-extension.json`, `.gemini/skills`, `.agents/skills` | [Extensions](https://geminicli.com/docs/extensions/), [Agent Skills](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md), [Creating skills](https://geminicli.com/docs/cli/creating-skills/) |
| `opencode` | OpenCode | skills, agents, plugins (npm), AGENTS.md | `.opencode/skills`, `.agents/skills`, `.claude/skills` | [Agent Skills](https://dev.opencode.ai/docs/skills/), [Agents](https://opencode.ai/docs/agents/) |
| `continue` | Continue | rules, prompts, MCP (no Open Skills host) | `.continue/rules`, `.continue/mcpServers` | [Rules](https://docs.continue.dev/customize/deep-dives/rules), [MCP](https://docs.continue.dev/customize/deep-dives/mcp) |
| `open-design` | Open Design | agents via daemon/MCP | app data / `.od/` | Product docs; guide-only for skills |
| `openwork` | OpenWork | OpenCode-backed | OpenCode skill paths | Prefer `opencode` skill docs |
| `aionui` | AionUi | app plugins / MCP sync | Application Support | Guide-only |
| `cline` | Cline | skills, rules, MCP, marketplace | `.cline/skills`, `~/.cline/skills`, MCP settings | [Skills](https://docs.cline.bot/customization/skills), [MCP](https://docs.cline.bot/mcp/mcp-overview) |
| `roo` | Roo Code | modes, rules, AGENTS.md, MCP | `.roo/rules`, `.roo/mcp.json`, `AGENTS.md` | [docs.roocode.com](https://docs.roocode.com); verify product status |
| `aider` | Aider | conventions + `read:` config | `CONVENTIONS.md`, `.aider.conf.yml` | [Conventions](https://aider.chat/docs/usage/conventions.html) |
| `zed` | Zed | context_servers (MCP), skills, instructions | `settings.json`, `AGENTS.md`, skills | [MCP](https://zed.dev/docs/ai/mcp), [Agent settings](https://zed.dev/docs/ai/agent-settings) |
| `goose` | Goose | extensions (MCP), recipes | `~/.config/goose/config.yaml` | [Extensions](https://block.github.io/goose), recipes guides |
| `kiro` | Kiro (Amazon Q lineage) | steering, skills, MCP | `.kiro/`, `~/.kiro/settings/mcp.json` | AWS Kiro / Q docs |
| `pycharm` | PyCharm | AI Assistant / MCP | `.ai/mcp/`, IDE settings | JetBrains AI Assistant docs |
| `junie` | Junie | AGENTS.md guidelines, MCP, extensions | `.junie/AGENTS.md`, `.junie/mcp/` | [Junie agent](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) |
| `warp` | Warp / Oz | skills, rules, Warp Drive, MCP | `.agents/skills`, Drive | Warp docs / in-product skills |
| `kilo` | Kilo Code | skills, AGENTS.md, MCP, marketplace | `.kilo/skills`, `.agents/skills`, `kilo.jsonc` | [Skills](https://kilo.ai/docs/customize/skills), [AGENTS.md](https://kilo.ai/docs/customize/agents-md) |
| `qwen` | Qwen Code | skills, extensions, context files | `.qwen/skills`, `.agents/skills`, `~/.qwen/skills` | [Skills](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/) |
| `crush` | Crush | config + tools | `~/.config/crush/` | Charm Crush docs |
| `antigravity` | Antigravity | skills under gemini tree | `~/.gemini/antigravity/` | Align with Gemini skills paths |
| `pi` | Pi | agent tree | `~/.pi/` | Product docs |
| `droid` | Factory Droid | app/CLI prefs | research | Guide-only |
| `openclaw` | OpenClaw | agent config | `~/.openclaw/` | Product docs |
| `forge` | ForgeCode | config | `~/.forge.toml` | Product docs |
| `trae` | Trae | project `.trae/` + MCP | `.trae/mcp.json` | Product docs |
| `bolt-ai` | BoltAI | MCP config | Application Support | Product docs |
| `libre-chat` | LibreChat | deploy YAML agents/MCP | `librechat.yaml` | LibreChat docs |
| `interpreter` | Open Interpreter | profiles | env/profile | Product docs |
| `hermes-agent` | Hermes Agent | agent config | `~/.hermes/` | Product docs |
| `smelt` / `jcode` / `codewhale` / `deepseek-tui` / `agent-deck` | various | research | research | Guide-only until paths pinned |
| `generic` / `ids` | suite utils | n/a | artifacts only | n/a |
| *(Grok Build)* | Grok Build | skills paths in config | `.grok/config.toml` → `.agents/skills` | Community/product notes; polyglot ships `.grok/config.toml` |
| *(legacy OpenAI plugins)* | ChatGPT plugins era | `ai-plugin.json` + OpenAPI | `/.well-known/ai-plugin.json` | Historical; still useful as bridge |

---

## Tier A — full official “plugin/skills” surfaces (authoritative for polyglot)

### `claude` — Claude Code  *(alias `claude-code`)*

**Names:** plugin, skill, command (legacy → skills), agent, hook, MCP server, LSP server, marketplace, CLAUDE.md / rules.

**Primary unit:** Directory with optional `.claude-plugin/plugin.json`; components at plugin root: `skills/`, `agents/`, `hooks/`, `.mcp.json`, `.lsp.json`, `commands/` (legacy).

**Standalone skills:** `~/.claude/skills/<name>/SKILL.md`, project `.claude/skills/<name>/SKILL.md`. Follows [Agent Skills](https://agentskills.io). Plugin skills namespaced `/plugin:skill`.

**Official docs:**

- Create plugins: [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)
- Plugins reference: [https://code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)
- Skills: [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)
- Features overview (when to use skills vs plugins vs MCP): [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)
- Agent Skills (platform API): [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- Plugins in Agent SDK: [https://code.claude.com/docs/en/agent-sdk/plugins](https://code.claude.com/docs/en/agent-sdk/plugins)

**Summary:** Plugins are the shareable package; skills are progressive instruction packs. Prefer packaging multi-project reuse as plugins; use `.claude/` for personal/project iteration. MCP/hooks/agents can ship inside plugins.

**Polyglot bridge:** `.agents/skills/<id>/SKILL.md` + optional root `mcp.json`; consumers often also want `.claude/skills` copy or Claude plugin compat manifest.

---

### `cursor` — Cursor

**Names:** plugin, skill, rule (`.mdc`), agent, command, MCP server, hook, marketplace / team marketplace.

**Primary unit:** `.cursor-plugin/plugin.json` bundling `rules/`, `skills/`, `agents/`, `commands/`, `hooks/`, `mcp.json`.

**Skills dirs:** `.agents/skills/`, `.cursor/skills/`, `~/.agents/skills/`, `~/.cursor/skills/`; also loads `.claude/skills` and `.codex/skills` for compatibility.

**Rules:** `.cursor/rules/*.mdc` (always / intelligent / globs / manual). `AGENTS.md` and `CLAUDE.md` also read.

**Official docs:**

- Plugins: [https://cursor.com/docs/plugins](https://cursor.com/docs/plugins)
- Plugins reference: [https://cursor.com/docs/reference/plugins](https://cursor.com/docs/reference/plugins)
- Skills: [https://cursor.com/docs/skills](https://cursor.com/docs/skills)
- Rules: [https://cursor.com/docs/rules](https://cursor.com/docs/rules)
- Customizing agents: [https://cursor.com/learn/customizing-agents](https://cursor.com/learn/customizing-agents)

**Summary:** Rules = static always/scoped context; skills = dynamic progressive workflows; plugins = installable bundles of both + MCP/hooks. Local test path: `~/.cursor/plugins/local/`.

**Polyglot bridge:** `.cursor/rules/<id>.mdc` (+ skill under `.agents/skills` or `.cursor/skills`) + `mcp.json`.

---

### `codex` — OpenAI Codex CLI

**Names:** skill, plugin, AGENTS.md (instructions), MCP, subagent / custom agent, memory.

**Primary unit (skills):** `SKILL.md` directory under repo/user/admin/system skill roots (`.agents/skills` walk).  
**Distribution:** plugins package skills (+ optional connectors) for install; skills remain the authoring format.

**Instructions:** hierarchical `AGENTS.md` / `AGENTS.override.md` from `~/.codex` + project root → cwd.

**Official docs:**

- Build skills: [https://developers.openai.com/codex/skills](https://developers.openai.com/codex/skills)
- Customization concepts: [https://developers.openai.com/codex/concepts/customization](https://developers.openai.com/codex/concepts/customization)
- AGENTS.md guide: [https://developers.openai.com/codex/guides/agents-md](https://developers.openai.com/codex/guides/agents-md)
- Subagents: [https://developers.openai.com/codex/concepts/subagents](https://developers.openai.com/codex/concepts/subagents)
- Skills samples / creator: [openai/codex skill-creator](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/SKILL.md)
- Curated skills catalog: [https://github.com/openai/skills](https://github.com/openai/skills)

**Summary:** AGENTS.md steers always-on repo behavior; skills are on-demand progressive expertise; plugins are the installable distribution unit (esp. desktop/work). Explicit `$skill` / `/skills` and implicit description match.

**Polyglot bridge:** `.agents/skills/**` + root `AGENTS.md` summary/bridge + optional `ai-plugin.json`.

---

### `copilot` + `vscode` — GitHub Copilot / VS Code

**Names:** plugin, agent skill, custom agent, hook, MCP, LSP, custom instructions, marketplace.

**Primary unit (plugin):** directory with root `plugin.json` (or under `.github/plugin/`), plus `agents/`, `skills/`, `hooks.json`, `.mcp.json` / `.github/mcp.json`, `lsp.json`.

**Skills paths:** project `.github/skills`, `.claude/skills`, `.agents/skills`; personal `~/.copilot/skills`, `~/.agents/skills`. CLI: `copilot plugin …`, `/skills`, `gh skill`, `copilot skill`.

**Instructions (not skills):** `.github/copilot-instructions.md`, personal `~/.copilot/…` instructions.

**Official docs:**

- About plugins: [https://docs.github.com/en/copilot/concepts/agents/about-plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins)
- Create plugin (CLI): [https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
- Add skills (CLI): [https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- About agent skills: [https://docs.github.com/en/copilot/concepts/agents/about-agent-skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- Add skills (cloud/agents): [https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- Customize overview: [https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/overview](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/overview)
- VS / VS Code agent skills (Microsoft): [https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills)
- VS Code docs (Agent Skills): see microsoft/vscode-docs `docs/copilot/customization/agent-skills.md`

**Summary:** Skills = Open Skills folders; plugins = versioned bundles for CLI/cloud agent; instructions = always-on repo/personal guidance. IDE MCP shape often `.vscode/mcp.json` with root `servers` (suite id `vscode`); CLI MCP often `mcpServers` under `~/.copilot/`.

**Polyglot bridge:** `.github/skills` and/or `.agents/skills` + `.github/copilot-instructions.md` condensed bridge + MCP as appropriate.

---

### `opencode` — OpenCode

**Names:** skill, agent (primary/subagent), plugin (JS/npm in `opencode.json`), permission on skill tool, AGENTS.md.

**Primary unit:** `SKILL.md` per directory. Loaded via native `skill` tool (on-demand).

**Discovery:** `.opencode/skills`, `~/.config/opencode/skills`, `.claude/skills`, `~/.claude/skills`, `.agents/skills`, `~/.agents/skills`; optional `skills.paths` / `skills.urls`.

**Official docs:**

- Agent Skills: [https://dev.opencode.ai/docs/skills/](https://dev.opencode.ai/docs/skills/)
- Agents: [https://opencode.ai/docs/agents/](https://opencode.ai/docs/agents/)
- Mintlify mirror: [https://anomalyco-opencode.mintlify.app/skills](https://anomalyco-opencode.mintlify.app/skills)

**Summary:** First-party skills are Open Skills–compatible with strict `name`/`description` and folder-name match. Plugins are a separate OpenCode extension mechanism (npm modules), not the same as Claude plugin.json.

**Polyglot bridge:** `.agents/skills/**` (and/or `.opencode/skills`) + AGENTS.md.

---

### `gemini` — Gemini CLI

**Names:** extension, agent skill, custom command, GEMINI.md context, hook, sub-agent, MCP server, theme.

**Primary unit (extension):** folder with `gemini-extension.json` under `~/.gemini/extensions/…`; can bundle MCP, commands, hooks, **skills/**, agents, policies.

**Skills:** `.gemini/skills`, `.agents/skills`, user `~/.gemini/skills` / `~/.agents/skills`; activate via `activate_skill` with consent. CLI: `gemini skills …`, `/skills`.

**Official docs:**

- Extensions hub: [https://geminicli.com/docs/extensions/](https://geminicli.com/docs/extensions/)
- Extension reference: [https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)
- Writing extensions: [https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md)
- Agent Skills: [https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md)
- Creating skills: [https://geminicli.com/docs/cli/creating-skills/](https://geminicli.com/docs/cli/creating-skills/)
- Skills getting started: [https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/tutorials/skills-getting-started.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/tutorials/skills-getting-started.md)

**Summary:** Extensions are Gemini’s “plugin package”; skills are progressive expertise (agentskills.io). Extensions may ship skills inside `skills/`. Context file often `GEMINI.md`.

**Polyglot bridge:** `.agents/skills/**` (alias supported) + optional `gemini-extension.json` if packaging as extension; MCP via settings/extension.

---

### `devin` + `devin-desktop` (alias `windsurf`)

**Names:** skill, plugin (CLI beta), rule, workflow (Cascade), AGENTS.md, MCP.

**Skills (cloud Devin):** prefers `.agents/skills/<name>/SKILL.md`; also scans `.devin/skills`, `.windsurf/skills`, `.github/skills`, `.claude/skills`, `.cursor/skills`, `.codex/skills`, etc.

**Cascade (desktop):** workspace `.windsurf/skills/`, global `~/.codeium/windsurf/skills/`; also `.agents/skills` for cross-agent.

**CLI plugins:** `.devin-plugin/plugin.json` + `skills/` + optional `AGENTS.md` / `rules/`; `devin plugins install …`.

**Official docs:**

- Devin product skills: [https://docs.devin.ai/product-guides/skills](https://docs.devin.ai/product-guides/skills)
- CLI skills overview: [https://docs.devin.ai/cli/extensibility/skills/overview](https://docs.devin.ai/cli/extensibility/skills/overview)
- Creating skills: [https://docs.devin.ai/cli/extensibility/skills/creating-skills](https://docs.devin.ai/cli/extensibility/skills/creating-skills)
- CLI plugins: [https://docs.devin.ai/cli/extensibility/plugins/overview](https://docs.devin.ai/cli/extensibility/plugins/overview)
- Cascade skills: [https://docs.devin.ai/desktop/cascade/skills](https://docs.devin.ai/desktop/cascade/skills)
- Cascade workflows: [https://docs.devin.ai/windsurf/plugins/cascade/workflows](https://docs.devin.ai/windsurf/plugins/cascade/workflows)
- Spec: [https://agentskills.io](https://agentskills.io)

**Summary:** Strong Open Skills citizen; desktop Cascade distinguishes skills vs rules vs slash workflows. CLI plugins bundle skills for sharing. Suite splits desktop (`devin-desktop`/`windsurf`) vs CLI (`devin`) for MCP paths.

**Polyglot bridge:** `.agents/skills/**` (+ optional `.windsurf/skills` / `.devin/skills` mirrors).

---

### `warp` — Warp / Oz

**Names:** skill, rule, Warp Drive notebook/workflow, MCP, agent (Oz).

**Discovery:** project/user `.agents/skills` when supported; Drive for hosted rules/notebooks; MCP via Warp MCP config.

**Official docs:** Warp product documentation / in-app skills (prefer `search_warp_documentation` in Warp agents). No single public “plugin.json” equivalent as of this review — treat as **skills + rules + MCP**, guide for Drive-only surfaces.

**Polyglot bridge:** `.agents/skills/**` + `mcp.json` as applicable.

---

## Tier B — partial / MCP-first / instructions-first (deep dive)

These clients have **official extension surfaces**, but they are not always named “plugins,” and Open Skills support varies. Prefer the artifacts below over inventing vendor manifests.

### `continue` — Continue (IDE + `cn` CLI)

**Names:** rules, prompts (slash), MCP servers / tools, config blocks, context providers. **Not** first-class Open Skills packages.

**Primary units:**

| Unit | Location | Role |
|------|----------|------|
| Rules | project `.continue/rules/*.md` (+ hub `uses:` in config) | Always/globs/`alwaysApply` system guidance for Agent/Chat/Edit |
| Prompts | config `prompts:` or prompt markdown | User `/` invocable workflows |
| MCP | `.continue/mcpServers/*.yaml` or `mcpServers` in `config.yaml` | Live tools (Agent mode only) |
| Config | `~/.continue/config.yaml` (user) + project config | Models, rules, MCP, docs index |

**Rules frontmatter (Markdown):** `name`, optional `globs` / `regex`, `description`, `alwaysApply`.

**MCP:** Accepts Continue YAML blocks; can also drop **JSON MCP configs from Claude/Cursor/Cline** into `.continue/mcpServers/` and Continue will load them. Transports: `stdio`, `sse`, `streamable-http`.

**Official docs:**

- Rules: [https://docs.continue.dev/customize/deep-dives/rules](https://docs.continue.dev/customize/deep-dives/rules)
- MCP: [https://docs.continue.dev/customize/deep-dives/mcp](https://docs.continue.dev/customize/deep-dives/mcp)
- Config reference: [https://docs.continue.dev/reference](https://docs.continue.dev/reference)
- Models/rules/tools guide: [https://docs.continue.dev/guides/configuring-models-rules-tools](https://docs.continue.dev/guides/configuring-models-rules-tools)
- Customize Agent: [https://docs.continue.dev/ide-extensions/agent/how-to-customize](https://docs.continue.dev/ide-extensions/agent/how-to-customize)

**Summary:** Continue’s “plugin-type” stack is **rules + prompts + MCP**, not SKILL.md. Polyglot skills are **not** auto-discovered as Continue skills.

**Polyglot bridge:**

1. Put canonical skill under `.agents/skills/` for other harnesses.
2. Project a **Continue rule** (`.continue/rules/<id>.md`) that points at or inlines the skill body for Agent mode.
3. Register MCP via config-mcp → `.continue/mcpServers/` or user config.
4. Optional: slash **prompt** for explicit invoke.

---

### `cline` — Cline (VS Code + CLI)

**Names:** skills, rules (`.clinerules` / Cline Rules), custom instructions (legacy → rules), MCP servers, marketplace.

**Primary units:**

| Unit | Project | Global / user |
|------|---------|----------------|
| Skills | `.cline/skills/<name>/SKILL.md` (also `.clinerules/skills/`, `.claude/skills/`) | `~/.cline/skills/` |
| Rules | `.clinerules/` | Documents/Cline/Rules (post custom-instructions migration) |
| MCP (IDE) | — | VS Code `globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| MCP (CLI) | — | `~/.cline/mcp.json` |

**Skills model:** Full Open Skills progressive loading (`use_skill`); `/` slash invoke; toggle enable/disable. `name` must match directory; `description` drives auto-match. Experimental flag may still exist in older builds (Settings → Features → Enable Skills).

**MCP:** stdio local + remote streamable HTTP / legacy SSE; marketplace one-click installs under `~/Documents/Cline/MCP/`.

**Official docs:**

- Skills: [https://docs.cline.bot/customization/skills](https://docs.cline.bot/customization/skills)
- MCP overview: [https://docs.cline.bot/mcp/mcp-overview](https://docs.cline.bot/mcp/mcp-overview)
- MCP marketplace: [https://docs.cline.bot/mcp/mcp-marketplace](https://docs.cline.bot/mcp/mcp-marketplace)
- Repo: [https://github.com/cline/cline](https://github.com/cline/cline)

**Summary:** Cline is a **first-class Open Skills + MCP** client. Prefer native `.cline/skills` (or shared `.agents/skills` if product also scans it — docs list `.claude/skills` and `.cline` paths; suite also maps `.agents/skills`).

**Polyglot bridge:** copy/link skill → `.cline/skills/<name>/` **and** keep `.agents/skills/<name>/`; merge MCP into Cline settings / `~/.cline/mcp.json`; optional `.clinerules` for always-on policy.

---

### `roo` (alias `roo-code`) — Roo Code

**Names:** custom modes, custom instructions / rules (`.roo/rules`), AGENTS.md (Agent Rules), MCP, slash commands. **Not** a full Open Skills host in official docs.

**Primary units:**

| Unit | Location |
|------|----------|
| Rules / instructions | `.roo/rules/*.md`, mode-specific `.roo/rules-{mode}/`, legacy `.roorules` |
| AGENTS.md | project root `AGENTS.md` (setting `roo-cline.useAgentRules`, default on) |
| Custom modes | YAML modes / `.roomodes` |
| MCP | user VS Code `globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`; project `.roo/mcp.json` |

**Official docs / sources:**

- Product docs: [https://docs.roocode.com](https://docs.roocode.com) (custom instructions, custom modes, MCP)
- AGENTS.md support: [Roo-Code#5969](https://github.com/RooCodeInc/Roo-Code/pull/5969) / [issue #5966](https://github.com/RooCodeInc/Roo-Code/issues/5966)
- Repo: [https://github.com/RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code)

**Note (lifecycle):** Public commentary in 2026 referenced product wind-down / pivot timelines. Treat paths as **best-effort**; verify install before promising Roo bridges in README.

**Polyglot bridge:** `AGENTS.md` + optional `.roo/rules/<id>.md` excerpt of skill; MCP via config-mcp; **do not** rely on SKILL.md auto-load unless re-verified.

---

### `goose` — Block Goose

**Names:** extensions (MCP servers), recipes, builtin extensions, prompts (MCP), platform extensions (e.g. Summon for skills/recipes).

**Primary units:**

| Unit | Location / shape |
|------|------------------|
| Extensions | `~/.config/goose/config.yaml` → `extensions:` (`builtin` \| `stdio` \| `sse`) |
| Recipes | YAML files: `instructions`, `parameters`, `extensions`, optional `sub_recipes` |
| Built-ins | `developer`, `memory`, `computercontroller`, `autovisualiser`, … |
| CLI | `goose configure`, `goose mcp`, `goose run --recipe`, `goose recipe …` |

**Model:** Goose’s “plugins” are **MCP extensions**. Recipes package reusable agent workflows + required extensions (Jinja2 params). Community/docs also reference skill-like loading via platform **Summon** extension — not the same as shipping only `.agents/skills` without config.

**Official docs:**

- Using extensions: [https://github.com/block/goose/blob/main/documentation/docs/getting-started/using-extensions.md](https://github.com/block/goose/blob/main/documentation/docs/getting-started/using-extensions.md) (also [block.github.io/goose](https://block.github.io/goose))
- MCP integration (Mintlify mirror): [https://block-goose.mintlify.app/guides/mcp-integration](https://block-goose.mintlify.app/guides/mcp-integration)
- Recipes: [https://block-goose.mintlify.app/guides/recipes](https://block-goose.mintlify.app/guides/recipes)
- Concepts: [https://block-goose.mintlify.app/concepts/extensions](https://block-goose.mintlify.app/concepts/extensions)

**Polyglot bridge:**

1. MCP server entry in Goose `extensions` (config-mcp hand adapter).
2. Optional **recipe** wrapping skill instructions + required MCP.
3. `.agents/skills` alone is insufficient unless Goose/Summon is configured to load it — document as optional.

---

### `zed` — Zed

**Names:** MCP / context servers, skills, instructions (AGENTS.md / multi-name rules files), agent profiles, tool permissions, external agents (ACP).

**Primary units:**

| Unit | Location |
|------|----------|
| MCP | `settings.json` → `context_servers` (local command or remote URL); also MCP **extensions** |
| Skills | project/user skill dirs (Agent Skills); model-invoked `skill` tool + `/skill` |
| Instructions | root `AGENTS.md`, also accepts `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, `CLAUDE.md`, `GEMINI.md`, … (first match wins for legacy list) |
| Agent settings | Agent Panel / `agent.*` in settings |

**Official docs:**

- MCP: [https://zed.dev/docs/ai/mcp](https://zed.dev/docs/ai/mcp)
- Agent settings (skills vs instructions): [https://zed.dev/docs/ai/agent-settings](https://zed.dev/docs/ai/agent-settings)
- Tools (incl. `skill`): [https://zed.dev/docs/ai/tools](https://zed.dev/docs/ai/tools)
- Tool permissions: [https://zed.dev/docs/ai/tool-permissions](https://zed.dev/docs/ai/tool-permissions)
- MCP extensions: [https://zed.dev/docs/extensions/mcp-extensions](https://zed.dev/docs/extensions/mcp-extensions) (path may track `docs/src/extensions/mcp-extensions.md` in zed repo)

**Summary:** Zed Agent uses **Skills** for reusable tasks and **Instructions** for always-on context; MCP via `context_servers`. Older “Rules Library” content maps to Skills/Instructions.

**Polyglot bridge:** `.agents/skills/**` + root `AGENTS.md` + `context_servers` / mcp.json adapted to Zed shape; optional Zed MCP extension for distribution.

---

### `junie` / `pycharm` — JetBrains Junie + IDEs

**Names:** guidelines / instructions (`AGENTS.md`), MCP tools, Junie **extensions** (skills + agents + guidelines + mcp), Brave mode, modes (Code/Ask). JetBrains AI Chat also hosts Claude Agent / Codex (those **do** support Skills natively).

**Primary units:**

| Unit | Location |
|------|----------|
| Guidelines | `.junie/AGENTS.md` (preferred), root `AGENTS.md`, legacy `.junie/guidelines.md` |
| MCP (Junie) | IDE Settings → Tools → Junie → MCP / `mcp.json`; project `.junie/mcp/mcp.json`; user `~/.junie/mcp/mcp.json` |
| MCP (PyCharm AI) | project `.ai/mcp/mcp.json` (suite config-mcp path) |
| Extensions | [JetBrains/junie-extensions](https://github.com/JetBrains/junie-extensions): `extension.json` + `skills/*/SKILL.md` + optional `mcp/`, `agents/`, `guidelines/` |
| Skills catalog | [JetBrains/skills](https://github.com/JetBrains/skills) |

**Official docs:**

- Junie agent (AI Assistant): [https://www.jetbrains.com/help/ai-assistant/junie-agent.html](https://www.jetbrains.com/help/ai-assistant/junie-agent.html)
- Agents overview (instructions/skills matrix): [https://www.jetbrains.com/help/ai-assistant/agents.html](https://www.jetbrains.com/help/ai-assistant/agents.html)
- Junie CLI / product: [https://junie.jetbrains.com](https://junie.jetbrains.com) · [JetBrains/junie](https://github.com/JetBrains/junie)

**Summary:** Junie itself is **guidelines + MCP** first; packaged domain expertise ships as **Junie extensions** with SKILL.md. Claude/Codex agents inside JetBrains AI use their own skill loaders.

**Polyglot bridge:** root or `.junie/AGENTS.md` bridge text; MCP under `.junie/mcp/mcp.json` / `.ai/mcp`; optional junie-extension wrap for skill bundles.

---

### `kiro` (alias `amazon-q`)

**Names:** steering, skills, MCP, project `.kiro/`, legacy Amazon Q paths.

**Primary units (suite + ecosystem):**

| Unit | Preferred | Legacy / getmcp |
|------|-----------|-----------------|
| Settings / MCP | `~/.kiro/settings/mcp.json`, project `.kiro/settings/mcp.json` | `~/.aws/amazonq/mcp.json` (getmcp `amazon-q`) |
| Steering / rules | `.kiro/steering/*.md` (common in multi-agent kits) | — |
| Skills | project/user skill dirs when enabled; Open Skills-compatible layouts used in the wild | — |

**Official docs:** AWS Kiro / Amazon Q Developer documentation; CLI lineage [aws/amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli). Product docs move between “Kiro” and “Q” branding — re-check URLs each refresh.

**Polyglot bridge:** `.agents/skills` (name==folder) + MCP to `.kiro/settings/mcp.json`; optional steering file summarizing skill triggers. Confirm skill root on implement.

---

### `aider` — Aider

**Names:** conventions, config (`.aider.conf.yml`), read-only context files, optional AGENTS.md via `read:`.

**Primary units:**

| Unit | How |
|------|-----|
| Conventions | Markdown file (e.g. `CONVENTIONS.md`) via `aider --read` or YAML `read:` |
| Config | `~/.aider.conf.yml`, repo `.aider.conf.yml` |
| AGENTS.md | Not always auto; add `read: AGENTS.md` (or list) in conf |

**No** Open Skills package, plugins, or MCP-first product surface (MCP only if you shell out manually).

**Official docs:**

- Conventions: [https://aider.chat/docs/usage/conventions.html](https://aider.chat/docs/usage/conventions.html)
- YAML config: [https://aider.chat/docs/config/aider_conf.html](https://aider.chat/docs/config/aider_conf.html)
- Community conventions: [https://github.com/Aider-AI/conventions](https://github.com/Aider-AI/conventions)

**Polyglot bridge:** emit `CONVENTIONS.md` or section of skill body + `.aider.conf.yml` snippet `read: [AGENTS.md, CONVENTIONS.md]`; keep `.agents/skills` for other agents only.

---

### `kilo` — Kilo Code (IDE + CLI) — promoted from Tier C

**Names:** skills, agents, MCP, AGENTS.md, marketplace, modes/agents, plugins (CLI).

**Primary units:**

| Unit | Project | Global |
|------|---------|--------|
| Skills | `.kilo/skills/<name>/SKILL.md` | `~/.kilo/skills/` |
| Compat skills | `.agents/skills/`, optional `.claude/skills/` | — |
| AGENTS.md | root `AGENTS.md` / `AGENT.md` (+ nested dirs) | — |
| MCP | `.kilo/kilo.json(c)` `mcp` key | `~/.config/kilo/kilo.json(c)` |
| Agents | `.kilo/agents/` | `~/.config/kilo/agents/` |
| Extra skill roots | `skills.paths` / `skills.urls` in kilo config | — |

**Official docs:**

- Skills: [https://kilo.ai/docs/customize/skills](https://kilo.ai/docs/customize/skills)
- AGENTS.md: [https://kilo.ai/docs/customize/agents-md](https://kilo.ai/docs/customize/agents-md)
- Marketplace: [https://kilo.ai/docs/customize/marketplace](https://kilo.ai/docs/customize/marketplace)
- MCP: [https://kilo.ai/docs/automate/mcp/overview](https://kilo.ai/docs/automate/mcp/overview) · [using-in-kilo-code](https://kilo.ai/docs/automate/mcp/using-in-kilo-code)
- CLI: [https://kilo.ai/docs/code-with-ai/platforms/cli](https://kilo.ai/docs/code-with-ai/platforms/cli)
- Marketplace repo: [https://github.com/Kilo-Org/kilo-marketplace](https://github.com/Kilo-Org/kilo-marketplace)

**Summary:** Kilo is **Open Skills + AGENTS.md + MCP + marketplace agents** — treat as near-Tier-A for polyglot.

**Polyglot bridge:** `.agents/skills` and/or `.kilo/skills`; root `AGENTS.md`; MCP into `kilo.jsonc` `mcp` map (note: Kilo’s MCP schema uses `type: local|remote`, not always classic `mcpServers`).

---

### `qwen` — Qwen Code — promoted from Tier C

**Names:** skills, extensions (with bundled skills), context files (`QWEN.md` / configurable `AGENTS.md`), slash commands, agents (markdown).

**Primary units:**

| Unit | Location |
|------|----------|
| Personal skills | `~/.qwen/skills/<name>/SKILL.md` |
| Project skills | `.qwen/skills/<name>/SKILL.md` |
| Shared Open Skills | `.agents/skills/` (supported as provider dir) |
| Extensions | `~/.qwen/extensions/…` + `qwen-extension.json` (`skills` field) |
| Context / instructions | `QWEN.md` default; `context.fileName` / `contextFileNames` can include `AGENTS.md` |

**Skill frontmatter:** `name`, `description`, optional `priority`, `paths`, `user-invocable`, `disable-model-invocation`. Model-invoked + `/skill-name` + `/skills` panel.

**Official docs:**

- Skills: [https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/)
- Repo docs: [https://github.com/QwenLM/qwen-code/blob/main/docs/users/features/skills.md](https://github.com/QwenLM/qwen-code/blob/main/docs/users/features/skills.md)
- `.agents/skills` support: [PR #2476](https://github.com/QwenLM/qwen-code/pull/2476)
- Configuration (context file names): product configuration docs under [qwen-code-docs](https://qwenlm.github.io/qwen-code-docs/)

**Polyglot bridge:** `.agents/skills` works natively; also mirror `.qwen/skills` if desired; set context `fileName` to include `AGENTS.md` for instruction bridge; MCP via Qwen settings when used.

---

### Grok Build (not a suite row; polyglot target)

**Names:** skills paths in config.

**Bridge:** `.grok/config.toml` → `[skills] paths = ["./.agents/skills"]`.

**Docs:** sparse public API; verify in-product when shipping Grok-specific claims.

---

### Legacy OpenAI ChatGPT plugins

**Manifest:** `ai-plugin.json` + OpenAPI (`/.well-known/ai-plugin.json` era).

**Still used as:** generic harness bridge (`api.type: "none"` for instruction-only polyglot packages).

---

## Tier C — guide-only / research-at-implement (deep notes)

Strategy: **do not invent plugin manifests**. Prefer MCP + AGENTS.md / skill tree only when a path is confirmed. Re-check each quarter or when config-clis implements adapters.

### Desktop / app shells

| Id | What “plugin-type” usually means | Known / likely paths | Official / primary refs | Polyglot stance |
|----|----------------------------------|----------------------|-------------------------|-----------------|
| `claude-desktop` | Desktop MCP + claude.ai custom skill **upload** (zip), not Claude Code `.claude-plugin` | MCP: `~/Library/Application Support/Claude/claude_desktop_config.json` (`mcpServers`); skills via app/Settings Features | [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview); Claude Desktop help | MCP adapter + human install notes; optional export skill zip |
| `open-design` | Local design desktop; agents via daemon/MCP | `.od/` / app data `app-config.json` | Product site / repo [nexu-io/open-design](https://github.com/nexu-io/open-design) | MCP/guide; no SKILL package assumed |
| `openwork` | Cowork desktop on OpenCode | OpenCode config + `.opencode/openwork.json` | Product / [different-ai/openwork](https://github.com/different-ai/openwork) | **Reuse `opencode` skill bridges** |
| `aionui` | Cowork GUI; MCP in app DB, may sync to CLIs | `~/Library/Application Support/AionUi/`; `~/.aionui` symlink notes | [iOfficeAI/AionUi](https://github.com/iOfficeAI/AionUi) | Guide; MCP export if documented |
| `bolt-ai` | macOS AI app MCP | `~/Library/Application Support/BoltAI/mcp_config.json` | Product docs | MCP-only bridge |
| `trae` | IDE-like; project MCP/rules | `.trae/mcp.json`, `.trae/rules/` (ecosystem kits) | Product docs | MCP + optional rules; verify skills |
| `libre-chat` | Deployed chat UI | `librechat.yaml` `mcpServers` | [LibreChat docs](https://www.librechat.ai) · [danny-avila/LibreChat](https://github.com/danny-avila/LibreChat) | Deploy YAML MCP; not repo skills |
| `agent-deck` | Desktop agent launcher | research | — | skip until paths pinned |

### CLI / TUI agents

| Id | Plugin-type surface | Paths / notes | Refs | Polyglot stance |
|----|---------------------|---------------|------|-----------------|
| `antigravity` | Gemini-adjacent agent tree | `~/.gemini/antigravity/` (settings/MCP) | Align with [Gemini CLI skills/extensions](https://geminicli.com/docs/extensions/) | Prefer `.agents/skills` + Gemini-style MCP under antigravity config |
| `crush` | Charm TUI agent | `~/.config/crush/crush.json` | [charmbracelet/crush](https://github.com/charmbracelet/crush) | config/MCP research; AGENTS.md if supported later |
| `pi` | coding agent | `~/.pi/` | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) | guide |
| `openclaw` | agent config | `~/.openclaw/openclaw.json` | [openclaw/openclaw](https://github.com/openclaw/openclaw) | guide |
| `forge` | CLI agent | `~/.forge.toml` | [antinomyhq/forge](https://github.com/antinomyhq/forge) | guide |
| `droid` | Factory Droid | env + local state | Factory docs | guide; AGENTS.md sometimes used in multi-agent kits |
| `interpreter` | Open Interpreter profiles | env / profile / project | [open-interpreter docs](https://docs.openinterpreter.com) | guide |
| `hermes-agent` | Nous agent | `~/.hermes/` or project | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | guide |
| `smelt`, `jcode`, `codewhale`, `deepseek-tui` | unknown | research at implement | — | skip / document-only |

### Suite utilities (not products)

| Id | Role |
|----|------|
| `generic` | Emit generic JSON/ids artifacts under `./out/` only |
| `ids` | ID listing utility — no plugin install surface |

### Tier C polyglot defaults

When user still wants “works everywhere” including Tier C:

1. Always ship **`.agents/skills/<name>/SKILL.md`** (widest shared convention).
2. Always ship **`AGENTS.md`** bridge (many CLIs/IDEs read it).
3. Ship **`mcp.json`** (stdio) and let **config-mcp** project per-client shapes.
4. In README compatibility table, mark Tier C as **manual / verify** with the paths above.
5. Never claim marketplace install for Tier C without a cited official channel.

---

## Polyglot mapping rules (from this OKF)

When generating a package, pick bridges from official surfaces:

| Artifact | Satisfies (catalog ids / products) |
|----------|-------------------------------------|
| `.agents/skills/<name>/SKILL.md` | Tier A cores + `cline`*, `kilo`, `qwen`, `zed`*, `devin`*, `cursor`*, `warp`, `gemini` alias, Open Skills tools |
| `.cline/skills/<name>/` | `cline` native (mirror of canonical skill) |
| `.kilo/skills/<name>/` | `kilo` native mirror |
| `.qwen/skills/<name>/` | `qwen` native mirror |
| `.continue/rules/<id>.md` | `continue` (skill body as rule; not auto SKILL load) |
| `.cursor/rules/<name>.mdc` | `cursor` |
| `.cursor-plugin/plugin.json` | optional Cursor marketplace-shaped pack |
| `.claude-plugin/plugin.json` + `skills/` | `claude` native plugin |
| `AGENTS.md` | `codex`, `kilo`, `roo`, `zed`, `junie`, many CLIs; `aider` if `read:` set; `qwen` if context fileName includes it |
| `CONVENTIONS.md` + `.aider.conf.yml` | `aider` |
| `.github/copilot-instructions.md` | `copilot` / `vscode` instructions |
| `.github/skills/` | `copilot` / `vscode` skills |
| `.grok/config.toml` | Grok Build |
| `ai-plugin.json` | legacy / generic |
| `mcp.json` / client MCP maps | all MCP-capable clients (adapt via config-mcp: Goose `extensions`, Zed `context_servers`, Kilo `mcp`, Continue mcpServers, …) |
| `gemini-extension.json` | optional Gemini / antigravity-family wrap |
| `.devin-plugin/plugin.json` | optional Devin CLI plugin wrap |
| Goose recipe YAML | `goose` workflow packaging |
| `.junie/AGENTS.md` + `.junie/mcp/` | `junie` |
| `.roo/rules` + `.roo/mcp.json` | `roo` |

\*Also list vendor-native skill dirs in README install matrix.

## Critical invariants (enforce in generators)

1. Folder name under skills root **equals** frontmatter `name:` (kebab-case).
2. `description` is a **trigger** for embedding/matchers, not marketing copy.
3. Prefer **stdio MCP**; no secrets in manifests (env refs).
4. Keep `SKILL.md` lean; bulk in `references/`.
5. Never install an entire marketplace as one plugin unit.

## Changelog

| Date | Change |
|------|--------|
| 2026-07-24 | Initial OKF embed for polyglot-plugin skill; catalog-aligned client coverage + official doc links as of July 2026 research. |
| 2026-07-24 | **Tier B/C deep dive:** full units/paths/docs/bridges for continue, cline, roo, goose, zed, junie/pycharm, kiro, aider; **promoted `kilo` + `qwen` into Tier B**; expanded Tier C desktop/CLI tables + default polyglot stance; mapping table updated. |
| 2026-07-24 | **Alias alignment:** added suite alias `claude-code` to the Tier A `claude` heading so the catalog’s alias (`claude` ≡ `claude-code`) is discoverable in this KB. Verified 43/43 primary catalog ids + 4/5 aliases + 4/4 split pairs present. |

## Next refresh checklist

- [ ] Re-fetch Claude plugins reference for new component dirs
- [ ] Confirm Cursor local plugin path + marketplace schema
- [ ] Codex plugin packaging vs skills-only install UX
- [ ] Copilot `plugin.json` field parity CLI vs cloud agent
- [ ] OpenCode remote `skills.urls` stability
- [ ] Gemini extension gallery + skills install CLI flags
- [ ] Devin plugin beta → GA
- [ ] Confirm Roo Code product status / path stability
- [ ] Kiro official skill directory path (steering vs skills)
- [ ] Zed default on-disk skills directory names
- [ ] Whether Cline auto-loads `.agents/skills` without copy to `.cline/skills`
- [ ] Fill remaining Tier C paths from config-clis implement notes
