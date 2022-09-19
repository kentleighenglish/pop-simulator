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
		out.builder = (settlement.housing > settlement.population) ? 5 : 15;

		if (settlement.focus === "supply") {
			out.hunter += individual.male ? 25 : 15;
			out.farmer = 30;
			out.gatherer += individual.male ? 15 : 35;
			out.soldier = individual.male ? 5 : -30;
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
	const { environment, stability, supply, housing, population } = settlement;
	const freeHouses = Math.max(0, housing - population);

	const stabilityMod = percentageToModifier(stability, 25, { lowerStart: 30, upperEnd: 60 });
	const supplyMod = percentageToModifier(supply, 15, { lowerStart: 5, lowerEnd: 0, upperStart: 10, upperEnd: 50 });
	const housingMod = percentageToModifier(freeHouses, 20, { lowerStart: 2, lowerEnd: 0, upperStart: 7, upperEnd: 20 });
	const environmentMod = percentageToModifier(environment, 10, {
		lowerEnd: 10,
		lowerStart: 25,
		upperStart: 50,
		upperEnd: 70,
	});

	return clamp(35 + stabilityMod + supplyMod + housingMod + environmentMod);
}

const calculateRole = (individual, settlement, params) => {
	const roleWeights = getRoleWeight(individual, settlement);
	const rolesArray = Object.keys(roles);
	const roleIndex = randomRange(0, rolesArray.length, individual.seed, roleWeights);

	return rolesArray[roleIndex];
}

const calculatePregnancy = (individual, partner, settlement, params) => {
	const { stability, supply, housing, population } = settlement;
	const freeHouses = Math.max(0, housing - population);

	const stabilityMod = percentageToModifier(stability, 25, { lowerStart: 30, upperEnd: 60 });
	const supplyMod = percentageToModifier(supply, 15, { lowerStart: 5, lowerEnd: 0, upperStart: 10, upperEnd: 50 });
	const housingMod = percentageToModifier(freeHouses, 5, { lowerStart: 2, lowerEnd: 0, upperStart: 1, upperEnd: 10 });

	let partnerMod = 0;
	if (partner.role !== "soldier" || (partner.role === "soldier" && settlement.focus !== "war")) {
		partnerMod = 30;
	}
	const diceRoll = seedrandom(individual.age + params.base)();

	const pregnancyChance = 10 + stabilityMod + supplyMod + housingMod + partnerMod;

	return pregnancyChance > diceRoll * 100;
}

const updatePartners = (individuals) => {
	return individuals.map(individual => {
		if (individual.partner) {
			const partnerIndex = individuals.findIndex(partner => partner.key === individual.partner);
			const partner = individuals[partnerIndex];

			if ((partnerIndex === -1 || partner.dead) || individual.dead) {
				individual.partner = null;
				if (partnerIndex !== -1) {
					individuals[partnerIndex].partner = null;
				}
			}

			if (individual.partner) {
				return individual;
			}
		}

		const oppositeSex = individuals.filter(i => (
			i.male !== individual.male &&
			i.age >= 15 &&
			!i.partner
		));
		oppositeSex.sort((a, b) => {
			const aDiff = Math.abs(a.age - individual.age);
			const bDiff = Math.abs(b.age - individual.age);

			return aDiff - bDiff;
		});
		if (oppositeSex.length) {
			const partner = oppositeSex[0];
			const partnerIndex = individuals.findIndex(i => partner.key === i.key);

			individuals[partnerIndex].partner = individual.key;

			individual.partner = partner.key;
		}
		return individual;
	});
}

export const createInitialPops = (count, settlement, params) => {
	settlement.population = count;

	let output = [];
	for (let i = 0; i < count; i++) {
		const base = seedrandom(i + params.base)();
		const individual = createIndividual(settlement, base, params);

		const age = randomRange(20, 50, base + (params.base / 100));
		individual.age = age;

		individual.role = calculateRole(individual, settlement, params);

		output.push(individual);
	}

	output = updatePartners(output);

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

export const updateIndividuals = (individuals, settlements, params) => {
	const output = [];

	for(const individual of individuals) {
		const settlement = settlements.find(settlement => settlement.key === individual.settlement);

		individuals = individuals.filter(i => !i.dead);
		individual.age++;

		individual.role = calculateRole(individual, settlement, params);

		const deathChance = percentageToModifier(individual.age, 100, {
			lowerStart: 0,
			lowerEnd: 0,
			upperStart: 40,
			upperEnd: 90
		}) + (settlement.supply < individuals.length ? 25 : 0);
		const diceRoll = seedrandom(individual.age + params.base)();
		if (deathChance > diceRoll * 100) {
			individual.dead = true;
		}

		if (!individual.male && individual.partner) {
			const partner = individuals.find(i => i.key === individual.partner);
			if (partner) {
				individual.pregnant = calculatePregnancy(individual, partner, settlement, params);
			}
		}

		output.push(individual);
	}

	const born = [];
	output.filter(i => i.pregnant).forEach(individual => {
		const settlement = settlements.find(s => s.key === individual.settlement);
		const partner = individuals.find(p => p.key === individual.partner);

		const parentSeed = individual.seed + (partner?.seed || 'nopartner');
		const bornIndividual = createIndividual(settlement, parentSeed, params);
		output.push(bornIndividual);
		born.push(bornIndividual);
	});

	const individualsResult = updatePartners(output).filter(i => !i.dead);
	const dead = output.filter(i => !!i.dead);
	return {
		individuals: individualsResult,
		dead,
		born
	};
}
