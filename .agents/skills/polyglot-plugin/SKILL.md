---
name: polyglot-plugin
description: "Generate a universal polyglot plugin package that works across all major AI agents and harnesses (Claude Code, Cursor, Devin, Kiro, Warp/Oz, Codex, Grok Build, VSCode Copilot, OpenCode). Use this skill when the user wants to create a plugin, skill, or tool package that should be portable and discoverable by multiple agents. Triggers on: 'create a plugin', 'make this work in all agents', 'polyglot plugin', 'universal skill', 'cross-agent compatible', 'agent plugin', 'portable skill package', or when the user has built something for one agent and wants it to work everywhere."
version: "1.0.0"
author: "tariqwest"
license: "MIT"
---

# Polyglot Plugin Generator

Generate a universal plugin package that is simultaneously discoverable and usable by all major AI agent platforms.

## When to Use

- User wants to create a new plugin/skill that works across multiple agents
- User has an existing single-agent skill and wants to make it portable
- User asks for a "universal" or "cross-agent" plugin
- User wants to publish a tool that any coding agent can pick up

## Core Concept

No single file format satisfies every agent. Instead, we produce a **polyglot package** — a directory that contains the correct discovery artifact for each major agent, all pointing at one canonical source of truth: the `SKILL.md`.

## Package Structure

Generate this exact layout (adjust `{{skill-name}}` throughout):

```
{{skill-name}}/
├── .agents/
│   └── skills/
│       └── {{skill-name}}/
│           ├── SKILL.md          # Canonical source of truth
│           ├── scripts/          # Executable tools (Python/Bash)
│           ├── references/       # Static knowledge docs
│           └── assets/           # Templates, raw data
├── .cursor/
│   └── rules/
│       └── {{skill-name}}.mdc   # Cursor discovery (imports SKILL.md)
├── .github/
│   └── copilot-instructions.md  # VSCode Copilot discovery
├── .grok/
│   └── config.toml              # Grok Build discovery
├── AGENTS.md                    # Codex/OpenAI Agents discovery
├── ai-plugin.json               # Legacy OpenAI plugin manifest
├── mcp.json                     # MCP server definition (Claude Code, Cursor, Kiro)
└── README.md                    # Human documentation
```

## Step-by-Step Generation Process

### 1. Gather Requirements

Ask the user (or infer from context):

1. **Name**: kebab-case identifier for the plugin (e.g. `postgres-optimizer`)
2. **Purpose**: What does this plugin enable the agent to do?
3. **Trigger phrases**: When should agents activate this? (user phrases, file patterns, contexts)
4. **Tools/Scripts**: Does it expose executable tools, or is it instruction-only?
5. **Dependencies**: External CLIs, runtimes, or APIs required (e.g. `python3`, `psql`, `node`)
6. **Auth**: Does it need API keys or OAuth? (`none`, `api_key`, `oauth`)

### 2. Write the Canonical SKILL.md

This is the single source of truth. All other artifacts derive from or reference it.

```markdown
---
name: "{{skill-name}}"
description: "{{trigger-optimized description — written for embedding match, not humans}}"
version: "1.0.0"
author: "{{author}}"
license: "MIT"
compatibility: "requires: {{comma-separated dependencies}}"
---

# {{Skill Title}}

## When to Use
{{Explicit trigger conditions — contexts, user phrases, file patterns}}

## Instructions
{{Step-by-step reasoning logic the agent should follow}}

## Scripts
{{If applicable, list scripts in scripts/ and when to call them}}

## References
{{If applicable, point to files in references/ with guidance on when to read them}}
```

**Description engineering rules:**
- Write for the agent's embedding/matching system, not for humans
- Include explicit trigger phrases and contexts
- Bad: "A tool for databases."
- Good: "Use this skill when the user asks to analyze, debug, or optimize SQL queries, or when EXPLAIN ANALYZE results are pasted."

### 3. Generate Bridge Artifacts

#### .cursor/rules/{{skill-name}}.mdc

Cursor does not look in `.agents/` by default. Create a rule file that imports the skill:

```markdown
---
description: {{Same description from SKILL.md}}
globs: {{relevant file globs if applicable, otherwise omit}}
---

{{Full content of SKILL.md body, or a directive to read it}}
```

If the SKILL.md is short (<100 lines), inline the full content. If longer, use:

```markdown
Read and follow the instructions in `.agents/skills/{{skill-name}}/SKILL.md`
```

#### .github/copilot-instructions.md

VSCode Copilot reads this file for workspace-level instructions:

```markdown
# {{Skill Title}}

{{Condensed version of SKILL.md instructions, focused on what Copilot needs}}
```

#### .grok/config.toml

```toml
[skills]
paths = ["./.agents/skills"]
```

#### AGENTS.md

Codex and some OpenAI agents look for this at the repo root:

```markdown
# {{Skill Title}}

{{Full SKILL.md body content}}
```

#### ai-plugin.json

The legacy OpenAI plugin manifest. Required for generic plugin harnesses:

```json
{
  "schema_version": "v1",
  "name_for_human": "{{Human-readable name}}",
  "name_for_model": "{{skill-name}}",
  "description_for_human": "{{One-line human description}}",
  "description_for_model": "{{Full trigger-optimized description from SKILL.md}}",
  "auth": {
    "type": "{{none | service_http | oauth}}"
  },
  "api": {
    "type": "openapi",
    "url": "{{URL to OpenAPI spec, or omit if instruction-only}}"
  },
  "logo_url": "",
  "contact_email": "",
  "legal_info_url": ""
}
```

For instruction-only plugins (no live API), set `"api": {"type": "none"}`.

#### mcp.json

For plugins that expose executable tools, define them as an MCP server:

```json
{
  "mcpServers": {
    "{{skill-name}}": {
      "command": "{{runtime — e.g. python3, node, bash}}",
      "args": ["{{path to entry script — e.g. .agents/skills/skill-name/scripts/server.py}}"],
      "env": {}
    }
  }
}
```

For instruction-only plugins (no executable tools), create a minimal mcp.json that documents the plugin exists but exposes no server:

```json
{
  "_comment": "This plugin is instruction-only. No MCP server is needed.",
  "mcpServers": {}
}
```

### 4. Write Scripts (if applicable)

Place all executable logic in `scripts/`:

- Use standard shebangs: `#!/usr/bin/env python3` or `#!/usr/bin/env bash`
- Never use hardcoded paths
- Verify dependencies at runtime before executing:
  ```bash
  if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed." >&2
    exit 1
  fi
  ```
- For MCP tool servers, implement JSON-RPC 2.0 over stdio exposing `tools`, `resources`, and/or `prompts`

### 5. Write the README.md

Human-facing documentation:

```markdown
# {{Skill Title}}

{{One-paragraph description}}

## Compatibility

| Agent / Harness | Discovery Path | Status |
|---|---|---|
| Claude Code | `.agents/skills/` + `mcp.json` | ✅ |
| Cursor | `.cursor/rules/` + `mcp.json` | ✅ |
| Kiro / Warp | `.agents/skills/` + `mcp.json` | ✅ |
| Devin | `.agents/skills/` | ✅ |
| Codex / OpenAI | `AGENTS.md` + `ai-plugin.json` | ✅ |
| Grok Build | `.grok/config.toml` | ✅ |
| VSCode Copilot | `.github/copilot-instructions.md` | ✅ |
| OpenCode | `.agents/skills/` | ✅ |

## Installation

Clone or copy this directory into your project root.

## Usage

{{How to use the plugin — trigger phrases, example interactions}}

## Dependencies

{{List of required tools/runtimes}}
```

### 6. Validate the Package

After generation, verify:

1. **Folder name matches**: The directory name under `.agents/skills/` matches the `name:` field in SKILL.md frontmatter exactly
2. **No broken references**: All paths in mcp.json, cursor rules, etc. resolve correctly
3. **Scripts are executable**: Run `chmod +x` on all scripts
4. **Description consistency**: The description appears (identically or adapted) in SKILL.md, ai-plugin.json, .cursor rule, and AGENTS.md
5. **Shebangs present**: Every script starts with `#!/usr/bin/env <runtime>`

## Critical Rules

- The folder name under `.agents/skills/` MUST match the `name:` field in SKILL.md. Kiro and other agents fail silently if these mismatch.
- The `description` field is an embedding trigger, not human documentation. Optimize it for semantic retrieval.
- Scripts must verify their own dependencies — agents run in varied sandboxed environments.
- Keep SKILL.md under 500 lines. Use `references/` for large docs with clear pointers from the main file.
- For MCP servers, use stdio transport (not HTTP) for maximum portability.

## Conversion: Existing Single-Agent Skill → Polyglot

If the user already has a skill for one agent:

1. Identify the canonical content (instructions, scripts, config)
2. Place it into the `.agents/skills/{{name}}/` structure as SKILL.md + scripts
3. Generate all bridge artifacts from the canonical content
4. Validate folder name matching and description consistency
