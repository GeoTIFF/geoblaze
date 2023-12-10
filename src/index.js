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
import range from "./range";
import rasterCalculator from "./raster-calculator";
import sum from "./sum";
import stat from "./stat";
import stats from "./stats";

const geoblaze = {
  cache,
  bandArithmetic,
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
  range,
  rasterCalculator,
  stat,
  stats,
  sum
};

export default geoblaze;

export { cache, bandArithmetic, get, histogram, identify, load, max, mean, median, min, mode, parse, rasterCalculator, sum, stats };

/* require geoblaze in AMD environment */
if (typeof define === "function" && define.amd) {
  /* global define */
  define(() => {
    return geoblaze;
  });
}

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
