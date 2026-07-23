#!/usr/bin/env node
import { basename, resolve } from "node:path";
import { envRootFromName, parseArgs, requireArg, pathExists, readText } from "./lib/fs-utils.mjs";
import { generateAllBridges } from "./lib/bridges.mjs";
import { listSkillMetas } from "./lib/skill-md.mjs";

const args = parseArgs();
const dest = resolve(requireArg(args, "dest"));
const name = args.name && args.name !== true ? args.name : basename(dest);
const envRoot =
  args["env-root"] && args["env-root"] !== true
    ? args["env-root"]
    : envRootFromName(name);
const upstreamUrl =
  args.upstream && args.upstream !== true ? args.upstream : "";
const version = args.version && args.version !== true ? args.version : "1.0.0";

let description = args.description && args.description !== true ? args.description : "";
if (!description) {
  const metas = listSkillMetas(dest);
  description = metas[0]?.description || `${name} polyglot agent plugin`;
}

generateAllBridges({
  dest,
  name,
  envRoot,
  description,
  version,
  upstreamUrl,
});
console.log("bridges generated at", dest);
