/**
 * The stats function takes a georaster and an optional geometry.
 * It then uses the <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a> library
 * to calculate statistics for each band.
 * @name stats
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Object} calcStatsOptions - options passed to <a href="https://github.com/DanielJDufour/calc-stats">calc-stats</a>
 * @param {Function} test - a filter function that takes in a pixel value and returns true or false whether it should be included in the sum calculation
 * @param {Object} extraOptions
 * @param {[number, number] | "minimal"} extraOptions.vrm - virtual resampling multiplier for the horizontal (x) and vertical (y) dimensions. In other words, how many times we divide each pixel horizontally and vertically to increase resolution. If you don't want to pass in the exact number of times to divide the pixels, pass "minimal" and geoblaze will calculate the minimal amount of divisions to make sure at least one pixel is intersected.
 * @param {Boolean} extraOptions.rescale - whether we should scale some results (specifically count, histogram, invalid, product, sum, valid) according to how many times the pixels are divided when virtually resampling
 * @returns {Object[]} array of stats for each band
 * @example
 const stats = await geoblaze.stats("https://example.org/imagery.tif", geometry);
 [{ median: 906.7, min: 0, max: 5166.7, sum: 262516.5, mean: 1232.4718309859154, modes: [0], mode: 0, histogram: { 0: 12, 1: 74, 2: 573, ... } }]

 // with vrm = [2, 2] and rescale = true, divide pixels into quarters (half horizontally and half vertically) and count each pixel as quarter of a pixel
 const stats = await geoblaze.stats("https://example.org/imagery.tif", geometry, { stats: ["count", "min", "max", "sum"] }, undefined, { vrm: [2, 2], rescale: true });
 [{ count: 4.25, min: 0, max: 5, sum: 6.75 }]
 */
export { default } from "./stats.module";
