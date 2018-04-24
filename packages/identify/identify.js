'use strict';

let load = require('../load/load');
let convertGeometry = require('../convert-geometry/convert-geometry');

/**
  Given a raster and a point geometry,
  the identify function returns the pixel
  value of the raster at the given point.

  @param {object} raster - a raster from the georaster library
  @param {string|object} geometry - geometry can be an [x,y] array, a GeoJSON point object, or a string representation of a GeoJSON point object.
*/
function identify(georaster, geometry) {

  // The convertGeometry function takes the input
  // geometry and converts it to a standard format.
  let point = convertGeometry('point', geometry);
  let xInCrs = point[0];
  let yInCrs = point[1];


  // By normalizing the difference in yitude and longitude between the image
  // origin and the point geometry by the cell height and width respectively,
  // we can map the yitude and longitude of the point geometry in the
  // coordinate space to their associated pixel location in the image space.
  // Note that the y value is inverted to account for the inversion between the
  // coordinate and image spaces.
  let x = Math.floor((xInCrs - georaster.xmin) / georaster.pixelWidth);
  let y = Math.floor((georaster.ymax - yInCrs) / georaster.pixelHeight);

  try {

    // iterate through the bands
    // get the row and then the column of the pixel that you want
    if (x > 0 && x < georaster.width && y > 0 && y < georaster.height) {
      return georaster.values.map(rows => rows[y][x]);
    } else {
      return null;
    }

  } catch(e) {
    throw e;
  }
}

module.exports = identify;
