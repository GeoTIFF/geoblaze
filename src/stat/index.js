/**
 * The stat function takes a georaster and an optional geometry.
 * It then uses the <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a> library
 * to calculate statistics for each band.
 * @name stat
 * @private
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {String} stat - name of statistic according to <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a>
 * @param {Function} test - a filter function that takes in a pixel value and returns true or false whether it should be included in the sum calculation
 * @param {Object} options
 * @param {[number, number] | "minimal"} options.vrm - virtual resampling multiplier for the horizontal (x) and vertical (y) dimensions. In other words, how many times we divide each pixel horizontally and vertically to increase resolution. If you don't want to pass in the exact number of times to divide the pixels, pass "minimal" and geoblaze will calculate the minimal amount of divisions to make sure at least one pixel is intersected.
 * @param {Boolean} options.rescale - whether we should scale area based results according to how many times the pixels are divided when virtually resampling
 * @returns {Object[]} array of stat for each band
 * @example
 await geoblaze.stat("https://example.org/rgb.tif", geometry, "median");
 [22, 32, 34]

 // calculate mean after dividing each pixel into 100 smaller pixels (10 cuts horizontally and 10 cuts vertically)
 await geoblaze.stat("https://example.org/rgb.tif", geometry, "mean", undefined, { vrm: [10, 10] });
 [22.2, 32.4, 34.5]
 */
export { default } from "./stat.module";
