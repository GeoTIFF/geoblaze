/**
 * This function loads a whole file into memory as a georaster.  If you pass in a url,
 * it will fetch the whole file.  It is the heavy-weight alternative to <a href="#parse">geoblaze.parse</a>
 * and should only be used if your file is relatively small or you have a really good reason
 * for loading the whole file into memory, like running band arithmetic to create a new file.
 * In general, use <a href="#parse">geoblaze.parse</a> instead of geoblaze.load.
 * @name load
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared
 * const url = "https://example.org/naif.tif";
 *
 * const georaster = await geoblaze.load(url);
 *
 * const mins = geoblaze.min(georaster);
 * const maxs = geoblaze.max(georaster);
 *
 * const ndvi = geoblaze.bandArithmetic(georaster, "(d - a) / (d + a)");
 */
export { default } from "./load.module";
