import bandArithmetic from "./band-arithmetic.module";

/**
 * The band arithmetic function takes a georaster and an arithmetic operation written as
 * a string as input. The function performs pixel-by-pixel calculation according to the
 * arithmetic operation provided. This is only possible for a multiband raster and not
 * for single band rasters. The output is a computed single band raster.
 * @name bandArithmetic
 * @param {GeoRaster|string} georaster - georaster or a url to a georaster (e.g. geotiff)
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
export default bandArithmetic;
