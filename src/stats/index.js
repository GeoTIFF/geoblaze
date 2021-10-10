/**
 * The stats function takes a georaster and an optional geometry.
 * It then uses the <a href="https://github.com/DanielJDufour/calc-stats" target="_blank">calc-stats</a> library
 * to calculate statistics for each band.
 * @name stats
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @returns {Object} array of stats for each band
 * @example
 const stats = await geoblaze.stats("https://example.org/imagery.tif", geometry);
 [{ median: 906.7, min: 0, max: 5166.7, sum: 262516.5, mean: 1232.4718309859154, modes: [0], mode: 0, histogram: { 0: 12, 1: 74, 2: 573, ... } }]
 */
export { default } from "./stats.module";
