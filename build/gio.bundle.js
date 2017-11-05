'use strict';

module.exports = {
	cache: require('./packages/gio-cache/cache'),
	load: require('./packages/gio-load/load'),
	identify: require('./packages/gio-identify/identify'),
	sum: require('./packages/gio-sum/sum'),
	mean: require('./packages/gio-mean/mean'),
	median: require('./packages/gio-median/median'),
	min: require('./packages/gio-min/min'),
	max: require('./packages/gio-max/max'),
	mode: require('./packages/gio-mode/mode'),
	histogram: require('./packages/gio-histogram/histogram')
};
