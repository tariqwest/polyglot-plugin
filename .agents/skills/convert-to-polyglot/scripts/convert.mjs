#!/usr/bin/env node
/**
 * End-to-end: inspect → scaffold → vendor → adapt → bridges → validate
 */
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  envRootFromName,
  parseArgs,
  pathExists,
  requireArg,
  run,
  which,
  rimraf,
  ensureDir,
  isDir,
} from "./lib/fs-utils.mjs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = parseArgs();

function runNode(script, extraArgs) {
  const res = run(process.execPath, [join(HERE, script), ...extraArgs], {
    stdio: "inherit",
  });
  if (res.status !== 0) {
    console.error(`Failed: ${script}`);
    process.exit(res.status || 1);
  }
}

const sourceArg = requireArg(args, "source");
const dest = resolve(requireArg(args, "dest"));
const name = args.name && args.name !== true ? args.name : basename(dest);
const envRoot =
  args["env-root"] && args["env-root"] !== true
    ? args["env-root"]
    : envRootFromName(name);
const exclude = args.exclude && args.exclude !== true ? args.exclude : "homepage,docs,READMEs,assets";
const runtimeSubdir =
  args["runtime-subdir"] && args["runtime-subdir"] !== true
    ? args["runtime-subdir"]
    : "";
const upstream =
  args.upstream && args.upstream !== true
    ? args.upstream
    : sourceArg.startsWith("http")
      ? sourceArg
      : "";
const version = args.version && args.version !== true ? args.version : "1.0.0";
const maxLines = args["max-lines"] && args["max-lines"] !== true ? args["max-lines"] : "480";

let source = sourceArg;
// clone if git url
if (/^https?:\/\//.test(sourceArg) || sourceArg.startsWith("git@")) {
  if (!which("git")) {
    console.error("git required to clone remote source");
    process.exit(1);
  }
  const cloneDir = join(tmpdir(), `polyglot-src-${name}-${Date.now()}`);
  rimraf(cloneDir);
  console.log("Cloning", sourceArg, "->", cloneDir);
  const res = run("git", ["clone", "--depth", "1", sourceArg, cloneDir], {
    stdio: "inherit",
  });
  if (res.status !== 0) process.exit(res.status || 1);
  source = cloneDir;
} else {
  source = resolve(sourceArg);
  if (!pathExists(source)) {
    console.error("Source not found:", source);
    process.exit(1);
  }
}

console.log("\n=== Phase 0: inspect ===");
runNode("inspect-source.mjs", ["--source", source]);

console.log("\n=== Phase 1: scaffold ===");
ensureDir(dest);
runNode("scaffold-package.mjs", ["--dest", dest, "--name", name]);

console.log("\n=== Phase 2: vendor ===");
const vendorArgs = ["--source", source, "--dest", dest, "--exclude", exclude];
if (runtimeSubdir) vendorArgs.push("--runtime-subdir", runtimeSubdir);
runNode("vendor-source.mjs", vendorArgs);

console.log("\n=== Phase 3–4: adapt skills/hooks/agents ===");
runNode("adapt-skills.mjs", [
  "--dest",
  dest,
  "--name",
  name,
  "--env-root",
  envRoot,
  "--max-lines",
  String(maxLines),
  "--version",
  version,
]);

console.log("\n=== Phase 5: bridges ===");
const bridgeArgs = [
  "--dest",
  dest,
  "--name",
  name,
  "--env-root",
  envRoot,
  "--version",
  version,
];
if (upstream) bridgeArgs.push("--upstream", upstream);
runNode("generate-bridges.mjs", bridgeArgs);

console.log("\n=== Phase 6: validate ===");
runNode("validate-package.mjs", ["--dest", dest]);

console.log("\nDone. Polyglot package at:", dest);
console.log(`export ${envRoot}="${dest}"`);
