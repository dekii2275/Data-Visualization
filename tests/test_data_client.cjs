/** Transport tests run without a browser or third-party packages. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const demo = path.join(__dirname, '../final_lab/demo');
const dataset = JSON.parse(fs.readFileSync(path.join(demo, 'traffic_data.json'), 'utf8'));
const source = fs.readFileSync(path.join(demo, 'config.js'), 'utf8') +
  fs.readFileSync(path.join(demo, 'data.js'), 'utf8') + '\nTrafficDataClient;';

function makeClient(fetch) {
  return vm.runInNewContext(source, {
    fetch, AbortController, setTimeout, clearTimeout,
    console: { warn() {} }
  });
}

for (const failure of ['http', 'network', 'json', 'shape', 'timeout']) {
  test(`falls back to static data after ${failure} failure`, async () => {
    const urls = [];
    const client = makeClient(async (url, options) => {
      urls.push(url);
      if (url === 'traffic_data.json') return { ok: true, json: async () => dataset };
      if (failure === 'network') throw new Error('offline');
      if (failure === 'timeout') {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      }
      return {
        ok: failure !== 'http', status: 503,
        json: async () => {
          if (failure === 'json') throw new Error('invalid JSON');
          return {};
        }
      };
    });
    const result = await client.load();
    assert.equal(result.live, false);
    assert.equal(result.data, dataset);
    assert.deepEqual(urls, ['/api/traffic/data', 'traffic_data.json']);
  });
}

test('uses the API when data is available', async () => {
  const urls = [];
  const client = makeClient(async url => {
    urls.push(url);
    return { ok: true, json: async () => dataset };
  });
  const result = await client.load();
  assert.equal(result.live, true);
  assert.equal(result.data, dataset);
  assert.equal(urls.length, 1);
});

test('propagates an error when both sources fail', async () => {
  const client = makeClient(async () => { throw new Error('offline'); });
  await assert.rejects(client.load(), /offline/);
});
