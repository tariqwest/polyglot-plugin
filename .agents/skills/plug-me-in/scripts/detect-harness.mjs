#!/usr/bin/env node
import { resolve } from "node:path";
import {
  boolFlag,
  detectHarness,
  flag,
  parseArgs,
  printJson,
} from "./lib/shared.mjs";

const args = parseArgs();
const cwd = resolve(String(flag(args, "cwd", process.cwd())));
const asJson = boolFlag(args, "json");

const result = detectHarness({ cwd, env: process.env });

if (asJson) {
  printJson(result);
} else {
  console.log(`harness: ${result.harness}`);
  console.log(`confidence: ${result.confidence}`);
  console.log(`score: ${result.score}`);
  if (result.ambiguous) console.log("ambiguous: true (confirm with user if needed)");
  if (result.reasons.length) {
    console.log("reasons:");
    for (const r of result.reasons) console.log(`  - ${r}`);
  }
  if (result.ranked.length > 1) {
    console.log("runners-up:");
    for (const r of result.ranked.slice(1)) {
      console.log(`  - ${r.id} (${r.score})`);
    }
  }
  console.log(`cwd: ${result.cwd}`);
}
