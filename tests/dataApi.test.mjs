import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import {
  getMetadataApi, getAvatarListApi, getLightconeListApi, getRelicSetListApi,
  getMonsterListApi, getASEventListApi, getPFEventListApi, getMOCEventListApi,
  getPeakEventListApi, getChangelog,
} from '../src/lib/api/api.ts';

const fetchers = [getMetadataApi, getAvatarListApi, getLightconeListApi, getRelicSetListApi,
  getMonsterListApi, getASEventListApi, getPFEventListApi, getMOCEventListApi,
  getPeakEventListApi, getChangelog];

describe('required data API contracts', () => {
  it('propagates network errors so query success cannot unlock an incomplete app', async () => {
    const get = axios.get;
    const log = console.error;
    const failure = new Error('intentional network failure');
    axios.get = async () => { throw failure; };
    console.error = () => {};
    try {
      for (const fetcher of fetchers) await assert.rejects(fetcher(), error => error === failure);
    } finally { axios.get = get; console.error = log; }
  });

  it('returns successful payloads unchanged (no dropping dependent data)', async () => {
    const get = axios.get;
    const payload = { reference: 'full payload' };
    axios.get = async () => ({ data: payload });
    try {
      for (const fetcher of fetchers) assert.equal(await fetcher(), payload);
    } finally { axios.get = get; }
  });

  it('decodes packed responses before callers can mark a query successful', async () => {
    const get = axios.get;
    axios.get = async () => ({ data: { format: 'srtools-strings-v1', strings: ['full multilingual text'], data: { name: '\0' + '0' } } });
    try {
      assert.deepEqual(await getAvatarListApi(), { name: 'full multilingual text' });
    } finally { axios.get = get; }
  });

});
