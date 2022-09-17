import { setDatasetsType, updateParamsType } from './mutations';

export const updateParams = ({ commit }, params = {}) => {
	commit(updateParamsType, params);
}

export const recalculate = async ({ state: { params }, commit }, { startingIndex = 0 } = {}) => {
	const response = await fetch("/engine/recalculate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ params })
	});
	const { datasets = [] } = await response.json();

	commit(setDatasetsType, { datasets });
}
