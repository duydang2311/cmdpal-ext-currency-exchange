import { expect, test } from 'bun:test';
import { extractPair } from './get-pair-price';

test('extract pair BTC-USDT', () => {
	expect(extractPair('/pairs/BTC-USDT/price')).toBe('BTC-USDT');
});
