import histogram from "./histogram.module";

/**
 * The histogram function takes a georaster as an input and an optional geometry.
 * If a geometry is included, the function returns the histogram of all the pixels
 * in that area. If no geometry is included, the function returns the histogram of
 * all the pixels for each band in the georaster.
 * @name histogram
 * @param {(GeoRaster|string)} georaster - a georaster or a url to a georaster (e.g. geotiff)
 * @param {Object} [input=undefined] a geometry, which we'll use for clipping result
 * @param {Object} options
 * @param {("nominal" | "ratio")} options.scaleType - measurement scale
 * @param {Number} options.numClasses - number of classes/bins, only available for ratio data
 * @param {("equal-interval" | "quantile")} options.classType - method of breaking data into classes, only available for ratio data
 * @returns {Object} array of histograms for each band
 * @example
 * // naip.tif has 4-bands: red, green, blue and near-infrared
 * const url = "https://example.org/naif.tif";
 *
 * // calculate the raw histogram pixel values
 * const histograms = await geoblaze.histogram(url, geometry, { scaleType: "nominal" });
 *
 * // break histograms into 10 bins for each band
 * const histograms = await geoblaze.histogram(url, geometry, { scaleType: "ratio", numClasses: 10, classType: "equal-interval" });
 */
export default histogram;
