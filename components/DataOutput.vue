<template>
	<div>
		<Histogram
	      :options="chartOptions"
	      :data="datasets"
		  :histogram-length="length"
	    />
	</div>
</template>
<script>
	import { mapState } from "vuex";

	export default {
		data: () => ({
			chartOptions: {
				scales: {
					x: {
						stacked: true,
						beginAtZero: true,
					},
					y: {
						stacked: true,
					}
				}
			}
		}),
		computed: {
			...mapState({
				params: "params",
				datasets: "datasets"
			}),
			length() {
				return Number(this.params.years || "0");
			}
		},
	}
</script>
