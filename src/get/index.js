import get from './get.module';

/**
 * The get function takes a raster and a bounding box as input. It returns
 * the subset of pixels in the raster found within the bounding box. It also
 * takes an optional parameter "flat" which will flatten the returning pixel
 * matrix across bands instead of retaining a nested array structure.
 * @name get
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} boundingBox - can be an [xmin, ymin, xmax, ymax] array, a [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Boolean} flat - whether or not the resulting output should be flattened into a single array
 * @returns {Object} array of pixel values
 * @example
 * const pixels = geoblaze.get(georaster, geometry);
 */
export default get;
