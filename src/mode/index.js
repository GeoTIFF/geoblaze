/**
 * The mode function takes a georaster and an optional geometry.
 * If a geometry is included, the function returns the mode of all the pixels
 * in that area. If no geometry is included, the function returns the mode of
 * all the pixels for each band in the georaster.  If there is more than one mode for a band,
 * it computes the mean among those modes.
 * @name mode
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Number[]} array of modes for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const results = await geoblaze.mode(url, geometry);
 * // results is [red, green, blue, nir]
 * [42, 84, 92, 94]
 */
export { default } from "./mode.module";
