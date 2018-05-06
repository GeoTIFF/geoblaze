import mode from './mode.module';

/**
 * The mode function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the mode of all the pixels
 * in that area. If no geometry is included, the function returns the mode of
 * all the pixels for each band in the raster.
 * @name mode
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of modes for each band
 * @example
 * const modes = geoblaze.mode(georaster, geometry);
 */
export default mode;
