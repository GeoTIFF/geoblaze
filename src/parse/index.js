/**
 * The parse function takes a georaster (as an object, array buffer, blob, buffer, file or url)
 * and returns a promise. The promise resolves to a georaster, which
 * can be used as input in other geoblaze methods, such as identify, sum,
 * or histogram. This function essentially call's <a href="https://github.com/geotiff/georaster" target="_blank">georaster</a>'s parseGeoRaster function.
 * @name parse
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @example
 * import { parse } from "geoblaze";
 *
 * // parse url
 * const georaster = await parse("https://example.org/naif.tif");
 *
 * // parse array buffer
 * const response = await fetch("https://example.org/naif.tif");
 * const arrayBuffer = await response.arrayBuffer();
 * const georaster = await parse(arrayBuffer);
 *
 * // parse buffer (in NodeJS)
 * import { readFileSync } from "fs";
 * const buffer = readFileSync("naip.tif");
 * const georaster = await parse(buffer);
 */
export { default } from "./parse.module";
