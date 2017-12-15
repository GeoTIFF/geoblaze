'use strict';

var geoblaze = {
				cache: require('./packages/cache/cache'),
				load: require('./packages/load/load'),
				identify: require('./packages/identify/identify'),
				sum: require('./packages/sum/sum'),
				mean: require('./packages/mean/mean'),
				median: require('./packages/median/median'),
				min: require('./packages/min/min'),
				max: require('./packages/max/max'),
				mode: require('./packages/mode/mode'),
				histogram: require('./packages/histogram/histogram')
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
				module.exports = geoblaze;
}

/*
    The following code allows you to use GeoRaster without requiring
*/
if (typeof window !== "undefined") {
				window["geoblaze"] = geoblaze;
} else if (typeof self !== "undefined") {
				self["geoblaze"] = geoblaze; // jshint ignore:line
}
