/**
 * @prettier
 */
import stats from "./stats.module";

/**
 * The stats function takes a raster as an input and an optional geometry.
 * It then uses the https://github.com/DanielJDufour/calc-stats library
 * to calculate statistics for each band.
 * @name mode
 * @param {Object} georaster - a georaster from the georaster library
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of stats for each band
 * @example
 * const stats = await geoblaze.stats(georaster, geometry);
 */
export default stats;
