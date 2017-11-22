'use strict';

module.exports = {
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
