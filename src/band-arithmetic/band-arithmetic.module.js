import _ from "underscore";
import parseGeoraster from "georaster";
import { parse } from "mathjs";

import get from "../get";
import wrap from "../wrap-load";
import utils from "../utils";

const regexMultiCharacter = /[A-z]{2}/g;

const containsNoDataValue = (bandValues, noDataValue) => {
  const numBandValues = bandValues.length;
  for (let i = 0; i < numBandValues; i++) {
    if (bandValues[i] === noDataValue) return true;
  }
  return false;
};

const isLeafNode = node => !node.op;

const parseAST = (ast, numBands) => {
  return new Function(...utils.listVariables(numBands), `return ${parseNode(ast)}`);
};

const parseNode = node => {
  const leftNode = node.args[0];
  const rightNode = node.args[1];

  const operation = node.op;

  let leftHandSide;
  if (leftNode.content) {
    // if the node represents parentheses, it will be an object with a single property "content" which contains a node
    leftHandSide = `(${parseNode(leftNode.content)}`;
  } else if (isLeafNode(leftNode)) {
    leftHandSide = `(${leftNode.value || leftNode.name}`;
  } else {
    leftHandSide = `(${parseNode(leftNode)}`;
  }

  let rightHandSide;
  if (rightNode.content) {
    // if the node represents parentheses, it will be an object with a single property "content" which contains a node
    rightHandSide = `${parseNode(rightNode.content)})`;
  } else if (isLeafNode(rightNode)) {
    rightHandSide = `${rightNode.value || rightNode.name})`;
  } else {
    rightHandSide = `${parseNode(rightNode)})`;
  }

  return `${leftHandSide} ${operation} ${rightHandSide}`;
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

// pre-parse arithmetic string to catch limitations with arithmetic operations
// before attempting to compute
const arithmeticError = arithmetic => {
  if (arithmetic.match(regexMultiCharacter)) {
    return "Geoblaze does not currently support implicit multiplication between variables. Please use the multiplication (*) symbol for these operations.";
  }
};

const bandArithmetic = async (georaster, arithmetic) => {
  const { noDataValue } = georaster;

  const bands = await get(georaster, undefined, false);

  if (bands.length < 2) {
    throw new Error("Band arithmetic is not available for this raster. Please make sure you are using a multi-band raster.");
  }

  const parseError = arithmeticError(arithmetic);
  if (parseError) throw new Error(parseError);

  const values = [];
  const numRows = bands[0].length;

  const ast = parse(arithmetic.toLowerCase());
  const arithmeticFunction = parseAST(ast, bands.length);

  for (let i = 0; i < numRows; i++) {
    const bandRows = getBandRows(bands, i);
    const row = [];
    const numValues = bandRows[0].length;

    for (let j = 0; j < numValues; j++) {
      const bandValues = getBandValues(bandRows, j);
      if (containsNoDataValue(bandValues, noDataValue)) {
        row.push(noDataValue);
      } else {
        const value = arithmeticFunction(...bandValues);
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
  const newGeoRaster = await parseGeoraster([values], metadata);
  return newGeoRaster;
};

export default wrap(bandArithmetic);
