import calcStats from "calc-stats";
import QuickPromise from "quick-promise";
import get from "../get";
import utils from "../utils";
import wrap from "../wrap-parse";
import { convertBbox, convertMultiPolygon } from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

const stats = (georaster, geometry, calcStatsOptions, test, { debug_level = 0 } = {}) => {
  try {
    // shallow clone
    calcStatsOptions = { ...calcStatsOptions };

    const { noDataValue } = georaster;

    // use noDataValue unless explicitly over-written
    if (noDataValue !== undefined && calcStatsOptions.noData === undefined) {
      calcStatsOptions.noData = noDataValue;
    }

    if (test) {
      if (calcStatsOptions && calcStatsOptions.filter) {
        const original_filter = calcStatsOptions.filter;
        calcStatsOptions.filter = ({ index, value }) => original_filter({ index, value }) && test(value);
      } else {
        calcStatsOptions.filter = ({ index, value }) => test(value);
      }
    }

    const flat = true;
    const getStatsByBand = values => values.map(band => calcStats(band, calcStatsOptions));

    if (geometry === null || geometry === undefined) {
      if (debug_level >= 2) console.log("[geoblaze] geometry is nullish");
      const values = get(georaster, undefined, flat);
      return QuickPromise.resolve(values).then(getStatsByBand);
    } else if (utils.isBbox(geometry)) {
      if (debug_level >= 2) console.log("[geoblaze] geometry is a rectangle");
      geometry = convertBbox(geometry);
      const values = get(georaster, geometry, flat);
      return QuickPromise.resolve(values).then(getStatsByBand);
    } else if (utils.isPolygonal(geometry)) {
      if (debug_level >= 2) console.log("[geoblaze] geometry is polygonal");
      geometry = convertMultiPolygon(geometry);

      // don't know how many bands are in georaster, so default to 100
      const values = new Array(100).fill(0).map(() => []);

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array, so we can later on calculate stats for each band separately
      const done = intersectPolygon(
        georaster,
        geometry,
        (value, bandIndex) => {
          if (values[bandIndex]) {
            values[bandIndex].push(value);
          } else {
            values[bandIndex] = [value];
          }
        },
        { debug_level }
      );

      return QuickPromise.resolve(done).then(() => {
        const bands = values.filter(band => band.length !== 0);
        if (bands.length > 0) return bands.map(band => calcStats(band, calcStatsOptions));
        else throw "No Values were found in the given geometry";
      });
    } else {
      throw "Geometry Type is Not Supported";
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default wrap(stats);
