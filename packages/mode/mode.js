'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');

let getModeFromCounts = counts => {
  // iterate through values to get highest frequency
  let buckets = _.sortBy(_.pairs(counts), pair => pair[1])
  let maxFrequency = buckets[buckets.length - 1][1];
  let modes = buckets
    .filter(pair => pair[1] === maxFrequency)
    .map(pair => Number(pair[0]));
  return modes.length === 1 ? modes[0] : modes;
}

let getMode = values => {
  let counts = _.countBy(values);
  return getModeFromCounts(counts);
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
function getModesForRaster(georaster, geom) {

  try {

    let noDataValue = georaster.no_data_value;

    if (geom === null || geom === undefined) {

      let modesForAllBands = georaster.values.map(band => {
        let counts = utils.countValuesInTable(band, noDataValue);
        return getModeFromCounts(counts);
      });
      return modesForAllBands.length === 1 ? modesForAllBands[0] : modesForAllBands;

    } else if (utils.isBbox(geom)) {

      geom = convertGeometry('bbox', geom);

      // grab array of values;
      let flat = true;
      let values = get(georaster, geom, flat);

      return values
        .map(band => band.filter(value => value !== noDataValue))
        .map(getMode);

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      let values = [];

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the getMode function
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (values[bandIndex]) {
          values[bandIndex].push(value);
        } else {
          values[bandIndex] = [value];
        }
      });

      if (values.length > 0) return values.map(getMode);
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = getModesForRaster;
