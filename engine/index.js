import Express from "express";
import bodyParser from "body-parser";

const app = Express();

const calculatePoint = (prev, params) => {
	const population = prev
		? Math.round((prev.population || 0) * 1.1)
		: params.initialPop;

	return {
		population
	}
}

app.use(bodyParser.json())
app.all("/recalculate", (req, res) => {
	const { params = {} } = req.body;

	const points = [];
	for (let i = 0; i < params.years - 1; i++) {
		const lastPoint = points[i - 1] || null;

		const point = calculatePoint(lastPoint, params);
		points.push(point);
	}

	res.json({ points });
});

export default app;
