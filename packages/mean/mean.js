'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');

/**
 * The mean function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the mean of all the pixels
 * in that area. If no geometry is included, the pixels returns the mean of
 * all the pixels for each band in the raster.
 * @name median
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of means for each band
 * @example
 * const means = geoblaze.mean(georaster, geometry);
 */
module.exports = (georaster, geom) => {

  try {

    if (utils.is_bbox(geom)) { // if geometry is a bounding box
      geom = convert_geometry('bbox', geom);
      let no_data_value = georaster.no_data_value;

      // grab array of values
      let values = get(georaster, geom);

      // sum values
      let sums = []
      for (let band_index = 0; band_index < values.length; band_index++) {
        let running_sum_for_band = 0;
        let number_of_cells_with_values_in_band = 0;
        let band = values[band_index];
        let number_of_rows = band.length;
        for (let row_index = 0; row_index < number_of_rows; row_index++) {
          let row = band[row_index];
          let number_of_cells = row.length;
          for (let column_index = 0; column_index < number_of_cells; column_index++) {
            let value = row[column_index];
            if (value !== no_data_value) {
              number_of_cells_with_values_in_band++;
              running_sum_for_band += value;
            }
          }
        }
        sums.push(running_sum_for_band / number_of_cells_with_values_in_band);
      }
      return sums;
    } else if (utils.is_polygon(geom)) { // if geometry is a polygon
      geom = convert_geometry('polygon', geom);
      let sums = [];
      let num_values = [];

      // the third argument of intersect_polygon is a function which
      // is run on every value, we use it to increment the sum so we
      // can later divide it by the total value count to get the mean
      intersect_polygon(georaster, geom, (value, band_index) => {
        if (num_values[band_index]) {
          sums[band_index] += value;
          num_values[band_index] += 1;
        } else {
          sums[band_index] = value;
          num_values[band_index] = 1;
        }
      });

      // here we check to see how many bands were in the image
      // based on the sums and use that to select how we display
      // the result
      let results = [];
      num_values.forEach((num, index) => {
        if (num > 0) results.push(sums[index] / num);
      });

      if (results) return results;
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Only Bounding Box and Polygon geometries are currently supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}
