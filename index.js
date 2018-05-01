'use strict';

const geoblaze = {
  cache: require('./src/cache'),
  load: require('./src/load'),
  identify: require('./src/identify'),
  sum: require('./src/sum'),
  mean: require('./src/mean'),
  median: require('./src/median'),
  min: require('./src/min'),
  max: require('./src/max'),
  mode: require('./src/mode'),
  histogram: require('./src/histogram'),
  bandArithmetic: require('./src/band-arithmetic'),
  rasterCalculator: require('./src/raster-calculator'),
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
