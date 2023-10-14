import bboxArea from "bbox-fns/bbox-area.js";
import booleanIntersects from "bbox-fns/boolean-intersects.js";
import calcAll from "bbox-fns/calc-all.js";
import dufour_peyton_intersection from "dufour-peyton-intersection";
import merge from "bbox-fns/merge.js";
import QuickPromise from "quick-promise";
import snap from "snap-bbox";
import wrapParse from "../wrap-parse";
// import writePng from "@danieljdufour/write-png";

const intersectPolygon = (georaster, geometry, perPixelFunction, { debug_level = 0 } = {}) => {
  const georaster_bbox = [georaster.xmin, georaster.ymin, georaster.xmax, georaster.ymax];

  const precisePixelHeight = georaster.pixelHeight.toString();
  const precisePixelWidth = georaster.pixelWidth.toString();

  // run intersect for each sample
  // each sample is a multi-dimensional array of numbers
  // in the following xdim format [b][r][c]
  let samples;

  if (georaster.values) {
    // if we have already loaded all the values into memory,
    // just pass those along and avoid using up more memory
    const sample = georaster.values;

    // intersections are calculated in time mostly relative to geometry,
    // so using the whole georaster bbox, shouldn't significantly more operations
    const intersections = dufour_peyton_intersection.calculate({
      debug: false,
      raster_bbox: georaster_bbox,
      raster_height: georaster.height,
      raster_width: georaster.width,
      pixel_height: georaster.pixelHeight,
      pixel_width: georaster.pixelWidth,
      geometry
    });

    samples = [{ intersections, sample, offset: [0, 0] }];
  } else if (georaster.getValues) {
    const geometry_bboxes = calcAll(geometry);
    if (debug_level >= 2) console.log("[geoblaze] geometry_bboxes:", geometry_bboxes);

    if (!geometry_bboxes.some(bbox => booleanIntersects(bbox, georaster_bbox))) return;

    const combined_geometry_bbox = merge(geometry_bboxes);
    if (debug_level >= 2) console.log("[geoblaze] combined_geometry_bbox:", combined_geometry_bbox);

    const usedArea = geometry_bboxes.reduce((total, bbox) => total + bboxArea(bbox), 0);
    const totalArea = bboxArea(combined_geometry_bbox);
    const usedPercentage = usedArea / totalArea;
    if (debug_level >= 2) console.log("[geoblaze] percentage of sample area used:", usedPercentage);

    const sample_bboxes = usedPercentage > 0.01 ? [combined_geometry_bbox] : geometry_bboxes;

    // get samples for each geometry bbox
    samples = sample_bboxes.map(sample_bbox => {
      const [xmin, ymin, xmax, ymax] = sample_bbox;

      // snap whole geometry bounding box to georaster grid system
      const snapResult = snap({
        bbox: [xmin.toString(), ymin.toString(), xmax.toString(), ymax.toString()],
        debug: false,
        origin: [georaster.xmin.toString(), georaster.ymax.toString()],
        overflow: false,
        scale: [precisePixelWidth, "-" + precisePixelHeight],
        size: [georaster.width.toString(), georaster.height.toString()],
        precise: true
      });
      if (debug_level >= 2) console.log("[geoblaze] snapResult:", snapResult);
      const snapped_bbox = snapResult.bbox_in_coordinate_system.map(n => Number(n));

      const image_bbox = snapResult.bbox_in_grid_cells.map(n => Number(n));
      if (debug_level >= 2) console.log("[geoblaze] image_bbox:", image_bbox);
      const [left, bottom, right, top] = image_bbox;

      const snapped_height = bottom - top;
      const snapped_width = right - left;

      const getValuesPromise = georaster.getValues({
        left,
        bottom,
        right,
        top,
        width: snapped_width,
        height: snapped_height,
        resampleMethod: "near"
      });

      const intersections = dufour_peyton_intersection.calculate({
        debug: false,
        raster_bbox: snapped_bbox,
        raster_height: snapped_height,
        raster_width: snapped_width,
        pixel_height: georaster.pixelHeight,
        pixel_width: georaster.pixelWidth,
        geometry
      });
      if (debug_level >= 3) console.log("[geoblaze] intersections:", JSON.stringify(intersections, undefined, 2));

      return QuickPromise.resolve(getValuesPromise).then(sample => {
        if (debug_level >= 3) console.log("[geoblaze] got sample:", sample);
        return {
          intersections,
          sample,
          offset: [left, top]
        };
      });
    });
  }
  if (debug_level >= 3) console.log("[geoblaze] samples:", samples);

  return QuickPromise.all(samples).then(resolved_samples => {
    resolved_samples.forEach(sample => {
      QuickPromise.resolve(sample).then(({ intersections, sample: imageBands, offset: [xoff, yoff] }) => {
        intersections.rows.forEach((row, irow) => {
          row.forEach(([start, end], irange) => {
            for (let icol = start; icol <= end; icol++) {
              imageBands.forEach((band, iband) => {
                const row = band[irow];
                if (row) {
                  const value = row[icol];
                  perPixelFunction(value, iband, yoff + irow, xoff + icol);
                }
              });
            }
          });
        });
      });
    });
  });
};

export default wrapParse(intersectPolygon);
