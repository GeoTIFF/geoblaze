'use strict';

let load = require('../load/load');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');

module.exports = (georaster, geom, flat) => {

  let crop_top; let crop_left; let crop_right; let crop_bottom;

  if (geom === null || geom === undefined) {

    try {

      if (flat) {

        crop_bottom = georaster.height;
        crop_left = 0;
        crop_right = georaster.width;
        crop_top = 0;

      } else {

        return georaster.values;

      }

    } catch (error) {

      console.error(error);
      throw error;

    }

  } else if (utils.is_bbox(geom)) { // bounding box

    try {


      // convert geometry
      let geometry = convert_geometry('bbox', geom);

      // use a utility function that converts from the lat/long coordinate
      // space to the image coordinate space
      // // left, top, right, bottom
      let bbox = utils.convert_crs_bbox_to_image_bbox(georaster, geometry);
      let bbox_left = bbox.xmin;
      let bbox_top = bbox.ymin;
      let bbox_right = bbox.xmax;
      let bbox_bottom = bbox.ymax;

      crop_top = Math.max(bbox_top, 0)
      crop_left = Math.max(bbox_left, 0);
      crop_right = Math.min(bbox_right, georaster.width);
      crop_bottom = Math.min(bbox_bottom, georaster.height)

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
        for (let row_index = crop_top; row_index < crop_bottom; row_index++) {
           values = values.concat(Array.prototype.slice.call(band[row_index].slice(crop_left, crop_right)));
        }
        return values;
      });
    } else {
      return georaster.values.map(band => {
        let table = [];
        for (let row_index = crop_top; row_index < crop_bottom; row_index++) {
          table.push(band[row_index].slice(crop_left, crop_right));
        }
        return table;
      });
    }
  } catch (e) {
    throw e;
  }
}
