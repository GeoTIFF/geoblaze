import _ from 'underscore';
import get from '../get';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const getEqualIntervalBins = (values, numClasses) => {

  // get min and max values
  const minValue = _.min(values);
  const maxValue = _.max(values);

  // specify bins, bins represented as a list of [min, max] values
  // and are divided up based on number of classes
  const interval = (maxValue - minValue) / numClasses;
  const bins = _.range(numClasses).map((num, index) => {
    const start = Number((minValue + num * interval).toFixed(2));
    const end = Number((minValue + (num + 1) * interval).toFixed(2));
    return [start, end];
  });

  const results = {};

  // set first bin in results to eliminate the need to check
  // for the existence of the key in every iteration
  let binIndex = 0;
  let bin = bins[binIndex];
  let binKey = `${bin[0]} - ${bin[1]}`;
  const firstValue = values[0];

  while (firstValue > bin[1]) { // this is in case the first value isn't in the first bin
    binIndex += 1;
    bin = bins[binKey];
    binKey = `>${bin[0]} - ${bin[1]}`;
  }
  results[binKey] = 1;

  // add to results based on bins
  for (let i = 1; i < values.length; i++) {
    const value = values[i];
    if (value <= bin[1]) { // add to existing bin if its in the correct range
      results[binKey] += 1;
    } else { // otherwise keep searching for an appropriate bin until one is found
      while (value > bin[1]) {
        binIndex += 1;
        bin = bins[binIndex];
        binKey = `>${bin[0]} - ${bin[1]}`;
        results[binKey] = 0; // initialize that bin
      }
      results[binKey] = 1; // initialize that bin with the first occupant
    }
  }

  return results;
};

const getQuantileBins = (values, numClasses) => {

  // get the number of values in each bin
  const valuesPerBin = values.length / numClasses;

  // iterate through values and use a counter to
  // decide when to set up the next bin. Bins are
  // represented as a list of [min, max] values
  const results = {};
  let binMin = values[0];
  let numValuesInCurrentBin = 1;
  for (let i = 1; i < values.length; i++) {
    if (numValuesInCurrentBin + 1 < valuesPerBin) {
      numValuesInCurrentBin += 1;
    } else { // if it is the last value, add it to the bin and start setting up for the next one
      const value = values[i];
      const binMax = value;
      numValuesInCurrentBin += 1;
      if (_.keys(results).length > 0) binMin = `>${binMin}`;
      results[`${binMin} - ${binMax}`] = numValuesInCurrentBin;
      numValuesInCurrentBin = 0;
      binMin = value;
    }
  }

  // add the last bin
  const binMax = values[values.length - 1];
  numValuesInCurrentBin += 1;
  binMin = `>${binMin}`;
  results[`${binMin} - ${binMax}`] = numValuesInCurrentBin;

  return results;
};

const getHistogram = (values, options = {}) => {

  // pull out options, possible options are:
  // scaleType: measurement scale, options are: nominal, ratio
  // numClasses: number of classes/bins, only available for ratio data
  // classType: method of breaking data into classes, only available
  //       for ratio data, options are: equal-interval, quantile
  //
  const scaleType = options.scaleType;
  const numClasses = options.numClasses;
  const classType = options.classType;

  if (!scaleType) {
    throw 'Insufficient options were provided, need a value for "scaleType." Possible values include "nominal" and "ratio".';
  }

  let results;

  // when working with nominal data, we simply create a new object attribute
  // for every new value, and increment for each additional value.
  if (scaleType === 'nominal') {
    results = {};
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (results[value]) results[value] += 1;
      else results[value] = 1;
    }
  } else if (scaleType === 'ratio') {
    results = {};

    if (!numClasses) {
      throw 'Insufficient options were provided, need a value for "numClasses".';
    } else if (!classType) {
      throw 'Insufficient options were provided, need a value for "classType". Possible values include "equal-interval" and "quantile"';
    }

    // sort values to make binning more efficient
    values = values.sort((a, b) => a - b);

    if (classType === 'equal-interval') {
      results = getEqualIntervalBins(values, numClasses);
    } else if (classType === 'quantile') {
      results = getQuantileBins(values, numClasses);
    } else {
      throw 'The classType provided is either not supported or incorrectly specified.';
    }
  }

  if (results) return results;
  else throw 'An unexpected error occurred while running the getHistogram function.';
};

const getHistogramsForRaster = (georaster, geom, options) => {

  try {
    if (geom === null || geom === undefined) {
      const flat = true;
      const values = get(georaster, null, flat);
      const { noDataValue } = georaster;

      return values
        .map(band => band.filter(value => value !== noDataValue))
        .map(band => getHistogram(band, options));

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);
      const { noDataValue } = georaster;

      // grab array of values by band
      const flat = true;
      const values = get(georaster, geom, flat);

      // run through histogram function
      return values
        .map(band => band.filter(value => value !== noDataValue))
        .map(band => getHistogram(band, options));

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      const { noDataValue } = georaster;

      // grab array of values by band
      let values = [];
      intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (values[bandIndex]) {
          values[bandIndex].push(value);
        } else {
          values[bandIndex] = [value];
        }
      });

      values = values.map(band => band.filter(value => value !== noDataValue));

      // run through histogram function
      return values.map(band => getHistogram(band, options));

    } else {
      throw 'Only Bounding Box and Polygon geometries are currently supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default getHistogramsForRaster;
