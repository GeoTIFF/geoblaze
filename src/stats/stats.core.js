import calcStats from "calc-stats";
import QuickPromise from "quick-promise";
import polygon from "bbox-fns/polygon";
import validate from "bbox-fns/validate";
import get from "../get";
import utils from "../utils";
import wrap from "../wrap-parse";
import { convertBbox, convertMultiPolygon } from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

const VRM_NO_RESAMPLING = [1, 1];

const stats = (georaster, geometry, calcStatsOptions, test, { debug_level = 0, include_meta = false, rescale = false, vrm = VRM_NO_RESAMPLING } = {}) => {
  try {
    // shallow clone
    calcStatsOptions = { ...calcStatsOptions };

    const { noDataValue } = georaster;

    // use noDataValue unless explicitly over-written
    if (noDataValue !== undefined && calcStatsOptions.noData === undefined) {
      calcStatsOptions.noData = noDataValue;
    }

    if (typeof vrm === "number") {
      if (vrm <= 0 || vrm !== Math.round(vrm)) {
        throw new Error("[geoblaze] vrm can only be defined as a positive integer");
      }
      vrm = [vrm, vrm];
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

    const resample = vrm === "minimal" || (Array.isArray(vrm) && (vrm[0] !== 1 || vrm[1] !== 1));
    const geometry_is_nullish = geometry === null || geometry === undefined;

    if (resample === true) {
      if (geometry_is_nullish) {
        geometry = polygon([georaster.xmin, georaster.ymin, georaster.xmax, georaster.ymax]);
      } else if (validate(geometry)) {
        geometry = polygon(geometry);
      } else if (utils.isBboxObj(geometry)) {
        // convert { xmin: 20, xmax: 32, ymin: -3, ymax: 0 } to geojson polygon
        geometry = polygon([geometry.xmin, geometry.ymin, geometry.xmax, geometry.ymax]);
      }
    }

    if (geometry_is_nullish && resample === false) {
      if (debug_level >= 2) console.log("[geoblaze] geometry is nullish");
      const values = get(georaster, undefined, flat);
      return QuickPromise.resolve(values).then(getStatsByBand);
    } else if (utils.isBbox(geometry) && resample === false) {
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
        { debug_level, vrm }
      );

      return QuickPromise.resolve(done).then(({ vrm }) => {
        // check if the user doesn't want the number of valid pixels returned
        const want_valid = calcStatsOptions.stats ? calcStatsOptions.stats.includes("valid") : calcStatsOptions.calcValid !== false;

        const use_virtual_resampling = vrm[0] !== 1 && vrm[1] !== 1;

        const bands = values.filter(band => band.length !== 0);

        if (bands.length > 0) {
          // if we need to know the number of valid pixels for intermediate calculations,
          // but the user didn't ask for it, calculate it anyway
          // and then remove the valid count from the returned results
          if (use_virtual_resampling) {
            if (calcStatsOptions.stats) {
              if (calcStatsOptions.stats.includes("product") && calcStatsOptions.stats.includes("valid") === false) {
                calcStatsOptions.stats = [...calcStatsOptions.stats, "valid"];
                if (debug_level >= 2) console.log('[geoblaze] added "valid" to stats');
              }
            } else {
              if (calcStatsOptions.calcProduct === true && calcStatsOptions.calcValid === false) {
                calcStatsOptions.calcValid = true;
                if (debug_level >= 2) console.log('[geoblaze] set "calcValid" to true');
              }
            }
          }

          const stats = bands.map(band => calcStats(band, calcStatsOptions));
          if (debug_level >= 2) console.log("[geoblaze] stats (before rescaling):", stats);

          // only rescaling results if virtual resampling is on
          if (use_virtual_resampling && rescale) {
            if (debug_level >= 2) console.log("[geoblaze] rescaling results based on relative size of virtual pixels");

            // if vrm is [2, 4] then area_multiplier will be 8,
            // meaning there are 8 virtual pixels for every actual pixel
            const area_multiplier = vrm[0] * vrm[1];
            if (debug_level >= 2) console.log("[geoblaze] area_multiplier:", area_multiplier);

            stats.forEach(band => {
              const { valid } = band;
              if (typeof band.count === "number") band.count /= area_multiplier;
              if (typeof band.invalid === "number") band.invalid /= area_multiplier;
              if (typeof band.sum === "number") band.sum /= area_multiplier;
              if (typeof band.valid === "number") band.valid /= area_multiplier;

              if (band.histogram) {
                for (const key in band.histogram) {
                  // this will lead to fractions of pixels
                  // for example, a pixel could appear 3.75 times if vrm is [2, 2]
                  band.histogram[key].ct /= area_multiplier;
                }
              }

              if (typeof band.product === "number") {
                band.product /= Math.pow(area_multiplier, valid);
              }
            });
          }

          // if the user asked not to have the valid stat,
          // exclude if from the results
          if (want_valid === false) {
            stats.forEach(band => delete band.valid);
          }

          if (include_meta) {
            stats.forEach(band => {
              band._meta = {
                vph: georaster.pixelHeight / vrm[1],
                vpw: georaster.pixelWidth / vrm[0],
                vrm: [vrm[0], vrm[1]]
              };
            });
          }

          return stats;
        } else {
          throw "No Values were found in the given geometry";
        }
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
