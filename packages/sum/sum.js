'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');

/**
 * The sum function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the sum of all the pixels
 * in that area. If no geometry is included, the pixels returns the sum of
 * all the pixels for each band in the raster.
 * @name sum
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of sums for each band
 * @example
 * const sums = geoblaze.sum(georaster, geometry);
 */
function sum(georaster, geom, test, debug=false) {

  try {

    if (geom === null || geom === undefined) {

      let noDataValue = georaster.no_data_value;
      return georaster.values.map(band => { // iterate over each band which include rows of pixels
        return band.reduce((sumOfBand, row) => { // reduce all the rows into one sum
          return sumOfBand + row.reduce((sumOfRow, cellValue) => { // reduce each row to a sum of its pixel values
            return cellValue !== noDataValue && (test === undefined || test(cellValue)) ? sumOfRow + cellValue : sumOfRow;
          }, 0);
        }, 0);
      });

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      let values = get(georaster, geom);
      let height = georaster.height;
      let width = georaster.width;
      let noDataValue = georaster.no_data_value;

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
      let sums = [];

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
      throw "Sum couldn't identify geometry"
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = sum;
