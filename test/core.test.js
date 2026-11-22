import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionRange } from '../src/index.js';

test('splits a range into aligned buckets', () => {
  const buckets = partitionRange(0, 7200, 3600);
  assert.deepEqual(buckets, [
    { start: 0, end: 3600 },
    { start: 3600, end: 7200 },
  ]);
});

test('aligns the first bucket down to the epoch boundary', () => {
  const buckets = partitionRange(100, 3700, 3600);
  assert.deepEqual(buckets, [
    { start: 0, end: 3600 },
    { start: 3600, end: 3700 },
  ]);
});

test('truncates the last bucket at the end of the range', () => {
  const buckets = partitionRange(0, 5000, 3600);
  assert.deepEqual(buckets, [
    { start: 0, end: 3600 },
    { start: 3600, end: 5000 },
  ]);
});

test('returns a single bucket when the range fits inside one bucket', () => {
  const buckets = partitionRange(10, 20, 3600);
  assert.deepEqual(buckets, [{ start: 0, end: 20 }]);
});

test('handles a range that starts exactly on a boundary', () => {
  const buckets = partitionRange(3600, 7200, 3600);
  assert.deepEqual(buckets, [{ start: 3600, end: 7200 }]);
});

test('handles negative timestamps (before the epoch)', () => {
  const buckets = partitionRange(-7200, -3600, 3600);
  assert.deepEqual(buckets, [
    { start: -7200, end: -3600 },
  ]);
});

test('handles negative timestamps crossing the epoch', () => {
  const buckets = partitionRange(-100, 100, 3600);
  assert.deepEqual(buckets, [
    { start: -3600, end: 0 },
    { start: 0, end: 100 },
  ]);
});

test('uses a default bucket size of one hour', () => {
  const buckets = partitionRange(0, 5400);
  assert.deepEqual(buckets, [
    { start: 0, end: 3600 },
    { start: 3600, end: 5400 },
  ]);
});

test('rejects non-integer inputs', () => {
  assert.throws(() => partitionRange(0.5, 100, 10), TypeError);
  assert.throws(() => partitionRange(0, 100.5, 10), TypeError);
  assert.throws(() => partitionRange(0, 100, 10.5), TypeError);
  assert.throws(() => partitionRange('0', 100, 10), TypeError);
});

test('rejects start >= end', () => {
  assert.throws(() => partitionRange(100, 100, 10), RangeError);
  assert.throws(() => partitionRange(200, 100, 10), RangeError);
});

test('rejects non-positive bucket size', () => {
  assert.throws(() => partitionRange(0, 100, 0), RangeError);
  assert.throws(() => partitionRange(0, 100, -10), RangeError);
});

test('does not mutate its arguments', () => {
  const start = 100;
  const end = 200;
  const bucketSize = 50;
  partitionRange(start, end, bucketSize);
  assert.equal(start, 100);
  assert.equal(end, 200);
  assert.equal(bucketSize, 50);
});
