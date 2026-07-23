# Plugin manifest formats & package structures

Field notes from flexing `convert-to-polyglot` across Claude, Cursor, Codex, Copilot, Gemini, OpenCode, Antigravity, Hermes, and multi-harness packs (priority / wave2 / wave3 fixtures).

Use this when inventorying an unknown plugin: **identify the manifest family first**, then map component paths into the polyglot layout.

---

## Quick map

| Family | Manifest path(s) | Typical components | Seen in |
|---|---|---|---|
| Claude Code plugin | `.claude-plugin/plugin.json` | `skills/`, `agents/`, `hooks/`, `.mcp.json`, `commands/` | official plugins, ccc/deckling, superpowers, understand-anything upstream |
| Claude marketplace | `.claude-plugin/marketplace.json` | `plugins[]` with `source` paths/git | claude-plugins-official, night-market, tons-of-skills |
| Cursor plugin | `.cursor-plugin/plugin.json` | `skills/`, `rules/`, `mcp.json`, agents | cursor/plugins (ralph-loop), polyglot bridges |
| Cursor rules (not full plugin) | `.cursor/rules/*.mdc` | frontmatter `description`/`globs`/`alwaysApply` | many repos |
| Codex plugin | `.codex-plugin/plugin.json` + often `.agents/plugins/marketplace.json` | `skills/`, agents | addyosmani/agent-skills, wshobson |
| Copilot plugin | `.github/plugin/plugin.json` or root `plugin.json` | `agents[]`, `skills[]` (paths may be monorepo-relative), hooks, `.mcp.json` | github/awesome-copilot |
| Copilot marketplace | `.github/plugin/marketplace.json` | `plugins[]` registry | awesome-copilot |
| Gemini extension | `gemini-extension.json` | `skills/`, `commands/*.toml`, `agents/`, `mcpServers`, `GEMINI.md` | agentic-design-patterns-extension, Giorgioeab/gemini-skills |
| Gemini/Antigravity MCP | `mcp_config.json` or `.agent/mcp_config.json` | MCP server map | ag-kit, gemini kits |
| OpenAI legacy plugin | `ai-plugin.json` | `name_for_model`, `api`, `auth` | polyglot output, ChatGPT-era |
| Polyglot / Open Skills | `AGENTS.md` + `.agents/skills/*/SKILL.md` | optional `.grok/config.toml` | convert-to-polyglot destination |
| MCP configs (cross-cutting) | `.mcp.json`, `mcp.json`, bare server map, `mcpServers` inline | stdio / http / sse servers | almost every modern plugin |

---

## 1. Claude Code plugin — `.claude-plugin/plugin.json`

### Location
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # ONLY the manifest lives here
├── skills/<name>/SKILL.md   # preferred
├── skills/<name>.md         # flat skill files also seen (deckling)
├── agents/*.md
├── hooks/hooks.json         # or hooks.json at root
├── commands/*.md
└── .mcp.json                # optional MCP at plugin root (NOT inside .claude-plugin/)
```

### Fields (observed)
| Field | Required | Notes |
|---|---|---|
| `name` | yes | kebab-case slug; skill namespace prefix |
| `description` | common | marketplace blurb |
| `version` | optional | if omitted, git SHA may act as version |
| `author` | optional | `{ "name": "..." }` |
| `keywords` / `repository` / `license` | optional | packaging metadata |
| path fields | optional | some manifests omit paths and rely on **default directories** (`skills/`, `agents/`, `hooks/`) |

### Examples

**Minimal official external plugin** (`anthropics/claude-plugins-official` → Asana/GitHub-style):
```json
{
  "name": "github",
  "description": "Official GitHub MCP server for repository management...",
  "author": { "name": "GitHub" }
}
```
Often paired with **MCP-only** content (no `skills/` tree).

**Richer plugin** (Understand-Anything upstream skill package style):
```json
{
  "name": "understand-anything",
  "description": "AI-powered codebase understanding...",
  "version": "2.9.4",
  "author": { "name": "Egonex" },
  "keywords": ["claude-plugin", "knowledge-graph"],
  "repository": "https://github.com/Egonex-AI/Understand-Anything",
  "license": "..."
}
```

**Polyglot bridge retarget** (after conversion):
```json
{
  "name": "understand-anything",
  "description": "...",
  "version": "2.9.4",
  "author": { "name": "polyglot port" },
  "skills": "./.agents/skills/",
  "agents": "./.agents/agents/",
  "hooks": "./.agents/hooks/hooks.json"
}
```

### Skill shapes under Claude plugins
1. **Directory skills:** `skills/<name>/SKILL.md` (+ `scripts/`, `references/`)
2. **Flat skills:** `skills/<name>.md` (ccc `deckling-pptx.md`) → converter promotes to dir + `SKILL.md`
3. **MCP-only:** only `.mcp.json` + manifest → converter synthesizes a thin orientation skill

### Claude marketplace — `.claude-plugin/marketplace.json`
```json
{
  "name": "my-marketplace",
  "owner": { "name": "..." },
  "plugins": [
    {
      "name": "quality-review-plugin",
      "source": "./plugins/quality-review-plugin",
      "description": "..."
    }
  ]
}
```
`source` may be a relative path, git URL, or git-subdir object. **Convert one plugin unit**, not the whole marketplace.

---

## 2. Cursor plugin — `.cursor-plugin/plugin.json`

### Location
```
plugin-name/
├── .cursor-plugin/plugin.json
├── skills/                 # or rules/
├── rules/*.mdc
├── agents/                 # optional
├── hooks/                  # optional
└── mcp.json                # common name (not always .mcp.json)
```

### Example (official `ralph-loop` after polyglot bridge / similar shape)
```json
{
  "name": "ralph-loop",
  "description": "Iterative self-referential AI loops...",
  "version": "1.0.0",
  "skills": "./.agents/skills/",
  "agents": "./.agents/agents/"
}
```

Upstream Cursor marketplace repos often list plugins in root `.cursor-plugin/marketplace.json` with per-plugin directories at repo root.

### Cursor rules (lightweight, not a full plugin)
`.cursor/rules/*.mdc`:
```yaml
---
description: When to apply this rule
globs:
alwaysApply: false
---
# Title
Body...
```

---

## 3. Codex plugin — `.codex-plugin/plugin.json`

### Location
```
my-plugin/
├── .codex-plugin/plugin.json
├── skills/<name>/SKILL.md
└── (optional) .mcp.json / apps / hooks
```
Repo-level registry often at `.agents/plugins/marketplace.json`.

### Notes
- Skills are standard agentskills.io `SKILL.md`.
- Codex may enforce **skill size caps** (~8KB descriptions/list); long skills should condense.
- Invocation differs (`$skill` / `@skill`) but on-disk format matches Open Skills.

---

## 4. GitHub Copilot plugin — `.github/plugin/plugin.json`

### Location (two patterns)

**A. Self-contained plugin directory**
```
my-plugin/
├── .github/plugin/plugin.json   # or plugin.json at root
├── agents/*.agent.md
├── skills/<name>/SKILL.md
├── hooks.json
└── .mcp.json
```

**B. Marketplace monorepo (awesome-copilot)** — critical for conversion:
```
awesome-copilot/
├── .github/plugin/marketplace.json
├── plugins/context-engineering/
│   ├── .github/plugin/plugin.json   # paths are RELATIVE but targets live at REPO ROOT
│   └── README.md
├── skills/context-map/SKILL.md      # ← actual skill bodies
└── agents/context-architect.agent.md
```

### Example (awesome-copilot `context-engineering`)
```json
{
  "name": "context-engineering",
  "description": "Tools and techniques for maximizing GitHub Copilot effectiveness...",
  "version": "1.0.0",
  "author": { "name": "Awesome Copilot Community" },
  "repository": "https://github.com/github/awesome-copilot",
  "license": "MIT",
  "keywords": ["context", "productivity", "refactoring"],
  "agents": ["./agents/context-architect.md"],
  "skills": [
    "./skills/context-map/",
    "./skills/refactor-plan/",
    "./skills/what-context-needed/"
  ]
}
```

### Conversion rule
Resolve `skills[]` / `agents[]` against:
1. plugin directory  
2. parent dirs up to monorepo root (`../`, `../../`, …)  
Because `./skills/foo` often means **repo-root** `skills/foo`, not `plugins/<id>/skills/foo`.

### Agent file naming
Copilot agents frequently use `*.agent.md`. Polyglot port maps them to `.agents/agents/*.md`.

### Copilot marketplace entry shape (abbreviated)
```json
{
  "name": "awesome-copilot",
  "owner": { "name": "..." },
  "plugins": [
    {
      "name": "context-engineering",
      "source": "./plugins/context-engineering",
      "description": "..."
    }
  ]
}
```

---

## 5. Gemini CLI extension — `gemini-extension.json`

### Location
```
my-extension/
├── gemini-extension.json
├── GEMINI.md                 # contextFileName
├── skills/<name>/SKILL.md
├── commands/*.toml           # slash commands
├── agents/*.md               # subagents
├── mcp_server.py             # optional bundled server
└── mcp_config.json           # alternate MCP config name
```

### Example (agentic-design-patterns-extension)
```json
{
  "name": "agentic-design-patterns",
  "version": "2.2.5",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "skill-search": {
      "command": "python3",
      "args": ["mcp_server.py"]
    }
  },
  "settings": [
    {
      "name": "GEMINI_MODEL",
      "description": "Model override",
      "envVar": "GEMINI_MODEL",
      "sensitive": false
    }
  ]
}
```

### Related paths
| Path | Role |
|---|---|
| `.gemini/skills/` | workspace skills |
| `~/.gemini/skills/` | user skills |
| `.agents/skills/` | alias tier (interoperable) |
| `.agent/skills/` | **Antigravity singular** (not `.agents`) |
| `mcp_config.json` | MCP map (Gemini/Antigravity kits) |

---

## 6. MCP configuration formats (cross-harness)

### A. Standard wrapper (most common after merge)
```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### B. Bare server map (official Claude external plugins)
File is still named `.mcp.json` but **omits** the `mcpServers` key:
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```
```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}" }
  }
}
```
Converter must detect “object of server configs” (`command` | `url` | `type`) and wrap/merge.

### C. Cursor / VS Code alternate key
Some files use `"servers"` instead of `"mcpServers"`:
```json
{
  "servers": {
    "github-agentic-workflows": {
      "command": "gh",
      "args": ["aw", "mcp-server"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### D. stdio vs remote
| Transport | Fields | Example |
|---|---|---|
| stdio | `command`, `args`, `env` | Playwright npx, local node servers |
| http | `type: "http"`, `url`, `headers` | GitHub, Linear |
| sse | `type: "sse"`, `url` | hosted OAuth MCP |
| docker | `command: "docker"`, `args: ["run", ...]` | containerized MCP |

### E. Path tokens inside MCP configs
| Token | Ecosystem |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | Claude plugins |
| `${PLUGIN_ROOT}` | some Copilot/OpenPlugin |
| `${workspaceFolder}` | VS Code/Cursor |
| `${GEMINI_PROJECT_DIR}` | Gemini |
| env vars `${API_TOKEN}` | universal |

Polyglot rewrite target: package env root (`${UNDERSTAND_ANYTHING_ROOT}`, etc.) or absolute paths under the converted package.

### F. Polyglot merge policy
Destination always keeps:
1. **Helper server** — `scripts/mcp-server.mjs` under the package name key  
2. **Upstream servers** — vendored originals in `.agents/references/mcp/` and merged into root `mcp.json` **and** `.mcp.json`  
Never drop upstream MCP because a helper exists.

---

## 7. OpenAI-style `ai-plugin.json` (legacy / bridge)

```json
{
  "schema_version": "v1",
  "name_for_human": "Understand Anything",
  "name_for_model": "understand_anything",
  "description_for_human": "...",
  "description_for_model": "Use when...",
  "auth": { "type": "none" },
  "api": { "type": "none" },
  "legal_info_url": "https://github.com/..."
}
```
Instruction-only polyglot packages use `api.type: "none"`. Live HTTP plugins point `api` at an OpenAPI URL.

---

## 8. Polyglot destination structure (canonical)

What `convert-to-polyglot` emits / expects:

```
package/
├── .agents/
│   ├── skills/<name>/SKILL.md    # name: == folder
│   ├── agents/                   # shared prompts
│   ├── hooks/                    # optional
│   └── references/               # overflow + upstream MCP copies
├── .cursor/rules/*.mdc
├── .github/copilot-instructions.md
├── .grok/config.toml
├── .claude-plugin/plugin.json
├── .cursor-plugin/plugin.json
├── .copilot-plugin/plugin.json
├── AGENTS.md
├── ai-plugin.json
├── mcp.json
├── .mcp.json                     # alias for Claude-style discovery
├── scripts/mcp-server.mjs
└── runtime/                      # optional vendored build
```

`.grok/config.toml` example:
```toml
[skills]
paths = ["./.agents/skills"]

[project]
name = "understand-anything"
description = "..."
```

---

## 9. Skill file formats (content, not package manifests)

| Format | Path | Frontmatter |
|---|---|---|
| Open Agent Skills | `**/SKILL.md` | `name`, `description` required; optional `version`, `compatibility`, `license`, `allowed-tools` |
| Flat Claude skill | `skills/foo.md` | may lack frontmatter → synthesize on convert |
| Copilot agent | `*.agent.md` | `name`, `description`, `tools`, `model`, … |
| Cursor rule | `*.mdc` | `description`, `globs`, `alwaysApply` |
| Windsurf / Cline / Roo rule | plain `.md` under rules dirs | frontmatter optional |
| Aider | `CONVENTIONS.md` | none (concatenated guidance) |
| Gemini command | `commands/*.toml` | tool-specific, not SKILL.md |

---

## 10. Inventory checklist for unknown packages

```
[ ] Find manifests (table in Quick map)
[ ] Classify: plugin vs marketplace vs extension vs skills-only tree
[ ] List skills: dir SKILL.md / flat md / manifest skills[] paths
[ ] List agents: agents/ / *.agent.md / manifest agents[]
[ ] List hooks: hooks.json / hooks/
[ ] List commands: commands/*.md / *.toml
[ ] List MCP: .mcp.json / mcp.json / bare map / inline mcpServers / mcp_config.json
[ ] Note monorepo: do relative paths escape the plugin subdirectory?
[ ] Note MCP-only: no skills tree but MCP present
[ ] Choose ENV_ROOT and convert ONE plugin unit
```

---

## 11. Gotchas encountered in fixtures

| Gotcha | Example | Handling |
|---|---|---|
| MCP-only official plugins | `external_plugins/github` | synthetic skill + vendor MCP |
| Bare `.mcp.json` without `mcpServers` | playwright/linear official | unwrap object-of-servers |
| Flat `skills/*.md` | deckling | promote to `skills/<name>/SKILL.md` |
| Copilot monorepo path indirection | awesome-copilot `plugins/*` | walk up to repo root for `./skills/...` |
| Antigravity **`.agent`** singular | ag-kit | discover `.agent/skills` |
| Gemini extension MCP in manifest | `gemini-extension.json` | treat `mcpServers` like MCP config |
| Deprecated OpenCode skill plugin | malhashemi/opencode-skills | prefer native skill trees / multi-harness sources |
| Marketplace vs plugin | any `marketplace.json` | don't convert entire catalog as one package |
| Long SKILL.md | superpowers, harness pipelines | condense + `.agents/references/*-full-protocol.md` |

---

## 12. Related files in this skill

- `fixtures.json` — priority / wave2 / wave3 / mcp conversion targets  
- `conversion-playbook.md` — case studies (Understand-Anything, MCP, wave3)  
- `../SKILL.md` — abstract conversion model + process  

When scripts fail on a novel manifest: **document the new shape here**, then extend `discoverSourceLayout` / vendor steps — do not invent a second destination layout.
