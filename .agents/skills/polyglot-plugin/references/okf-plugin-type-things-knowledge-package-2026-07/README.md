# OKF plugin-type things — comprehensive knowledge package (2026-07)

**Status:** expanded Open Knowledge Format (OKF) package  
**As-of:** `2026-07` (July 2026)  
**Last reviewed:** 2026-07-24  
**Owner skill:** `polyglot-plugin`  
**Source reference:** `../okf-plugin-type-things-2026-07.md`  
**Source client catalog:** `~/Developer/config-clis/.agents/plans/config-clis.md`  
**Related suite plans:** [config-plugins.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-plugins.md), [config-skills.md](file:///Users/tariqwest/Developer/config-clis/.agents/plans/config-skills.md)

---

## What this package is

This directory is a more comprehensive, research-expanded version of the `okf-plugin-type-things-2026-07.md` mini-OKF. It is designed for agents and models that may have limited deep-research or web-search capabilities: each file is self-contained, explicit about discovery paths, and links to authoritative documentation.

The package covers:

1. **Foundations and Tier C** — vocabulary, quick catalog matrix, guide-only/research clients, polyglot mapping rules, critical invariants, changelog, and refresh checklist.
2. **Tier A harnesses** — full, official plugin/skills/extension surfaces (`claude`, `cursor`, `codex`, `copilot`/`vscode`, `opencode`, `gemini`, `devin`/`windsurf`, `warp`).
3. **Tier B harnesses** — partial / MCP-first / instructions-first surfaces (`continue`, `cline`, `roo`, `goose`, `zed`, `junie`/`pycharm`, `kiro`, `aider`, `kilo`, `qwen`, Grok Build, legacy OpenAI ChatGPT plugins).
4. **Cross-cutting standards** — Open Skills / `SKILL.md`, MCP, instruction files (`AGENTS.md`, `CLAUDE.md`, `CONVENTIONS.md`, `.cursor/rules/*.mdc`, etc.), plugin manifests, and the polyglot package strategy.

---

## How to use this package

- Start with **OKF foundations and Tier C** for vocabulary, the quick matrix, and polyglot mapping rules.
- Look up a specific harness in **Tier A** or **Tier B**.
- Read **Cross-cutting standards** for reusable patterns (MCP, Open Skills, manifests, bridging).
- Each file has its own `Research notes` section documenting verified facts, ambiguities, and known link changes.

---

## Files

| File | Purpose |
|------|---------|
| [okf-foundations-and-tier-c.md](./okf-foundations-and-tier-c.md) | Vocabulary, quick matrix, Tier C, mapping rules, invariants, changelog, checklist |
| [tier-a-harnesses.md](./tier-a-harnesses.md) | Full official plugin/skills surfaces |
| [tier-b-harnesses.md](./tier-b-harnesses.md) | Partial / MCP-first / instructions-first surfaces |
| [cross-cutting-standards.md](./cross-cutting-standards.md) | Portable, transferable, and standardized knowledge patterns |

---

## When to update

- Re-read after any `config-clis` catalog rename/add.
- Re-verify official doc URLs when a link 404s or when a product announces a new extensibility surface.
- For major refreshes, bump the month in the package directory name and keep a one-line pointer in the prior package.

---

## Core vocabulary

| Term | Meaning |
|------|---------|
| **Agent Skills / Open Skills** | Portable `SKILL.md` folders ([agentskills.io](https://agentskills.io)). Progressive disclosure: frontmatter always, body on invoke. |
| **Plugin (package)** | Distributable bundle: skills + optional agents, hooks, MCP/LSP, commands, rules. Manifest varies by vendor. |
| **Rules / instructions** | Always-on or scoped guidance (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, copilot instructions). Not the same as skills. |
| **MCP** | Live tools/resources/prompts via Model Context Protocol (stdio preferred for portability). |
| **Marketplace** | Registry of many plugins; install **one unit**, never the whole catalog as one package. |
| **Polyglot package** | Canonical `.agents/skills/<name>/SKILL.md` + per-harness bridge artifacts. |
