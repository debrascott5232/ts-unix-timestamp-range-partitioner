# ts-unix-timestamp-range-partitioner

Splits a Unix timestamp range into fixed-size buckets aligned to epoch boundaries for time-series data storage.

## Usage

```js
import { partitionRange } from './src/index.js';

const buckets = partitionRange(100, 3700, 3600);
// [
//   { start: 0, end: 3600 },
//   { start: 3600, end: 3700 },
// ]
```

The function takes `start` (inclusive), `end` (exclusive), and an optional
`bucketSize` in seconds (default 3600).  It returns an array of objects with
`start` and `end` properties, ordered by start time.

## Why this exists

Time-series databases often store data in fixed-size buckets aligned to the
Unix epoch.  Given an arbitrary query range, you need to know exactly which
buckets overlap that range.  Computing this by hand is easy to get wrong when
the range does not start on a boundary, when it spans the epoch, or when it is
shorter than one bucket.  This library centralises that logic in one small,
well-tested function.

The trade-off is deliberate: buckets are always aligned to the epoch, never to
the start of the range.  That means the first bucket may begin earlier than
`start`, and the last bucket may extend beyond `end` only if the range does not
fill it completely.  This matches the storage layout used by many time-series
systems and keeps bucket boundaries stable across different queries.

## Edge cases

- Negative timestamps (before 1970-01-01T00:00:00Z) are supported.  A range
  that crosses the epoch will produce a bucket ending at 0 and another starting
  at 0.
- If the range fits entirely inside one bucket, a single bucket is returned
  with `end` equal to the range end.
- `start` must be strictly less than `end`, and `bucketSize` must be a positive
  integer.  Violations throw `RangeError` or `TypeError` respectively.
