import max from "./max.module";

/**
 * The max function takes a georaster (object or url) as an input and an optional geometry.
 * If a geometry is included, the function returns the max of all the pixels
 * in that area. If no geometry is included, the function returns the max of
 * all the pixels for each band in the raster.
 * @name max
 * @param {GeoRaster|string} georaster - a georaster or a url to a georaster (e.g. geotiff)
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Number[]} array of maxs for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const maxs = await geoblaze.max(url, geometry);
 * // maxs is [red, green, blue, nir]
 * [231, 242, 254, 255]
 */
export default max;
