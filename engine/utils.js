
export const clamp = (num, min = 0, max = 100) => Math.floor(Math.min(max, Math.max(min, num)));

export const randomRange = (min, max, seed, weights = []) => {
	const rangeLength = max - min;
	const rangeArray = Array.from(Array(rangeLength).keys());
	const arrayWeights = weights.length ? weights : Array.from(rangeArray).fill(1);

    let i;

    const parsedWeights = [];

    for (i = 0; i < rangeArray.length; i++)
        parsedWeights[i] = arrayWeights[i] + (parsedWeights[i - 1] || 0);

    const random = (seed || Math.random()) * parsedWeights[parsedWeights.length - 1];

    for (i = 0; i < parsedWeights.length; i++)
        if (parsedWeights[i] > random)
            break;

    return min + rangeArray[i];
}

export const percentageToModifier = (percentage, effect = 5, thresholds = {}) => {
    const { upperStart = 50, upperEnd = 100, lowerStart = 50, lowerEnd = 100 } = thresholds;

    if (percentage > lowerStart && percentage < upperStart) {
        return 0;
    }

    let percent = percentage;
    if (percent >= upperStart) {
        percent = Math.min(1, (percentage - upperStart) / (upperEnd - upperStart));
    } else if (percent < lowerStart) {
        percent = Math.max(-1, (lowerStart - percent) / (lowerEnd - lowerStart));
    }

	return Math.round(percent * effect * 100) / 100;
}
