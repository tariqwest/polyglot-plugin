#!/usr/bin/env node
import {
  boolFlag,
  classifyLocalTree,
  flag,
  parseArgs,
  printJson,
  resolveSourceTree,
} from "./lib/shared.mjs";

const args = parseArgs();
const source = flag(args, "source") || args._[0];
const asJson = boolFlag(args, "json");

if (!source) {
  console.error("Usage: classify-source.mjs --source <url-or-path> [--json]");
  process.exit(2);
}

let resolved;
try {
  resolved = resolveSourceTree(String(source));
} catch (e) {
  console.error(String(e?.message || e));
  process.exit(1);
}

const classification = classifyLocalTree(resolved.localPath);
const out = {
  source: String(source),
  resolved: {
    localPath: resolved.localPath,
    remote: resolved.remote ?? null,
    shorthand: resolved.shorthand ?? null,
    subpath: resolved.subpath ?? null,
    cloned: Boolean(resolved.cloned),
    cloneRoot: resolved.cloneRoot ?? null,
  },
  ...classification,
  // omit bulky mcp server bodies in human mode later
};

if (asJson) {
  // keep mcpServers in json for tooling
  printJson(out);
} else {
  console.log(`source: ${out.source}`);
  console.log(`local: ${out.resolved.localPath}`);
  console.log(`type: ${out.type}`);
  console.log(`nativeHarness: ${out.nativeHarness ?? "(n/a)"}`);
  console.log(`recommendedStrategy: ${out.recommendedStrategy}`);
  console.log(
    `skills (${out.skillNames.length}): ${out.skillNames.join(", ") || "(none)"}`,
  );
  console.log(
    `mcp (${out.mcpServerIds.length}): ${out.mcpServerIds.join(", ") || "(none)"}`,
  );
  if (out.marketplacePlugins.length) {
    console.log("marketplace plugins:");
    for (const p of out.marketplacePlugins.slice(0, 50)) {
      console.log(
        `  - ${p.name}: ${typeof p.source === "string" ? p.source : JSON.stringify(p.source)}`,
      );
    }
    if (out.marketplacePlugins.length > 50) {
      console.log(`  … +${out.marketplacePlugins.length - 50} more`);
    }
  }
  console.log(
    `bridges: ${Object.entries(out.bridges)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "(none)"}`,
  );
}
