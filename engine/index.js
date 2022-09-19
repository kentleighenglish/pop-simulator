import Express from "express";
import bodyParser from "body-parser";
import seedrandom from "seedrandom";

import {
	createInitialPops,
	updateIndividuals,
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
			dead: [],
			born: [],
			settlements: [settlement],
			population: initialPop
		}
	}

	const {
		individuals,
		born,
		dead,
	} = await updateIndividuals(prev.individuals, prev.settlements, params);

	const settlements = await Promise.all(prev.settlements.map(async (settlement) => {
		const pops = individuals.filter(i => i.settlement === settlement.key);
		return await updateSettlement(pops, settlement, params);
	}));

	return {
		individuals,
		born,
		dead,
		settlements,
		population: individuals.length
	}
}

app.use(bodyParser.json())
app.all("/recalculate", async (req, res) => {
	try {
		const { params = {} } = req.body;

		params.base = seedrandom(params.seed)() * 100;

		const points = [];
		for (let i = 0; i < params.years - 1; i++) {
			const lastPoint = points[i - 1] || null;

			const point = await calculatePoint(lastPoint, params);
			points.push({ index: i, ...point });
		}

		const dataPayload = points.reduce((acc, { index, population, dead, born }) => ([
			...acc,
			{ index, population, dead: dead.length, born: born.length }
		]), []);

		const datasets = [
			{
				label: "Population",
				backgroundColor: "rgba(97, 175, 184, 1)",
				scales: {
					x: {
						stacked: true
					},
				},
				parsing: {
					yAxisKey: "population",
					xAxisKey: "index"
				}
			},
			{
				label: "Dead",
				backgroundColor: "#FF784F",
				scales: {
					x: {
						stacked: true
					},
				},
				parsing: {
					yAxisKey: "dead",
					xAxisKey: "index"
				}
			},
			{
				label: "Born",
				backgroundColor: "#A1E887",
				scales: {
					x: {
						stacked: true
					},
				},
				parsing: {
					yAxisKey: "born",
					xAxisKey: "index"
				}
			}
		];

		res.json({ data: dataPayload, datasets });
	} catch (e) {
		console.error(e);
		res.json({ datasets: [] });
	}
});

export default app;
