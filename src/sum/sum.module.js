/**
 * @prettier
 */
import get from "../get";
import utils from "../utils";
import wrap from "../wrap-func";
import convertGeometry from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

const sum = (georaster, geom, test, debug = false) => {
  try {
    const { noDataValue } = georaster;

    const calcSumByBand = bands => {
      return bands.map(band => {
        return band.reduce((sumOfBand, cellValue) => {
          return cellValue !== noDataValue && (test === undefined || test(cellValue)) ? sumOfBand + cellValue : sumOfBand;
        }, 0);
      });
    };

    const flat = true;
    if (geom === null || geom === undefined) {
      const values = get(georaster, undefined, flat);
      return utils.callAfterResolveArgs(calcSumByBand, values);
    } else if (utils.isBbox(geom)) {
      geom = convertGeometry("bbox", geom);
      const values = get(georaster, geom, flat);
      return utils.callAfterResolveArgs(calcSumByBand, values);
    } else if (utils.isPolygon(geom, debug)) {
      geom = convertGeometry("polygon", geom);
      const sums = [];

      // the third argument of intersectPolygon is a function which
      // is run on every value, we use it to increment the sum
      const done = intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (test === undefined || test(value)) {
          if (sums[bandIndex]) {
            sums[bandIndex] += value;
          } else {
            sums[bandIndex] = value;
          }
        }
      });

      return utils.callAfterResolveArgs(() => {
        if (sums.length > 0) return sums;
        else return [0];
      }, done);
    } else {
      throw "[geoblaze] sum couldn't identify geometry";
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default wrap(sum);
