---
name: convert-to-polyglot
description: "Use when converting an existing single-harness agent plugin (Claude Code, Cursor, Copilot, Codex, etc.) into a universal polyglot plugin package under a target directory. Triggers on convert plugin to polyglot, port Claude plugin, make cross-agent compatible, harness-plugins conversion, polyglot port of an upstream skill/plugin."
version: "1.0.0"
author: "tariqwest"
license: "MIT"
compatibility: "requires: node>=20; optional: git, gh, rsync, pnpm (only if the source ships a JS runtime monorepo)"
---

# convert-to-polyglot

Convert an existing agent plugin into a **polyglot package** that every major harness can discover, using one canonical Open Agent Skills tree plus bridge artifacts.

This skill captures the process used to port [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) into `~/Developer/harness-plugins/understand-anything`. Pair it with the sibling skill `polyglot-plugin` (greenfield packages). This skill is for **migration / conversion**.

## When to use

- User has (or links) an upstream plugin built for one harness
- User wants output under `harness-plugins/`, or any polyglot destination
- User says “convert”, “port”, “polyglot-ify”, or “make work across Claude/Cursor/Codex/Warp”

## Inputs to gather

1. **Source** — git URL, local path, or both
2. **Destination** — e.g. `~/Developer/harness-plugins/<name>`
3. **Package name** — kebab-case (`understand-anything`)
4. **Env prefix** (optional) — e.g. `UNDERSTAND_ANYTHING_ROOT` (default: derived from name → `UPPER_SNAKE_ROOT`)
5. **What to vendor** — skills only vs skills + agents + hooks + runtime packages
6. **Exclude noise** — docs sites, marketing homepage, huge unrelated assets (default: exclude `homepage/`, `docs/`, `READMEs/`, `.git/`, `node_modules/`)

## Target layout (non-negotiable)

```text
{{package-name}}/
├── .agents/
│   ├── skills/                 # ONE folder per skill; name == SKILL.md name:
│   │   └── {{skill}}/
│   │       ├── SKILL.md        # canonical instructions (<500 lines preferred)
│   │       ├── scripts/        # all executables live here
│   │       ├── references/     # optional per-skill refs
│   │       └── assets/         # optional
│   ├── agents/                 # shared subagent prompts (if upstream has agents/)
│   ├── hooks/                  # optional lifecycle hooks + README for other harnesses
│   └── references/             # package-level overflow (full protocols, indexes)
├── .cursor/rules/{{skill}}.mdc
├── .github/copilot-instructions.md
├── .grok/config.toml
├── .claude-plugin/plugin.json  # optional compat
├── .cursor-plugin/plugin.json  # optional compat
├── .copilot-plugin/plugin.json # optional compat
├── AGENTS.md
├── ai-plugin.json
├── mcp.json
├── scripts/                    # package-level helpers (MCP server, etc.) — use JS
├── runtime/                    # optional: upstream packages/build (if not skill-only)
├── package.json                # thin polyglot root (type: module)
├── README.md
└── LICENSE                     # from upstream when present
```

Folder name under `.agents/skills/` **must** exactly match `name:` in that skill’s frontmatter.

## Process (execute in order)

Use the bundled JS scripts under this skill’s `scripts/` directory. Prefer:

```bash
SKILL_SCRIPTS="{{path-to}}/polyglot-plugin/.agents/skills/convert-to-polyglot/scripts"
node "$SKILL_SCRIPTS/convert.mjs" \
  --source <git-url-or-path> \
  --dest <absolute-dest> \
  --name <package-name> \
  [--env-root UNDERSTAND_ANYTHING_ROOT] \
  [--runtime-subdir understand-anything-plugin] \
  [--exclude homepage,docs,READMEs,assets]
```

Or run phases manually as below.

### Phase 0 — Inspect source

1. Clone shallow if remote: `git clone --depth 1 <url> /tmp/<name>-src`
2. Map upstream structure:
   - Skills dirs (`skills/`, `.agents/skills/`, plugin root)
   - Agents (`agents/`)
   - Hooks (`hooks/`)
   - Manifests (`.claude-plugin/`, `.cursor-plugin/`, `.copilot-plugin/`)
   - Runtime monorepo (`packages/`, `pnpm-workspace.yaml`)
3. Record version, description, license from upstream manifests/`package.json`/`README`
4. List every `SKILL.md` and note line counts; anything **>480 lines** will be condensed later

```bash
node "$SKILL_SCRIPTS/inspect-source.mjs" --source <path>
```

### Phase 1 — Scaffold destination

```bash
node "$SKILL_SCRIPTS/scaffold-package.mjs" --dest <dest> --name <name>
```

Creates empty polyglot skeleton (dirs + stub files only if missing).

### Phase 2 — Vendor content

Copy **without** `node_modules` / `.git`:

| Upstream | Destination |
|---|---|
| `skills/*` or plugin `skills/*` | `.agents/skills/*` |
| `agents/*` | `.agents/agents/*` |
| `hooks/*` | `.agents/hooks/*` |
| `packages/*`, build configs, lockfiles | `runtime/` (if shipping runtime) |
| `LICENSE`, useful `install.sh` | package root (adapt paths later) |

Heuristics used for Understand-Anything:

- Plugin package lived at `understand-anything-plugin/` → became `runtime/` + skills lifted to `.agents/skills/`
- Do **not** leave duplicate `runtime/skills` or `runtime/agents` (canonical is `.agents/`)

```bash
node "$SKILL_SCRIPTS/vendor-source.mjs" \
  --source <src> \
  --dest <dest> \
  --runtime-subdir <optional-subdir> \
  --exclude homepage,docs,READMEs,assets
```

### Phase 3 — Normalize each skill

For every skill directory:

1. **Frontmatter** — ensure `name`, `description` (embedding trigger), `version`, `author`, `license`, `compatibility`
2. **`name:` == folder name**
3. **Move executables** into `scripts/` (`.mjs`, `.js`, `.py`, `.sh`); `chmod +x`
4. **Rewrite harness-specific paths**:
   - `${CLAUDE_PLUGIN_ROOT}` → `${PLUGIN_ROOT}` / `${{ENV_ROOT}}`
   - `.../skills/` → `${PLUGIN_ROOT}/.agents/skills/`
   - `.../agents/` → `${AGENTS_DIR}` → `${PLUGIN_ROOT}/.agents/agents/`
   - `.../packages/` → `${RUNTIME_ROOT}/packages/`
5. **Inject polyglot root resolution** block (bash) near top of instructions
6. **Neutralize harness jargon** lightly: “Task tool” → “subagent/task tool”; avoid hard Claude-only assumptions where a one-line neutral phrase works
7. **Condense if >480 lines**:
   - Write full body to `.agents/references/{{skill}}-full-protocol.md`
   - Keep phase headers + short summaries + pointer to full protocol in `SKILL.md`
8. Add **## Scripts and agents (polyglot paths)** listing scripts + shared agents + runtime paths

```bash
node "$SKILL_SCRIPTS/adapt-skills.mjs" \
  --dest <dest> \
  --env-root <ENV_ROOT_VAR> \
  --max-lines 480
```

### Phase 4 — Hooks and agents

- Rewrite hook paths to `.agents/hooks/` and `${ENV_ROOT:-${CLAUDE_PLUGIN_ROOT}}`
- Add `.agents/hooks/README.md` explaining how non-Claude harnesses should approximate hooks
- Path-rewrite agent markdown the same way as skills

### Phase 5 — Generate bridge artifacts

```bash
node "$SKILL_SCRIPTS/generate-bridges.mjs" --dest <dest> --name <name> --env-root <ENV_ROOT_VAR>
```

Produces:

| Artifact | Role |
|---|---|
| `.cursor/rules/{{skill}}.mdc` + umbrella rule | Cursor discovery |
| `.github/copilot-instructions.md` | VS Code Copilot |
| `.grok/config.toml` | `paths = ["./.agents/skills"]` |
| `AGENTS.md` | Codex / Devin / OpenCode |
| `ai-plugin.json` | Legacy OpenAI-style (`api.type: "none"` if instruction-led) |
| `mcp.json` + `scripts/mcp-server.mjs` | Optional stdio MCP (JS) |
| `.claude-plugin/plugin.json` etc. | Compat manifests pointing at `.agents/` |
| Root `package.json` | `type: module`, scripts for mcp/runtime |
| `README.md` | Install matrix + layout + differences from upstream |

**MCP policy:** Skills remain the primary interface. MCP exposes thin helpers only (package info, list skills, find graphs/artifacts, summarize). Implement MCP servers in **JavaScript** (`scripts/*.mjs`).

### Phase 6 — Validate

```bash
node "$SKILL_SCRIPTS/validate-package.mjs" --dest <dest>
```

Must pass:

- [ ] Every `.agents/skills/<name>/SKILL.md` has `name: <name>`
- [ ] No SKILL.md over 500 lines (warn) / fix if over
- [ ] Required bridges exist: `AGENTS.md`, `ai-plugin.json`, `mcp.json`, `README.md`, `.grok/config.toml`, `.github/copilot-instructions.md`, at least one `.cursor/rules/*.mdc`
- [ ] Skill scripts are under `scripts/` and executable
- [ ] No duplicate canonical trees under `runtime/skills` or `runtime/agents`
- [ ] MCP smoke test (initialize + tools/list) if `scripts/mcp-server.mjs` exists

### Phase 7 — Document differences from upstream

README must include:

- Upstream URL + version
- Layout map
- Env var for package root
- Runtime build steps (if any)
- Harness install matrix
- Explicit **differences from upstream** (path model, condensation, MCP, excluded dirs)

## Path resolution snippet (inject into skills)

Agents should resolve:

```bash
PLUGIN_ROOT="${{{ENV_ROOT}}:-${CLAUDE_PLUGIN_ROOT:-}}"
# fallbacks: walk from skill dir, ~/.agents/plugins/{{name}}, dest checkout
RUNTIME_ROOT="${PLUGIN_ROOT}/runtime"
AGENTS_DIR="${PLUGIN_ROOT}/.agents/agents"
```

Replace `{{ENV_ROOT}}` with the package env var (e.g. `UNDERSTAND_ANYTHING_ROOT`).

## Decision guide: skill-only vs runtime vendor

| Situation | Choice |
|---|---|
| Pure markdown skills + small scripts | Skill-only polyglot (no `runtime/`) |
| Upstream has parsers, dashboard, WASM, build | Vendor as `runtime/` and document `pnpm install && pnpm build` |
| Huge docs/marketing site | Exclude; link upstream |


## Abstract conversion model (use when scripts fail)

Scripts automate the **common path**. Unknown layouts still convert if you follow this model. Prefer adapting by hand using these invariants over inventing a new package shape.

### Invariants (always true)

1. **One canonical instruction tree** — every skill becomes `.agents/skills/<name>/SKILL.md` where folder name **equals** frontmatter `name:`.
2. **Executables live under `scripts/`** next to that skill (or package-level `scripts/` for MCP helpers). Never leave loose binaries at skill root.
3. **Shared non-skill prompts** go to `.agents/agents/` (analyzers, reviewers, personas).
4. **Lifecycle hooks** (if any) go to `.agents/hooks/` plus a short README for non-Claude harnesses.
5. **Overflow docs** (long protocols, command catalogs, upstream MCP notes) go to `.agents/references/`.
6. **Discovery bridges** always exist: Cursor rules, Copilot instructions, Grok config, `AGENTS.md`, `ai-plugin.json`, root `mcp.json` / `.mcp.json`.
7. **Harness-neutral root** via env var `{{ENV_ROOT}}` → `PLUGIN_ROOT`, with fallbacks (`CLAUDE_PLUGIN_ROOT`, walk-up, known install paths).
8. **Do not invent product behavior** — port structure and path semantics; keep upstream workflows intact.

### Inventory first (Phase 0)

Map the source into buckets before copying:

| Bucket | Look for |
|---|---|
| Skills | `skills/**/SKILL.md`, flat `skills/*.md`, `.agents/skills`, `.cursor/skills`, `.codex/skills`, single root `SKILL.md` |
| Agents | `agents/`, `.agents/agents/` |
| Hooks | `hooks/`, `hooks.json` |
| Commands | `commands/*.md` (Claude slash commands — treat as references or promote to skills if they are full workflows) |
| MCP | `.mcp.json`, `mcp.json`, `mcp_config.json`, `plugin.json` → `mcpServers` |
| Runtime | `packages/`, buildable monorepo, WASM, dashboards |
| Manifests | `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, marketplace entries |

If a layout is unknown: **search for `SKILL.md` and any `mcpServers` JSON first**, then expand outward. Match the on-disk manifest against [plugin-manifest-formats.md](references/plugin-manifest-formats.md).

### Transformation rules

**Skills**

- Dir skill → copy tree to `.agents/skills/<name>/`.
- Flat `skills/foo.md` → `.agents/skills/foo/SKILL.md` (synthesize frontmatter if missing).
- Single-root skill package → folder name from frontmatter `name:` or directory name.
- Condensation: if body > ~480 lines, keep summary SKILL.md + full text in `.agents/references/<name>-full-protocol.md`.

**Paths inside content**

Rewrite in this order (specific → general):

1. `…/agents/` → `${AGENTS_DIR}/` or `.agents/agents/`
2. `…/skills/` → `${PLUGIN_ROOT}/.agents/skills/`
3. `…/packages/` → `${RUNTIME_ROOT}/packages/`
4. `${CLAUDE_PLUGIN_ROOT}` / hard-coded plugin roots → `${PLUGIN_ROOT}` / `${ENV_ROOT}`
5. Soften harness-only jargon only when it blocks other agents (“Task tool” → subagent/task tool)

**MCP (critical)**

Upstream MCP is **capabilities**, not optional garnish:

1. Vendor original config to `.agents/references/mcp/` (preserve bytes).
2. Merge `mcpServers` into destination root `mcp.json` **and** `.mcp.json`.
3. Keep a small polyglot helper server (`scripts/mcp-server.mjs`) under a distinct server name.
4. Rewrite path tokens:
   - `${CLAUDE_PLUGIN_ROOT}` → `${ENV_ROOT}` or absolute package root
   - relative `./servers/...` → `${ENV_ROOT}/runtime/...` or vendored path
5. Document required env vars / OAuth in README (never hardcode secrets).
6. Prefer **stdio** for local servers; leave remote SSE/HTTP URLs as-is.
7. If MCP ships **beside** skills in a monorepo (not in the plugin subdir), still vendor it when the plugin manifest references it.

**Commands vs skills**

- Full workflow markdown with triggers → skill.
- Thin slash stubs → `.agents/references/commands/` and mention them from AGENTS.md.

**Runtime**

- If parsers/UI/build exist, vendor under `runtime/` and drop duplicate `runtime/skills|agents|hooks`.
- Document one build command; skills should reference `${RUNTIME_ROOT}`.

### When automation fails — manual algorithm

```
1. Inventory buckets (table above)
2. Choose ENV_ROOT name
3. Scaffold polyglot dirs
4. Normalize each skill into .agents/skills/<name>/
5. Move scripts; chmod +x; rewrite paths
6. Copy agents/hooks/commands/MCP/runtime into canonical homes
7. Generate bridges (or copy from a known-good polyglot package and edit names)
8. Merge MCP servers; rewrite roots
9. Validate: name match, bridges present, no runtime skill dups, mcp.json parses
10. Smoke: node scripts/mcp-server.mjs initialize; open one SKILL.md and walk the workflow
```

If a step is unclear, **preserve upstream files under `.agents/references/upstream-raw/`** rather than dropping them — better a messy reference than lost capability.

### Anti-patterns (scripts or manual)

- Shipping only bridges with empty `.agents/skills`
- Dropping upstream `.mcp.json` because “we already have a helper MCP”
- Leaving Claude-only roots as the sole resolution path
- Converting an entire marketplace monorepo as one package (convert **one plugin unit**)
- Renaming skill `name:` without renaming the folder
- HTTP MCP by default when stdio exists upstream


## Anti-patterns

- Leaving Claude-only `${CLAUDE_PLUGIN_ROOT}` as the sole root
- Folder name ≠ `name:` frontmatter
- Executables at skill root instead of `scripts/`
- 800+ line SKILL.md loaded by every harness (condense + references)
- Duplicating skills under both `.agents/skills` and `runtime/skills`
- HTTP MCP by default (prefer stdio)
- Python/bash for **new** package-level helpers — use **JS** per user preference for lightweight local tooling
- Inventing behavior not in upstream — port structure and paths; don’t rewrite product logic unless asked

## Bundled scripts

| Script | Purpose |
|---|---|
| `scripts/convert.mjs` | End-to-end orchestrator |
| `scripts/inspect-source.mjs` | Print source map (skills/agents/hooks/runtime) |
| `scripts/scaffold-package.mjs` | Create polyglot dirs |
| `scripts/vendor-source.mjs` | Copy upstream → dest layout |
| `scripts/adapt-skills.mjs` | Frontmatter, paths, condense, scripts section |
| `scripts/generate-bridges.mjs` | Bridges + MCP stub + README |
| `scripts/validate-package.mjs` | Checklist validation + optional MCP smoke test |
| `scripts/run-fixtures.mjs` | Clone/convert/validate fixtures (`priority` / `wave2` / `mcp` / `all`) |
| `scripts/lib/fs-utils.mjs` | Shared FS helpers |
| `scripts/lib/skill-md.mjs` | Frontmatter parse/serialize, condense, path rewrite |
| `scripts/lib/bridges.mjs` | Bridge file generators |

All scripts: `#!/usr/bin/env node`, ESM, dependency-free (Node stdlib only).



## Alternative harness formats (wave3)

These source layouts are **not** Claude/Codex/Cursor-primary. Scripts try common paths; use the abstract model when a layout is novel.

| Harness | Typical layout | Fixture examples |
|---|---|---|
| **Gemini CLI** | `skills/*/SKILL.md`, `gemini-extension.json`, optional `mcp_config.json` / `mcp_server.py`, `GEMINI.md`, `commands/*.toml` | gemini-api-skills, gemini-skills-extension, agentic-design-patterns-extension, gemini-cli-skillz |
| **OpenCode** | `.opencode/skills/`, `opencode.json` plugins, or plugin packages with `plugin.ts` | opencode-agent-skills, opencode-skills-malhashemi |
| **GitHub Copilot** | `plugin.json` under `.github/plugin/`, `agents/*.agent.md`, `skills/*/SKILL.md`, optional `.mcp.json` | copilot-context-engineering, copilot-frontend-web-dev, copilot-database-data-management |
| **Antigravity** | `.agent/skills/` (**singular**), `.agent/mcp_config.json`, workflows | agentic-stack, ag-kit |
| **Hermes** | agentskills.io `SKILL.md` trees for `~/.hermes/skills/` | awesome-hermes-skills |
| **Windsurf / Cline / Roo / Aider** | Often **emitted adapters** (`.windsurf/skills`, `.clinerules`, `.roo/rules`, `CONVENTIONS.md`) from a canonical skills source | softspark-ai-toolkit-app, agent-skill-creator, cc-sdd |

### Extra inventory buckets for alt harnesses

| Bucket | Also look for |
|---|---|
| Skills | `.agent/skills`, `.gemini/skills`, `.opencode/skills`, `.windsurf/skills`, `.cline/skills`, `.roo/skills`, `.kiro/skills`, `.goose/skills`, `.github/skills`, `app/skills` |
| Agents | `agents/*.agent.md` (Copilot), `.opencode/agents/`, `.agent/agents/` |
| Commands | Gemini `commands/*.toml`, OpenCode commands, Copilot prompts |
| MCP | `gemini-extension.json` → `mcpServers`, `.agent/mcp_config.json`, Copilot `.mcp.json` |
| Manifests | `gemini-extension.json`, Copilot `.github/plugin/plugin.json`, OpenCode `opencode.json` / plugin entry |

When converting **generated adapters** (Windsurf plain `.md` rules, Aider `CONVENTIONS.md`): either convert the **canonical SKILL.md source** (preferred) or promote each rule file into a synthetic skill directory.


## Fixture test matrix

Targets live in [references/fixtures.json](references/fixtures.json).

| Set | Count | Purpose |
|---|---:|---|
| `priority` | 8 | First smoke matrix (Claude/Cursor/Codex-heavy) |
| `wave2` | 20 | Broader + **12 MCP-bundled** |
| `wave3` | 15 | **Alt harnesses** (Gemini, OpenCode, Copilot, Antigravity, Hermes, multi) |
| `mcp` | 13+ | Only fixtures with `hasMcp: true` |
| `all` | priority+wave2+wave3+catalog | Full catalog |

```bash
node "$SKILL_SCRIPTS/run-fixtures.mjs" --set priority --dry-run
node "$SKILL_SCRIPTS/run-fixtures.mjs" --set wave2
node "$SKILL_SCRIPTS/run-fixtures.mjs" --set wave3
node "$SKILL_SCRIPTS/run-fixtures.mjs" --set mcp
node "$SKILL_SCRIPTS/run-fixtures.mjs" --only official-github,cursor-notion-plugin
```

Reports: `~/Developer/harness-plugins/convert-fixtures-report-<set>.{json,md}`

## Reference notes
See [references/plugin-manifest-formats.md](references/plugin-manifest-formats.md) for every manifest family encountered (Claude, Cursor, Codex, Copilot, Gemini, MCP variants, polyglot bridges) with real field notes and gotchas.



See [references/conversion-playbook.md](references/conversion-playbook.md) for the Understand-Anything case study and edge cases.

## Relationship to `polyglot-plugin` skill

- **`polyglot-plugin`**: create a new skill/plugin from a purpose/description
- **`convert-to-polyglot`**: migrate an existing harness-specific plugin into that shape

After conversion, the destination package should itself satisfy the `polyglot-plugin` validation rules.