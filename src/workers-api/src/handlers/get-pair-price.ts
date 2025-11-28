import { attempt, type Attempt } from '@duydang2311/attempt';
import invariant from 'tiny-invariant';
import { Pair } from '../lib/types';
import { getPath, handler, stripQueryString } from '../lib/utils';

// TODO: round-robin getPrices
// pairs/:pair/price
export function getPairPriceHandler(getPrices: GetPrice[]) {
	return handler(async (req, _env, ctx) => {
		const pair = extractPair(getPath(req.url));
		const cacheKey = stripQueryString(req.url);
		const cache = caches.default;
		const response = await cache.match(cacheKey);
		if (response) {
			return response;
		}
		for (const getPrice of getPrices) {
			const result = await getPrice(pair);
			if (!result.ok) {
				if (result.error === 'RATE_LIMIT') continue;
				const body = { error: result.error };
				switch (result.error) {
					case 'NOT_FOUND':
						return Response.json(body, { status: 404 });
					default:
						return Response.json(body, { status: 500 });
				}
			}
			const response = Response.json(
				{ pair, price: result.data },
				{
					status: 200,
					headers: {
						'Cache-Control': 'public, max-age=1',
					},
				}
			);
			ctx.waitUntil(cache.put(cacheKey, response.clone()));
			return response;
		}
		return Response.json({ error: 'RATE_LIMIT' }, { status: 429 });
	});
}

export function extractPair(path: string): Pair {
	const length = '/pairs/'.length;
	const index = path.indexOf('/', length);
	const pair = path.substring(length, index === -1 ? undefined : index);
	invariant(pair.indexOf('-') !== -1, 'invalid pair');
	return pair as Pair;
}

interface GetPrice {
	(pair: Pair): Promise<Attempt<string, 'NOT_FOUND' | 'RATE_LIMIT' | 'UNKNOWN'>>;
}

export function getPriceBinance(fetch: typeof globalThis.fetch): GetPrice {
	return async (pair) => {
		const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair.replace(/-/g, '')}`, {
			method: 'GET',
		});
		if (response.status === 400) {
			const { code } = await response.json<{ code: number }>();
			if (code === -1121) {
				return attempt.fail('NOT_FOUND');
			}
			return attempt.fail('UNKNOWN');
		}
		if (response.status === 429) {
			return attempt.fail('RATE_LIMIT');
		}
		return attempt.ok(await response.json<{ price: string }>().then((a) => a.price));
	};
}

export function getPriceCoinbase(fetch: typeof globalThis.fetch): GetPrice {
	return async (pair) => {
		const response = await fetch(`https://api.exchange.coinbase.com/products/${pair}/ticker`, {
			method: 'GET',
			headers: {
				'User-Agent': 'cmdpal-ext-currency-exchange',
			},
		});
		if (!response.ok) {
			switch (response.status) {
				case 404:
					return attempt.fail('NOT_FOUND');
				case 429:
					return attempt.fail('RATE_LIMIT');
				default:
					return attempt.fail('UNKNOWN');
			}
		}
		return attempt.ok(await response.json<{ price: string }>().then((a) => a.price));
	};
}
