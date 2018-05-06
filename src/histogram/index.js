import histogram from './histogram.module';

/**
 * The histogram function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the histogram of all the pixels
 * in that area. If no geometry is included, the function returns the histogram of
 * all the pixels for each band in the raster.
 * @name histogram
 * @param {Object} a georaster from georaster library
 * @param {Object} [input=undefined] a geometry, which we'll use for clipping result
 * @returns {Object} array of histograms for each band
 * @example
 * var histograms = geoblaze.histogram(georaster, geometry);
 */
export default histogram;
