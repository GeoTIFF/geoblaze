import median from './median.module';

/**
 * The median function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the median of all the pixels
 * in that area. If no geometry is included, the function returns the median of
 * all the pixels for each band in the raster.
 * @name median
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of medians for each band
 * @example
 * const medians = geoblaze.median(georaster, geometry);
 */
export default median;
