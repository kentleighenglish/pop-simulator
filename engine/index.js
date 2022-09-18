import Express from "express";
import bodyParser from "body-parser";
import seedrandom from "seedrandom";

import {
	createInitialPops,
	updateIndividual
} from './individual';
import {
	createSettlement,
	updateSettlement
} from './settlement';

const app = Express();

const calculatePoint = async (prev, params) => {
	if (!prev) {
		const { initialPop = 1 } = params;

		const settlement = createSettlement(params, { population: initialPop });

		const individuals = createInitialPops(initialPop, settlement, params);

		return {
			individuals: individuals.map(i => ({ ...i, settlement: settlement.key })),
			settlements: [settlement],
			population: initialPop
		}
	}

	let individuals = await Promise.all(prev.individuals.map(async (i) => {
		const settlement = prev.settlements.find(settlement => settlement.key === i.settlement);

		return await updateIndividual(i, settlement, prev.individual, params);
	}));

	individuals = individuals.filter(i => !i.dead);

	const settlements = await Promise.all(prev.settlements.map(async (settlement) => {
		const pops = individuals.filter(i => i.settlement === settlement.key);
		return await updateSettlement(pops, settlement, params);
	}));

	return {
		individuals,
		settlements,
		population: prev.population
	}
}

app.use(bodyParser.json())
app.all("/recalculate", async (req, res) => {
	try {
		const { params = {} } = req.body;

		params.base = seedrandom(params.seed)() * 100;

		const points = [];
		const datasets = [];
		for (let i = 0; i < params.years - 1; i++) {
			const lastPoint = points[i - 1] || null;

			const point = await calculatePoint(lastPoint, params);
			points.push({ index: i, ...point });
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
	} catch (e) {
		console.error(e);
		res.json({ datasets: [] });
	}
});

export default app;
