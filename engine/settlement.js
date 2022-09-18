import short from "short-uuid";

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

	return settlement;
}
