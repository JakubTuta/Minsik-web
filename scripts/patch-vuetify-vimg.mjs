#!/usr/bin/env node
// Guards VImg's pollForSize() against an undefined img element after every
// `bun install`. Upstream bug (vuetifyjs/vuetify#22361): on fast navigation
// or with `eager`, pollForSize can run after the <img> ref has already gone
// null (component unmounted/re-rendered mid-flight), and it destructures
// naturalHeight/naturalWidth straight off the argument with no guard —
// "Cannot destructure property 'naturalHeight' of 'r' as it is undefined".

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetFile = resolve(__dirname, "../node_modules/vuetify/lib/components/VImg/VImg.js");

const MARKER = "// [patched: guard-pollforsize-undefined-img]";
const NEEDLE = `      const poll = () => {
        clearTimeout(timer);
        if (vm.isUnmounted) return;
        const {
          naturalHeight: imgHeight,
          naturalWidth: imgWidth
        } = img;`;
const REPLACEMENT = `      const poll = () => {
        clearTimeout(timer);
        if (vm.isUnmounted) return;
        ${MARKER}
        if (!img) return;
        const {
          naturalHeight: imgHeight,
          naturalWidth: imgWidth
        } = img;`;

let content = readFileSync(targetFile, "utf8");

if (content.includes(MARKER)) {
  console.log("VImg.js: patch already applied, skipping.");
  process.exit(0);
}

if (!content.includes(NEEDLE)) {
  console.error("VImg.js: expected pollForSize source not found, skipping patch (vuetify version likely changed — re-check scripts/patch-vuetify-vimg.mjs).");
  process.exit(0);
}

content = content.replace(NEEDLE, REPLACEMENT);

writeFileSync(targetFile, content, "utf8");
console.log("VImg.js: pollForSize undefined-img guard applied.");
