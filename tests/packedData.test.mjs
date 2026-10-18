import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { packData, unpackData } from '../src/lib/data/packedData.ts';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
describe('lossless data transport', () => {
  it('round-trips repeated strings, control characters, arrays, null and numbers', () => {
    const long = 'Repeated multilingual text 日本語 Tiếng Việt '.repeat(3);
    const data = { nested: [long, long, long, null, 1.2345, false, '\0literal', '\0!0'], name: { vi: long, en: long } };
    assert.deepEqual(unpackData(JSON.parse(JSON.stringify(packData(data)))), data);
    assert.equal(unpackData(data), data, 'legacy API payloads are supported');
    assert.throws(() => unpackData({ format: 'srtools-strings-v1', strings: [], data: '\0' + '123' }));
  });

  for (const file of readdirSync('data').filter(file => file.endsWith('.json.br') && !file.includes('_basic'))) {
    it(`round-trips all fields/locales in ${file} and never grows the transfer`, () => {
      const original = JSON.parse(brotliDecompressSync(readFileSync(`data/${file}`)));
      assert.equal(hash(unpackData(JSON.parse(JSON.stringify(packData(original))))), hash(original), file);
      if (existsSync(`data/.packed/${file}`)) {
        const packed = JSON.parse(brotliDecompressSync(readFileSync(`data/.packed/${file}`)));
        assert.equal(hash(unpackData(packed)), hash(original), `generated ${file}`);
        assert.ok(readFileSync(`data/.packed/${file}`).length <= readFileSync(`data/${file}`).length, 'wire payload must not grow');
      }
    });
  }
});
