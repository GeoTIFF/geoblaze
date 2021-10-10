/**
 * The band arithmetic function takes a georaster and an arithmetic operation. The function performs pixel-by-pixel calculation according to the
 * arithmetic operation provided. This is only possible for a multiband raster and not
 * for single band rasters. The output is a computed single band raster.
 * @name bandArithmetic
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {String} operation - a string representation of an arithmetic operation to perform
 * @returns {GeoRaster} the computed georaster
 * @example
 * // naip.tif has 4-bands: red (a), green (b), blue (c) and near-infrared (d)
 * const ndvi = await geoblaze.bandArithmetic("https://example.org/naip.tif", '(d - a)/(d + a)')
 *
 * // or if you want to preload the georaster, so you can use it later, too
 * const georaster = await geoblaze.load("https://example.org/naip.tif");
 * const ndvi = await geoblaze.bandArithmetic(georaster, '(c - b)/(c + b)');
 */
export { default } from "./band-arithmetic.module";
