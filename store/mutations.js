import { set } from "vue";

export const setPointsType = "@setPoints";
export const updateParamsType = "@updateParams";

export default {
	[setPointsType] (state, { points }) {
		set(state, "points", points);
	},
	[updateParamsType] (state, params) {
		set(state, "params", { ...state.params, ...params });
	}
}
