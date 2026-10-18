import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/app/api/data/[name]/route.ts';

describe('data HTTP cache validation', () => {
  it('returns content ETags, accepts conditional requests and keeps wire formats isolated', async () => {
    const context = { params: Promise.resolve({ name: 'as' }) };
    const response = await GET(new Request('http://localhost/api/data/as'), context);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Encoding'), 'br');
    const etag = response.headers.get('etag');
    assert.ok(etag);
    assert.match(response.headers.get('Cache-Control'), /no-cache/);
    const cached = await GET(new Request('http://localhost/api/data/as', { headers: { 'If-None-Match': `W/${etag}` } }), context);
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), '');
    const packed = await GET(new Request('http://localhost/api/data/as?encoding=strings-v1'), context);
    if (process.env.NODE_ENV === 'production') {
      assert.notEqual(packed.headers.get('etag'), etag);
      const different = await GET(new Request('http://localhost/api/data/as?encoding=strings-v1', { headers: { 'If-None-Match': etag } }), context);
      assert.equal(different.status, 200, 'legacy ETag must not validate a packed response');
    }
    const missing = await GET(new Request('http://localhost/api/data/missing'), { params: Promise.resolve({ name: 'missing' }) });
    assert.equal(missing.status, 404);
  });
});
