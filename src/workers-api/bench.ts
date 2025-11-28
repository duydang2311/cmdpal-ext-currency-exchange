/**
 * 1. Your original implementation (manual loop with charCodeAt checks).
 * This logic checks for '//' to skip the protocol slashes.
 */
export function getPathOriginal(url: string) {
	const index = url.indexOf('/', Math.max(0, url.indexOf('://') + 3));
	return index === -1 ? '/' : url.substring(index);
}

/**
 * 2. Hyper-Optimized implementation (using V8-optimized built-in indexOf).
 * This relies on the fact that the path starts after the '://' protocol separator.
 * This is generally faster because built-in string methods execute native C++ code in V8.
 */
function getPathHyperOptimized(url) {
	// 1. Find the end of the protocol part '://'
	const protocolSeparatorIndex = url.indexOf('://');

	// Start searching for the first path slash AFTER the host/port part.
	// host starts 3 characters after '://'
	const startSearchIndex = protocolSeparatorIndex > -1 ? protocolSeparatorIndex + 3 : 0;

	// 2. Find the first slash occurring AFTER the host part.
	const pathStartIndex = url.indexOf('/', startSearchIndex);

	if (pathStartIndex > -1) {
		return url.substring(pathStartIndex);
	}

	// 3. If no slash is found (e.g., 'http://example.com'), path is root.
	return '/';
}

// --- Benchmark Configuration ---
const ITERATIONS = 1000000; // 1 Million runs for micro-optimization stability
const URLS = [
	'https://example.com/api/v1/resource?query=test#hash',
	'http://localhost:3000/some/deep/path',
	'https://cdn.server.net/images/large/photo.jpg',
	'ftp://data.server.com/file.txt',
	'http://127.0.0.1:8080/metrics/prom',
];
const URL_COUNT = URLS.length;
// --- End Configuration ---

console.log(`\n--- Path Extraction Benchmark ---`);
console.log(`Running each test ${ITERATIONS} times with ${URL_COUNT} distinct full URLs.`);
console.log(`\nExample URL: ${URLS[0]}`);
console.log('---------------------------------');

// #1: Benchmark your original function
console.time('1. Original getPath (Manual Loop)');
for (let i = 0; i < ITERATIONS; i++) {
	getPathOriginal(URLS[i % URL_COUNT]);
}
console.timeEnd('1. Original getPath (Manual Loop)');

// ---

// #2: Benchmark the hyper-optimized function
console.time('2. Hyper-Optimized (indexOf)');
for (let i = 0; i < ITERATIONS; i++) {
	getPathHyperOptimized(URLS[i % URL_COUNT]);
}
console.timeEnd('2. Hyper-Optimized (indexOf)');

// ---

// #3: Benchmark new URL(url).pathname (Robustness Baseline)
console.time('3. new URL().pathname (Baseline)');
for (let i = 0; i < ITERATIONS; i++) {
	try {
		// Full URL is guaranteed, so no base URL needed.
		const urlObject = new URL(URLS[i % URL_COUNT]);
		const pathname = urlObject.pathname;
	} catch (e) {
		// Skip invalid URL processing in the benchmark
		continue;
	}
}
console.timeEnd('3. new URL().pathname (Baseline)');
console.log('---------------------------------\n');
