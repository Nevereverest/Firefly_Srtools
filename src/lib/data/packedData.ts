// Lossless wire format. Data files and the default API response stay unchanged.
// Only repeated long strings are interned; numeric values, keys and order remain intact.
export const PACKED_DATA_FORMAT = "srtools-strings-v1";
export type PackedData = { format: string; strings: string[]; data: unknown };

export function packData(data: unknown): PackedData {
  const counts = new Map<string, number>();
  const visit = (value: unknown) => {
    if (typeof value === "string" && value.length >= 32) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    } else if (value && typeof value === "object") {
      for (const child of Object.values(value)) visit(child);
    }
  };
  visit(data);
  const strings = [...counts].filter(([text, count]) =>
    count > 1 && (count - 1) * JSON.stringify(text).length > count * 16
  ).map(([text]) => text);
  const refs = new Map(strings.map((text, index) => [text, `\0${index}`]));
  const encode = (value: unknown): unknown => {
    if (typeof value === "string") return refs.get(value) ?? (value.startsWith("\0") ? `\0!${value}` : value);
    if (Array.isArray(value)) return value.map(encode);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, encode(child)]));
    }
    return value;
  };
  return { format: PACKED_DATA_FORMAT, strings, data: encode(data) };
}

export function unpackData<T>(payload: T | PackedData): T {
  if (!payload || typeof payload !== "object" || !("format" in payload) ||
      payload.format !== PACKED_DATA_FORMAT) return payload as T;
  const { strings, data } = payload as PackedData;
  if (!Array.isArray(strings) || !strings.every(text => typeof text === "string")) {
    throw new Error("Invalid packed data dictionary");
  }
  // Decode in place: avoid allocating a second copy of large object trees.
  const decode = (value: unknown): unknown => {
    if (typeof value === "string" && value.startsWith("\0")) {
      if (value.startsWith("\0!")) return value.slice(2);
      const index = value.slice(1);
      if (!/^(0|[1-9]\d*)$/.test(index) || Number(index) >= strings.length) {
        throw new Error("Invalid packed data reference");
      }
      return strings[Number(index)];
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) value[i] = decode(value[i]);
    } else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      for (const key of Object.keys(record)) record[key] = decode(record[key]);
    }
    return value;
  };
  return decode(data) as T;
}
