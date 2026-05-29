#!/usr/bin/env node
// Re-applies the Bun/Windows pathToFileURL fix to @nuxt/vite-builder's vite-node-runner
// after every `bun install`. Without this, vite-node throws "File URL path must be an
// absolute path" for virtual module IDs (/@id/...) because Bun's pathToFileURL on
// Windows doesn't add the drive letter for POSIX-style paths.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetFile = resolve(__dirname, "../node_modules/@nuxt/vite-builder/dist/vite-node-runner.mjs");

const MARKER = "// [patched: fix-bun-windows-pathToFileURL]";
const PATCH = `
${MARKER}
function fixWindowsFsPath(fsPath) {
\tif (process.platform !== "win32") return fsPath;
\tif (typeof fsPath === "string" && fsPath.startsWith("/") && !/^\\/[a-zA-Z]:\\//.test(fsPath)) {
\t\tconst drive = process.cwd()[0];
\t\treturn drive + ":/" + fsPath.slice(1);
\t}
\treturn fsPath;
}
class NuxtViteNodeRunner extends ViteNodeRunner {
\tasync resolveUrl(id, importer) {
\t\tconst result = await super.resolveUrl(id, importer);
\t\tif (Array.isArray(result)) {
\t\t\treturn [result[0], fixWindowsFsPath(result[1])];
\t\t}
\t\treturn result;
\t}
}`;

let content = readFileSync(targetFile, "utf8");

if (content.includes(MARKER)) {
  console.log("vite-node-runner.mjs: patch already applied, skipping.");
  process.exit(0);
}

content = content
  .replace(
    "const runner = createRunner();",
    `${PATCH}\nconst runner = createRunner();`
  )
  .replace(
    "return new ViteNodeRunner({",
    "return new NuxtViteNodeRunner({"
  );

writeFileSync(targetFile, content, "utf8");
console.log("vite-node-runner.mjs: Bun/Windows pathToFileURL patch applied.");
