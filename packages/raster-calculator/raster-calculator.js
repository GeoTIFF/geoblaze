'use strict';

const _ = require('underscore');
const parseGeoraster = require("georaster");

const containsNoDataValue = (bandValues, noDataValue) => {
  const numBandValues = bandValues.length;
  for (let i = 0; i < numBandValues; i++) {
    if (bandValues[i] === noDataValue) return true;
  }
  return false;
}

const getBandRows = (bands, index) => {
  // using a for loop here instead of map leads to a significant performance improvement
  const bandRows = [];
  for (let i = 0; i < bands.length; i++) {
    bandRows.push(bands[i][index]);
  }
  return bandRows;
};

const getBandValues = (bandRows, index) => {
  // using a for loop here instead of map leads to a significant performance improvement
  const bandValues = [];
  for (let i = 0; i < bandRows.length; i++) {
    bandValues.push(bandRows[i][index]);
  }
  return bandValues;
}

/**
 * The raster calculator function takes a raster and a javascript function as input.
 * The function is performed pixel-by-pixel on each cell in the raster. The arguments
 * to the function should reference bands in their order in the raster
 * @name rasterCalculator
 * @param {Object} raster - a raster from the georaster library
 * @param {String} operation - a string representation of a arithmetic operation to perform
 * @returns {Object} raster - the computed georaster
 * @example
 * const filteredRaster = geoblaze.rasterCalculator(georaster, (a, b, c) => a + b === c ? 1 : 0);
 */
module.exports = (georaster, func) => {
  return new Promise((resolve, reject) => {
    if (typeof func !== 'function') {
      return reject(new Error('Function is invalid. Please provide a valid function as the second argument.'));
    }

    try {
      const bands = georaster.values;
      const noDataValue = georaster.no_data_value;
      const values = [];
      const numRows = bands[0].length;

      for (let i = 0; i < numRows; i++) {
        const bandRows = getBandRows(bands, i);
        const row = [];
        const numValues = bandRows[0].length;

        for (let j = 0; j < numValues; j++) {
          const bandValues = getBandValues(bandRows, j);
          if (containsNoDataValue(bandValues, noDataValue)) {
            row.push(noDataValue);
          } else {
            row.push(func(...bandValues));
          }
        }
        values.push(row);
      }

      const metadata = _.pick(georaster, ...[
        'no_data_value',
        'projection',
        'xmin',
        'ymax',
        'pixelWidth',
        'pixelHeight'
      ]);
      return parseGeoraster([values], metadata).then(georaster => resolve(georaster));

    } catch(e) {
      console.error(e);
      return reject(e);
    }
  });
};
