import stat from "../stat";

/**
 * The range function takes a georaster as an input and an optional geometry.
 * If a geometry is included, the function returns the range of all the pixels
 * in that area for each band. If no geometry is included, the function returns the range of
 * all the pixels for each band in the raster.
 * @name min
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Function} test - a filter function that takes in a pixel value and returns true or false whether it should be included in the range calculation
 * @returns {Number[]} array of ranges for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const ranges = await geoblaze.range(url, geometry);
 * // ranges is [red, green, blue, nir]
 * [231, 234, 229, 0]
 */

export default function range(georaster, geometry, test) {
  return stat(georaster, geometry, "range", test, { vrm: "minimal" });
}
