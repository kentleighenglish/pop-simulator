<template>
	<div>
		<Bar
			ref="chart"
			:chart-options="chartOptions"
			:chart-data="chartData"
			:chart-id="chartId"
			:dataset-id-key="datasetIdKey"
			:plugins="plugins"
			:css-classes="cssClasses"
			:styles="styles"
			:width="width"
			:height="height"
	    />
	</div>
</template>
<script>
import { Bar } from "vue-chartjs/legacy";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
	name: "BarChart",
	components: { Bar },
	props: {
		chartId: {
			type: String,
			default: "bar-chart"
		},
		datasetIdKey: {
			type: String,
			default: "label"
		},
		width: {
			type: Number,
			default: 400
		},
		height: {
			type: Number,
			default: 200
		},
		cssClasses: {
			default: "",
			type: String
		},
		styles: {
			type: Object,
			default: () => {}
		},
		plugins: {
			type: Object,
			default: () => {}
		},
		histogramLength: {
			type: Number,
			default: 0,
		},
		data: {
			type: Array,
			default: () => ([])
		},
		options: {
			type: Object,
			default: () => ({})
		}
	},
	computed: {
		chartOptions() {
			return {
				...this.options,
			};
		},
		chartData () {
			return {
				labels: Array.from(Array(this.histogramLength).keys()),
				datasets: [...this.data]
			};
		}
	}
}
</script>
