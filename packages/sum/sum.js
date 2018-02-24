'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');

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

      let no_data_value = georaster.no_data_value;
      return georaster.values.map(band => { // iterate over each band which include rows of pixels
        return band.reduce((sum_of_band, row) => { // reduce all the rows into one sum
          return sum_of_band + row.reduce((sum_of_row, cell_value) => { // reduce each row to a sum of its pixel values
            return cell_value !== no_data_value && (test === undefined || test(cell_value)) ? sum_of_row + cell_value : sum_of_row;
          }, 0);
        }, 0);
      });

    } else if (utils.is_bbox(geom)) {
      geom = convert_geometry('bbox', geom);

      let values = get(georaster, geom);
      let height = georaster.height;
      let width = georaster.width;
      let no_data_value = georaster.no_data_value;

      // sum values
      return values.map(band => { // iterate over each band which include rows of pixels
        return band.reduce((sum_of_band, row) => { // reduce all the rows into one sum
          return sum_of_band + row.reduce((sum_of_row, cell_value) => { // reduce each row to a sum of its pixel values
            return cell_value !== no_data_value && (test === undefined || test(cell_value)) ? sum_of_row + cell_value : sum_of_row;
          }, 0);
        }, 0);
      });

    } else if (utils.is_polygon(geom, debug)) {
      geom = convert_geometry('polygon', geom);
      let sums = [];

      // the third argument of intersect_polygon is a function which
      // is run on every value, we use it to increment the sum
      intersect_polygon(georaster, geom, (value, band_index) => {
        if (test === undefined || test(value)) {
          if (sums[band_index]) {
            sums[band_index] += value;
          } else {
            sums[band_index] = value;
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
