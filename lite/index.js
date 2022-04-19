import bandArithmetic from "./band-arithmetic";
import cache from "./cache";
import get from "./get";
import histogram from "./histogram";
import identify from "./identify";
import load from "./load";
import max from "./max";
import mean from "./mean";
import median from "./median";
import min from "./min";
import mode from "./mode";
import parse from "./parse";
import rasterCalculator from "./raster-calculator";
import sum from "./sum";
import stats from "./stats";

const geoblaze = {
  bandArithmetic,
  cache,
  get,
  histogram,
  identify,
  load,
  max,
  mean,
  median,
  min,
  mode,
  parse,
  rasterCalculator,
  sum,
  stats
};

export default geoblaze;

export { bandArithmetic, cache, get, histogram, identify, load, max, mean, median, min, mode, parse, rasterCalculator, sum, stats };

/* set window.geoblaze in the browser */
if (typeof window !== "undefined") {
  window["geoblaze"] = geoblaze;
}

/* set self.geoblaze in a web worker */
if (typeof self !== "undefined") {
  self["geoblaze"] = geoblaze;
}

/* set global.geoblaze in node */
if (typeof global !== "undefined") {
  global["geoblaze"] = geoblaze;
}
