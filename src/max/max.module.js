import _ from 'underscore';
import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const getMax = (values, noDataValue) => {
  const numberOfValues = values.length;
  if (numberOfValues > 0) {
    let max = null;
    for (let i = 0; i < numberOfValues; i++) {
      const value = values[i];
      if (value !== noDataValue) {

        /* We first compare the current value to the stored maximum.
        If the new value is greater than the stored minimum, replace the
        stored minimum with the new value. When checking a greater than
        comparison aganist a null value, like in the first comparison,
        the statement resolves as true. */

        if (value > max) {
          max = value;
        }
      }
    }
    return max;
  } else {
    throw 'No values were provided';
  }
};

const getMaxForRaster = (georaster, geom) => {

  try {

    const noDataValue = georaster.no_date_value;

    if (geom === null || geom === undefined) {

      return georaster.values.map(band => {
        return _.max(band.map(row => getMax(row, noDataValue)));
      });

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      // grab array of values;
      const flat = true;
      const values = get(georaster, geom, flat);

      // get max value
      return values.map(band => getMax(band, noDataValue));

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      const values = [];

      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (!values[bandIndex]) {
          values[bandIndex] = value;
        } else if (value > values[bandIndex]) {
          values[bandIndex] = value;
        }
      });

      if (values) return values;
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default getMaxForRaster;
