<template>
	<div ref="dataOutputContainer">
	</div>
</template>
<script>
	import { mapState } from 'vuex';
	import * as d3 from 'd3';

	export default {
		data: () => ({
			histogram: null,
			svg: null,
			x: null,
			y: null,
			margin: { top: 10, right: 30, bottom: 30, left: 40 },
			width: 390,
			height: 360
		}),
		computed: {
			...mapState({
				params: "params",
				points: "points"
			})
		},
		watch: {
			points() {
				this.updateGraph();
			}
		},
		mounted() {
			const xLength = this.params.years;

			// append the svg object to the body of the page
			this.svg = d3.select(this.$refs.dataOutputContainer)
			  .append("svg")
				.attr("width", this.width + this.margin.left + this.margin.right)
				.attr("height", this.height + this.margin.top + this.margin.bottom)
			  .append("g")
				.attr("transform",
					  "translate(" + this.margin.left + "," + this.margin.top + ")");

			// X axis: scale and draw:
			this.x = d3.scaleLinear()
				.domain([0, xLength])
				.range([0, this.width]);

			this.svg.append("g")
				.attr("transform", "translate(0," + this.height + ")")
				.call(d3.axisBottom(this.x));

			// set the parameters for the histogram
			this.histogram = d3.histogram()
				.value((d) => d.population)
				.domain(this.x.domain())  // then the domain of the graphic
				.thresholds(this.x.ticks(70)); // then the numbers of bins

			// And apply this function to data to get the bins
			const bins = this.histogram(this.points);

			// Y axis: scale and draw:
			this.y = d3.scaleLinear()
				.range([this.height, 0]);
			this.y.domain([0, d3.max(bins, (d) => d.length)]);
				// d3.hist has to be called before the Y axis obviously

			this.svg.append("g")
				.call(d3.axisLeft(this.y));

			// append the bar rectangles to the svg element
			this.svg.selectAll("rect")
				.data(bins)
				.enter()
				.append("rect")
				.attr("x", 1)
				.attr("transform", (d) => "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")")
				.attr("width", (d) => this.x(d.x1) - this.x(d.x0) -1)
				.attr("height", (d) => this.height - this.y(d.length))
				.style("fill", "#69b3a2");
		},
		methods: {
			updateGraph() {
				const { years } = this.params;
				const bins = this.histogram(this.points);

				this.x.domain([0, years]);
			    this.y.domain([0, d3.max(bins, (d) => d.length)]);

				this.svg.transition();

				this.svg.selectAll("rect")
					.data(bins)
					.enter()
					.append("rect")
					.attr("x", 1)
					.attr("transform", (d) => "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")")
					.attr("width", (d) => this.x(d.x1) - this.x(d.x0) -1)
					.attr("height", (d) => this.height - this.y(d.length))
					.style("fill", "#69b3a2");
			}
		}
	}
</script>
