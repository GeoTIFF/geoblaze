import identify from './identify.module';

/**
  Given a raster and a point geometry,
  the identify function returns the pixel
  value of the raster at the given point.

  @name identify
  @param {object} raster - a raster from the georaster library
  @param {string|object} geometry - geometry can be an [x,y] array, a GeoJSON point object, or a string representation of a GeoJSON point object.
*/
export default identify;
