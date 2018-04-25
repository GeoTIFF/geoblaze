'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');
let _ = require("underscore");

let getMedian = values => {

  // sort values
  values.sort();
  let valuesLength = values.length;

  // pull middle value from sorted array
  if (valuesLength % 2 !== 0) {
    let middle = Math.floor(valuesLength / 2);
    return values[middle];
  } else {
    let middle = valuesLength / 2;
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
function getMedianForRaster(georaster, geom) {

  try {

    let geomIsBbox = utils.isBbox(geom);

    if (geom === null || geom === undefined || geomIsBbox) {

      if (geomIsBbox) {

        geom = convertGeometry('bbox', geom);

      }

      let values = get(georaster, geom);

      let noDataValue = georaster.no_data_value;

      // median values
      let medians = []
      for (let bandIndex = 0; bandIndex < values.length; bandIndex++) {
        let band = values[bandIndex];
        let counts = utils.countValuesInTable(band, noDataValue);
        let numCellsWithValue = utils.sum(_.values(counts));
        let sortedCounts = _.pairs(counts).sort((pair1, pair2) => Number(pair1[0]) - Number(pair2[0]));
        //console.log("sortedCounts:", sortedCounts);
        let middle = numCellsWithValue / 2;
        let runningCount = 0;
        for (let i = 0; i < sortedCounts.length; i++) {
          let sortedCount = sortedCounts[i];
          let value = Number(sortedCount[0]);
          let count = sortedCount[1];
          runningCount += count;
          if (runningCount > middle) {
            medians.push(value);
            break;
          } else if (runningCount === middle) {
            medians.push((value + Number(sortedCounts[i+1])) / 2);
            break;
          }
        }
        //console.log("medians:", medians);
      }
      return medians;

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      let values = [];

      // the third argument of this function is a function which
      // runs for every pixel in the polygon. Here we add them to
      // an array to run through the getMedian function
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (values[bandIndex]) {
          values[bandIndex].push(value);
        } else {
          values[bandIndex] = [value];
        }
      });

      if (values.length > 0) return values.map(getMedian);
      else throw 'No Values were found in the given geometry';

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.'
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
}

module.exports = getMedianForRaster;
