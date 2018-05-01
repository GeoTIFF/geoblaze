'use strict';

process.env.DEBUG_LEVEL = 1;

require('./src/get/get.test');
require('./src/load/load.test');
require('./src/convert-geometry/convert-geometry.test');
require('./src/histogram/histogram.test');
require('./src/identify/identify.test');
require('./src/intersect-polygon/interset-polygon.test');
require('./src/max/max.test');
require('./src/mean/mean.test');
require('./src/median/median.test');
require('./src/min/min.test');
require('./src/mode/mode.test');
require('./src/band-arithmetic/band-arithmetic.test');
require('./src/sum/sum.test');
require('./src/raster-calculator/raster-calculator.test');
require('./src/utils/utils.test');
