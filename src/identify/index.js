/**
  Given a raster and a point geometry, the identify function returns the pixel
  value of the raster at the given point.  The raster and point must share the same 
  <a href="https://en.wikipedia.org/wiki/Spatial_reference_system">Spatial Reference System</a>.
  @name identify
  @param {GeoRaster|ArrayBuffer|Blob|Buffer|File|String} georaster - geospatial gridded raster data
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
export { default } from "./identify.module";
