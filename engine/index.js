import Express from "express";
import bodyParser from "body-parser";
import seedrandom from "seedrandom";

import {
	createInitialPops
} from './individual';
import {
	createSettlement
} from './settlement';

const app = Express();

// const examplePoint = {
// 	population: 0,
// 	individuals: [{
// 		key: 'i1',
// 		settlement: 's1',
// 		happiness: 0,
// 		age: 0,
// 		health: 0,
// 		strength: 0,
// 		male: true,
// 		role: '' // farmer, gatherer, hunter, soldier, builder, leader, inventor
// 	}],
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
// }

const calculatePoint = (prev, params) => {
	if (!prev) {
		const settlement = createSettlement(params);

		const { initialPop = 0 } = params;
		const individuals = createInitialPops(initialPop, settlement, params);

		return {
			individuals: individuals.map(i => ({ ...i, settlement: settlement.key })),
			population: initialPop
		}
	}

	return {
		population: prev.population
	}
}

app.use(bodyParser.json())
app.all("/recalculate", (req, res) => {
	const { params = {} } = req.body;

	params.base = seedrandom(params.seed)() * 100;

	const points = [];
	const datasets = [];
	for (let i = 0; i < params.years - 1; i++) {
		const lastPoint = points[i - 1] || null;

		const { population } = calculatePoint(lastPoint, params);
		points.push({ index: i, population });
	}

	datasets.push({
		label: "Population",
		data: points,
		backgroundColor: "rgba(97, 175, 184, 1)",
		parsing: {
			yAxisKey: "population",
			xAxisKey: "index"
		}
	})

	res.json({ datasets });
});

export default app;
