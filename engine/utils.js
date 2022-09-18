
export const clamp = (num, min = 0, max = 100) => Math.min(max, Math.max(min, num));

export const randomRange = (min, max, seed) => {
	return Math.floor((seed || Math.random()) * (max - min + 1) + min)
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

	return percent * effect;
}
