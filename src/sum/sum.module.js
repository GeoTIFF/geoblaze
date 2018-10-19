import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const sum = (georaster, geom, test, debug=false) => {
  try {
    if (geom === null || geom === undefined) {

      const { noDataValue } = georaster;
      return georaster.values.map(band => { // iterate over each band which include rows of pixels
        return band.reduce((sumOfBand, row) => { // reduce all the rows into one sum
          return sumOfBand + row.reduce((sumOfRow, cellValue) => { // reduce each row to a sum of its pixel values
            return cellValue !== noDataValue && (test === undefined || test(cellValue)) ? sumOfRow + cellValue : sumOfRow;
          }, 0);
        }, 0);
      });
    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      const values = get(georaster, geom);
      const { noDataValue } = georaster;

      // sum values
      return values.map(band => { // iterate over each band which include rows of pixels
        return band.reduce((sumOfBand, row) => { // reduce all the rows into one sum
          return sumOfBand + row.reduce((sumOfRow, cellValue) => { // reduce each row to a sum of its pixel values
            return cellValue !== noDataValue && (test === undefined || test(cellValue)) ? sumOfRow + cellValue : sumOfRow;
          }, 0);
        }, 0);
      });
    } else if (utils.isPolygon(geom, debug)) {
      geom = convertGeometry('polygon', geom);
      const sums = [];

      // the third argument of intersectPolygon is a function which
      // is run on every value, we use it to increment the sum
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (test === undefined || test(value)) {
          if (sums[bandIndex]) {
            sums[bandIndex] += value;
          } else {
            sums[bandIndex] = value;
          }
        }
      });

      if (sums.length > 0) return sums;
      else return [0];

    } else {
      throw 'Sum couldn\'t identify geometry';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default sum;
