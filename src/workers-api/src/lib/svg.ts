export interface Vec2 {
	x: number;
	y: number;
}

function getPerpendicularDistance(point: Vec2, start: Vec2, end: Vec2) {
	let dx = end.x - start.x;
	let dy = end.y - start.y;

	// Line is a point
	if (dx === 0 && dy === 0) {
		return Math.hypot(point.x - start.x, point.y - start.y);
	}

	// Normalized segment vector
	const lengthSq = dx * dx + dy * dy;

	// t is the projection of the point onto the line
	let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq;

	// Restrict t to the segment (0 to 1)
	t = Math.max(0, Math.min(1, t));

	// Closest point on the segment
	const closestX = start.x + t * dx;
	const closestY = start.y + t * dy;

	// Distance to the closest point
	return Math.hypot(point.x - closestX, point.y - closestY);
}

export function simplify(points: Vec2[], epsilon: number) {
	if (points.length <= 2) {
		return points;
	}

	// Find the point with the maximum distance
	let dMax = 0;
	let index = 0;
	const end = points.length - 1;

	for (let i = 1; i < end; i++) {
		const d = getPerpendicularDistance(points[i], points[0], points[end]);
		if (d > dMax) {
			index = i;
			dMax = d;
		}
	}

	// If maximum distance is greater than epsilon, recursively simplify
	if (dMax > epsilon) {
		const result1 = simplify(points.slice(0, index + 1), epsilon);
		const result2 = simplify(points.slice(index), epsilon);

		// Concatenate results, removing the duplicate point at the end of result1/start of result2
		return result1.slice(0, result1.length - 1).concat(result2);
	} else {
		// If distance is less than epsilon, just return the start and end points
		return [points[0], points[end]];
	}
}

export function monotoneCubic2Path(points: Vec2[]) {
	if (points.length < 2) return '';

	let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

	// 1. Calculate derivatives (slopes) at each point
	const slopes: number[] = [0]; // slope[0] is not used, actual start at index 1
	const n = points.length;

	for (let i = 0; i < n; i++) {
		if (i === 0) {
			// First point slope: Use forward difference
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			slopes.push(dx === 0 ? 0 : dy / dx);
		} else if (i === n - 1) {
			// Last point slope: Use backward difference
			const dx = points[n - 1].x - points[n - 2].x;
			const dy = points[n - 1].y - points[n - 2].y;
			slopes.push(dx === 0 ? 0 : dy / dx);
		} else {
			// Internal points slope: Use average of adjacent slopes (limited by adjacent points)
			const dPrevX = points[i].x - points[i - 1].x;
			const dPrevY = points[i].y - points[i - 1].y;
			const dNextX = points[i + 1].x - points[i].x;
			const dNextY = points[i + 1].y - points[i].y;

			const mPrev = dPrevX === 0 ? 0 : dPrevY / dPrevX;
			const mNext = dNextX === 0 ? 0 : dNextY / dNextX;

			// Fritsch-Butland method to ensure monotonicity (simplified)
			if (mPrev * mNext < 0) {
				// Change of sign means there's a peak/valley, slope must be zero
				slopes.push(0);
			} else {
				// Slopes are in the same direction, use weighted harmonic mean (or simple average)
				// Using a simple average for robustness in this SVG context
				slopes.push((mPrev + mNext) / 2);
			}
		}
	}

	// 2. Generate Bézier path segments
	for (let i = 0; i < n - 1; i++) {
		const p1 = points[i];
		const p2 = points[i + 1];
		const m1 = slopes[i + 1];
		const m2 = slopes[i + 2];

		const h = p2.x - p1.x;

		// Convert Hermite form (P1, m1, P2, m2) to Bézier control points (C1, C2)
		// C1 = P1 + h/3 * m1; C2 = P2 - h/3 * m2

		// Control Point 1 (C1)
		const c1x = p1.x + h / 3;
		const c1y = p1.y + (h / 3) * m1;

		// Control Point 2 (C2)
		const c2x = p2.x - h / 3;
		const c2y = p2.y - (h / 3) * m2;

		path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
	}

	return path;
}

export function kochanekBartels2Path(points: Vec2[], T: number, B: number, C: number) {
	if (points.length < 2) return '';

	let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

	// Alpha parameters derived from T, B, C
	const a1 = ((1 - T) * (1 + B) * (1 + C)) / 2;
	const a2 = ((1 - T) * (1 - B) * (1 - C)) / 2;
	const a3 = ((1 - T) * (1 + B) * (1 - C)) / 2;
	const a4 = ((1 - T) * (1 - B) * (1 + C)) / 2;

	// Loop through the segments
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = i === 0 ? points[0] : points[i - 1];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = i === points.length - 2 ? points[i + 1] : points[i + 2];

		// Incoming tangent (M1) at P1
		const m1x = a1 * (p2.x - p1.x) + a2 * (p1.x - p0.x);
		const m1y = a1 * (p2.y - p1.y) + a2 * (p1.y - p0.y);

		// Outgoing tangent (M2) at P2
		const m2x = a3 * (p3.x - p2.x) + a4 * (p2.x - p1.x);
		const m2y = a3 * (p3.y - p2.y) + a4 * (p2.y - p1.y);

		// Convert Hermite form (P1, M1, P2, M2) to Bézier control points (C1, C2)
		// C1 = P1 + 1/3 * M1; C2 = P2 - 1/3 * M2

		// Control Point 1 (C1)
		const c1x = p1.x + m1x / 3;
		const c1y = p1.y + m1y / 3;

		// Control Point 2 (C2)
		const c2x = p2.x - m2x / 3;
		const c2y = p2.y - m2y / 3;

		path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
	}

	return path;
}

export function catmullRom2Path(points: Vec2[]) {
	return kochanekBartels2Path(points, 0, 0, 0);
}

export function toSvgCoordinate(point: Vec2) {
	// x-axis: normalizedX * scaleFactor + PADDING
	const scaledX = point.x * xScaleFactor + PADDING;

	// y-axis: SVG coordinates start from the top.
	// We invert the y-coordinate so that the low prices (small y in data) map to a high pixel value (closer to the bottom).
	const scaledY = CHART_HEIGHT - point.y * yScaleFactor + PADDING;

	return { x: scaledX, y: scaledY };
}
