# Source routing

How `plug-me-in` turns a URL, path, or description into an install plan.

## 1. Normalize the input

| Input shape | Action |
|---|---|
| `https://github.com/org/repo` | git URL → clone or `npx skills add org/repo` |
| `https://github.com/org/repo/tree/main/path` | clone repo; treat `path` as unit root |
| `owner/repo` | GitHub shorthand |
| absolute/relative path | local tree |
| `@scope/pkg` or bare npm name with MCP intent | MCP via `npx -y` |
| marketplace slug / `/plugin …` text | harness-native marketplace flow |
| natural language only | search (`npx skills find`, web/GitHub); propose candidates |

## 2. Classification priority

Inspect the unit root (cloned or local) in this order — first strong match wins:

1. **marketplace** — `.claude-plugin/marketplace.json` or `.github/plugin/marketplace.json` or `.cursor-plugin/marketplace.json` with `plugins[]`
2. **polyglot** — `.agents/skills/**/SKILL.md` **and** at least two of: `AGENTS.md`, `ai-plugin.json`, `.cursor/rules`, `.grok/config.toml`, multi `*-plugin/plugin.json`
3. **claude-plugin** — `.claude-plugin/plugin.json`
4. **cursor-plugin** — `.cursor-plugin/plugin.json`
5. **codex-plugin** — `.codex-plugin/plugin.json`
6. **copilot-plugin** — `.github/plugin/plugin.json` or root `plugin.json` with agents/skills arrays
7. **gemini-extension** — `gemini-extension.json`
8. **mcp-only** — MCP config present, no meaningful skill/plugin tree
9. **open-skill** — one skill dir with `SKILL.md` (or flat skill file)
10. **skills-repo** — multiple `SKILL.md` without a single plugin manifest
11. **unknown**

Also record:

- `skillNames[]`
- `mcpServerIds[]`
- `marketplacePlugins[]` (name + source)
- `nativeHarness` guess
- `recommendedStrategy`

## 3. Strategy selection

```
function pickStrategy(type, targetHarness, opts):
  if type == marketplace:
    return list_and_choose_unit

  if type == mcp-only OR opts.mcpOnly:
    return merge_mcp

  if type == open-skill OR type == skills-repo OR type == polyglot:
    if skills_cli_supports(targetHarness) and source_is_remote_github:
      return skills_cli_then_verify
    return copy_skills (+ harness bridges)

  if type matches native plugin for targetHarness:
    return native_plugin_install

  if type is foreign plugin:
    if opts.skillsOnly or only_need_skills:
      return extract_skills_and_copy
    if opts.convert or full_fidelity:
      return convert_then_install
    return explain_options (convert vs extract)

  return manual_from_matrix
```

### native match table

| type | native harness ids |
|---|---|
| claude-plugin | claude-code |
| cursor-plugin | cursor |
| codex-plugin | codex |
| copilot-plugin | copilot |
| gemini-extension | gemini |
| polyglot / open-skill | many (filesystem) |

## 4. Per-strategy procedures

### skills_cli

```bash
npx skills add <owner/repo> \
  -a <agent> \
  [-s <skillName>] \
  [-g] \          # global
  -y
```

On failure → `copy_skills`.

### copy_skills

1. Find skill roots (`**/SKILL.md`, flat `skills/*.md`)
2. For each skill (or `--name` filter):
   - Read frontmatter `name` (fallback: directory name)
   - Destination: harness skill path from matrix
   - Copy directory (or promote flat file to `dest/<name>/SKILL.md`)
3. Harness bridges:
   - **cursor:** write `.cursor/rules/<name>.mdc`
   - **grok:** ensure `.grok/config.toml` paths
   - **copilot:** append short pointer to `.github/copilot-instructions.md` if no full plugin
   - **aider:** append section to `CONVENTIONS.md`
   - **antigravity:** use `.agent/skills` singular
4. Copy skill `scripts/` with the skill; keep executable bits

### merge_mcp

1. Load source MCP (file or inline from extension/plugin)
2. Normalize servers object
3. Rewrite local path tokens when `pluginRoot` known
4. Merge into harness MCP path (or print JSON for Warp UI)
5. Report env vars

### native_plugin_install

Harness-specific:

- **claude-code:** prefer marketplace/plugin commands; else copy plugin tree and document `/plugin` enable
- **gemini:** `gemini extensions install <path-or-url>`
- **cursor:** project copy of plugin + rules/MCP
- **copilot:** copy plugin unit with resolved skill/agent paths

### convert_then_install

```bash
node ../convert-to-polyglot/scripts/convert.mjs \
  --source <src> \
  --dest ~/Developer/harness-plugins/<name> \
  --name <name>
```

Then run `copy_skills` + `merge_mcp` from the polyglot dest into the target harness.

Default dest root: `~/Developer/harness-plugins/`.

### list_and_choose_unit

1. Parse `plugins[]`
2. Print name, description, source
3. Stop for user choice unless `--name` matches exactly one
4. Resolve `source` (relative path or git) to a unit root
5. Re-classify from step 2 on that unit

### extract_skills_and_copy

Lighter than full convert:

1. Collect skills from plugin layout defaults (`skills/`, manifest paths, monorepo walk-up)
2. `copy_skills` only
3. Optionally `merge_mcp` if `.mcp.json` present
4. Warn that hooks/agents/commands may be skipped

## 5. Monorepo resolution

When manifest paths like `./skills/foo` don’t exist beside the manifest:

1. Try manifest dir
2. Walk parents until repo root (`.git` or filesystem root)
3. Resolve relative to each candidate
4. Record `resolvedFrom` for the report

Typical: GitHub awesome-copilot `plugins/<id>/` → root `skills/`.

## 6. Remote clone policy

- Shallow: `git clone --depth 1`
- Temp: `/tmp/plug-me-in-<slug>-<pid>`
- Reuse temp if same URL already cloned in this process
- Don’t delete temp before user confirms if install failed (print path)
- Prefer `npx skills add` without keeping a clone when that fully satisfies the ask

## 7. Name filters

`--name` applies to:

- single skill inside skills-repo
- single marketplace plugin
- single MCP server id when merging a multi-server file

If no match: list candidates and exit non-zero.

## 8. Success criteria checklist

- [ ] Target path(s) exist
- [ ] Skill folder name == frontmatter `name` (when skills installed)
- [ ] MCP merged without removing unrelated servers
- [ ] Harness-specific bridge written when required (Cursor mdc, Grok toml, …)
- [ ] User told how to reload / verify
- [ ] Required env vars named

## 9. Failure fallbacks

| Failure | Fallback |
|---|---|
| skills CLI missing/network | filesystem copy from clone |
| convert script missing | extract_skills_and_copy + manual matrix steps |
| no write permission global | project scope or print manual paths |
| unknown layout | inspect-source + preserve under references + ask user |
| Warp MCP no file | print JSON block for Settings UI |
