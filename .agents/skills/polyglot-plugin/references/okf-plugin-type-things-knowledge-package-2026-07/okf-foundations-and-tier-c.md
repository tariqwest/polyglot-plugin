# OKF Foundations and Tier C — plugin-type things (2026-07)

**Status:** expanded OKF knowledge-package fragment  
**As-of:** `2026-07` (July 2026)  
**Last reviewed:** 2026-07-24  
**Owner skill:** `polyglot-plugin`  
**Source reference:** `.agents/skills/polyglot-plugin/references/okf-plugin-type-things-2026-07.md`  
**Source client catalog:** `~/Developer/config-clis/.agents/plans/config-clis.md`  
**Related suite plans:** [config-plugins.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-plugins.md), [config-skills.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-skills.md)

---

## Document status, ownership, and refresh workflow

| Field | Value |
|-------|-------|
| **Intent** | Authoritative framing for the `polyglot-plugin` skill: vocabulary, catalog mapping, Tier C coverage, polyglot bridge rules, and invariants. |
| **Scope** | Client/catalog *framing* plus Tier C (guide-only/research) clients. Tier A and B remain in the source OKF and are summarized here only in the quick matrix. |
| **Owner** | `polyglot-plugin` skill maintainers. |
| **Refresh cadence** | Re-read after any `config-clis` catalog rename/add; re-verify official doc URLs quarterly or when a link 404s. |
| **Major refresh signal** | Bump the source OKF filename month (`okf-plugin-type-things-YYYY-MM.md`) and keep a one-line pointer in the prior file. |

### How to use / update this knowledge package

1. Read this file when authoring polyglot bridges, validating discovery paths, or answering “what does X call plugins?”
2. Prefer the **official docs links** in the quick matrix over blog posts or repo READMEs; if a link 404s, replace it and bump **Last reviewed**.
3. When `config-clis` gains/renames a catalog id, add/rename the matching quick-matrix row and update the Tier C tables if the id is guide-only.
4. Keep every bridge decision traceable: document the **catalog id**, **primary unit**, **paths**, **official docs**, and **polyglot bridge**.
5. Cross-check install paths with sibling skill `plug-me-in/references/harness-install-matrix.md` before claiming a path works out-of-the-box.
6. Do **not** invent vendor `plugin.json` or marketplace schemas for Tier C clients; use `.agents/skills`, `AGENTS.md`, and MCP instead.

---

## Vocabulary definitions

| Term | Definition | Example | Cross-links |
|------|------------|---------|-------------|
| **Agent Skills / Open Skills** | Portable `SKILL.md` folders following the [agentskills.io](https://agentskills.io) spec. Progressive disclosure: frontmatter/metadata is always loaded; the full body is loaded only when the skill is invoked. | `.agents/skills/<name>/SKILL.md` | Quick matrix, Tier C polyglot defaults, Polyglot mapping rules |
| **Plugin (package)** | A distributable bundle that may contain skills, agents, hooks, MCP/LSP servers, commands, and rules. The root manifest and directory layout vary by vendor. | `.claude-plugin/plugin.json` + `skills/`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, `.devin-plugin/plugin.json` | Tier A summaries, Polyglot mapping rules |
| **Rules / instructions** | Always-on or scoped guidance for an agent, distinct from on-demand skills. Typically single files rather than directories. | `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, `.roo/rules` | Critical invariants, Vocabulary |
| **MCP** | Model Context Protocol: live tools, resources, and prompts exposed over stdio/SSE/HTTP. stdio is the most portable transport for local CLI agents. | `.mcp.json`, `mcpServers` block, `.continue/mcpServers/*.yaml`, Goose `extensions:` | Polyglot mapping rules, Critical invariants |
| **Marketplace** | A registry of many independent plugins. Users install **one unit** at a time; the catalog itself is not a single installable package. | Cursor marketplace, Cline MCP marketplace, Kilo marketplace | Critical invariants |
| **Polyglot package** | This skill’s canonical layout: an Open Skills root (`.agents/skills/<name>/SKILL.md`) plus per-harness bridge artifacts so the same expertise works across many clients. | `.agents/skills/<name>/SKILL.md` + `.cursor/rules/<name>.mdc` + `AGENTS.md` + `mcp.json` | Tier C polyglot defaults, Polyglot mapping rules |

**Open standard hub:** [https://agentskills.io](https://agentskills.io)

---

## Quick matrix: catalog id → display name → terminology → discovery → docs → polyglot bridge

| Catalog id | Display name | What they call “plugin-type things” | Primary discovery paths | Official entry docs | Polyglot bridge |
|------------|--------------|--------------------------------------|-------------------------|---------------------|-----------------|
| `cursor` | Cursor | plugins, skills, rules, MCP, hooks | `.cursor-plugin/`, `.cursor/skills`, `.agents/skills`, `.cursor/rules` | [Plugins](https://cursor.com/docs/plugins), [Skills](https://cursor.com/docs/skills), [Rules](https://cursor.com/docs/rules) | `.cursor/rules/<id>.mdc` + `.agents/skills` or `.cursor/skills` + `mcp.json` |
| `claude` (`claude-code`) | Claude Code | plugins, skills, agents, hooks, MCP, LSP, marketplaces | `.claude-plugin/plugin.json`, `skills/`, `~/.claude/skills`, `.claude/skills` | [Plugins](https://code.claude.com/docs/en/plugins), [Plugins ref](https://code.claude.com/docs/en/plugins-reference), [Skills](https://code.claude.com/docs/en/skills) | `.agents/skills/<id>/SKILL.md` + optional `mcp.json`; also copy to `.claude/skills` or Claude plugin manifest |
| `vscode` | VS Code + Copilot Chat | agent skills, custom instructions, MCP | `.github/skills`, workspace instructions | [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) | `.github/skills` and/or `.agents/skills` + `.github/copilot-instructions.md` + MCP |
| `copilot` | GitHub Copilot CLI | plugins, agent skills, agents, hooks, MCP | `plugin.json`, `.github/skills`, `~/.copilot/skills` | [About plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins), [Add skills (CLI)](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | `.github/skills` and/or `.agents/skills` + `.github/copilot-instructions.md` + MCP |
| `claude-desktop` | Claude Desktop | custom skills (upload), MCP | app Settings → Features + desktop MCP JSON (`~/Library/Application Support/Claude/claude_desktop_config.json`) | [Agent Skills overview (platform)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) | MCP adapter + human install notes; optional exported skill zip |
| `devin-desktop` / `windsurf` | Devin Desktop / Cascade | skills, rules, workflows, plugins (IDE) | `.windsurf/skills`, `.agents/skills` | [Cascade Skills](https://docs.devin.ai/desktop/cascade/skills) | `.agents/skills/**` + optional `.windsurf/skills` mirror |
| `devin` | Devin CLI / cloud | skills, plugins (beta) | `.devin/skills`, `.agents/skills`, multi-path scan | [Skills overview](https://docs.devin.ai/cli/extensibility/skills/overview), [Plugins](https://docs.devin.ai/cli/extensibility/plugins/overview) | `.agents/skills/**` + optional `.devin/skills` mirror + `.devin-plugin/plugin.json` wrap |
| `codex` | OpenAI Codex CLI | skills, plugins, AGENTS.md, MCP, subagents | `.agents/skills`, `~/.agents/skills`, `AGENTS.md` | [Build skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Customization](https://developers.openai.com/codex/concepts/customization) | `.agents/skills/**` + root `AGENTS.md` + optional `ai-plugin.json` |
| `gemini` | Gemini CLI | extensions, agent skills, custom commands, GEMINI.md | `gemini-extension.json`, `.gemini/skills`, `.agents/skills` | [Extensions](https://geminicli.com/docs/extensions/), [Agent Skills](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md), [Creating skills](https://geminicli.com/docs/cli/creating-skills/) | `.agents/skills/**` + optional `gemini-extension.json` + MCP |
| `opencode` | OpenCode | skills, agents, plugins (npm), AGENTS.md | `.opencode/skills`, `.agents/skills`, `.claude/skills` | [Agent Skills](https://dev.opencode.ai/docs/skills/), [Agents](https://opencode.ai/docs/agents/) | `.agents/skills/**` + `.opencode/skills` + `AGENTS.md` |
| `warp` | Warp / Oz | skills, rules, Warp Drive, MCP | `.agents/skills`, Warp Drive | Warp docs / in-product skills | `.agents/skills/**` + `mcp.json` as applicable |
| `continue` | Continue (IDE + `cn` CLI) | rules, prompts, MCP (no Open Skills host) | `.continue/rules`, `.continue/mcpServers` | [Rules](https://docs.continue.dev/customize/deep-dives/rules), [MCP](https://docs.continue.dev/customize/deep-dives/mcp) | `.agents/skills/` canonical + `.continue/rules/<id>.md` + MCP + optional slash prompt |
| `cline` | Cline (VS Code + CLI) | skills, rules, MCP, marketplace | `.cline/skills`, `~/.cline/skills`, `.clinerules/`, Cline MCP settings | [Skills](https://docs.cline.bot/customization/skills), [MCP](https://docs.cline.bot/mcp/mcp-overview) | `.cline/skills/<name>/` + `.agents/skills/<name>/` + MCP to Cline settings + `.clinerules` |
| `roo` (`roo-code`) | Roo Code | modes, rules, AGENTS.md, MCP | `.roo/rules`, `.roo/mcp.json`, `AGENTS.md` | [docs.roocode.com](https://docs.roocode.com) | `AGENTS.md` + optional `.roo/rules/<id>.md` + MCP; do not rely on SKILL.md auto-load |
| `aider` | Aider | conventions + `read:` config | `CONVENTIONS.md`, `.aider.conf.yml` | [Conventions](https://aider.chat/docs/usage/conventions.html) | `CONVENTIONS.md` + `.aider.conf.yml` snippet `read:` + `.agents/skills` for other agents |
| `zed` | Zed | context_servers (MCP), skills, instructions | `settings.json`, `AGENTS.md`, skills | [MCP](https://zed.dev/docs/ai/mcp), [Agent settings](https://zed.dev/docs/ai/agent-settings) | `.agents/skills/**` + root `AGENTS.md` + `context_servers` / `mcp.json` adapted to Zed shape |
| `goose` | Goose | extensions (MCP), recipes | `~/.config/goose/config.yaml` | [block.github.io/goose](https://block.github.io/goose) | MCP server entry in Goose `extensions` + optional recipe; `.agents/skills` insufficient alone |
| `kiro` | Kiro (Amazon Q lineage) | steering, skills, MCP | `.kiro/`, `~/.kiro/settings/mcp.json` | AWS Kiro / Amazon Q docs | `.agents/skills` + MCP to `.kiro/settings/mcp.json` + optional `.kiro/steering` |
| `pycharm` | PyCharm | AI Assistant / MCP | `.ai/mcp/`, IDE settings | JetBrains AI Assistant docs | `.ai/mcp/mcp.json` via config-mcp + `.agents/skills` for others |
| `junie` | Junie | AGENTS.md guidelines, MCP, extensions | `.junie/AGENTS.md`, `.junie/mcp/`, `extension.json` | [Junie agent](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) | `.junie/AGENTS.md` or root + MCP under `.junie/mcp/mcp.json` / `.ai/mcp`; optional junie-extension |
| `kilo` | Kilo Code | skills, AGENTS.md, MCP, marketplace | `.kilo/skills`, `.agents/skills`, `kilo.jsonc` | [Skills](https://kilo.ai/docs/customize/skills), [AGENTS.md](https://kilo.ai/docs/customize/agents-md), [MCP](https://kilo.ai/docs/automate/mcp/overview) | `.agents/skills` and/or `.kilo/skills` + root `AGENTS.md` + MCP into `kilo.jsonc` `mcp` map |
| `qwen` | Qwen Code | skills, extensions, context files | `.qwen/skills`, `.agents/skills`, `~/.qwen/skills` | [Skills](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/) | `.agents/skills` works natively; mirror `.qwen/skills`; set `context.fileName` to include `AGENTS.md` |
| `open-design` | Open Design | agents via daemon/MCP | `.od/` / app data | [nexu-io/open-design](https://github.com/nexu-io/open-design) | MCP/guide; no SKILL package assumed |
| `openwork` | OpenWork | OpenCode-backed | `.opencode/openwork.json`, OpenCode skill paths | [different-ai/openwork](https://github.com/different-ai/openwork) | Reuse `opencode` skill bridges |
| `aionui` | AionUi | app plugins / MCP sync | `~/Library/Application Support/AionUi/`, `~/.aionui` | [iOfficeAI/AionUi](https://github.com/iOfficeAI/AionUi) | Guide; MCP export if documented |
| `crush` | Crush | config + tools | `~/.config/crush/` | [charmbracelet/crush](https://github.com/charmbracelet/crush) | config/MCP research; `AGENTS.md` if supported later |
| `antigravity` | Antigravity | skills under Gemini tree | `~/.gemini/antigravity/` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/) | `.agents/skills` + Gemini-style MCP under antigravity config |
| `pi` | Pi | agent tree | `~/.pi/` | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) | guide |
| `droid` | Factory Droid | app/CLI prefs | env + local state | Factory docs | guide; `AGENTS.md` sometimes used in multi-agent kits |
| `openclaw` | OpenClaw | agent config | `~/.openclaw/` | [openclaw/openclaw](https://github.com/openclaw/openclaw) | guide |
| `forge` | ForgeCode | config | `~/.forge.toml` | [antinomyhq/forge](https://github.com/antinomyhq/forge) | guide |
| `trae` | Trae | project `.trae/` + MCP | `.trae/mcp.json` | Product docs | MCP + optional rules; verify skills |
| `bolt-ai` | BoltAI | MCP config | `~/Library/Application Support/BoltAI/mcp_config.json` | Product docs | MCP-only bridge |
| `libre-chat` | LibreChat | deploy YAML agents/MCP | `librechat.yaml` | [LibreChat docs](https://www.librechat.ai) | deploy YAML MCP; not repo skills |
| `interpreter` | Open Interpreter | profiles | env / profile / project | [Open Interpreter docs](https://docs.openinterpreter.com) | guide |
| `hermes-agent` | Hermes Agent | agent config | `~/.hermes/` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | guide |
| `smelt`, `jcode`, `codewhale`, `deepseek-tui`, `agent-deck` | various | unknown / research | research | — | skip / document-only until paths pinned |
| `generic` / `ids` | suite utils | n/a | artifacts only | n/a | n/a |
| *(Grok Build)* | Grok Build | skills paths in config | `.grok/config.toml` → `.agents/skills` | community/product notes | ship `.grok/config.toml` pointing to `.agents/skills` |
| *(legacy OpenAI plugins)* | ChatGPT plugins era | `ai-plugin.json` + OpenAPI | `/.well-known/ai-plugin.json` | historical | generic harness bridge via `ai-plugin.json` (`api.type: "none"` for instruction-only) |

---

## Tier C — guide-only / research-at-implement

**Strategy:** do not invent plugin manifests. Prefer `.agents/skills`, `AGENTS.md`, and MCP only when a path is confirmed. Re-check each quarter or when `config-clis` implements adapters.

### Desktop / app shells

| Id | Known / verified | Guide-only / unverified | Recommended polyglot stance |
|----|------------------|-------------------------|-----------------------------|
| `claude-desktop` | Desktop MCP JSON (`~/Library/Application Support/Claude/claude_desktop_config.json` with `mcpServers`) and claude.ai custom skill upload (zip). | Exact zip format, upload API, and desktop-vs-Code namespace differences. | MCP adapter + human install notes; optionally export a skill zip. Do **not** ship a `.claude-plugin` expecting it to install on Desktop. |
| `open-design` | Local design desktop; agents via daemon/MCP; `.od/` / `app-config.json`. | Public skill loader and `SKILL.md` packaging. | MCP/guide only; no SKILL package assumed. |
| `openwork` | Cowork desktop on OpenCode; uses OpenCode config and `.opencode/openwork.json`. | Independent plugin manifest or skill root. | **Reuse `opencode` skill bridges**; do not invent an OpenWork-specific manifest. |
| `aionui` | Cowork GUI; MCP in app DB, may sync to CLIs; `~/Library/Application Support/AionUi/` and `~/.aionui` symlink notes. | Stable sync protocol and public plugin API. | Guide; MCP export only if documented. |
| `bolt-ai` | macOS AI app MCP; `~/Library/Application Support/BoltAI/mcp_config.json`. | Native skill or rules surface. | MCP-only bridge. |
| `trae` | IDE-like; project MCP and rules; `.trae/mcp.json`, `.trae/rules/` (ecosystem kits). | Native skill loader and marketplace schema. | MCP + optional rules; verify skills before claiming support. |
| `libre-chat` | Deployed chat UI; `librechat.yaml` with `mcpServers`. | Repo-based skill install. | Deploy YAML MCP; not a repo-skills target. |
| `agent-deck` | Desktop agent launcher. | All paths and surface names. | Skip until paths pinned. |

### CLI / TUI agents

| Id | Known / verified | Guide-only / unverified | Recommended polyglot stance |
|----|------------------|-------------------------|-----------------------------|
| `antigravity` | Gemini-adjacent agent tree; `~/.gemini/antigravity/` (settings/MCP). | Independent extension schema and native skill root. | `.agents/skills` + Gemini-style MCP under antigravity config. |
| `crush` | Charm TUI agent; `~/.config/crush/crush.json`. | `AGENTS.md`/context support and MCP schema. | config/MCP research; emit `AGENTS.md` only if supported later. |
| `pi` | coding agent; `~/.pi/`. | Plugin or skill surface. | guide |
| `openclaw` | agent config; `~/.openclaw/openclaw.json`. | Skill loader. | guide |
| `forge` | CLI agent; `~/.forge.toml`. | Skill/plugin surface. | guide |
| `droid` | Factory Droid; env + local state. | Stable skill paths; `AGENTS.md` is sometimes used in multi-agent kits. | guide; note `AGENTS.md` usage in multi-agent kits. |
| `interpreter` | Open Interpreter profiles; env / profile / project. | Skill packaging. | guide |
| `hermes-agent` | Nous agent; `~/.hermes/`. | Plugin surface. | guide |
| `smelt`, `jcode`, `codewhale`, `deepseek-tui` | Unknown. | All. | skip / document-only until paths pinned |

### Suite utilities (not products)

| Id | Role | Known / verified | Recommended polyglot stance |
|----|------|------------------|-----------------------------|
| `generic` | Emit generic JSON/ids artifacts under `./out/` only. | No plugin install surface. | Use only as a build utility; no skill/MCP bridge. |
| `ids` | ID listing utility. | No plugin install surface. | Use only as a catalog utility; no skill/MCP bridge. |

### Tier C polyglot defaults

When a user still wants “works everywhere” including Tier C:

1. **Always ship `.agents/skills/<name>/SKILL.md`.** This is the widest shared convention across Tier A, Tier B, and most Tier C clients.
2. **Always ship `AGENTS.md`.** Many CLIs and IDEs read it as always-on context even when they do not fully implement Open Skills.
3. **Ship `mcp.json` (stdio)** and let the **config-mcp** project translate it per-client shape (Goose `extensions`, Zed `context_servers`, Kilo `mcp`, Continue `mcpServers`, etc.).
4. In README compatibility tables, mark Tier C as **manual / verify** and cite the paths above.
5. **Never claim marketplace install** for a Tier C client without a cited official channel.
6. Keep instructions root files (`AGENTS.md`, `CONVENTIONS.md`, `copilot-instructions.md`) as **bridges**, not replacements for the canonical `SKILL.md`, so updates propagate to all harnesses.

---

## Polyglot mapping rules

When generating a package, pick bridges from official surfaces. Start with the canonical `.agents/skills/<name>/SKILL.md` and add vendor-native mirrors only when the loader is confirmed.

| Artifact | Satisfies (catalog ids / products) | When to use / notes |
|----------|-------------------------------------|----------------------|
| `.agents/skills/<name>/SKILL.md` | Tier A cores + `cline`, `kilo`, `qwen`, `zed`, `devin`, `cursor`, `warp`, `gemini` alias, Open Skills tools | Default for every polyglot package. Lowest-common-denominator, progressive-disclosure format. |
| `.claude/skills/<name>/` | `claude` personal/project skill copy | Use when mirroring for Claude Code local/project iteration alongside the canonical skill. |
| `.claude-plugin/plugin.json` + `skills/` | `claude` native plugin | Use when packaging a full Claude plugin with agents/hooks/MCP/LSP for distribution. |
| `.cursor/skills/<name>/` | `cursor` native skill mirror | Use when mirroring for Cursor native skill discovery. |
| `.cursor/rules/<name>.mdc` | `cursor` | Use for always-on/scoped policy or when a Cursor rule is the best native hook. |
| `.cursor-plugin/plugin.json` | optional Cursor marketplace-shaped pack | Use when publishing to the Cursor marketplace or testing local `.cursor-plugin`. |
| `.codex/skills/<name>/` | `codex` (if/when confirmed) | Use as Codex-native mirror; primary is `.agents/skills`. |
| `.github/skills/` | `copilot` / `vscode` skills | Use for GitHub Copilot / VS Code agent skills surface. |
| `.github/copilot-instructions.md` | `copilot` / `vscode` instructions | Use for always-on repo/personal guidance in Copilot/VS Code. |
| `.devin/skills/<name>/` | `devin` | Mirror for Devin CLI/cloud when confirmed; primary is `.agents/skills`. |
| `.windsurf/skills/<name>/` | `devin-desktop` / `windsurf` | Mirror for Devin Desktop Cascade when confirmed. |
| `.devin-plugin/plugin.json` | optional Devin CLI plugin wrap | Use when distributing a Devin CLI plugin bundle. |
| `.gemini/skills/<name>/` | `gemini` native skill mirror | Mirror for Gemini CLI skill discovery. |
| `gemini-extension.json` | optional Gemini / antigravity-family wrap | Use when packaging as a Gemini extension. |
| `.opencode/skills/<name>/` | `opencode` native skill mirror | Mirror for OpenCode native discovery; supports `skills.paths` / `skills.urls` as fallback. |
| `.qwen/skills/<name>/` | `qwen` native mirror | Use when mirroring for Qwen Code project/personal skill roots. |
| `qwen-extension.json` | optional Qwen extension wrap | Use when packaging as a Qwen extension with bundled skills. |
| `.kilo/skills/<name>/` | `kilo` native mirror | Use for Kilo Code native skill discovery. |
| `kilo.jsonc` (`mcp` key) | `kilo` MCP | Use to register MCP servers in Kilo Code; note Kilo’s schema may use `type: local/remote` rather than classic `mcpServers`. |
| `.cline/skills/<name>/` | `cline` native (mirror of canonical skill) | Use for Cline native Open Skills loader. |
| `.clinerules/` | `cline` | Use for always-on Cline policy. |
| `.continue/rules/<id>.md` | `continue` | Use when Continue has no SKILL host; project skill body as a rule with frontmatter. |
| `.roo/rules` + `.roo/mcp.json` | `roo` | Optional Roo Code bridge; `AGENTS.md` is the more reliable path. |
| `.roomodes` / YAML modes | `roo` | Use when targeting custom Roo Code modes. |
| `AGENTS.md` | `codex`, `kilo`, `roo`, `zed`, `junie`, many CLIs; `aider` if `read:` set; `qwen` if `context.fileName` includes it | Use as root always-on instruction bridge. Keep it concise. |
| `GEMINI.md` | `gemini` context file | Use for Gemini CLI default context. |
| `QWEN.md` / `context.fileName` | `qwen` context | Use for Qwen Code default context; configure `context.fileName` to include `AGENTS.md` if needed. |
| `CONVENTIONS.md` + `.aider.conf.yml` | `aider` | Use when aider is a primary target; add `read: [AGENTS.md, CONVENTIONS.md]` in conf. |
| `.junie/AGENTS.md` + `.junie/mcp/` | `junie` | Use when targeting JetBrains Junie; keep root `AGENTS.md` for other agents. |
| `.ai/mcp/mcp.json` | `pycharm` / JetBrains AI Assistant MCP | Use for PyCharm/JetBrains AI Assistant MCP registration. |
| `.kiro/settings/mcp.json` + `.kiro/steering/*.md` | `kiro` | Use for Kiro/Amazon Q MCP; optional steering files summarize skill triggers. |
| `.grok/config.toml` | Grok Build | Use when targeting Grok Build; points `[skills] paths` to `./.agents/skills`. |
| `mcp.json` / client MCP maps | all MCP-capable clients | Use when providing live tools; adapt per client via `config-mcp` (Goose `extensions`, Zed `context_servers`, Kilo `mcp`, Continue `mcpServers`, etc.). |
| Goose recipe YAML | `goose` | Use when bundling skill instructions + required extensions for Goose workflows. |
| Zed MCP extension | `zed` | Use when distributing as a Zed MCP extension. |
| `ai-plugin.json` | legacy / generic | Use as generic harness bridge (`api.type: "none"` for instruction-only polyglot packages). |

\* Also list vendor-native skill dirs in README install matrix.

---

## Critical invariants (enforce in generators)

1. **Folder name under skills root equals frontmatter `name:` (kebab-case).**  
   Clients index skills by directory name, and frontmatter `name:` is what the `use_skill` / `/skill` tool registers. A mismatch breaks auto-discovery, slash invocation, and plugin packaging validators.

2. **`description` is a trigger for embedding/matchers, not marketing copy.**  
   LLM retrieval and client match logic pick skills by semantic similarity to `description`. Verbose or generic marketing copy degrades recall, wastes token budget, and may hit length limits. Keep it one to two sentences focused on what the skill does.

3. **Prefer stdio MCP; no secrets in manifests (use env refs).**  
   stdio is the most portable transport across local CLI agents. Hard-coded secrets in `mcp.json` or `plugin.json` leak into version control and installable packages. Reference environment variables and document which variables the user must set.

4. **Keep `SKILL.md` lean; bulk in `references/`.**  
   `SKILL.md` is typically embedded and/or progressively disclosed. A large body increases load latency and may exceed context windows. Put detailed examples, schemas, and deep docs under `references/` and pull them in by path or link.

5. **Never install an entire marketplace as one plugin unit.**  
   A marketplace is a curated registry of many independent packages. Bundling it as a single installable unit breaks versioning, inflates the dependency/conflict surface, and violates client manifest schemas.

6. **Do not invent vendor plugin manifests for Tier C / guide-only clients.**  
   Unsupported `plugin.json` or marketplace shapes will fail validation or 404. For guide-only clients, emit `.agents/skills`, `AGENTS.md`, and MCP configs, which degrade gracefully and remain valid if the client’s surface changes.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-24 | Initial OKF embed for `polyglot-plugin` skill; catalog-aligned client coverage + official doc links as of July 2026 research. |
| 2026-07-24 | **Tier B/C deep dive:** full units/paths/docs/bridges for `continue`, `cline`, `roo`, `goose`, `zed`, `junie`/`pycharm`, `kiro`, `aider`; **promoted `kilo` + `qwen` into Tier B**; expanded Tier C desktop/CLI tables + default polyglot stance; mapping table updated. |
| 2026-07-24 | **Alias alignment:** added suite alias `claude-code` to the Tier A `claude` heading so the catalog’s alias (`claude` ≡ `claude-code`) is discoverable in this KB. Verified 43/43 primary catalog ids + aliases + split pairs present. |
| 2026-07-24 | **Expanded foundations fragment** (`okf-foundations-and-tier-c.md`): added cross-linked vocabulary table, quick matrix with polyglot-bridge column, research-grade Tier C known/guide-only/stance tables, expanded polyglot mapping rules with per-artifact usage notes, expanded critical invariants, and a research notes section. |

---

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
- [ ] Fill remaining Tier C paths from `config-clis` implement notes
- [ ] Validate Grok Build `.grok/config.toml` public schema and skill-path loader
- [ ] Confirm Qwen `context.fileName` default for `AGENTS.md` bridge
- [ ] Document Kilo `kilo.jsonc` MCP `type` field parity with `mcpServers` schemas
- [ ] Verify whether Crush supports `AGENTS.md` or context profiles
- [ ] Re-check Trae `.trae/rules/` directory and MCP schema from product docs

---

## Research notes

### Verified facts
- The source OKF contains 43 primary catalog ids, plus aliases (`claude-code`, `windsurf`/`devin-desktop`, `roo-code`) and split pairs (`copilot`/`vscode`, `devin`/`devin-desktop`, `junie`/`pycharm`).
- Tier A and promoted Tier B clients (`kilo`, `qwen`) explicitly reference or load `.agents/skills/<name>/SKILL.md`.
- `agentskills.io` is cited as the Open Skills spec by `claude`, `codex`, `devin`, `gemini`, `opencode`, `kilo`, and `qwen`.
- Tier C strategy in the source KB explicitly says **“do not invent plugin manifests”**; this is preserved and elevated to a critical invariant.

### Ambiguities
- **Roo Code lifecycle:** public 2026 commentary referenced a possible wind-down / pivot; `AGENTS.md` support exists but treat Roo bridges as best-effort.
- **Kiro vs Amazon Q branding:** product docs move between “Kiro” and “Q” branding; URLs and directory names must be re-verified each refresh.
- **Cline `.agents/skills` auto-load:** docs list `.claude/skills` and `.cline/skills`; whether `.agents/skills` is read without copying is unconfirmed.
- **Cursor `.cursor-plugin/plugin.json` local install + marketplace schema:** not confirmed in source; marked for refresh.
- **OpenCode `skills.urls` remote loading:** stability and auth behavior unclear.
- **Qwen `context.fileName` default:** configurable but not confirmed to include `AGENTS.md` out-of-the-box.
- **Kilo `kilo.jsonc` MCP schema:** uses `type: local|remote` mapping, not always classic `mcpServers`.
- **Grok Build:** sparse public API; only the `.grok/config.toml` → `.agents/skills` pointer is documented in source.
- **Warp:** no single public `plugin.json` equivalent; skill loading is in-product / Drive-only.
- **Tier C CLI/TUI clients (`crush`, `pi`, `forge`, `droid`, `interpreter`, `hermes-agent`, `smelt`, etc.):** no stable plugin/skill manifest surface; paths are best-effort or unknown.

### Dead / changed links
- No automated link verification was run during this expansion.
- Known movers:
  - Kiro / Amazon Q documentation URLs drift between branding releases.
  - Roo Code primary docs site (`docs.roocode.com`) status depends on product continuity.
  - Gemini documentation is split between `geminicli.com` and GitHub repo paths; verify canonicality on refresh.
  - LibreChat docs domain has moved to `librechat.ai` in source; confirm on next refresh.
