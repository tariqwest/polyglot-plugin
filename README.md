
## Skills in this repo

| Skill | Purpose |
|---|---|
| `polyglot-plugin` | Greenfield: generate a new polyglot plugin/skill package from a purpose description |
| `convert-to-polyglot` | Migration: convert an existing single-harness plugin (Claude/Cursor/etc.) into the polyglot layout — process captured from the Understand-Anything port |

```bash
# Convert an upstream plugin
node .agents/skills/convert-to-polyglot/scripts/convert.mjs \
  --source https://github.com/org/plugin \
  --dest ~/Developer/harness-plugins/my-plugin \
  --name my-plugin \
  --env-root MY_PLUGIN_ROOT
```

To achieve maximum compatibility across modern AI agents (Claude, Codex, Cursor, Devin, Warp, Kiro, Grok Build, etc.), you cannot rely on a single file format. instead, you must structure your plugin as a Polyglot Package. [1, 2, 3, 4, 5] 
The current "Gold Standard" for broad compatibility is the Open Agent Skills Standard (used by Devin, Claude, and Kiro) augmented with an MCP Server definition (for Cursor and advanced coding agents).
## The Universal "Polyglot" Package Structure
Create a root directory for your plugin (e.g., my-agent-plugin/). Inside, use this exact structure to satisfy the discovery logic of all major agents simultaneously. [6] 

my-agent-plugin/
├── .agents/                   # Universal discovery path (Devin, Codex, OpenCode)
│   └── skills/
│       └── my-skill-name/     # MUST match the `name` in SKILL.md
│           ├── SKILL.md       # The core logic (see Metadata below)
│           ├── scripts/       # Executable tools (Python/Bash)
│           ├── references/    # Static knowledge (PDFs, docs, CSVs)
│           └── assets/        # Templates and raw data
├── .cursor/
│   └── rules/                 # Cursor-specific discovery
│       └── my-skill.mdc       # Symlink to ../.agents/skills/my-skill-name/SKILL.md
├── .grok/
│   └── config.toml            # Grok Build specific discovery
├── ai-plugin.json             # Legacy/OpenAI standard manifest
├── mcp.json                   # Modern standard (Claude Code, Cursor, Kiro)
└── README.md                  # Human-readable documentation

------------------------------
## 1. The Core Artifact: SKILL.md (The Brain) [7, 8] 
This file is the single source of truth. Most agents (Devin, Antigravity, Kiro) will parse this directly. [9, 10, 11] 
Required Frontmatter (YAML):
Use these exact fields to ensure the agent "wakes up" when the user intends to use your plugin.

---name: "postgres-optimizer"        # ID-safe name (kebab-case)
description: "Analyzes PostgreSQL query performance, suggests indexes, and explains EXPLAIN ANALYZE output."
version: "1.0.0"
author: "YourName"
license: "MIT"compatibility: "requires: psql, python3" # Optional hint for the agent
---# Instructions(Your step-by-step reasoning logic goes here. Use <references> to point to files in the references/ folder.)

## 2. The Bridge Artifacts (The Connectors)
Different agents look for different "entry points." You must provide these specific files to map your skill to their system. [12] 

| Artifact File | Target Agents | Purpose |
|---|---|---|
| mcp.json | Claude Code, Cursor, Kiro | Defines your plugin as a "Server" that exposes tools. Crucial for execution-heavy plugins. |
| .cursor/rules/*.mdc | Cursor | Cursor does not look in .agents by default. Create a rule file that explicitly imports or symlinks your SKILL.md. |
| ai-plugin.json | OpenAI / ChatGPT | The classic standard. Required if you want to be usable by generic "Plugin" harnesses. |
| agenthub.json | Devin / Antigravity | Some versions of these agents use a JSON registry file to track installed skills if not found in .agents/. |

## 3. Critical Metadata for Cross-Agent Discovery
To ensure your plugin is actually found and activated by the AI, you must adhere to these metadata rules:

* Folder Name Matching: The folder name (my-skill-name/) MUST match the name: field in your SKILL.md frontmatter. Kiro and Antigravity often fail if these mismatch. [13] 
* Description Engineering: The description field is not for humans; it is the embedding trigger.
* Bad: "A tool for databases."
   * Good: "Use this skill when the user asks to analyze, debug, or optimize SQL queries, or when EXPLAIN ANALYZE results are pasted." [14, 15, 16, 17] 
* Script Portability:
* Place all executable logic in scripts/.
   * Use standard shebangs (#!/usr/bin/env python3) rather than hardcoded paths.
   * Devin/Opencode specific: These agents run in sandboxed Linux environments. Ensure your scripts verify dependencies (e.g., if ! command -v jq &> /dev/null) before running. [18] 

## 4. Special "Harness" Configuration

* Grok Build: Requires a .grok/config.toml that points to your skills folder:

[skills]
paths = ["./.agents/skills"]

* VSCode (Copilot): Doesn't natively load "Skills" broadly yet, but respects .github/copilot-instructions.md. You can script a build step to concatenate your SKILL.md content into that file for VSCode users. [19, 20] 


[1] [https://natesnewsletter.substack.com](https://natesnewsletter.substack.com/p/how-i-made-a-new-ai-discovery-a-coding)
[2] [https://e2b.dev](https://e2b.dev/blog/open-source-alternatives-to-devin)
[3] [https://www.youtube.com](https://www.youtube.com/watch?v=uRquE0FjvFk)
[4] [https://www.instagram.com](https://www.instagram.com/reel/DZsMKrpxetX/)
[5] [https://builtin.com](https://builtin.com/articles/what-is-cursor-ai)
[6] [https://levelup.gitconnected.com](https://levelup.gitconnected.com/building-claude-code-plugins-the-complete-developers-guide-b642c951cade)
[7] [https://medium.com](https://medium.com/@abhishekjainindore24/claude-7-skills-b093ab1e5cc3)
[8] [https://dev.to](https://dev.to/orkesconductor/deeper-dive-into-conductor-skills-teaching-ai-agents-to-orchestrate-workflows-ino)
[9] [https://www.oreilly.com](https://www.oreilly.com/radar/your-ai-agent-already-forgot-half-of-what-you-told-it/)
[10] [https://github.com](https://github.com/haidrrrry/compose-kotlin-agent-skills)
[11] [https://medium.com](https://medium.com/@julian.burns50/3-migrating-slash-commands-39c53d13b0e0)
[12] [https://docs.devin.ai](https://docs.devin.ai/product-guides/skills)
[13] [https://code.visualstudio.com](https://code.visualstudio.com/docs/agent-customization/agent-skills)
[14] [https://blog.nimblepros.com](https://blog.nimblepros.com/blogs/next-level-ai-mcp/)
[15] [https://duet.so](https://duet.so/guides/beyond-claude-code-building-a-shared-skill-library)
[16] [https://duet.so](https://duet.so/guides/claude-code-skills-complete-guide)
[17] [https://www.youtube.com](https://www.youtube.com/watch?v=sZ2h41i8xpU&t=11)
[18] [https://developer.harness.io](https://developer.harness.io/docs/platform/harness-ai/harness-skills/)
[19] [https://pub.towardsai.net](https://pub.towardsai.net/grok-build-vs-claude-code-the-compatibility-bet-the-buzz-and-what-you-can-actually-bring-over-406447d668be)
[20] [https://www.firecrawl.dev](https://www.firecrawl.dev/blog/best-grok-plugins)


The equivalent of the Agent Skills schema for plugins is the OpenAPI Specification (OAS) combined with an AI Plugin Manifest File (traditionally known as ai-plugin.json). [1, 2, 3] 
While an Agent Skill Schema defines highly portable, prompt-based instruction playbooks (like SKILL.md or AGENTS.md) to shape how an agent reasons, Plugins physically extend what an agent can do by bundling those skills with functional, live API endpoints. [4, 5, 6] 
The primary schemas and standards powering AI plugins are detailed below.
Just as an Agent Skill uses a structured YAML frontmatter or JSON schema to describe its triggers, plugins use a manifest file typically hosted at /.well-known/ai-plugin.json. This schema acts as the metadata layer that bridges human branding and machine execution. [1, 2, 7, 8] 
Key properties required in the manifest schema include:

* name_for_model: The strict, identifier-safe name the LLM calls.
* description_for_model: Crucial instruction block helping the model understand when and how to use the plugin.
* api: Defines the data format, pointing to the structural API spec URL (e.g., type openapi).
* auth: Specifies the authentication schema (e.g., none, service_http, oauth). [1, 9] 

Where an agent skill details a step-by-step workflow textually, a plugin relies on an OpenAPI Specification (YAML or JSON) to act as its absolute functional schema. [2, 10] 

* Function Calling Integration: LLMs parse the paths, parameters, and responses objects of your OpenAPI file.
* Parameter Schema: The strict JSON schema inside the requestBody or parameters tells the model exactly what variable types, enums, and strings it must generate to trigger a successful API transaction. [11, 12, 13, 14] 

If you are developing for cutting-edge coding agents (such as [Claude Code](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) or Codex), the plugin ecosystem has heavily shifted toward the Model Context Protocol (MCP). [4] 

* The Difference: Traditional skills live locally in your codebase as context markdown files. MCP acts as the live "data plug" plugin architecture. [15, 16, 17] 
* The Schema: MCP utilizes a normalized JSON-RPC 2.0 protocol schema to expose three plugin schemas to the agent:
* tools: Functional code schemas the agent can call dynamically.
   * resources: Static or dynamic data schemas the agent can read.
   * prompts: Pre-packaged prompt templates (similar to local skills). [18, 19, 20] 

| Metric | Agent Skills Schema | Plugin Schema (Traditional / MCP) |
|---|---|---|
| Core File Format | Markdown (SKILL.md) / YAML / JSON | JSON Manifest + OpenAPI YAML / JSON-RPC |
| Primary Purpose | Guide agent behavior and instruct reasoning | Connect agent to live data, apps, and APIs |
| Execution Layer | Run entirely within the LLM prompt context window | Executed via server actions or native code functions |
| Example Specs | Anthropic Skills, Vercel Agent Skills | ai-plugin.json, OpenAI Actions, MCP Server Schema |

Would you like a starter template for an ai-plugin.json manifest or an MCP tool schema definition for your plugin?

[1] [https://apievangelist.com](https://apievangelist.com/2024/02/07/adding-openai-plugin-manifest-to-the-apisjson-properties/)
[2] [https://community.openai.com](https://community.openai.com/t/safeguarding-your-chatgpt-plugins-best-practices-for-security/150282)
[3] [https://blog.leena.ai](https://blog.leena.ai/glossary/ai-plugin/)
[4] [https://www.mindstudio.ai](https://www.mindstudio.ai/blog/how-to-use-ai-agent-skills-plugins-claude-code-codex)
[5] [https://chris-ayers.com](https://chris-ayers.com/posts/agent-skills-plugins-marketplace/)
[6] [https://tonykipkemboi.com](https://tonykipkemboi.com/blog/agent-skills-and-plugins-explained)
[7] [https://www.mindstudio.ai](https://www.mindstudio.ai/blog/agent-skills-open-standard-claude-openai-google)
[8] [https://github.com](https://github.com/anthropics/skills/discussions/166)
[9] [https://community.openai.com](https://community.openai.com/t/how-are-the-ai-plugin-json-and-openapi-spec-converted-into-the-prompt-for-chatgpt/187838)
[10] [https://www.youtube.com](https://www.youtube.com/watch?v=hfBtjGMP3dY&t=55)
[11] [https://www.youtube.com](https://www.youtube.com/watch?v=4WRsoM0bXcw&t=6)
[12] [https://www.youtube.com](https://www.youtube.com/watch?v=EDBSNUhNe2Q&t=16)
[13] [https://www.scaler.com](https://www.scaler.com/blog/ai-agents-beginners-complete-guide/)
[14] [https://youmind.com](https://youmind.com/landing/x-viral-articles/openclaw-agent-system-prompt-architecture)
[15] [https://www.sanity.io](https://www.sanity.io/blog/introducing-sanity-agent-skills)
[16] [https://www.mindstudio.ai](https://www.mindstudio.ai/blog/prompts-vs-skills-vs-plugins-vs-mcps-framework)
[17] [https://www.linkedin.com](https://www.linkedin.com/posts/anshumanbhartiya_some-thoughts-on-where-claude-agent-skills-activity-7387782724297601024-xbWk)
[18] [https://www.mindstudio.ai](https://www.mindstudio.ai/blog/claude-code-skills-vs-plugins-difference)
[19] [https://www.jeeva.ai](https://www.jeeva.ai/blog/multi-agent-coordination-playbook-%28mcp-ai-teamwork%29-implementation-plan)
[20] [https://medium.com](https://medium.com/data-science-collective/model-context-protocol-mcp-a-universal-bridge-between-ai-models-and-real-world-data-3d8e6e29462c)
