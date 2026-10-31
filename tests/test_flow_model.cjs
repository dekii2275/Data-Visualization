/** Domain tests for geography and hourly traffic profiles. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const demo = path.join(__dirname, '../final_lab/demo');
const { model, config } = vm.runInNewContext(
  fs.readFileSync(path.join(demo, 'config.js'), 'utf8') +
  fs.readFileSync(path.join(demo, 'flow-model.js'), 'utf8') +
  '\n({model: FlowModel, config: FLOW_CONFIG})'
);
const dataset = JSON.parse(fs.readFileSync(path.join(demo, 'traffic_data.json'), 'utf8'));

test('rejects invalid geometry and segments with no travel distance', () => {
  for (const coords of [[], [[10, 106]], [[10, 106], [10, 106]], [[NaN, 106], [10, 106]], [[91, 106], [10, 106]]]) {
    assert.equal(model.buildPath(coords), null);
  }
});

test('interpolates multi-part roads by distance rather than point index', () => {
  const road = model.buildPath([[0, 0], [0, 0.001], [0, 0.004]]);
  const middle = model.pointAt(road, 0.5);
  assert.ok(Math.abs(middle[1] - 0.002) < 1e-8);
  assert.ok(Math.abs(model.pointAt(road, 1.5)[1] - middle[1]) < 1e-8);
  assert.ok(Math.abs(model.pointAt(road, -0.5)[1] - middle[1]) < 1e-8);
});

test('each proposed neighborhood contains existing, nonzero road geometry', () => {
  for (const area of config.areas) {
    const records = model.selectSegments(dataset.segments, area);
    assert.ok(records.length > 0, area.id);
    assert.ok(records.length < dataset.segments.length, area.id);
    assert.ok(records.every(s => model.buildPath(s.coords)));
    const roadName = records[0].name;
    assert.ok(model.selectSegments(dataset.segments, area, roadName).every(s => s.name === roadName));
    assert.equal(model.selectSegments(dataset.segments, area, 'nonexistent road').length, 0);
  }
});

test('uses hourly data, wraps midnight and falls back to dominant LOS', () => {
  const segment = { dominant_los: 'D', hourly_los: ['A', 'F'] };
  assert.equal(model.losAt(segment, 0.5), 'A');
  assert.equal(model.losAt(segment, 1), 'F');
  assert.equal(model.losAt(segment, 24), 'A');
  assert.equal(model.losAt(segment, 3), 'D');
  assert.equal(model.losAt({ dominant_los: 'unknown' }, 0), 'C');
});

test('congestion slows movement and reduces illustrative vehicle spacing', () => {
  const ordered = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(config.profiles[ordered[i]].speed < config.profiles[ordered[i - 1]].speed);
    assert.ok(config.profiles[ordered[i]].spacing < config.profiles[ordered[i - 1]].spacing);
  }
});

test('metrics summarize selected segments, without inventing city-wide counts', () => {
  const segments = [
    { coords: [[0, 0], [0, 0.001]], dominant_los: 'A' },
    { coords: [[0, 0], [0, 0.003]], dominant_los: 'F' }
  ];
  const summary = model.summarize(segments, 7);
  assert.equal(summary.count, 2);
  assert.equal(summary.severe, 1);
  assert.equal(summary.severePct, 50);
  assert.ok(Math.abs(summary.speed - (42 + 3 * 3) / 4) < 1e-8);
  assert.equal(model.summarize([], 0).speed, 0);
});

test('all 24 hours of every scoped road produce finite bounded metrics', () => {
  for (const area of config.areas) {
    const selected = model.selectSegments(dataset.segments, area);
    for (let hour = 0; hour < 24; hour++) {
      const summary = model.summarize(selected, hour);
      assert.ok(Number.isFinite(summary.speed) && summary.speed >= 3 - 1e-9 && summary.speed <= 42 + 1e-9);
      assert.ok(summary.severePct >= 0 && summary.severePct <= 100);
      assert.equal(summary.count, selected.length);
    }
  }
});
