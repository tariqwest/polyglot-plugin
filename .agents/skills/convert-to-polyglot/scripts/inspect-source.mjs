#!/usr/bin/env node
import { resolve } from "node:path";
import { parseArgs, requireArg, pathExists } from "./lib/fs-utils.mjs";
import { discoverSourceLayout } from "./lib/skill-md.mjs";

const args = parseArgs();
const source = resolve(requireArg(args, "source"));
if (!pathExists(source)) {
  console.error("Source not found:", source);
  process.exit(1);
}
const layout = discoverSourceLayout(source);
console.log(JSON.stringify(layout, null, 2));
