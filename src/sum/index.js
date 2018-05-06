import sum from './sum.module';

/**
 * The sum function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the sum of all the pixels
 * in that area. If no geometry is included, the function returns the sum of
 * all the pixels for each band in the raster.
 * @name sum
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of sums for each band
 * @example
 * const sums = geoblaze.sum(georaster, geometry);
 */

export default sum;
