import bandArithmetic from './band-arithmetic.module';

/**
 * The band arithmetic function takes a raster and an arithmetic operation written as
 * a string as input. The function performs pixel-by-pixel calculation according to the
 * arithmetic operation provided. This is only possible for a multiband raster and not
 * for single band rasters. The output is a computed single band raster.
 * @name bandArithmetic
 * @param {Object} raster - a raster from the georaster library
 * @param {String} operation - a string representation of a arithmetic operation to perform
 * @returns {Object} raster - the computed georaster
 * @example
 * const ndvi = geoblaze.bandArithmetic(georaster, '(c - b)/(c + b)');
 */
export default bandArithmetic;
