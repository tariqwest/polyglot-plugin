# Graph Report - /Users/tariqwest/Developer/polyglot-plugin  (2026-07-23)

## Corpus Check
- 37 files · ~55,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 235 nodes · 530 edges · 19 communities (8 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 99,200 input · 6,754 output

## Community Hubs (Navigation)
- plug-me-in install engine
- convert-to-polyglot scaffolding
- SKILL.md adaptation utilities
- harness classification
- bridge artifact generation
- Grounding Pages and Tier A harnesses
- upstream vendor inspection
- polyglot reference documentation
- Aider harness
- Cline harness
- Continue harness
- Goose harness
- Grok Build harness
- Junie harness
- Kilo Code harness
- Kiro harness
- Qwen Code harness
- Roo Code harness
- Zed harness

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

### Community 0 - "plug-me-in install engine"
Cohesion: 0.09
Nodes (50): args, asJson, classification, cwd, filterSkills(), harness, installMcp(), installSkillsFromClassification() (+42 more)

### Community 1 - "convert-to-polyglot scaffolding"
Cohesion: 0.09
Nodes (37): args, bridgeArgs, dest, HERE, runNode(), sourceArg, vendorArgs, args (+29 more)

### Community 2 - "SKILL.md adaptation utilities"
Cohesion: 0.11
Nodes (36): agentsDir, args, dest, hasAgents, maxLines, refsRoot, skillMetas, skillsRoot (+28 more)

### Community 3 - "harness classification"
Cohesion: 0.08
Nodes (29): args, asJson, classification, out, args, asJson, cwd, result (+21 more)

### Community 4 - "bridge artifact generation"
Cohesion: 0.28
Nodes (18): adaptHooks(), escapeYaml(), generateAllBridges(), mergeUpstreamMcp(), titleize(), writeAgentsMd(), writeAiPlugin(), writeCompatManifests() (+10 more)

### Community 5 - "Grounding Pages and Tier A harnesses"
Cohesion: 0.31
Nodes (13): AGENTS.md, Model Context Protocol (MCP), OKF plugin-type knowledgebase, Open Skills / Agent Skills, Polyglot Plugin, Claude Code, OpenAI Codex CLI, GitHub Copilot / VS Code (+5 more)

### Community 6 - "upstream vendor inspection"
Cohesion: 0.17
Nodes (11): args, commandsDir, dest, exclude, hasMcp, hasSkills, layout, licenseRoots (+3 more)

### Community 7 - "polyglot reference documentation"
Cohesion: 0.17
Nodes (12): Conversion playbook (Understand-Anything), Plugin manifest formats & package structures, Harness install matrix, Source routing, Cross-cutting standards for portable agent knowledge, OKF Foundations and Tier C — plugin-type things (2026-07), OKF plugin-type things knowledge package (2026-07), convert-to-polyglot skill (+4 more)

## Knowledge Gaps
- **100 isolated node(s):** `args`, `dest`, `maxLines`, `skillsRoot`, `refsRoot` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pathExists()` connect `SKILL.md adaptation utilities` to `convert-to-polyglot scaffolding`, `bridge artifact generation`, `upstream vendor inspection`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `writeText()` connect `bridge artifact generation` to `convert-to-polyglot scaffolding`, `SKILL.md adaptation utilities`, `upstream vendor inspection`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `ensureDir()` connect `convert-to-polyglot scaffolding` to `SKILL.md adaptation utilities`, `bridge artifact generation`, `upstream vendor inspection`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `args`, `dest`, `maxLines` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plug-me-in install engine` be split into smaller, more focused modules?**
  _Cohesion score 0.09433962264150944 - nodes in this community are weakly interconnected._
- **Should `convert-to-polyglot scaffolding` be split into smaller, more focused modules?**
  _Cohesion score 0.08879492600422834 - nodes in this community are weakly interconnected._
- **Should `SKILL.md adaptation utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.10661268556005399 - nodes in this community are weakly interconnected._