'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');
let intersectPolygon = require('../intersect-polygon/intersect-polygon');

/**
 * The mean function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the mean of all the pixels
 * in that area. If no geometry is included, the pixels returns the mean of
 * all the pixels for each band in the raster.
 * @name mean
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of means for each band
 * @example
 * const means = geoblaze.mean(georaster, geometry);
 */
function mean(georaster, geom) {

  try {

    if (utils.isBbox(geom)) { // if geometry is a bounding box
      geom = convertGeometry('bbox', geom);
      let noDataValue = georaster.no_data_value;

      // grab array of values
      let values = get(georaster, geom);

      // sum values
      let sums = []
      for (let bandIndex = 0; bandIndex < values.length; bandIndex++) {
        let sumForBand = 0;
        let cellsWithValues = 0;
        let band = values[bandIndex];
        let numberOfRows = band.length;
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
          let row = band[rowIndex];
          let numCells = row.length;
          for (let columnIndex = 0; columnIndex < numCells; columnIndex++) {
            let value = row[columnIndex];
            if (value !== noDataValue) {
              cellsWithValues++;
              sumForBand += value;
            }
          }
        }
        sums.push(sumForBand / cellsWithValues);
      }
      return sums;
    } else if (utils.isPolygon(geom)) { // if geometry is a polygon
      geom = convertGeometry('polygon', geom);
      let sums = [];
      let numValues = [];

      // the third argument of intersectPolygon is a function which
      // is run on every value, we use it to increment the sum so we
      // can later divide it by the total value count to get the mean
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (numValues[bandIndex]) {
          sums[bandIndex] += value;
          numValues[bandIndex] += 1;
        } else {
          sums[bandIndex] = value;
          numValues[bandIndex] = 1;
        }
      });

      // here we check to see how many bands were in the image
      // based on the sums and use that to select how we display
      // the result
      let results = [];
      numValues.forEach((num, index) => {
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

module.exports = mean;
