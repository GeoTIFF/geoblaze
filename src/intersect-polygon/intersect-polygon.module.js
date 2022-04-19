import dufour_peyton_intersection from "dufour-peyton-intersection";
import snap from "snap-bbox";
import get from "../get";
import wrapParse from "../wrap-parse";
import utils from "../utils";

const { resolve } = utils;

const intersectPolygon = (georaster, geometry, perPixelFunction) => {
  const { noDataValue, pixelHeight, pixelWidth } = georaster;

  const geomBoundingBox = utils.getBoundingBox(geometry);

  // snap geometry bounding box to georaster grid system
  const snapResult = snap({
    bbox: [geomBoundingBox.xmin, geomBoundingBox.ymin, geomBoundingBox.xmax, geomBoundingBox.ymax],
    origin: [georaster.xmin, georaster.ymax],
    scale: [pixelWidth, -1 * pixelHeight]
  });

  const { bbox_in_coordinate_system: valueBoundingBox } = snapResult;

  const sample = get(georaster, valueBoundingBox);

  // to-do: use preciso
  const sampleHeightInPixels = Math.round((valueBoundingBox[3] - valueBoundingBox[1]) / pixelHeight);
  const sampleWidthInPixels = Math.round((valueBoundingBox[2] - valueBoundingBox[0])/ pixelWidth);

  const intersections = dufour_peyton_intersection.calculate({
    debug: false,
    raster_bbox: valueBoundingBox,
    raster_height: sampleHeightInPixels,
    raster_width: sampleWidthInPixels,
    pixel_height: pixelHeight,
    pixel_width: pixelWidth,
    geometry
  });

  
  return resolve(sample).then(imageBands => {
    intersections.rows.forEach((row, irow) => {
      row.forEach(([start, end], irange) => {
        for (let icol = start; icol <= end; icol++) {
          imageBands.forEach((band, iband) => {
            const row = band[irow];
            if (row) {
              const value = row[icol];
              if (value != undefined && value !== noDataValue) {
                perPixelFunction(value, iband, irow, icol);
              }  
            }
          });
        }
      });
    });
  });
};

export default wrapParse(intersectPolygon);
