'use strict';

process.env.DEBUG_LEVEL = 1;

require('./packages/get/test');
require('./packages/load/test');
require('./packages/convert-geometry/test');
require('./packages/histogram/test');
require('./packages/identify/test');
require('./packages/intersect-polygon/test');
require('./packages/max/test');
require('./packages/mean/test');
require('./packages/median/test');
require('./packages/min/test');
require('./packages/mode/test');
require('./packages/band-arithmetic/test');
require('./packages/sum/test');
require('./packages/raster-calculator/test');
require('./packages/utils/test');
