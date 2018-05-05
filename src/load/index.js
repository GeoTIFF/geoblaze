import load from './load.module';

/**
 * The load function takes a url to a geotiff or geotiff file as an input
 * and returns a promise. The promise resolves as a georaster, which
 * can be used as input in other geoblaze methods, such as identify, sum,
 * or histogram.
 * @name load
 * @param {Object|string} urlOrFile - a string representation of a url or a geotiff file
 * @example
 * const sums = geoblaze.load(urlOrFile).then(georaster => sum(georaster, geometry));
 */
export default load;
