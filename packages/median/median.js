'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');
let _ = require("underscore");

let get_median = values => {

  // sort values
  values.sort();
  let values_length = values.length;

  // pull middle value from sorted array
  if (values_length % 2 !== 0) {
    let middle = Math.floor(values_length / 2);
    return values[middle];
  } else {
    let middle = values_length / 2;
    return (values[middle - 1] + values[middle]) / 2;
  }
}

/**
 * The median function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the median of all the pixels
 * in that area. If no geometry is included, the pixels returns the median of
 * all the pixels for each band in the raster.
 * @name median
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of medians for each band
 * @example
 * const medians = geoblaze.median(georaster, geometry);
 */
function get_median_for_raster(georaster, geom) {

  try {

    let geom_is_bbox = utils.is_bbox(geom);

    if (geom === null || geom === undefined || geom_is_bbox) {

      if (geom_is_bbox) {

        geom = convert_geometry('bbox', geom);

      }

      let values = get(georaster, geom);

      let no_data_value = georaster.no_data_value;

      // median values
      let medians = []
      for (let band_index = 0; band_index < values.length; band_index++) {
        let band = values[band_index];
        let counts = utils.count_values_in_table(band, no_data_value);
        let number_of_cells_with_values_in_band = utils.sum(_.values(counts));
        let sorted_counts = _.pairs(counts).sort((pair1, pair2) => Number(pair1[0]) - Number(pair2[0]));
        //console.log("sorted_counts:", sorted_counts);
        let middle = number_of_cells_with_values_in_band / 2;
        let running_count = 0;
        for (let i = 0; i < sorted_counts.length; i++) {
          let sorted_count = sorted_counts[i];
          let value = Number(sorted_count[0]);
          let count = sorted_count[1];
          running_count += count;
          if (running_count > middle) {
            medians.push(value);
            break;
          } else if (running_count === middle) {
            medians.push((value + Number(sorted_counts[i+1])) / 2);
            break;
          }
        }
        //console.log("medians:", medians);
      }
      return medians;

    } else if (utils.is_polygon(geom)) {
      geom = convert_geometry('polygon', geom);
      let values = [];

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the get_median function
      intersect_polygon(georaster, geom, (value, band_index) => {
        if (values[band_index]) {
          values[band_index].push(value);
        } else {
          values[band_index] = [value];
        }
      });

      if (values.length > 0) return values.map(get_median);
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = get_median_for_raster;
