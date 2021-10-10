import _ from "underscore";
import parseGeoraster from "georaster";

import get from "../get";
import wrap from "../wrap-load";
import utils from "../utils";

const containsNoDataValue = (bandValues, noDataValue) => {
  const numBandValues = bandValues.length;
  for (let i = 0; i < numBandValues; i++) {
    if (bandValues[i] === noDataValue) return true;
  }
  return false;
};

const parseString = (string, numBands) => {
  return new Function(...utils.listVariables(numBands), string);
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

const rasterCalculator = async (georaster, func) => {
  const bands = await get(georaster);
  const numBands = bands.length;

  if (typeof func === "string") {
    func = parseString(func.toLowerCase(), numBands);
  }

  if (typeof func !== "function") {
    throw new Error("Function is invalid. Please provide a valid function as the second argument.");
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

  const metadata = _.pick(georaster, ...["noDataValue", "projection", "xmin", "ymax", "pixelWidth", "pixelHeight"]);
  return await parseGeoraster([values], metadata);
};

export default wrap(rasterCalculator);
