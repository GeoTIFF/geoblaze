/**
 * The modes function takes a georaster and an optional geometry.
 * If a geometry is included, the function returns the modes of all the pixels
 * in that area. If no geometry is included, the function returns the modes of
 * all the pixels for each band in the georaster.  Unlike the mode function, it will
 * not compute the mean, but return all the most common values for each band.
 * @name modes
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Array<Array<Number>>} array of modes for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const results = await geoblaze.mode(url, geometry);
 * // results is [ [red], [green], [blue], [nir] ]
 * [[ 42, 43] , [83, 82, 84], [92], [94]]
 */

export { default } from "./modes.module";
