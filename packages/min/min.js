'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');
let _ = require("underscore");

let getMin = (values, noDataValue) => {
  let numberOfValues = values.length;
  if (numberOfValues > 0) {
    let min = null;
    for (let i = 0; i < numberOfValues; i++) {
      let value = values[i];
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
}

/**
 * The min function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the min of all the pixels
 * in that area for each band. If no geometry is included, the pixels returns the min of
 * all the pixels for each band in the raster.
 * @name min
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of mins for each band
 * @example
 * const mins = geoblaze.min(georaster, geometry);
 */
function getMinForRaster(georaster, geom) {

  try {

    let noDataValue = georaster.no_data_value;

    if (geom === null || geom === undefined) {

      return georaster.values.map(band => {
        return _.min(band.map(row => getMin(row, noDataValue)).filter(value => value !== undefined && value !== null));
      });

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      // grab array of values;
      let values = get(georaster, geom, true);

      // get min value
      return values.map(band => getMin(band, noDataValue));


    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      let values = [];

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
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = getMinForRaster;
