'use strict';

const _ = require('underscore');
const parse_georaster = require("georaster");

const get = require('../get/get');
const utils = require('../utils/utils');
const convert_geometry = require('../convert-geometry/convert-geometry');
const intersect_polygon = require('../intersect-polygon/intersect-polygon');

const logger = require('../../logger');
const parse = require('mathjs').parse;

const regex_multi_character = /[A-z]{2}/g;

const is_leaf_node = node => !node.op;

const variables = [...Array(13)].map((val, i) => String.fromCharCode(i + 65).toLowerCase());
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

const get_value = (input, band_values) => {
  if (input.value) return input.value;

  const variable_index = variables.findIndex(variable => variable === input.name);
  return band_values[variable_index];
};

const compute_value = (node, band_values) => {
  const left_node = node.args[0];
  const right_node = node.args[1];

  const operation = node.fn;

  let left_value;
  if (left_node.content) { // if the node represents parentheses, it will be an object with a single property "content" which contains a node
    left_value = compute_value(left_node.content, band_values);
  } else if (is_leaf_node(left_node)) {
    left_value = get_value(left_node, band_values);
  } else {
    left_value = compute_value(left_node, band_values);
  }

  let right_value;
  if (right_node.content) { // if the node represents parentheses, it will be an object with a single property "content" which contains a node
    right_value = compute_value(right_node.content, band_values);
  } else if (is_leaf_node(right_node)) {
    right_value = get_value(right_node, band_values);
  } else {
    right_value = compute_value(right_node, band_values);
  }

  return operations[operation](left_value, right_value);
};

const get_band_rows = (bands, index) => {
  // using a for loop here instead of map leads to a significant performance improvement
  const band_rows = [];
  for (let i = 0; i < bands.length; i++) {
    band_rows.push(bands[i][index]);
  }
  return band_rows;
};

const get_band_values = (band_rows, index) => {
  // using a for loop here instead of map leads to a significant performance improvement
  const band_values = [];
  for (let i = 0; i < band_rows.length; i++) {
    band_values.push(band_rows[i][index]);
  }
  return band_values;
}

// pre-parse arithmetic string to catch limitations with arithmetic operations
// before attempting to compute
const arithmetic_error = (arithmetic) => {
  if (arithmetic.match(regex_multi_character)) {
    return ('Geoblaze does not currently support implicit multiplication between variables. Please use the multiplication (*) symbol for these operations.');
  }
}

/**
 * The band arithmetic function takes a raster and an arithmetic operation written as
 * a string as input. The function performs pixel-by-pixel calculation according to the
 * arithmetic operation provided. This is only possible for a multiband raster and not
 * for single band rasters. The output is a computed single band raster.
 * @name band_arithmetic
 * @param {Object} raster - a raster from the georaster library
 * @param {String} operation - a string representation of a arithmetic operation to perform
 * @returns {Object} array of computed values for each band
 * @example
 * const ndvi = geoblaze.band_arithmetic(georaster, '(c - b)/(c + b)');
 */

module.exports = (georaster, arithmetic) => {
  return new Promise((resolve, reject) => {
    const parsed_arithmetic = parse(arithmetic.toLowerCase());

    if (georaster.values.length < 2) {
      return reject(new Error('Band arithmetic is not available for this raster. Please make sure you are using a multi-band raster.'));
    }

    const parse_error = arithmetic_error(arithmetic);
    if (parse_error) return reject(new Error(parse_error));

    try {
      const bands = georaster.values;
      const values = [];

      for (let i = 0; i < bands[0].length; i++) {
        const band_rows = get_band_rows(bands, i);
        const row = [];

        for (let j = 0; j < band_rows[0].length; j++) {
          const band_values = get_band_values(band_rows, j);
          row.push(compute_value(parsed_arithmetic, band_values));
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
      return parse_georaster([values], metadata).then(georaster => resolve(georaster));

    } catch(e) {
      console.error(e);
      reject(e);
    }
  });
};
