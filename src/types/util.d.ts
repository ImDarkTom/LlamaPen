import type { Readable } from 'readable-stream';

type ReadableOf<T> = Readable & AsyncIterable<T>;