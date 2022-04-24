import dufour_peyton_intersection from "dufour-peyton-intersection";
import snap from "snap-bbox";
import divide from "preciso/divide.js";
import subtract from "preciso/subtract.js";
import get from "../get";
import wrapParse from "../wrap-parse";
import utils from "../utils";

const { resolve } = utils;

const intersectPolygon = (georaster, geometry, perPixelFunction) => {
  const { noDataValue, pixelHeight, pixelWidth } = georaster;

  const geomBoundingBox = utils.getBoundingBox(geometry);

  const precisePixelHeight = pixelHeight.toString();
  const precisePixelWidth = pixelWidth.toString();

  // snap geometry bounding box to georaster grid system
  const snapResult = snap({
    bbox: [geomBoundingBox.xmin.toString(), geomBoundingBox.ymin.toString(), geomBoundingBox.xmax.toString(), geomBoundingBox.ymax.toString()],
    origin: [georaster.xmin.toString(), georaster.ymax.toString()],
    scale: [precisePixelWidth, "-" + precisePixelHeight],
    precise: true
  });

  const preciseSampleBox = snapResult.bbox_in_coordinate_system;
  const sampleBox = preciseSampleBox.map(str => Number(str));

  const sample = get(georaster, preciseSampleBox);

  const preciseSampleHeightInPixels = divide(subtract(preciseSampleBox[3], preciseSampleBox[1]), precisePixelHeight);
  const preciseSampleWidthInPixels = divide(subtract(preciseSampleBox[2], preciseSampleBox[0]), precisePixelWidth);

  // should not need Math.round because preciso is super precise
  // but we leave it in just in case
  const sampleHeightInPixels = Math.round(Number(preciseSampleHeightInPixels));
  const sampleWidthInPixels = Math.round(Number(preciseSampleWidthInPixels));

  const intersections = dufour_peyton_intersection.calculate({
    debug: false,
    raster_bbox: sampleBox,
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
