/**
 * The sum function takes a georaster and an optional geometry.
 * If a geometry is included, the function returns the sum of all the pixels
 * in that area. If no geometry is included, the function returns the sum of
 * all the pixels for each band in the georaster.
 * @name sum
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Number[]} array of sums for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const results = await geoblaze.sum(url, geometry);
 * // results is [red, green, blue, nir]
 * [217461, 21375, 57312, 457125]
 */
export { default } from "./sum.module";
