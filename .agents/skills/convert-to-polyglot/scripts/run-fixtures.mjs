#!/usr/bin/env node
/**
 * Clone → convert → validate fixture plugins for convert-to-polyglot.
 *
 * Usage:
 *   node run-fixtures.mjs [--set priority|wave2|wave3|mcp|all|claude|codex|cursor] [--only id1,id2]
 *                         [--out-dir ~/Developer/harness-plugins]
 *                         [--keep-clones] [--skip-existing] [--dry-run]
 *                         [--limit N]
 */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import {
  ensureDir,
  envRootFromName,
  isDir,
  parseArgs,
  pathExists,
  readText,
  rimraf,
  run,
  which,
  writeJson,
  writeText,
} from "./lib/fs-utils.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = resolve(HERE, "../references/fixtures.json");
const CONVERT = join(HERE, "convert.mjs");
const VALIDATE = join(HERE, "validate-package.mjs");

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  if (p === "~") return homedir();
  return p;
}

function loadFixtures() {
  return JSON.parse(readText(FIXTURES_PATH));
}

function selectTargets(fixtures, { set, only, limit }) {
  let list = [];
  if (set === "priority" || !set) list = fixtures.priority.slice();
  else if (set === "wave2") list = (fixtures.wave2 || []).slice();
  else if (set === "wave3") list = (fixtures.wave3 || []).slice();
  else if (set === "mcp") {
    const all = [...(fixtures.priority || []), ...(fixtures.wave2 || []), ...(fixtures.wave3 || [])];
    const seen = new Set();
    for (const t of all) {
      if (!t.hasMcp) continue;
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      list.push(t);
    }
  }
  else if (set === "all") {
    const seen = new Set();
    for (const t of [...(fixtures.priority || []), ...(fixtures.wave2 || []), ...(fixtures.wave3 || [])]) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      list.push(t);
    }
    for (const harness of Object.keys(fixtures.catalog || {})) {
      for (const t of fixtures.catalog[harness]) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        list.push({
          ...t,
          harness,
          name: t.name || t.id,
          envRoot: t.envRoot || envRootFromName(t.name || t.id),
          description: t.description || t.id,
        });
      }
    }
  } else if (["claude", "codex", "cursor"].includes(set)) {
    const pri = fixtures.priority.filter((t) => t.harness === set || (set === "codex" && t.harness === "multi"));
    const cat = (fixtures.catalog[set] || []).map((t) => ({
      ...t,
      harness: set,
      name: t.name || t.id,
      envRoot: t.envRoot || envRootFromName(t.name || t.id),
      description: t.description || t.id,
    }));
    const seen = new Set();
    for (const t of [...pri, ...cat]) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      list.push(t);
    }
  } else {
    console.error(`Unknown --set ${set}`);
    process.exit(1);
  }


  // --only should find ids across priority + wave2 even if --set defaulted to priority
  if (only && set === "priority") {
    const seen = new Set(list.map((x) => x.id));
    for (const t of [...(fixtures.wave2 || []), ...(fixtures.wave3 || [])]) {
      if (!seen.has(t.id)) list.push(t);
    }
  }

  if (only) {
    const want = new Set(
      String(only)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    list = list.filter((t) => want.has(t.id) || want.has(t.name));
  }
  if (limit && Number(limit) > 0) list = list.slice(0, Number(limit));
  return list;
}

function cloneRepo(repo, cloneDir) {
  if (isDir(join(cloneDir, ".git"))) {
    // shallow refresh
    const pull = run("git", ["-C", cloneDir, "pull", "--ff-only"], { stdio: "pipe" });
    if (pull.status !== 0) {
      rimraf(cloneDir);
    } else {
      return { ok: true, reused: true };
    }
  }
  ensureDir(dirname(cloneDir));
  if (isDir(cloneDir)) rimraf(cloneDir);
  const res = run("git", ["clone", "--depth", "1", repo, cloneDir], { stdio: "inherit" });
  return { ok: res.status === 0, reused: false, status: res.status, stderr: res.stderr };
}

function main() {
  const args = parseArgs();
  if (!which("git")) {
    console.error("git is required");
    process.exit(1);
  }
  if (!which("node")) {
    console.error("node is required");
    process.exit(1);
  }

  const fixtures = loadFixtures();
  const set = args.set && args.set !== true ? args.set : "priority";
  const outDir = resolve(
    expandHome(
      args["out-dir"] && args["out-dir"] !== true
        ? args["out-dir"]
        : fixtures.defaultOutDir || "~/Developer/harness-plugins"
    )
  );
  const keepClones = Boolean(args["keep-clones"]);
  const skipExisting = Boolean(args["skip-existing"]);
  const dryRun = Boolean(args["dry-run"]);
  const only = args.only && args.only !== true ? args.only : "";
  const limit = args.limit && args.limit !== true ? args.limit : 0;

  const targets = selectTargets(fixtures, { set, only, limit });
  if (!targets.length) {
    console.error("No fixtures selected");
    process.exit(1);
  }

  ensureDir(outDir);
  const cloneRoot = join(tmpdir(), "polyglot-fixture-clones");
  ensureDir(cloneRoot);

  console.log(`Fixtures: ${targets.length} | set=${set} | out=${outDir}`);
  if (dryRun) {
    for (const t of targets) {
      console.log(`- ${t.id}: ${t.repo}${t.subdir ? " :: " + t.subdir : ""} -> ${join(outDir, t.name || t.id)}`);
    }
    process.exit(0);
  }

  const results = [];
  const started = Date.now();

  for (const t of targets) {
    const name = t.name || t.id;
    const dest = join(outDir, name);
    const envRoot = t.envRoot || envRootFromName(name);
    const repoKey = t.repo.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
    const cloneDir = join(cloneRoot, repoKey);
    const row = {
      id: t.id,
      name,
      harness: t.harness || "",
      repo: t.repo,
      subdir: t.subdir || "",
      dest,
      ok: false,
      phase: "start",
      error: "",
      durationMs: 0,
    };
    const t0 = Date.now();
    console.log(`\n======== ${t.id} (${t.harness || "?"}) ========`);
    console.log(t.description || "");

    try {
      if (skipExisting && pathExists(join(dest, "AGENTS.md")) && pathExists(join(dest, ".agents/skills"))) {
        console.log("skip-existing: validating only");
        row.phase = "validate-existing";
        const v = run(process.execPath, [VALIDATE, "--dest", dest], { stdio: "inherit" });
        row.ok = v.status === 0;
        if (!row.ok) row.error = "validate failed on existing";
        row.durationMs = Date.now() - t0;
        results.push(row);
        continue;
      }

      row.phase = "clone";
      console.log("clone", t.repo);
      const c = cloneRepo(t.repo, cloneDir);
      if (!c.ok) {
        row.error = `clone failed: ${c.stderr || c.status}`;
        row.durationMs = Date.now() - t0;
        results.push(row);
        console.error(row.error);
        continue;
      }

      const source = t.subdir ? join(cloneDir, t.subdir) : cloneDir;
      if (!isDir(source)) {
        row.error = `source path missing after clone: ${source}`;
        row.durationMs = Date.now() - t0;
        results.push(row);
        console.error(row.error);
        continue;
      }

      row.phase = "convert";
      // Fresh dest for clean conversion
      if (isDir(dest)) rimraf(dest);
      ensureDir(dest);
      const convertArgs = [
        CONVERT,
        "--source",
        source,
        "--dest",
        dest,
        "--name",
        name,
        "--env-root",
        envRoot,
        "--upstream",
        t.repo,
      ];
      console.log("convert", source, "->", dest);
      const conv = run(process.execPath, convertArgs, { stdio: "inherit" });
      if (conv.status !== 0) {
        row.error = `convert failed (${conv.status})`;
        row.durationMs = Date.now() - t0;
        results.push(row);
        console.error(row.error);
        continue;
      }

      row.phase = "validate";
      const val = run(process.execPath, [VALIDATE, "--dest", dest], { stdio: "inherit" });
      if (val.status !== 0) {
        row.error = `validate failed (${val.status})`;
        row.durationMs = Date.now() - t0;
        results.push(row);
        console.error(row.error);
        continue;
      }

      row.ok = true;
      row.phase = "done";
      row.durationMs = Date.now() - t0;
      results.push(row);
      console.log(`OK ${t.id} in ${row.durationMs}ms`);
    } catch (e) {
      row.error = String(e?.stack || e);
      row.durationMs = Date.now() - t0;
      results.push(row);
      console.error(row.error);
    }
  }

  if (!keepClones) {
    // keep clone cache by default for speed on reruns — only delete if not keep and --clean-clones
    if (args["clean-clones"]) rimraf(cloneRoot);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  const summary = {
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    set,
    outDir,
    total: results.length,
    passed,
    failed: failed.length,
    results,
  };

  const reportPath = join(outDir, `convert-fixtures-report-${set}.json`);
  writeJson(reportPath, summary);

  const md = [
    `# convert-to-polyglot fixture report (\`${set}\`)`,
    "",
    `- Total: **${summary.total}**`,
    `- Passed: **${passed}**`,
    `- Failed: **${failed.length}**`,
    `- Duration: ${summary.durationMs}ms`,
    `- Out: \`${outDir}\``,
    "",
    "| ID | Harness | OK | Phase | Dest | Error |",
    "|---|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.id} | ${r.harness} | ${r.ok ? "✅" : "❌"} | ${r.phase} | \`${r.dest}\` | ${String(r.error || "").replace(/\|/g, "\\|").slice(0, 120)} |`
    ),
    "",
  ].join("\n");
  const mdPath = join(outDir, `convert-fixtures-report-${set}.md`);
  writeText(mdPath, md);

  console.log("\n======== SUMMARY ========");
  console.log(`passed ${passed}/${results.length}`);
  console.log("report:", reportPath);
  console.log("markdown:", mdPath);
  if (failed.length) {
    for (const f of failed) console.log(`FAIL ${f.id}: ${f.error}`);
    process.exit(1);
  }
}

main();