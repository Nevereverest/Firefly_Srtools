import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync, brotliDecompressSync, constants } from "node:zlib";
import { packData } from "../src/lib/data/packedData";

const directory = path.join(process.cwd(), "data");
const output = path.join(directory, ".packed");
mkdirSync(output, { recursive: true });
const buildSignature = createHash("sha256")
  .update(readFileSync(new URL(import.meta.url)))
  .update(readFileSync(path.join(process.cwd(), "src/lib/data/packedData.ts"))).digest("hex");
let originalBytes = 0, packedBytes = 0, originalTransfer = 0, packedTransfer = 0;
for (const file of readdirSync(directory)) {
  if (!file.endsWith(".json.br") || file.includes("_basic")) continue;
  const source = readFileSync(path.join(directory, file));
  const json = brotliDecompressSync(source);
  const target = path.join(output, file);
  const sourceHash = createHash("sha256").update(source).digest("hex");
  const signature = `${sourceHash}:${buildSignature}`;
  if (existsSync(target) && existsSync(`${target}.build`) &&
      readFileSync(`${target}.build`, "utf8") === signature) {
    const existing = readFileSync(target);
    originalBytes += json.length;
    packedBytes += brotliDecompressSync(existing).length;
    originalTransfer += source.length;
    packedTransfer += existing.length;
    continue;
  }
  const packed = Buffer.from(JSON.stringify(packData(JSON.parse(json.toString()))));
  originalBytes += json.length;
  originalTransfer += source.length;
  // Spend build-time CPU, not request-time CPU. Never grow the network payload
  // to save JSON parsing; keep the original if Brotli already handles it better.
  let compressed = source;
  let body = json;
  if (packed.length < json.length * 0.95) {
    const candidate = brotliCompressSync(packed, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    });
    if (candidate.length <= source.length) { compressed = candidate; body = packed; }
  }
  packedBytes += body.length;
  packedTransfer += compressed.length;
  writeFileSync(path.join(output, file), compressed);
  // A stale generated file can never be served for a changed source file.
  writeFileSync(path.join(output, `${file}.sha256`), sourceHash);
  writeFileSync(`${target}.build`, signature);
}
console.log(`Data JSON: ${(originalBytes / 1048576).toFixed(2)} → ${(packedBytes / 1048576).toFixed(2)} MiB (lossless; all locales/datasets retained)`);

console.log(`Brotli transfer: ${(originalTransfer / 1048576).toFixed(2)} → ${(packedTransfer / 1048576).toFixed(2)} MiB`);
