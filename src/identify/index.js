import identify from "./identify.module";

/**
  Given a raster and a point geometry,
  the identify function returns the pixel
  value of the raster at the given point.

  @name identify
  @param {(GeoRaster|string)} georaster - a georaster or a url to a georaster (e.g. geotiff)
  @param {string|object|Point} geometry - geometry can be an [x,y] array, a GeoJSON point object, or a string representation of a GeoJSON point object.

  @example
  // based on https://observablehq.com/@danieljdufour/identify-single-pixel-value-in-geotiff
  const url = "https://s3.amazonaws.com/geoblaze/wildfires.tiff";

  // point as [longitude, latitude]
  const cityOfRedding = [-122.366667, 40.583333];

  const results = await geoblaze.identify(url, cityOfRedding);

  // results are [red, green, blue]
  [76, 76, 68]
*/
export default identify;
