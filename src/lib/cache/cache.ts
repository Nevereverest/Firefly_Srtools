import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

type CacheItem = { buf: Uint8Array; type: "json" | "br"; etag: string };
type CachedFile = { version: string; original: CacheItem; packed?: CacheItem };
const cache = new Map<string, CachedFile>();
const dir = path.join(process.cwd(), "data");
const sources = new Map<string, string>();
// Explicitly prefer .json when both forms exist, matching the old API.
for (const file of readdirSync(dir).sort()) {
  if (file.endsWith(".json.br")) sources.set(file.slice(0, -8), file);
}
for (const file of readdirSync(dir)) {
  if (file.endsWith(".json")) sources.set(file.slice(0, -5), file);
}
const hash = (buf: Uint8Array) => createHash("sha256").update(buf).digest("hex");
const item = (buf: Uint8Array, type: CacheItem["type"]): CacheItem => ({ buf, type, etag: `"${hash(buf)}"` });

export function getDataCache(name: string, packed = false) {
  const file = sources.get(name);
  if (!file) return undefined;
  const sourcePath = path.join(dir, file);
  const isDev = process.env.NODE_ENV !== "production";
  let entry = cache.get(name);
  if (entry && !isDev) return packed && entry.packed ? entry.packed : entry.original;
  const stats = statSync(sourcePath);
  const version = `${stats.mtimeMs}:${stats.size}`;
  if (!entry || (isDev && entry.version !== version)) {
    const buf = readFileSync(sourcePath);
    entry = { version, original: item(buf, file.endsWith(".br") ? "br" : "json") };
    const packedPath = path.join(dir, ".packed", file);
    if (!isDev && existsSync(packedPath) && existsSync(`${packedPath}.sha256`) &&
        readFileSync(`${packedPath}.sha256`, "utf8") === hash(buf)) {
      entry.packed = item(readFileSync(packedPath), "br");
    }
    cache.set(name, entry);
  }
  return packed && entry.packed ? entry.packed : entry.original;
}
