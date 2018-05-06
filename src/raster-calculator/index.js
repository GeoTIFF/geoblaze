import rasterCalculator from './raster-calculator.module';

/**
 * The raster calculator function takes a raster and a javascript function as input.
 * The function is performed pixel-by-pixel on each cell in the raster. The arguments
 * to the function should reference bands in the order in the raster
 * @name rasterCalculator
 * @param {Object} raster - a raster from the georaster library
 * @param {String} operation - a string representation of a arithmetic operation to perform
 * @returns {Object} raster - the computed georaster
 * @example
 * const filteredRaster = geoblaze.rasterCalculator(georaster, (a, b, c) => a + b === c ? 1 : 0);
 */
export default rasterCalculator;
