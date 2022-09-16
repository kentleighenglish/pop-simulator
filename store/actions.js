import { setPointsType, updateParamsType } from './mutations';

export const updateParams = ({ commit }, params = {}) => {
	commit(updateParamsType, params);
}

export const recalculate = ({ state: { params }, commit }, { startingIndex = 0 } = {}) => {
	commit(setPointsType, { points: [] });
}
