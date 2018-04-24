'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');
let _ = require("underscore");

let getMax = (values, noDataValue) => {
  let numberOfValues = values.length;
  if (numberOfValues > 0) {
    let max = null;
    for (let i = 0; i < numberOfValues; i++) {
      let value = values[i];
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
}

/**
 * The max function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the max of all the pixels
 * in that area. If no geometry is included, the pixels returns the max of
 * all the pixels for each band in the raster.
 * @name max
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of maxs for each band
 * @example
 * const maxs = geoblaze.max(georaster, geometry);
 */
function getMaxForRaster(georaster, geom) {

  try {

    let noDataValue = georaster.no_date_value;

    if (geom === null || geom === undefined) {

      return georaster.values.map(band => {
        return _.max(band.map(row => getMax(row, noDataValue)));
      });

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      // grab array of values;
      let flat = true;
      let values = get(georaster, geom, flat);

      // get max value
      return values.map(band => getMax(band, noDataValue));

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      let values = [];

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
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = getMaxForRaster;
