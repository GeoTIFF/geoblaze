/**
 * The min function takes a georaster as an input and an optional geometry.
 * If a geometry is included, the function returns the min of all the pixels
 * in that area for each band. If no geometry is included, the function returns the min of
 * all the pixels for each band in the raster.
 * @name min
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Number[]} array of mins for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const mins = await geoblaze.min(url, geometry);
 * // mins is [red, green, blue, nir]
 * [1, 4, 9, 4]
 */
export { default } from "./min.module";
