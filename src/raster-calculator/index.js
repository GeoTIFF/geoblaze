/**
 * The raster calculator function takes a georaster and a javascript function as input.
 * The function is performed pixel-by-pixel on each cell in the raster. The arguments
 * to the function should reference bands in the order in the raster
 * @name rasterCalculator
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Function} function - a JavaScript function representing an arithmetic operation to perform
 * @returns {GeoRaster} georaster - the computed georaster
 * @example
 * // 3-band GeoTIFF with bands (a) red, (b) green, and (c) blue
 * const url = "https://example.org/rgb.tif"
 * const filteredRaster = geoblaze.rasterCalculator(url, (a, b, c) => a + b === c ? 1 : 0);
 */
export { default } from "./raster-calculator.module";
