import utils from '../utils';
import convertGeometry from '../convert-geometry';

const get = (georaster, geom, flat) => {
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
      const geometry = convertGeometry('bbox', geom);

      // use a utility function that converts from the lat/long coordinate
      // space to the image coordinate space
      // // left, top, right, bottom
      const bbox = utils.convertCrsBboxToImageBbox(georaster, geometry);
      const bboxLeft = bbox.xmin;
      const bboxTop = bbox.ymin;
      const bboxRight = bbox.xmax;
      const bboxBottom = bbox.ymax;

      cropTop = Math.max(bboxTop, 0);
      cropLeft = Math.max(bboxLeft, 0);
      cropRight = Math.min(bboxRight, georaster.width);
      cropBottom = Math.min(bboxBottom, georaster.height);
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
        const table = [];
        for (let rowIndex = cropTop; rowIndex < cropBottom; rowIndex++) {
          table.push(band[rowIndex].slice(cropLeft, cropRight));
        }
        return table;
      });
    }
  } catch (e) {
    throw e;
  }
};

export default get;
