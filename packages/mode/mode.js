'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');

let get_mode_from_counts_object = counts => {
  // iterate through values to get highest frequency
  let buckets = _.sortBy(_.pairs(counts), pair => pair[1])
  let max_frequency = buckets[buckets.length - 1][1];
  let modes = buckets
    .filter(pair => pair[1] === max_frequency)
    .map(pair => Number(pair[0]));
  return modes.length === 1 ? modes[0] : modes;
}

let get_mode = values => {
  let counts = _.countBy(values);
  return get_mode_from_counts_object(counts);
}


/**
 * The mode function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the mode of all the pixels
 * in that area. If no geometry is included, the pixels returns the mode of
 * all the pixels for each band in the raster.
 * @name mode
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of modes for each band
 * @example
 * const modes = geoblaze.mode(georaster, geometry);
 */
function get_modes_for_raster(georaster, geom) {

  try {

    let no_data_value = georaster.no_data_value;

    if (geom === null || geom === undefined) {

      let modes_for_all_bands = georaster.values.map(band => {
        let counts = utils.count_values_in_table(band, no_data_value);
        return get_mode_from_counts_object(counts);
      });
      return modes_for_all_bands.length === 1 ? modes_for_all_bands[0] : modes_for_all_bands;

    } else if (utils.is_bbox(geom)) {

      geom = convert_geometry('bbox', geom);

      // grab array of values;
      let flat = true;
      let values = get(georaster, geom, flat);

      return values
        .map(band => band.filter(value => value !== no_data_value))
        .map(get_mode);

    } else if (utils.is_polygon(geom)) {
      geom = convert_geometry('polygon', geom);
      let values = [];

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the get_mode function
      intersect_polygon(georaster, geom, (value, band_index) => {
        if (values[band_index]) {
          values[band_index].push(value);
        } else {
          values[band_index] = [value];
        }
      });

      if (values.length > 0) return values.map(get_mode);
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = get_modes_for_raster;
