import _ from 'underscore';
import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const getMin = (values, noDataValue) => {
  const numberOfValues = values.length;
  if (numberOfValues > 0) {
    let min = null;
    for (let i = 0; i < numberOfValues; i++) {
      const value = values[i];
      if (value !== noDataValue) {

        /* We first compare the current value to the stored minimum.
        If the new value is less than the stored minimum, replace the
        stored minimum with the new value. Also check to see
        if the minimum value has not yet been defined, and
        define it as the current value if that is the case. */

        if (value < min || min === null) {
          min = value;
        }
      }
    }
    return min;
  } else {
    throw 'No values were provided';
  }
};

const getMinForRaster = (georaster, geom) => {

  try {

    const { noDataValue } = georaster;

    if (geom === null || geom === undefined) {

      return georaster.values.map(band => {
        return _.min(band.map(row => getMin(row, noDataValue)).filter(value => value !== undefined && value !== null));
      });

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      // grab array of values;
      const values = get(georaster, geom, true);

      // get min value
      return values.map(band => getMin(band, noDataValue));


    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      const values = [];

      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (typeof values[bandIndex] === 'undefined') {
          values[bandIndex] = value;
        } else if (value < values[bandIndex]) {
          values[bandIndex] = value;
        }
      });

      if (values.length > 0) return values;
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default getMinForRaster;
