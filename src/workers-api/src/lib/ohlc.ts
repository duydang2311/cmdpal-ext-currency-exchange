export type OHLCPair = `${string}-${string}`;
export type OHLCInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface GetOHLCOptions {
	interval?: OHLCInterval;
}

export interface GetOHLC {
	(pair: string, options?: GetOHLCOptions): Promise<{ time: number; open: number; high: number; low: number; close: number }[]>;
}

export function getOHLCBinance(fetch: typeof globalThis.fetch): GetOHLC {
	return async (pair, options?) => {
		const response = await fetch(
			`https://api.binance.com/api/v3/klines?symbol=${pair.replace(/-/g, '')}&interval=${options?.interval ?? '1d'}&limit=300`,
			{ method: 'GET' }
		);
		if (!response.ok) {
			return [];
		}
		const candles = await response.json<[time: number, open: string, high: string, low: string, close: string][]>();
		return candles.map(([time, open, high, low, close]) => ({
			time,
			open: Number(open),
			high: Number(high),
			low: Number(low),
			close: Number(close),
		}));
	};
}

export function getOHLCCoinbase(fetch: typeof globalThis.fetch): GetOHLC {
	return async (pair, options?) => {
		const response = await fetch(
			`https://api.exchange.coinbase.com/products/${pair}/candles?granularity=${convertIntervalToSeconds(options?.interval ?? '1h')}`,
			{
				method: 'GET',
				headers: {
					'User-Agent': 'cmdpal-ext-currency-exchange-workers',
				},
			}
		);
		if (!response.ok) {
			return [];
		}
		const candles = await response.json<[time: number, low: number, high: number, open: number, close: number][]>();
		return candles
			.map(([time, open, high, low, close]) => ({
				time,
				open,
				high,
				low,
				close,
			}))
			.toSorted((a, b) => a.time - b.time);
	};
}

export function convertIntervalToSeconds(interval: OHLCInterval) {
	switch (interval) {
		case '1m':
			return 60;
		case '5m':
			return 300;
		case '15m':
			return 900;
		case '1h':
			return 3600;
		case '4h':
			return 21600;
		case '1d':
			return 86400;
	}
}
