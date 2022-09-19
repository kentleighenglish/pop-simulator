import short from "short-uuid";
import { percentageToModifier } from "./utils";

// 	settlements: [{
// 		key: 's1',
// 		supply: 0,
// 		housing: 0,
// 		stability: 0,
// 		environment: 0, // the habitability of the location
// 		technologies: [{
// 			key: 't1',
// 			effects: []
// 		}],
// 	}]

// const settlementFocus = [
// 	"supply",
// 	"growth",
// 	"technology",
// 	"war",
// ];

const calculateEnvironment = (source = {}, { base }) => {
	const individualsAssist = (source?.population || 1) * 2.5;

	return Math.floor(Math.min(100, base + individualsAssist));
}

export const createSettlement = (params, source = {}) => {
	const technologies = (source.technologies || []);
	const environment = calculateEnvironment(source, params)

	return {
		key: short.generate(),
		supply: 0,
		housing: 0,
		stability: 0,
		focus: "supply",
		environment,
		technologies
	}
}

export const updateSettlement = (individuals, settlement, params) => {
	settlement.population = individuals.length;

	const {
		soldier = 0,
		gatherer = 0,
		farmer = 0,
		hunter = 0,
		builder = 0,
	} = individuals.reduce((acc, individual) => ({
		...acc,
		[individual.role]: (acc[individual.role] || 0) + 1,
	}), {});

	settlement.supply -= individuals.length;

	const environmentMod = percentageToModifier(settlement.environment, 5, {
		lowerEnd: 10,
		lowerStart: 25,
		upperStart: 50,
		upperEnd: 70,
	}) || 1;

	settlement.housing += (builder * environmentMod);

	settlement.supply += (gatherer * 8 * environmentMod);
	settlement.supply += (farmer * 10 * environmentMod);
	settlement.supply += (hunter * 15 * environmentMod);
	settlement.supply = Math.floor(settlement.supply);

	const stabilitySupplyMod = percentageToModifier(settlement.supply, 25, {
		lowerEnd: individuals.length,
		lowerStart: individuals.length * 1.5,
		upperStart: individuals.length * 3,
		upperEnd: individuals.length * 5
	});

	settlement.stability = settlement.focus === "war" ? -10 : 0;
	settlement.stability += stabilitySupplyMod;

	if (soldier && settlement.focus !== "war") {
		settlement.stability += (soldier / individuals.length) * 10;
	}

	if (individuals.length * 2 <= settlement.supply) {
		settlement.focus = "growth";
	} else {
		settlement.focus = "supply";
	}

	return settlement;
}
