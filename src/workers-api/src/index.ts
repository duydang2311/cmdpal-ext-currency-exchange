import { PatternRouter } from 'hono/router/pattern-router';
import { getPath } from 'hono/utils/url';
import { getPriceBinance, getPriceCoinbase, getPairPriceHandler } from './handlers/get-pair-price';

const router = new PatternRouter<ExportedHandlerFetchHandler<Env>>();

router.add('GET', '/pairs/:pair/price', getPairPriceHandler([getPriceBinance(fetch), getPriceCoinbase(fetch)]));

export default {
	async fetch(req, env, ctx): Promise<Response> {
		const path = getPath(req);
		const result = router.match(req.method, path)[0];
		let response: Response | null = null;
		if (result.length > 0) {
			const handler = result[0][0];
			response = await handler(req, env, ctx);
		} else {
			response = new Response(null, { status: 404 });
		}
		return response;

		// 	const url = new URL(request.url);
		// 	const ohlc = await getOHLCCoinbase(fetch)(url.searchParams.get('pair')!, { interval: '1d' });
		// 	if (ohlc.length === 0) {
		// 		return new Response(null);
		// 	}

		// 	const times = ohlc.map((a) => a.time);
		// 	const closes = ohlc.map((a) => a.close);
		// 	const timeMin = Math.min(...times);
		// 	const timeMax = Math.max(...times);
		// 	const closeMin = Math.min(...closes);
		// 	const closeMax = Math.max(...closes);
		// 	const points = simplify(
		// 		ohlc.map((a) => ({
		// 			x: a.time - timeMin,
		// 			y: a.close - closeMin,
		// 		})),
		// 		20
		// 	);

		// 	// --- 2. Determine SVG Dimensions and Scaling Factors ---

		// 	// Define the desired SVG size
		// 	const SVG_WIDTH = 800;
		// 	const SVG_HEIGHT = 400;
		// 	const PADDING = 0; // Padding around the chart area

		// 	// Calculate the chart area dimensions
		// 	const CHART_WIDTH = SVG_WIDTH - 2 * PADDING;
		// 	const CHART_HEIGHT = SVG_HEIGHT - 2 * PADDING;

		// 	// Calculate the ohlc range (ohlc space)
		// 	const timeRange = timeMax - timeMin;
		// 	const lowRange = closeMax - closeMin;

		// 	// Handle the case where the range is zero (e.g., all prices are the same)
		// 	const xScaleFactor = timeRange > 0 ? CHART_WIDTH / timeRange : 0;
		// 	const yScaleFactor = lowRange > 0 ? CHART_HEIGHT / lowRange : 0;

		// 	// Function to map a ohlc point to an SVG coordinate
		// 	const scalePoint = (p) => {
		// 		// x-axis: normalizedX * scaleFactor + PADDING
		// 		const scaledX = p.x * xScaleFactor + PADDING;

		// 		// y-axis: SVG coordinates start from the top.
		// 		// We invert the y-coordinate so that the low prices (small y in ohlc) map to a high pixel value (closer to the bottom).
		// 		const scaledY = CHART_HEIGHT - p.y * yScaleFactor + PADDING;

		// 		return { x: scaledX, y: scaledY };
		// 	};

		// 	// --- 3. Generate the SVG Path String ---

		// 	// Map all normalized points to scaled SVG coordinates
		// 	const scaledPoints = points.map(scalePoint);

		// 	// Create the 'd' attribute string for the <path> element
		// 	// Start with 'M' (Move to) the first point, then use 'L' (Line to) for the rest.
		// 	const linePathD = monotoneCubic2Path(scaledPoints);
		// 	let areaPathD = '';
		// 	if (scaledPoints.length > 0) {
		// 		const firstPoint = scaledPoints[0];
		// 		const lastPoint = scaledPoints[scaledPoints.length - 1];

		// 		areaPathD =
		// 			`M${firstPoint.x},${CHART_HEIGHT + PADDING} ` + // Start at bottom-left of chart area
		// 			`${linePathD.substring(1)} ` + // Follow the line (skip the initial 'M')
		// 			`L${lastPoint.x},${CHART_HEIGHT + PADDING} ` + // Line down to bottom-right of chart area
		// 			`Z`; // Close the path back to the start
		// 	}
		// 	// --- 4. Assemble the Final SVG ---

		// 	const svgString = `
		//     <svg width="100%" height="100%" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
		// 		<defs>
		//             <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
		//                 <stop offset="0%" style="stop-color:#f5393c;stop-opacity:0.6" />
		//                 <stop offset="100%" style="stop-color:#f5393c;stop-opacity:0.1" />
		//             </linearGradient>
		//         </defs>
		//         <!-- <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#f4f4f4"/> -->
		//         <!-- <rect x="${PADDING}" y="${PADDING}" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="white" stroke="#ccc" stroke-width="1"/> -->
		// 		<path
		//             d="${areaPathD}"
		//             fill="url(#areaGradient)"
		//         />

		//         <path
		//             d="${linePathD}"
		//             fill="none"
		//             stroke="#f5393c"
		//             stroke-width="1"
		//         />
		//     </svg>
		// `;

		// 	return new Response(svgString, {
		// 		headers: { 'Content-Type': 'image/svg+xml' },
		// 	});
	},
} satisfies ExportedHandler<Env>;
