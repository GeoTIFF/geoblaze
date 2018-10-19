import _ from 'underscore';
import parseGeoraster from 'georaster';

import utils from '../utils';
const { listVariables } = utils;

const containsNoDataValue = (bandValues, noDataValue) => {
  const numBandValues = bandValues.length;
  for (let i = 0; i < numBandValues; i++) {
    if (bandValues[i] === noDataValue) return true;
  }
  return false;
};

const parseString = (string, numBands) => {
  return new Function(...listVariables(numBands), string);
};

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
};

const rasterCalculator = (georaster, func) => {
  return new Promise((resolve, reject) => {

    try {
      const bands = georaster.values;
      const numBands = bands.length;

      if (typeof func === 'string') {
        func = parseString(func.toLowerCase(), numBands);
      }

      if (typeof func !== 'function') {
        return reject(new Error('Function is invalid. Please provide a valid function as the second argument.'));
      }

      const { noDataValue } = georaster;
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
            const value = func(...bandValues);
            if (value === Infinity || value === -Infinity || isNaN(value)) {
              row.push(noDataValue);
            } else {
              row.push(value);
            }
          }
        }
        values.push(row);
      }

      const metadata = _.pick(georaster, ...[
        'noDataValue',
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

export default rasterCalculator;
