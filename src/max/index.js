import max from './max.module';

/**
 * The max function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the max of all the pixels
 * in that area. If no geometry is included, the function returns the max of
 * all the pixels for each band in the raster.
 * @name max
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of maxs for each band
 * @example
 * const maxs = geoblaze.max(georaster, geometry);
 */
export default max;
