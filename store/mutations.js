import { set } from "vue";

export const setDatasetsType = "@setDatasets";
export const updateParamsType = "@updateParams";

export default {
	[setDatasetsType] (state, { datasets }) {
		set(state, "datasets", datasets);
	},
	[updateParamsType] (state, params) {
		set(state, "params", { ...state.params, ...params });
	}
}
