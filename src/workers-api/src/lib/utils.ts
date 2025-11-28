export function handler<Env = unknown, CfHostMetadata = unknown>(f: ExportedHandlerFetchHandler<Env, CfHostMetadata>) {
	return f;
}

export function getPath(url: string) {
	const index = url.indexOf('/', Math.max(0, url.indexOf('://') + 3));
	return index === -1 ? '/' : url.substring(index);
}

export function stripQueryString(url: string) {
	const index = url.indexOf('?');
	return index === -1 ? url : url.substring(0, index);
}
