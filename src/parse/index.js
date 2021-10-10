import parse from "./parse.module";

/**
 * The parse function takes a url to a geotiff, geotiff file, or array buffer as an input
 * and returns a promise. The promise resolves as a georaster, which
 * can be used as input in other geoblaze methods, such as identify, sum,
 * or histogram. This function essentially call's <a href="https://github.com/geotiff/georaster" target="_blank">georaster</a>'s parseGeoRaster function.
 * @name parse
 * @param {ArrayBuffer|Buffer|File|string} urlOrFile - a string representation of a url, array buffer, buffer, or file
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
export default parse;
