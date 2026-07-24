---
name: plug-me-in
description: "Install any skill, plugin, MCP server, marketplace, or repo into the user's current AI harness. Use whenever the user wants to add a capability to Claude Code, Cursor, Codex, Copilot, Gemini, OpenCode, Warp/Oz, Windsurf, Cline, Roo, Antigravity, Hermes, Aider, or similar — including phrases like plug me in, install this skill, add this plugin, wire up this MCP, install from marketplace, get this GitHub skill into my agent, how do plugins work in my harness, or pastes a link/path to a skill/plugin/MCP/repo. Prefer automation; fall back to clear manual steps. Also use when the user asks what their current harness calls plugins or how to extend it."
version: "1.0.0"
author: "tariqwest"
license: "MIT"
compatibility: "requires: node>=20; optional: git, gh, npx (skills CLI), bun"
---

# plug-me-in

Get a desired capability into **the harness the user is in right now** — explain that harness’s extension model, classify the source, then install via automation when possible, otherwise give exact manual steps.

This skill is the **consumer** path. Sibling skills:

| Skill | When |
|---|---|
| `polyglot-plugin` | Author a new multi-harness package from scratch |
| `convert-to-polyglot` | Port a single-harness plugin into the polyglot layout |
| **`plug-me-in`** | Install something into the **current** harness |

## Bundled scripts

Resolve scripts relative to this skill directory:

```bash
SKILL_ROOT="{{this-skill-dir}}"   # .../plug-me-in
SCRIPTS="$SKILL_ROOT/scripts"
CONVERT_SCRIPTS="$(dirname "$SKILL_ROOT")/convert-to-polyglot/scripts"
```

| Script | Purpose |
|---|---|
| `scripts/detect-harness.mjs` | Infer current harness from env/cwd/process clues |
| `scripts/classify-source.mjs` | Classify a URL/path as skill / plugin / MCP / marketplace / repo |
| `scripts/install.mjs` | Install into a target harness (project or global) |
| `scripts/explain-harness.mjs` | Print plugin-model summary for one harness |
| `references/harness-install-matrix.md` | Per-harness models, paths, CLIs, gotchas |
| `references/source-routing.md` | How to route each source type |

Prefer `node` (or `bun`) to run scripts. Dependency-free ESM.

---

## Workflow (always follow this order)

### 1. Detect the current harness

```bash
node "$SCRIPTS/detect-harness.mjs" [--cwd .] [--json]
```

Also use conversational clues:

- User says “in Claude / Cursor / Warp / Codex …”
- Tooling available only in one product (Warp Oz tools, Claude plugin CLI, Cursor rules UI)
- CWD markers: `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.agent/`, `.opencode/`, `AGENTS.md`

If ambiguous, ask once with a short list. Default bias: **project-level install** into the active workspace unless the user says “global” or “all my projects”.

Then load only the relevant section:

```bash
node "$SCRIPTS/explain-harness.mjs" --harness <id>
# or read references/harness-install-matrix.md for that harness
```

Explain in plain language:

1. What this harness calls extensions (skills / plugins / rules / MCP / extensions)
2. Where they live (project vs user)
3. Preferred install commands
4. What “success” looks like (file present, CLI list, reload)

### 2. Identify the desired capability

Gather:

1. **Source** — URL, local path, npm package, marketplace slug, or plain description
2. **Scope** — `project` (default) or `global`
3. **Name filter** (optional) — one skill inside a multi-skill repo
4. **Whether conversion is OK** — if source is wrong-harness, may convert via `convert-to-polyglot` then install

If the user only describes a capability (“I want Playwright browser tools”) and has no link:

1. Search known catalogs (`npx skills find …`, GitHub, official marketplaces)
2. Propose 1–3 candidates with maturity notes
3. Install the chosen one

### 3. Classify the source

```bash
node "$SCRIPTS/classify-source.mjs" --source <url-or-path> [--json]
```

Types:

| Type | Signals |
|---|---|
| `open-skill` | `SKILL.md` tree, agentskills.io layout, `npx skills`-friendly |
| `claude-plugin` | `.claude-plugin/plugin.json` |
| `cursor-plugin` | `.cursor-plugin/plugin.json` or rules pack |
| `codex-plugin` | `.codex-plugin/plugin.json` |
| `copilot-plugin` | `.github/plugin/plugin.json` / root `plugin.json` |
| `gemini-extension` | `gemini-extension.json` |
| `mcp-only` | `.mcp.json` / `mcp.json` / bare server map, little else |
| `marketplace` | `marketplace.json` listing many plugins |
| `polyglot` | `.agents/skills` + bridges (`AGENTS.md`, multi-manifest) |
| `skills-repo` | Many `**/SKILL.md`, no single plugin unit |
| `unknown` | Needs inspect / clone |

For remote git URLs, shallow-clone to a temp dir when classification needs the tree:

```bash
git clone --depth 1 <url> /tmp/plug-me-in-<slug>
```

Use `convert-to-polyglot`’s inspector when helpful:

```bash
node "$CONVERT_SCRIPTS/inspect-source.mjs" --source <path>
```

Deep format notes: sibling skill `convert-to-polyglot/references/plugin-manifest-formats.md`.

### 4. Choose install strategy

Decision tree:

```
source type × current harness
│
├─ open-skill / polyglot skill tree
│   ├─ Prefer: npx skills add <pkg> -a <agent> -y   (when CLI maps to harness)
│   └─ Else: copy/symlink SKILL.md tree into harness skill path
│
├─ native plugin for THIS harness
│   └─ Use harness-native install (claude plugin, gemini extensions, cursor plugin path)
│
├─ plugin for a DIFFERENT harness
│   ├─ If user wants “just make it work here”:
│   │   convert-to-polyglot → install polyglot bridges for current harness
│   └─ If user only needs skills/MCP subset: extract that subset and install natively
│
├─ mcp-only
│   └─ Merge server entry into harness MCP config (see matrix)
│
├─ marketplace
│   └─ Do NOT install whole catalog. List plugins; user picks one unit; install that unit
│
└─ unknown
    └─ Inventory → pick closest type → proceed or manual steps
```

Never install an entire marketplace as one package.

### 5. Execute install

```bash
node "$SCRIPTS/install.mjs" \
  --source <url-or-path> \
  --harness <id> \
  --scope project|global \
  [--cwd <project-root>] \
  [--name <skill-or-plugin-name>] \
  [--dest <override-dest>] \
  [--convert] \
  [--dry-run] \
  [--yes]
```

Behavior of `install.mjs`:

1. Classify source (unless already known)
2. Resolve install paths for harness + scope
3. Pick method: `skills-cli` | `copy-skill` | `merge-mcp` | `native-cli` | `convert-then-install` | `manual`
4. Perform filesystem / CLI actions (or print plan with `--dry-run`)
5. Print a short **verification** checklist

When `--convert` is set (or auto when source harness ≠ target and full plugin needed):

```bash
node "$CONVERT_SCRIPTS/convert.mjs" \
  --source <src> \
  --dest "${DEST:-$HOME/Developer/harness-plugins/<name>}" \
  --name <name>
# then install from dest into current harness paths
```

Default convert dest: `~/Developer/harness-plugins/<name>` (existing convention).

### 6. Verify and report

Always finish with:

1. What was installed (paths)
2. Scope (project/global)
3. How to activate (reload window, new session, `/reload`, restart MCP)
4. How to confirm (`npx skills list`, harness-specific list, open file)
5. Env vars / secrets still needed (never write secrets; name them)
6. If partial: what landed vs what needs manual UI steps

---

## Harness quick map

Read full details in [references/harness-install-matrix.md](references/harness-install-matrix.md). Summary:

| ID | Calls them | Primary skill path (project) | MCP config (typical) | Fast install |
|---|---|---|---|---|
| `claude-code` | plugins, skills, MCP | `.claude/skills/`, plugin dirs | `.mcp.json` / plugin `.mcp.json` | `/plugin`, marketplace, copy skills |
| `cursor` | rules, skills, MCP, plugins | `.cursor/rules/`, `.cursor/skills/`, `.agents/skills/` | `.cursor/mcp.json` | copy + MCP merge; `npx skills` |
| `codex` | skills, plugins | `.agents/skills/`, `AGENTS.md` | project MCP if used | copy skills / polyglot |
| `copilot` | plugins, instructions | `.github/` plugin + `copilot-instructions.md` | `.mcp.json` / VS Code MCP | copy plugin unit |
| `gemini` | extensions, skills | `.gemini/skills/`, `~/.gemini/skills/` | extension / `mcp_config.json` | `gemini extensions install` |
| `opencode` | skills, plugins | `.opencode/skills/`, `.agents/skills/` | opencode config | copy skills |
| `warp` / `oz` | skills, MCP, rules | `.agents/skills/`, Warp Drive | Warp MCP settings | copy skills + MCP UI/config |
| `windsurf` | rules, MCP | `.windsurf/rules/` | windsurf MCP | copy rules |
| `cline` | rules, MCP | `.clinerules` / `.cline/rules` | cline MCP | copy |
| `roo` | rules, MCP | `.roo/rules` | roo MCP | copy |
| `antigravity` | skills | `.agent/skills/` (**singular**) | `.agent/mcp_config.json` | copy |
| `hermes` | skills | `~/.hermes/skills/` | n/a / MCP if configured | copy |
| `aider` | conventions | `CONVENTIONS.md` | n/a | append guidance |
| `grok` | skills | `.agents/skills/` + `.grok/config.toml` | optional | copy + grok config |

When harness is unknown, install **Open Skills** shape into `.agents/skills/<name>/` and mention bridges.

---

## Source-type playbooks

Detail: [references/source-routing.md](references/source-routing.md).

### A. Pure skill pack (`SKILL.md`)

1. Try `npx skills add <owner/repo> -a <agent> -s <skill> -y` with agent mapping from matrix
2. Else copy to harness skill dir: folder name **must** match frontmatter `name:`
3. For Cursor, also ensure a `.cursor/rules/<name>.mdc` pointer if the harness won’t read `.agents/`

### B. Full plugin (Claude/Cursor/Codex/Copilot)

- **Same harness:** native path (plugin marketplace add, copy plugin dir to expected location)
- **Different harness:** convert → install polyglot subset for current harness
- **Marketplace JSON:** list `plugins[]`, pick one `source`, recurse as single plugin

### C. MCP server only

1. Normalize to `{ "mcpServers": { "<id>": { ... } } }` (wrap bare maps)
2. Merge into harness MCP file without dropping existing servers
3. Rewrite path tokens (`${CLAUDE_PLUGIN_ROOT}` → real path) when local stdio
4. Tell user which env vars to set; do not embed secrets

### D. GitHub / local repo of mixed content

1. `classify-source` + `inspect-source`
2. If multiple plugin units, ask which unit (or install skills-only tree)
3. Prefer smallest install that delivers the asked capability

### E. npm / npx MCP packages

```text
{ "command": "npx", "args": ["-y", "@scope/package"] }
```

Merge into MCP config; prefer `-y` for npx.

---

## Safety and UX

- Prefer **project** scope; global only when asked or no project root
- Never overwrite MCP configs blindly — merge keys; back up when rewriting
- Never commit secrets; reference `{{ENV_NAME}}` style placeholders
- Don’t convert entire marketplaces
- Don’t invent product features the source doesn’t ship
- If automation can’t run (no network, sandbox), print complete manual steps from the matrix
- After destructive-ish merges, show a diff summary of what changed

---

## Output template (user-facing)

Use this structure when reporting:

```markdown
## Harness
- Detected: <name> (<id>)
- Plugin model: <one sentence>

## Source
- Input: <url/path>
- Classified as: <type>
- Strategy: <skills-cli | copy | mcp-merge | convert+install | manual>

## Actions taken
- ...

## Installed paths
- ...

## Activate
- ...

## Verify
- ...

## Still needed (if any)
- env: ...
- UI clicks: ...
```

---

## Examples

**Example 1 — skill link in Cursor**

User: “Add https://github.com/vercel-labs/agent-skills into Cursor”

1. detect → `cursor`
2. classify → `open-skill` / skills-repo
3. `npx skills add vercel-labs/agent-skills -a cursor -y` or `install.mjs --harness cursor`
4. Report `.cursor` / `.agents` paths + reload

**Example 2 — Claude plugin while in Warp**

User: “I want this Claude plugin in Warp: https://github.com/org/foo-plugin”

1. detect → `warp`
2. classify → `claude-plugin`
3. convert-to-polyglot → `~/Developer/harness-plugins/foo-plugin`
4. Install `.agents/skills` into Warp skill path; merge MCP if present
5. Explain Warp doesn’t load Claude marketplaces natively

**Example 3 — MCP only**

User: “Plug Playwright MCP into my project”

1. detect harness
2. classify intent → mcp-only
3. Merge playwright stdio server into harness MCP file
4. Verify with harness MCP list / restart

**Example 4 — explain only**

User: “How do plugins work in Claude Code?”

1. detect or take `claude-code`
2. `explain-harness.mjs --harness claude-code`
3. No install unless they name a source

---

## Anti-patterns

- Installing without detecting harness first
- Dumping a whole marketplace into the project
- Replacing `mcp.json` instead of merging
- Leaving folder name ≠ `name:` in SKILL.md
- Converting when a one-file skill copy would suffice
- Using Python/bash for new helpers here — keep automation in **JS**
- Pointing users only at polyglot authoring when they asked to **install**

---

## When to hand off

| User goal | Hand off to |
|---|---|
| Build a new multi-agent package | `polyglot-plugin` |
| Port upstream plugin to polyglot layout as the main deliverable | `convert-to-polyglot` |
| Just use something in the current agent | **this skill** (may call convert as a step) |
