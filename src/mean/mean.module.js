import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const mean = (georaster, geom) => {

  try {

    const geomIsBbox = utils.isBbox(geom);

    if (geom === null || geom === undefined || geomIsBbox) {

      if (geomIsBbox) {
        geom = convertGeometry('bbox', geom);
      }

      const values = get(georaster, geom);

      const { noDataValue } = georaster;

      // sum values
      const sums = [];
      for (let bandIndex = 0; bandIndex < values.length; bandIndex++) {
        let sumForBand = 0;
        let cellsWithValues = 0;
        const band = values[bandIndex];
        const numberOfRows = band.length;
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
          const row = band[rowIndex];
          const numCells = row.length;
          for (let columnIndex = 0; columnIndex < numCells; columnIndex++) {
            const value = row[columnIndex];
            if (value !== noDataValue) {
              cellsWithValues++;
              sumForBand += value;
            }
          }
        }
        sums.push(sumForBand / cellsWithValues);
      }
      return sums;
    } else if (utils.isPolygon(geom)) { // if geometry is a polygon
      geom = convertGeometry('polygon', geom);
      const sums = [];
      const numValues = [];

      // the third argument of intersectPolygon is a function which
      // is run on every value, we use it to increment the sum so we
      // can later divide it by the total value count to get the mean
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (numValues[bandIndex]) {
          sums[bandIndex] += value;
          numValues[bandIndex] += 1;
        } else {
          sums[bandIndex] = value;
          numValues[bandIndex] = 1;
        }
      });

      // here we check to see how many bands were in the image
      // based on the sums and use that to select how we display
      // the result
      const results = [];
      numValues.forEach((num, index) => {
        if (num > 0) results.push(sums[index] / num);
      });

      if (results) return results;
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Only Bounding Box and Polygon geometries are currently supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default mean;
