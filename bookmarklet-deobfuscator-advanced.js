// bookmarklet-deobfuscator-advanced.js
// Usage:
//   node bookmarklet-deobfuscator-advanced.js input.js > clean.js

const fs = require("fs");
const path = require("path");

// --------------------
// 1. Read input file
// --------------------
if (!process.argv[2]) {
  console.error("❌ No input file provided");
  process.exit(1);
}

const inputPath = process.argv[2];
let code;

try {
  code = fs.readFileSync(inputPath, "utf8");
} catch (e) {
  console.error("❌ Failed to read file:", e.message);
  process.exit(1);
}

// --------------------
// 2. Decode bookmarklet
// --------------------
code = code.trim();

code = code.replace(/^javascript:/i, "");

try {
  code = decodeURIComponent(code.replace(/\+/g, " "));
} catch {
  console.error("⚠️ URL decoding had issues, continuing with raw code");
}

code = code.replace(/\r\n/g, "\n");

// --------------------
// 3. Find string array
// --------------------
const arrayMatch = code.match(
  /(const|var|let)\s+(_0x[a-f0-9]+)\s*=\s*\[(.*?)\];/s
);

if (!arrayMatch) {
  console.error("❌ No obfuscation string array found");
  process.exit(1);
}

const arrayName = arrayMatch[2];
const arrayBody = arrayMatch[3];

if (/`/.test(arrayBody)) {
  console.error("❌ Template literals detected in array, aborting for security");
  process.exit(1);
}

if (!/^(\s*(['"])(?:[^\\]|\\.)*?\2\s*,?\s*)*$/s.test(arrayBody)) {
  console.error("❌ String array contains non-string values or invalid syntax, aborting");
  process.exit(1);
}

let strings;
try {
  strings = JSON.parse(`[${arrayBody.replace(/'/g, '"').replace(/,\s*$/, "")}]`);
} catch (e) {
  console.error("❌ Failed to parse string array:", e.message);
  process.exit(1);
}

// --------------------
// 4. Replace decoder calls
// --------------------
const decoderRegex = new RegExp(
  `${arrayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(\\s*0x([0-9a-f]+)\\s*\\)`,
  "gi"
);

let passes = 0;
let changed = true;
const missingIndices = [];

while (changed && passes < 10) {
  changed = false;
  passes++;

  code = code.replace(decoderRegex, (match, hex) => {
    const index = parseInt(hex, 16);
    const value = strings[index];

    if (typeof value === "string") {
      changed = true;
      return JSON.stringify(value);
    }
    missingIndices.push(index);
    return match;
  });
}

if (missingIndices.length > 0) {
  const unique = [...new Set(missingIndices)];
  console.error(`⚠️ Could not resolve indices: ${unique.join(", ")}`);
}

// --------------------
// 5. Remove array + wrapper junk
// --------------------
code = code.replace(arrayMatch[0], "");

code = code.replace(/^\s*\(function\s*\(\)\s*\{\s*/s, "");
code = code.replace(/\}\s*\)\s*\(\s*\)\s*;?\s*$/s, "");

// --------------------
// 6. Output (no naive beautify - use external tool like prettier)
// --------------------
console.log(code);
