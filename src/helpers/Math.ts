/**
 * 返回一个四舍五入到指定精度的值
 */
const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));

/**
 * 返回一个被限制在 min 和 max 之间的值
 */
const clamp = (value: number, min = 0, max = 100 ) => {
	return Math.min(Math.max(value, min), max);
};

/**
 * return a value that has been re-mapped according to the from/to
 * - for example, adjust(10, 0, 100, 100, 0) = 90
 */
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
	return round(toMin + (toMax - toMin) * (value - fromMin) / (fromMax - fromMin));
};

export { round, clamp, adjust }