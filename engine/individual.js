import short from "short-uuid";
import seedrandom from "seedrandom";
import { clamp, randomRange, percentageToModifier } from "./utils";

const roles = {
	child: 0,
	farmer: 0,
	gatherer: 0,
	hunter: 0,
	soldier: 0,
	builder: 0,
};

const getRoleWeight = (individual, settlement) => {
	const out = { ...roles }

	if (individual.age <= 14) {
		out.child += 100;
	} else {
		out.soldier += individual.male ? 10 : -30;
		out.builder = 20;

		if (settlement.focus === "supply") {
			out.hunter += individual.male ? 20 : 5;
			out.farmer = 20;
			out.gatherer += individual.male ? 10 : 30;
		}
		if (settlement.focus === "growth") {
			out.builder += 30;
		}

		if (settlement.focus === "war") {
			out.soldier += 40;
		}
	}

	return Object.values(out);
}



const calculateHappiness = settlement => {
	const { stability, supply, housing, population } = settlement;
	const freeHouses = Math.max(0, housing - population);

	const happinessStabilityMod = percentageToModifier(stability, 25, { lowerStart: 30, upperEnd: 60 });
	const happinessSupplyMod = percentageToModifier(supply, 15, { lowerStart: 5, lowerEnd: 0, upperStart: 10, upperEnd: 50 });
	const housingMod = percentageToModifier(freeHouses, 20, { lowerStart: 2, lowerEnd: 0, upperStart: 7, upperEnd: 20 });

	return clamp(40 + happinessStabilityMod + happinessSupplyMod + housingMod);
}

const calculateRole = (individual, settlement, params) => {
	const roleWeights = getRoleWeight(individual, settlement);
	const rolesArray = Object.keys(roles);
	const roleIndex = randomRange(0, rolesArray.length, individual.seed, roleWeights);

	return rolesArray[roleIndex];
}

export const createInitialPops = (count, settlement, params) => {
	settlement.population = count;

	const output = [];
	for (let i = 0; i < count; i++) {
		const base = seedrandom(i + params.base)();
		const individual = createIndividual(settlement, base, params);

		const age = randomRange(20, 50, base + (params.base / 100));
		individual.age = age;

		individual.role = calculateRole(individual, settlement, params);

		const oppositeSex = output.filter(i => (i.male !== individual.male && i.age >= 15));
		oppositeSex.sort((a, b) => {
			const aDiff = Math.abs(a.age - individual.age);
			const bDiff = Math.abs(b.age - individual.age);

			return aDiff - bDiff;
		});
		if (oppositeSex.length) {
			const partner = oppositeSex[0];
			const partnerIndex = output.findIndex(i => partner.key === i.key);

			output[partnerIndex].partner = individual.key;

			individual.partner = partner.key;
		}

		output.push(individual);
	}

	return output;
}

export const createIndividual = (settlement, parentSeed, { base }) => {
	const { supply  } = settlement;

	const male = parentSeed > 0.5;

	const strengthBase = male ? 30 : 15;
	const strengthSupplyMod = percentageToModifier(supply, 15, { lowerStart: 5, lowerEnd: 0, upperStart: 10, upperEnd: 50 });
	const strengthParentMod = 50 * ((base / 100) + parentSeed);
	const strength = clamp(strengthBase + strengthParentMod + strengthSupplyMod);

	const happiness = calculateHappiness(settlement);

	return {
		key: short.generate(),
		settlement: settlement.key,
		seed: parentSeed,
		age: 0,
		strength,
		happiness,
		male,
		married: false,
		role: "child"
	};
}

export const updateIndividual = (individual, settlement, { base }) => {
	individual.age++;

	return individual;
}
