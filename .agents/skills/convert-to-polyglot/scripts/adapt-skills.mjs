#!/usr/bin/env node
import { basename, join, resolve } from "node:path";
import {
  ensureDir,
  isDir,
  isFile,
  listDirs,
  listFiles,
  parseArgs,
  pathExists,
  readText,
  requireArg,
  writeText,
  writeJson,
  envRootFromName,
} from "./lib/fs-utils.mjs";
import {
  condenseBody,
  enhanceFrontmatter,
  injectAfterH1,
  normalizeSkillScriptsDir,
  parseSkillMd,
  rewriteHarnessPaths,
  rootResolutionBlock,
  scriptsSection,
  serializeSkillMd,
  upsertSection,
} from "./lib/skill-md.mjs";
import { adaptHooks } from "./lib/bridges.mjs";

const args = parseArgs();
const dest = resolve(requireArg(args, "dest"));
const packageName = args.name && args.name !== true ? args.name : basename(dest);
const envRoot =
  args["env-root"] && args["env-root"] !== true
    ? args["env-root"]
    : envRootFromName(packageName);
const maxLines = Number(args["max-lines"] || 480);
const version = args.version && args.version !== true ? args.version : "1.0.0";

const skillsRoot = join(dest, ".agents/skills");
const refsRoot = ensureDir(join(dest, ".agents/references"));
const hasAgents = isDir(join(dest, ".agents/agents"));

const skillMetas = [];

for (const skillDir of listDirs(skillsRoot)) {
  const name = basename(skillDir);
  const smPath = join(skillDir, "SKILL.md");
  if (!isFile(smPath)) continue;

  const scriptNames = normalizeSkillScriptsDir(skillDir);
  let text = readText(smPath);
  let parsed = parseSkillMd(text);
  const data = enhanceFrontmatter(parsed, {
    name,
    version,
    author: "polyglot port",
  });
  let body = parsed.body;

  // condense before path rewrite so full protocol keeps original structure
  if (body.split("\n").length > maxLines) {
    const fullPath = join(refsRoot, `${name}-full-protocol.md`);
    writeText(
      fullPath,
      `# ${name} — full protocol (reference)\n\n` +
        `> Canonical detailed instructions extracted for polyglot SKILL.md size limits.\n` +
        `> Agents should read this file when executing the full pipeline.\n\n` +
        body
    );
    body = condenseBody(name, body);
    console.log(`condensed ${name} -> references/${name}-full-protocol.md`);
  }

  body = rewriteHarnessPaths(body, { envRoot });
  body = injectAfterH1(body, rootResolutionBlock(envRoot, packageName));
  body = upsertSection(
    body,
    "## Scripts and agents (polyglot paths)",
    scriptsSection(name, scriptNames, { hasAgents })
  );

  // rewrite script path mentions for moved scripts
  for (const s of scriptNames) {
    body = body.split(`skills/${name}/${s}`).join(`skills/${name}/scripts/${s}`);
    body = body.split(`/${name}/${s}`).join(`/${name}/scripts/${s}`);
  }

  const out = serializeSkillMd(data, body, parsed.order);
  writeText(smPath, out);

  // rewrite full protocol paths if present
  const fullPath = join(refsRoot, `${name}-full-protocol.md`);
  if (pathExists(fullPath)) {
    let full = readText(fullPath);
    full = rewriteHarnessPaths(full, { envRoot });
    for (const s of scriptNames) {
      full = full.split(`/understand/${s}`).join(`/understand/scripts/${s}`);
      full = full.split(`/${name}/${s}`).join(`/${name}/scripts/${s}`);
      full = full.split(`skills/${name}/${s}`).join(`skills/${name}/scripts/${s}`);
    }
    if (!full.includes("Polyglot paths")) {
      full = full.replace(
        /^# .+$/m,
        (h) =>
          h +
          `\n\n> **Polyglot paths:** root=\`${envRoot}\`; skills=\`.agents/skills/\`; agents=\`.agents/agents/\`; runtime=\`runtime/\`.\n`
      );
    }
    writeText(fullPath, full);
  }

  skillMetas.push({
    name,
    description: data.description || "",
    path: `.agents/skills/${name}`,
    scripts: scriptNames,
    lines: out.split("\n").length,
  });
  console.log(`adapted ${name}: lines=${out.split("\n").length} scripts=${scriptNames.length}`);
}

// agents path rewrite
const agentsDir = join(dest, ".agents/agents");
if (isDir(agentsDir)) {
  for (const f of listFiles(agentsDir)) {
    if (!f.endsWith(".md")) continue;
    const t = rewriteHarnessPaths(readText(f), { envRoot });
    writeText(f, t);
  }
  console.log("rewrote agents");
}

adaptHooks(dest, envRoot);
writeJson(join(refsRoot, "skills-index.json"), skillMetas);
console.log("adapt-skills complete:", skillMetas.length, "skills; envRoot=", envRoot);
