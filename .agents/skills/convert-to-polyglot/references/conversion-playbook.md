# Conversion playbook (case study: Understand-Anything)

## Source shape (upstream)

- Monorepo root with `.claude-plugin/`, `.cursor-plugin/`, `.copilot-plugin/`
- Real plugin package: `understand-anything-plugin/`
  - `skills/` (9 skills, large `understand/SKILL.md` ~858 lines)
  - `agents/` (analyzer prompts)
  - `hooks/` (PostToolUse / SessionStart)
  - `packages/` (core, dashboard, viewer, tree-sitter WASM)
  - `src/` (TS helpers exported from skill package)
- Noise: `homepage/`, `docs/`, localized `READMEs/`, marketing `assets/`

## Destination shape

`~/Developer/harness-plugins/understand-anything`

- Skills → `.agents/skills/*`
- Agents → `.agents/agents/*`
- Hooks → `.agents/hooks/*` (+ README for non-Claude)
- Packages/build → `runtime/`
- Removed duplicates: `runtime/skills`, `runtime/agents`, `runtime/hooks`
- Env root: `UNDERSTAND_ANYTHING_ROOT`
- Condensed primary skill; full text → `.agents/references/understand-full-protocol.md`
- Thin MCP: list skills, find `knowledge-graph.json`, summarize graph

## Edge cases handled

1. **Scripts not under `scripts/`** — upstream placed some `.mjs`/`.py` at skill root; normalize into `scripts/` and rewrite references.
2. **Multi-skill package** — generate per-skill Cursor rules **and** an umbrella rule; AGENTS.md indexes all skills.
3. **Runtime build required** — document `pnpm` in README; skills inject `RUNTIME_ROOT` and build hint.
4. **Hooks are Claude-shaped** — keep JSON, parameterize root env, document adaptation for other harnesses (don’t fake unsupported APIs).
5. **SKILL.md size limits** — keep phase headers + short body; point to full protocol for execution fidelity.
6. **Path rewrite order** — rewrite specific suffixes (`/agents/`, `/skills/`, `/packages/`) before blanket `${CLAUDE_PLUGIN_ROOT}` → `${PLUGIN_ROOT}`.
7. **Install scripts** — if kept, retarget `understand-anything-plugin` → `runtime` and note polyglot layout at top.

## Validation snapshot (what “done” looked like)

- 9 skills, names match folders, all SKILL.md &lt; 500 lines after condensation
- Bridges present for Cursor, Copilot, Grok, AGENTS, ai-plugin, mcp
- MCP `initialize` + `tools/list` + `ua_list_skills` smoke OK
- ~7–8MB package dominated by `runtime/` WASM/parsers

## Reuse checklist for the next plugin

- [ ] Identify skills root and whether agents/hooks/runtime exist
- [ ] Choose env root var name
- [ ] Vendor → normalize scripts → adapt paths → bridges → validate
- [ ] Exclude marketing/docs unless user wants them
- [ ] Prefer JS for any new automation added during conversion
## Wave 2 / MCP fixtures

Additional conversion targets (see `fixtures.json` → `wave2` and `mcp`):

### MCP-bundled (primary)

| ID | Source | MCP shape |
|---|---|---|
| official-github | anthropics/claude-plugins-official `external_plugins/github` | `.mcp.json` |
| official-playwright | …/playwright | `.mcp.json` |
| official-linear | …/linear | `.mcp.json` |
| official-context7 | …/context7 | `.mcp.json` |
| official-firebase | …/firebase | `.mcp.json` |
| official-terraform | …/terraform | `.mcp.json` |
| official-serena | …/serena | `.mcp.json` |
| official-gitlab | …/gitlab | `.mcp.json` |
| cursor-notion-plugin | makenotion/cursor-notion-plugin | `mcp.json` (hosted SSE) |
| cursor-harness-plugin | thisrohangupta/cursor-harness-plugin | `mcp.json` stdio + hooks |
| ucoz-agent-skills | ucoz-skills/agent-skills | `.mcp.json` + multi-harness |
| heroku-claude-adapter | dsouzaAnush/heroku-skills `adapters/claude/heroku` | adapter `.mcp.json` |
| mongodb-agent-skills | mongodb/agent-skills | marketplace + MCP (priority) |

### Non-MCP diversity

continual-learning, create-plugin, agent-compatibility, pensive, engineering-workflow-plugin, claude-code-kit, planning-with-files, ok-skills.

### MCP conversion checklist

1. Detect `.mcp.json` / `mcp.json` / `mcp_config.json` / inline `mcpServers`
2. Vendor originals under `.agents/references/mcp/`
3. Merge into root `mcp.json` + `.mcp.json`
4. Rewrite `${CLAUDE_PLUGIN_ROOT}` → package env root
5. Document auth/env; never embed secrets
6. Keep polyglot helper server under a **different** server key

## Wave 3 — alternative harness formats

Goal: flex the converter on **non-Claude / non-Codex / non-Cursor-primary** packages.

| ID | Harness | Format notes |
|---|---|---|
| gemini-api-skills | Gemini | Official `google-gemini/gemini-skills` |
| gemini-skills-extension | Gemini | `gemini-extension.json` + skills + MCP |
| agentic-design-patterns-extension | Gemini | Extension + 28 skills + mcp_server.py |
| gemini-cli-skillz | Gemini | Extension wrapping skillz MCP |
| opencode-agent-skills | OpenCode | Plugin TS package for skill tools |
| opencode-skills-malhashemi | OpenCode | Skills pack for OpenCode |
| copilot-context-engineering | Copilot | awesome-copilot nested plugin |
| copilot-frontend-web-dev | Copilot | awesome-copilot nested plugin |
| copilot-database-data-management | Copilot | awesome-copilot nested plugin |
| cc-sdd | multi-alt | SDD skills across many CLIs |
| agentic-stack | Antigravity | portable `.agent/` |
| ag-kit | Antigravity/Gemini | `.agent/` + mcp_config |
| softspark-ai-toolkit-app | multi-alt | source for Windsurf/Cline/Roo/OpenCode/Aider emitters |
| awesome-hermes-skills | Hermes | Hermes skill library |
| agent-skill-creator | multi-alt | emits adapters for 17 platforms |

Run: `node scripts/run-fixtures.mjs --set wave3`
