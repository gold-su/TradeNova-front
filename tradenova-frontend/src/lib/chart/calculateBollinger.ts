export function calculateBollinger(
  closes: number[],
  period: number,
  multiplier: number,
) {
  const result = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);

    const mean = slice.reduce((a, b) => a + b, 0) / period;

    const variance =
      slice.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;

    const std = Math.sqrt(variance);

    result.push({
      upper: mean + std * multiplier,
      middle: mean,
      lower: mean - std * multiplier,
    });
  }

  return result;
}
