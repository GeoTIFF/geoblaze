'use strict';

let load = require('../load/load');
let utils = require('../utils/utils');
let convertGeometry = require('../convert-geometry/convert-geometry');

/**
 * The get function takes a raster and a bounding box as input. It returns
 * the subset of pixels in the raster found within the bounding box. It also
 * takes an optional parameter "flat" which will flatten the returning pixel
 * matrix across bands instead of retaining a nested array structure.
 * @name get
 * @param {Object} raster - a raster from the georaster library
 * @param {Object} boundingBox - can be an [xmin, ymin, xmax, ymax] array, a [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] GeoJSON polygon object, or a string representation of a GeoJSON polygon object.
 * @param {Boolean} flat - whether or not the resulting output should be flattened into a single array
 * @returns {Object} array of pixel values
 * @example
 * const pixels = geoblaze.get(georaster, geometry);
 */
function get(georaster, geom, flat) {

  let cropTop; let cropLeft; let cropRight; let cropBottom;

  if (geom === null || geom === undefined) {

    try {

      if (flat) {

        cropBottom = georaster.height;
        cropLeft = 0;
        cropRight = georaster.width;
        cropTop = 0;

      } else {

        return georaster.values;

      }

    } catch (error) {

      console.error(error);
      throw error;

    }

  } else if (utils.isBbox(geom)) { // bounding box

    try {


      // convert geometry
      let geometry = convertGeometry('bbox', geom);

      // use a utility function that converts from the lat/long coordinate
      // space to the image coordinate space
      // // left, top, right, bottom
      let bbox = utils.convertCrsBboxToImageBbox(georaster, geometry);
      let bboxLeft = bbox.xmin;
      let bboxTop = bbox.ymin;
      let bboxRight = bbox.xmax;
      let bboxBottom = bbox.ymax;

      cropTop = Math.max(bboxTop, 0)
      cropLeft = Math.max(bboxLeft, 0);
      cropRight = Math.min(bboxRight, georaster.width);
      cropBottom = Math.min(bboxBottom, georaster.height)

    } catch (error) {

      console.error(error);
      throw error;

    }

  } else {

    throw 'Geometry is not a bounding box - please make sure to send a bounding box when using geoblaze.get';

  }

  try {

     if (flat) {
      return georaster.values.map(band => {
        let values = [];
        for (let rowIndex = cropTop; rowIndex < cropBottom; rowIndex++) {
           values = values.concat(Array.prototype.slice.call(band[rowIndex].slice(cropLeft, cropRight)));
        }
        return values;
      });
    } else {
      return georaster.values.map(band => {
        let table = [];
        for (let rowIndex = cropTop; rowIndex < cropBottom; rowIndex++) {
          table.push(band[rowIndex].slice(cropLeft, cropRight));
        }
        return table;
      });
    }
  } catch (e) {
    throw e;
  }
}

module.exports = get;
