import stat from "../stat";

/**
 * The sum function takes a georaster and an optional geometry.
 * If a geometry is included, the function returns the sum of all the pixels
 * in that area. If no geometry is included, the function returns the sum of
 * all the pixels for each band in the georaster.
 * @name sum
 * @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
 * @param {Object} geometry - geometry can be an [xmin, ymin, xmax, ymax] array for a bounding box, [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] for a polygon, a GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Function} test - a filter function that takes in a pixel value and returns true or false whether it should be included in the sum calculation
 * @param {Object} extraOptions
 * @param {[number, number] | "minimal"} extraOptions.vrm - virtual resampling multiplier for the horizontal (x) and vertical (y) dimensions. In other words, how many times we divide each pixel horizontally and vertically to increase resolution. If you don't want to pass in the exact number of times to divide the pixels, pass "minimal" and geoblaze will calculate the minimal amount of divisions to make sure at least one pixel is intersected.
 * @param {Boolean} extraOptions.rescale - whether we should rescale results based on virtual pixel size. It is highly recommended you set rescale to true if you set vrm.
 * @returns {Number[]} array of sums for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared (nir)
 * const url = "https://example.org/naif.tif";
 *
 * const results = await geoblaze.sum(url, geometry);
 * // results is [red, green, blue, nir]
 * [217461, 21375, 57312, 457125]
 *
 * // elevation.tif has one band with pixel values representing altitude
 * const elevation_url = "https://example.org/elevation.tif";
 *
 * const results = await geoblaze.sum(elevation_url, geometry, value => value >= 0);
 * // results is sum of all interesecting pixels at or above sea level
 * [2131]
 *
 * const population_url = "https://example.org/population.tif";
 * const results = await geoblaze.sum(population_url, geometry, undefined, { vrm: [100, 100], rescale: true });
 * // results is the estimated number of people living within a geometry after resampling pixels (dividing 100 times horizontally then vertically)
 * [3154.25425]
 */
export default function sum(georaster, geometry, test, { rescale, vrm } = {}) {
  return stat(georaster, geometry, "sum", test, { rescale, vrm });
}
