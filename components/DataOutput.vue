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
					// xAxes: [{
					// 	display: false,
					// 	barPercentage: 1.3,
					// 	ticks: {
					// 		max: 3,
					// 	}
					// }, {
					// 	display: true,
					// 	ticks: {
					// 		autoSkip: false,
					// 		max: 4,
					// 	}
					// }],
					// yAxes: [{
					// 	ticks: {
					// 		beginAtZero:true
					// 	}
					// }]
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
