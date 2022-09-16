<template>
	<div ref="dataOutputContainer">
		{{ points }}
	</div>
</template>
<script>
	import { mapState } from 'vuex';
	// import { histogram } from 'd3';

	export default {
		computed: {
			...mapState({
				points: "points"
			})
		},
		mounted() {
			// histogram([], {
			// 	value: d => d.rate,
			// 	label: "Unemployment rate (%) →",
			// 	width: "100%",
			// 	height: 500,
			// 	color: "steelblue"
			// })
		}
	}
</script>
