# Graph Report - .  (2026-07-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 235 nodes · 530 edges · 19 communities (8 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f562c1ca`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- shared.mjs
- fs-utils.mjs
- adapt-skills.mjs
- explain-harness.mjs
- bridges.mjs
- Open Skills / Agent Skills
- vendor-source.mjs
- polyglot-plugin skill
- Aider
- Cline
- Continue
- Block Goose
- Grok Build
- JetBrains Junie + PyCharm
- Kilo Code
- Kiro (AWS)
- Qwen Code
- Roo Code
- Zed

## God Nodes (most connected - your core abstractions)
1. `writeText()` - 18 edges
2. `pathExists()` - 17 edges
3. `generateAllBridges()` - 15 edges
4. `main()` - 15 edges
5. `ensureDir()` - 14 edges
6. `readText()` - 14 edges
7. `isDir()` - 12 edges
8. `pathExists()` - 12 edges
9. `writeJson()` - 11 edges
10. `discoverSourceLayout()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Claude Code` --references--> `Model Context Protocol (MCP)`  [EXTRACTED]
  .agents/skills/polyglot-plugin/references/okf-plugin-type-things-knowledge-package-2026-07/tier-a-harnesses.md → facts/mcp/index.html
- `Claude Code` --references--> `Open Skills / Agent Skills`  [EXTRACTED]
  .agents/skills/polyglot-plugin/references/okf-plugin-type-things-knowledge-package-2026-07/tier-a-harnesses.md → facts/open-skills/index.html
- `Cursor` --references--> `Model Context Protocol (MCP)`  [EXTRACTED]
  .agents/skills/polyglot-plugin/references/okf-plugin-type-things-knowledge-package-2026-07/tier-a-harnesses.md → facts/mcp/index.html
- `Cursor` --references--> `Open Skills / Agent Skills`  [EXTRACTED]
  .agents/skills/polyglot-plugin/references/okf-plugin-type-things-knowledge-package-2026-07/tier-a-harnesses.md → facts/open-skills/index.html
- `GitHub Copilot / VS Code` --references--> `Model Context Protocol (MCP)`  [EXTRACTED]
  .agents/skills/polyglot-plugin/references/okf-plugin-type-things-knowledge-package-2026-07/tier-a-harnesses.md → facts/mcp/index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Polyglot Package Bridge Artifacts** — readme_polyglot_plugin, readme_okf_plugin_type_things_2026_07, polyglot_plugin_references_cross_cutting_standards [EXTRACTED 1.00]
- **Convert-to-Polyglot Conversion Process** — readme_convert_to_polyglot, convert_to_polyglot_references_conversion_playbook, convert_to_polyglot_references_plugin_manifest_formats [EXTRACTED 1.00]
- **Plug-Me-In Installation Workflow** — readme_plug_me_in, plug_me_in_references_harness_install_matrix, plug_me_in_references_source_routing [EXTRACTED 1.00]
- **Polyglot Plugin Supported Harnesses** — references_okf_plugin_type_things_knowledge_package_2026_07_claude, references_okf_plugin_type_things_knowledge_package_2026_07_cursor, references_okf_plugin_type_things_knowledge_package_2026_07_codex, references_okf_plugin_type_things_knowledge_package_2026_07_copilot, references_okf_plugin_type_things_knowledge_package_2026_07_opencode, references_okf_plugin_type_things_knowledge_package_2026_07_gemini, references_okf_plugin_type_things_knowledge_package_2026_07_devin, references_okf_plugin_type_things_knowledge_package_2026_07_warp [EXTRACTED 1.00]
- **Polyglot Plugin Supported Tier B Harnesses** — references_okf_plugin_type_things_knowledge_package_2026_07_continue, references_okf_plugin_type_things_knowledge_package_2026_07_cline, references_okf_plugin_type_things_knowledge_package_2026_07_roo, references_okf_plugin_type_things_knowledge_package_2026_07_goose, references_okf_plugin_type_things_knowledge_package_2026_07_zed, references_okf_plugin_type_things_knowledge_package_2026_07_junie, references_okf_plugin_type_things_knowledge_package_2026_07_kiro, references_okf_plugin_type_things_knowledge_package_2026_07_aider, references_okf_plugin_type_things_knowledge_package_2026_07_kilo, references_okf_plugin_type_things_knowledge_package_2026_07_qwen, references_okf_plugin_type_things_knowledge_package_2026_07_grok [EXTRACTED 1.00]

## Communities (19 total, 11 thin omitted)

### Community 0 - "shared.mjs"
Cohesion: 0.09
Nodes (50): args, asJson, classification, cwd, filterSkills(), harness, installMcp(), installSkillsFromClassification() (+42 more)

### Community 1 - "fs-utils.mjs"
Cohesion: 0.09
Nodes (37): args, bridgeArgs, dest, HERE, runNode(), sourceArg, vendorArgs, args (+29 more)

### Community 2 - "adapt-skills.mjs"
Cohesion: 0.11
Nodes (36): agentsDir, args, dest, hasAgents, maxLines, refsRoot, skillMetas, skillsRoot (+28 more)

### Community 3 - "explain-harness.mjs"
Cohesion: 0.08
Nodes (29): args, asJson, classification, out, args, asJson, cwd, result (+21 more)

### Community 4 - "bridges.mjs"
Cohesion: 0.28
Nodes (18): adaptHooks(), escapeYaml(), generateAllBridges(), mergeUpstreamMcp(), titleize(), writeAgentsMd(), writeAiPlugin(), writeCompatManifests() (+10 more)

### Community 5 - "Open Skills / Agent Skills"
Cohesion: 0.31
Nodes (13): AGENTS.md, Model Context Protocol (MCP), OKF plugin-type knowledgebase, Open Skills / Agent Skills, Polyglot Plugin, Claude Code, OpenAI Codex CLI, GitHub Copilot / VS Code (+5 more)

### Community 6 - "vendor-source.mjs"
Cohesion: 0.17
Nodes (11): args, commandsDir, dest, exclude, hasMcp, hasSkills, layout, licenseRoots (+3 more)

### Community 7 - "polyglot-plugin skill"
Cohesion: 0.17
Nodes (12): Conversion playbook (Understand-Anything), Plugin manifest formats & package structures, Harness install matrix, Source routing, Cross-cutting standards for portable agent knowledge, OKF Foundations and Tier C — plugin-type things (2026-07), OKF plugin-type things knowledge package (2026-07), convert-to-polyglot skill (+4 more)

## Knowledge Gaps
- **100 isolated node(s):** `args`, `dest`, `maxLines`, `skillsRoot`, `refsRoot` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pathExists()` connect `adapt-skills.mjs` to `fs-utils.mjs`, `bridges.mjs`, `vendor-source.mjs`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `writeText()` connect `bridges.mjs` to `fs-utils.mjs`, `adapt-skills.mjs`, `vendor-source.mjs`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `ensureDir()` connect `fs-utils.mjs` to `adapt-skills.mjs`, `bridges.mjs`, `vendor-source.mjs`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `args`, `dest`, `maxLines` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `shared.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09433962264150944 - nodes in this community are weakly interconnected._
- **Should `fs-utils.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08879492600422834 - nodes in this community are weakly interconnected._
- **Should `adapt-skills.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.10661268556005399 - nodes in this community are weakly interconnected._