import utils from "../utils";
import { convertBbox } from "../convert-geometry";
import wrap from "../wrap-parse";

const get = (georaster, geom, flat) => {
  if (!georaster) throw new Error("[georaster] can't get values without a georaster!");
  let cropTop;
  let cropLeft;
  let cropRight;
  let cropBottom;
  if (geom === null || geom === undefined) {
    try {
      if (flat) {
        cropBottom = georaster.height;
        cropLeft = 0;
        cropRight = georaster.width;
        cropTop = 0;
      } else {
        return (
          georaster.values ||
          georaster.getValues({ height: georaster.height, left: 0, right: georaster.width, bottom: georaster.height, top: 0, width: georaster.width })
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (utils.isBbox(geom)) {
    // bounding box
    try {
      const geometry = convertBbox(geom);

      // use a utility function that converts from the lat/long coordinate
      // space to the image coordinate space
      const bbox = utils.convertCrsBboxToImageBbox(georaster, geometry);

      cropTop = Math.max(bbox.ymin, 0);
      cropLeft = Math.max(bbox.xmin, 0);
      cropRight = Math.min(bbox.xmax, georaster.width);
      cropBottom = Math.min(bbox.ymax, georaster.height);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (["bottom", "left", "right", "top"].every(k => k in geom)) {
    ({ bottom: cropBottom, left: cropLeft, right: cropRight, top: cropTop } = geom);
  } else {
    console.error(geom);
    throw "Geometry is not a bounding box - please make sure to send a bounding box when using geoblaze.get";
  }

  try {
    if (flat) {
      if (georaster.values) {
        return georaster.values.map(band => {
          let values = [];
          for (let rowIndex = cropTop; rowIndex < cropBottom; rowIndex++) {
            values = values.concat(Array.prototype.slice.call(band[rowIndex].slice(cropLeft, cropRight)));
          }
          return values;
        });
      } else {
        return georaster
          .getValues({
            height: cropBottom - cropTop,
            width: cropRight - cropLeft,
            left: cropLeft,
            top: cropTop,
            right: cropRight,
            bottom: cropBottom
          })
          .then(bands => {
            return bands.map(rows => {
              return rows.reduce((acc, row) => acc.concat(Array.from(row)), []);
            });
          });
      }
    } else {
      if (georaster.values) {
        return georaster.values.map(band => {
          const table = [];
          for (let rowIndex = cropTop; rowIndex < cropBottom; rowIndex++) {
            table.push(band[rowIndex].slice(cropLeft, cropRight));
          }
          return table;
        });
      } else {
        return georaster.getValues({
          height: cropBottom - cropTop,
          width: cropRight - cropLeft,
          left: cropLeft,
          top: cropTop,
          right: cropRight,
          bottom: cropBottom
        });
      }
    }
  } catch (e) {
    console.error("[geoblaze] error in get.module.js");
    throw e;
  }
};

export default wrap(get);
