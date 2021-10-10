import rasterCalculator from "./raster-calculator.module";

/**
 * The raster calculator function takes a georaster (object or url) and a javascript function as input.
 * The function is performed pixel-by-pixel on each cell in the raster. The arguments
 * to the function should reference bands in the order in the raster
 * @name rasterCalculator
 * @param {GeoRaster|string} georaster - a georaster or a url to a georaster (e.g. geotiff)
 * @param {Function} function - a JavaScript function representing an arithmetic operation to perform
 * @returns {GeoRaster} georaster - the computed georaster
 * @example
 * const filteredRaster = geoblaze.rasterCalculator(georaster, (a, b, c) => a + b === c ? 1 : 0);
 */
export default rasterCalculator;
