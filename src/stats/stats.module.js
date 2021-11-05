import calcStats from "calc-stats";
import resolve from "quick-resolve";
import get from "../get";
import utils from "../utils";
import wrap from "../wrap-parse";
import convertGeometry from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

const DEFAULT_CALC_STATS_OPTIONS = {
  calcHistogram: false,
  calcMax: false,
  calcMean: false,
  calcMedian: false,
  calcMin: false,
  calcMode: false,
  calcModes: false,
  calcSum: false
};

const stats = (georaster, geometry, calcStatsOptions, test) => {
  try {
    const resolvedCalcStatsOptions = calcStatsOptions ? { ...DEFAULT_CALC_STATS_OPTIONS, ...calcStatsOptions } : undefined;

    const { noDataValue } = georaster;
    const flat = true;
    const getStatsByBand = values => {
      return values
        .map(band => band.filter(value => value !== noDataValue && (test === undefined || test(value))))
        .map(band => calcStats(band, resolvedCalcStatsOptions));
    };

    if (geometry === null || geometry === undefined) {
      const values = get(georaster, undefined, flat);
      return resolve(values).then(getStatsByBand);
    } else if (utils.isBbox(geometry)) {
      geometry = convertGeometry("bbox", geometry);
      const values = get(georaster, geometry, flat);
      return resolve(values).then(getStatsByBand);
    } else if (utils.isPolygon(geometry)) {
      geometry = convertGeometry("polygon", geometry);

      // don't know how many bands are in georaster, so default to 100
      const values = new Array(100).fill(0).map(() => []);

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the getMode function
      const done = intersectPolygon(georaster, geometry, (value, bandIndex) => {
        if (test === undefined || test(value)) {
          if (values[bandIndex]) {
            values[bandIndex].push(value);
          } else {
            values[bandIndex] = [value];
          }
        }
      });

      return resolve(done).then(() => {
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
