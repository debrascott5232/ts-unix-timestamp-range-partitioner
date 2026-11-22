const DEFAULT_BUCKET_SIZE = 3600; // one hour in seconds

/**
 * Split a Unix timestamp range into fixed-size buckets aligned to epoch boundaries.
 *
 * The range is interpreted as a half-open interval [start, end).  A bucket is
 * represented as a plain object with `start` and `end` properties (both Unix
 * timestamps in seconds).  Buckets are aligned to multiples of `bucketSize`
 * measured from the Unix epoch (1970-01-01T00:00:00Z).  The final bucket is
 * truncated at `end` if the range does not fill it completely.
 *
 * @param {number} start - inclusive start timestamp (seconds since epoch)
 * @param {number} end - exclusive end timestamp (seconds since epoch)
 * @param {number} [bucketSize=DEFAULT_BUCKET_SIZE] - positive bucket width in seconds
 * @returns {{start: number, end: number}[]} array of buckets, ordered by start time
 * @throws {TypeError} if any argument is not a finite integer number
 * @throws {RangeError} if start >= end or bucketSize <= 0
 */
export function partitionRange(start, end, bucketSize = DEFAULT_BUCKET_SIZE) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(bucketSize)) {
    throw new TypeError('start, end, and bucketSize must be integers');
  }
  if (start >= end) {
    throw new RangeError('start must be less than end');
  }
  if (bucketSize <= 0) {
    throw new RangeError('bucketSize must be positive');
  }

  const buckets = [];
  // Align the first bucket start down to the nearest epoch boundary.
  // Math.floor is safe because start is an integer and bucketSize is positive.
  let bucketStart = Math.floor(start / bucketSize) * bucketSize;

  while (bucketStart < end) {
    const bucketEnd = bucketStart + bucketSize;
    buckets.push({
      start: bucketStart,
      end: bucketEnd < end ? bucketEnd : end,
    });
    bucketStart = bucketEnd;
  }

  return buckets;
}
