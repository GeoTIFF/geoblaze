/**
 * @prettier
 */
import parse from "./parse.module";

/**
 * The parse function takes a url to a geotiff or geotiff file as an input
 * and returns a promise. The promise resolves as a georaster, which
 * can be used as input in other geoblaze methods, such as identify, sum,
 * or histogram.
 * @name parse
 * @param {Object|string} urlOrFile - a string representation of a url or a geotiff file
 * @example
 * const georaster = await geoblaze.parse(urlOrFile);
 * const sums = sum(georaster, geometry);
 */
export default parse;
