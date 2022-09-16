<template>
	<div>
		<input
			placeholder="Initial Population"
			:value="params.initialPop"
			name="initialPop"
			type="number"
			@input="onParamUpdate($event)"
		/>
		<input
			placeholder="Calculate Length (Years)"
			:value="params.years"
			name="years"
			type="number"
			@input="onParamUpdate($event)"
		/>
		<DataOutput />
	</div>
</template>
<script>
import { mapState, mapActions } from 'vuex';

export default {
	name: "IndexPage",
	computed: {
		...mapState({
			params: "params"
		})
	},
	mounted() {
		this.recalculate();
	},
	methods: {
		...mapActions({
			updateParams: "updateParams",
			recalculate: "recalculate",
			step: "step"
		}),
		onParamUpdate(e) {
			this.updateParams({
				[e.target.name]: e.target.value
			});

			this.recalculate();
		}
	}
}
</script>
