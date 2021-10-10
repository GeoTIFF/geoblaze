/**
 * The get function takes a georaster and a bounding box as input. It returns
 * the subset of pixels in the georaster found within the bounding box. It also
 * takes an optional parameter "flat" which will flatten the returning pixel
 * matrix across bands, so that for each band all the rows will be combined into one long array.
 * @name get
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} boundingBox - can be an [xmin, ymin, xmax, ymax] array, a [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Boolean} flat - whether or not the resulting output should be flattened into a single array for each band
 * @returns {Object} array of pixel values
 * @example
 * const pixels = await geoblaze.get(georaster, geometry);
 */
export { default } from "./get.module";
