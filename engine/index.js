
// const calculatePoint = (prev, params) => {
// 	const population = prev
// 		? Math.floor((prev.population || 0) * 1.1)
// 		: params.initialPop;
//
// 	return {
// 		population
// 	}
// }

export default function (req, res, next) {
  // req is the Node.js http request object
  console.log(req.url);

  // for (let i = startingIndex; i < params.years - 1; i++) {
	//   const lastPoint = (points[i - 1] || null);
  //
	//   points[i] = calculatePoint(lastPoint, params);
  // }

  // res is the Node.js http response object

  // next is a function to call to invoke the next middleware
  // Don't forget to call next at the end if your middleware is not an endpoint!
  next()
}
