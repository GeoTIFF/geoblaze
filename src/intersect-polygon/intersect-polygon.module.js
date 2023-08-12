import booleanIntersects from "bbox-fns/boolean-intersects.js";
import calcBoundingBox from "bbox-fns/calc.js";
import dufour_peyton_intersection from "dufour-peyton-intersection";
import snap from "snap-bbox";
import wrapParse from "../wrap-parse";
import utils from "../utils";
// import writePng from "@danieljdufour/write-png";

const { resolve } = utils;

const intersectPolygon = (georaster, geometry, perPixelFunction) => {
  const { noDataValue } = georaster;

  const georaster_bbox = [georaster.xmin, georaster.ymin, georaster.xmax, georaster.ymax];

  const precisePixelHeight = georaster.pixelHeight.toString();
  const precisePixelWidth = georaster.pixelWidth.toString();

  let sample;
  let sample_height;
  let sample_width;
  let intersections;

  if (georaster.values) {
    // if we have already loaded all the values into memory,
    // just pass those along and avoid using up more memory
    sample = georaster.values;
    sample_height = georaster.height;
    sample_width = georaster.width;

    // intersections are calculated in time mostly relative to geometry,
    // so using the whole georaster bbox, shouldn't significantly more operations
    intersections = dufour_peyton_intersection.calculate({
      debug: false,
      raster_bbox: georaster_bbox,
      raster_height: georaster.height,
      raster_width: georaster.width,
      pixel_height: georaster.pixelHeight,
      pixel_width: georaster.pixelWidth,
      geometry
    });
  } else if (georaster.getValues) {
    const geometry_bbox = calcBoundingBox(geometry);

    if (!booleanIntersects(geometry_bbox, georaster_bbox)) return;

    const [xmin, ymin, xmax, ymax] = geometry_bbox;

    // snap geometry bounding box to georaster grid system
    const snapResult = snap({
      bbox: [xmin.toString(), ymin.toString(), xmax.toString(), ymax.toString()],
      debug: false,
      origin: [georaster.xmin.toString(), georaster.ymax.toString()],
      overflow: false,
      scale: [precisePixelWidth, "-" + precisePixelHeight],
      size: [georaster.width.toString(), georaster.height.toString()],
      precise: true
    });

    const preciseSampleBox = snapResult.bbox_in_coordinate_system;
    const sample_bbox = preciseSampleBox.map(str => Number(str));

    const [left, bottom, right, top] = snapResult.bbox_in_grid_cells.map(n => Number(n));

    sample_height = bottom - top;
    sample_width = right - left;

    sample = georaster.getValues({
      left,
      bottom,
      right,
      top,
      width: sample_width,
      height: sample_height,
      resampleMethod: "near"
    });

    intersections = dufour_peyton_intersection.calculate({
      debug: false,
      raster_bbox: sample_bbox,
      raster_height: sample_height,
      raster_width: sample_width,
      pixel_height: georaster.pixelHeight,
      pixel_width: georaster.pixelWidth,
      geometry
    });
  }

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
