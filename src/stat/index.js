/**
 * The stat function takes a georaster and an optional geometry.
 * It then uses the <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a> library
 * to calculate statistics for each band.
 * @name stat
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {String} stat - name of statistic according to <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a>
 * @returns {Object} array of stat for each band
 * @example
 await geoblaze.stat("https://example.org/rgb.tif", geometry, "median");
 [22, 32, 34]
 */
export { default } from "./stat.module";
