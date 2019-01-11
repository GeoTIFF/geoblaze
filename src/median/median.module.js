import _ from 'underscore';
import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const getMedian = values => {

  // sort values
  values.sort();
  const valuesLength = values.length;

  // pull middle value from sorted array
  if (valuesLength % 2 !== 0) {
    const middle = Math.floor(valuesLength / 2);
    return values[middle];
  } else {
    const middle = valuesLength / 2;
    return (values[middle - 1] + values[middle]) / 2;
  }
};

const getMedianForRaster = (georaster, geom) => {

  try {

    const geomIsBbox = utils.isBbox(geom);

    if (geom === null || geom === undefined || geomIsBbox) {

      if (geomIsBbox) {
        geom = convertGeometry('bbox', geom);
      }

      const values = get(georaster, geom);

      const { noDataValue } = georaster;

      // median values
      const medians = [];
      for (let bandIndex = 0; bandIndex < values.length; bandIndex++) {
        const band = values[bandIndex];
        const counts = utils.countValuesInTable(band, noDataValue);
        const numCellsWithValue = utils.sum(_.values(counts));
        const sortedCounts = _.pairs(counts).sort((pair1, pair2) => Number(pair1[0]) - Number(pair2[0]));
        //console.log("sortedCounts:", sortedCounts);
        const middle = numCellsWithValue / 2;
        let runningCount = 0;
        for (let i = 0; i < sortedCounts.length; i++) {
          const sortedCount = sortedCounts[i];
          const value = Number(sortedCount[0]);
          const count = sortedCount[1];
          runningCount += count;
          if (runningCount > middle) {
            medians.push(value);
            break;
          } else if (runningCount === middle) {
            medians.push((value + Number(sortedCounts[i+1])) / 2);
            break;
          }
        }
        //console.log("medians:", medians);
      }
      return medians;

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      const values = [];

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the getMedian function
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (values[bandIndex]) {
          values[bandIndex].push(value);
        } else {
          values[bandIndex] = [value];
        }
      });

      if (values.length > 0) return values.map(getMedian);
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default getMedianForRaster;
