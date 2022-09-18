import short from "short-uuid";
import seedrandom from "seedrandom";
import { clamp, percentageToModifier } from './utils';

// const roles = [
// 	"child",
// 	"farmer",
// 	"gatherer",
// 	"hunter",
// 	"soldier",
// 	"builder",
// ];

const calculateHappiness = settlement => {
	const { stability, supply, housing, population } = settlement;
	const freeHouses = housing - population;

	const happinessStabilityMod = percentageToModifier(stability, 25, { lowerStart: 30, upperEnd: 60 });
	const happinessSupplyMod = percentageToModifier(supply, 15, { lowerStart: 5, lowerEnd: 0, upperStart: 10, upperEnd: 50 });
	const housingMod = percentageToModifier(freeHouses, 20, { lowerStart: 2, lowerEnd: 0, upperStart: 7, upperEnd: 20 });

	return clamp(40 + happinessStabilityMod + happinessSupplyMod * housingMod);
}

export const createInitialPops = (count, settlement, params) => {
	const output = Array(count).map((i) => {
		const base = seedrandom(i)() * (params.base / 100);
		const initial = createIndividual(settlement, base, params);

		return {
			...initial,

			age: 0,
			happiness: 0,
			strength: 0,
			role: ''
		};
	});

	for(let i = 0; i < output.length; i++) {
		const ind = output[i];

		console.log(ind);
	}

	return output;
}

export const createIndividual = (settlement, parentSeed, { base }) => {
	const { supply  } = settlement;

	const male = parentSeed > 0.5;
	const strength = (base + parentSeed) * (supply / 100);
	const happiness = calculateHappiness(settlement);

	return {
		key: short.generate(),
		settlement: settlement.key,
		age: 0,
		strength,
		happiness,
		male,
		married: false,
		role: "child"
	};
}
