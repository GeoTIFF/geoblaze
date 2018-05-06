import min from './min.module';

/**
 * The min function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the min of all the pixels
 * in that area for each band. If no geometry is included, the function returns the min of
 * all the pixels for each band in the raster.
 * @name min
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of mins for each band
 * @example
 * const mins = geoblaze.min(georaster, geometry);
 */
export default min;
