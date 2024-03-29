import bboxArea from "bbox-fns/bbox-area.js";
import booleanIntersects from "bbox-fns/boolean-intersects.js";
import calcAll from "bbox-fns/calc-all.js";
import dufour_peyton_intersection from "dufour-peyton-intersection";
import merge from "bbox-fns/merge.js";
import union from "bbox-fns/union.js";
import reproject from "bbox-fns/precise/reproject.js";
import { PreciseGeotransform } from "geoaffine";
import QuickPromise from "quick-promise";
import snap from "snap-bbox";
import wrapParse from "../wrap-parse";
// import writePng from "@danieljdufour/write-png";

const intersectPolygon = (georaster, geometry, perPixelFunction, { debug_level = 0, vrm = [1, 1] } = {}) => {
  const georaster_bbox = [georaster.xmin, georaster.ymin, georaster.xmax, georaster.ymax];

  const precisePixelHeight = georaster.pixelHeight.toString();
  const precisePixelWidth = georaster.pixelWidth.toString();

  if (typeof vrm === "number") vrm = [vrm, vrm]
  const [xvrm, yvrm] = vrm;
  console.log({xvrm, yvrm});

  // run intersect for each sample
  // each sample is a multi-dimensional array of numbers
  // in the following xdim format [b][r][c]
  let samples;

  if (georaster.values) {
    console.log("georaster.values:", georaster.values);
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
    let geometry_bboxes = union(calcAll(geometry));
    if (debug_level >= 2) console.log("[geoblaze] geometry_bboxes:", geometry_bboxes);

    // filter out geometry bboxes that don't intersect raster
    // assuming anti-meridian geometries have been normalized beforehand
    geometry_bboxes = geometry_bboxes.filter(bbox => booleanIntersects(bbox, georaster_bbox));
    if (debug_level >= 2) console.log("[geoblaze] intersecting geometry bboxes:", geometry_bboxes);

    // no intersecting pixels
    if (geometry_bboxes.length === 0) return;

    const geotransfrom = PreciseGeotransform([georaster.xmin.toString(), precisePixelWidth, "0", georaster.ymax.toString(), "0", "-" + precisePixelHeight]);
    if (debug_level >= 2) console.log("[geoblaze] geotransfrom:", geotransfrom);

    const combined_geometry_bbox = merge(geometry_bboxes);
    if (debug_level >= 2) console.log("[geoblaze] combined_geometry_bbox:", combined_geometry_bbox);

    const usedArea = geometry_bboxes.reduce((total, bbox) => total + bboxArea(bbox), 0);
    const totalArea = bboxArea(combined_geometry_bbox);
    const usedPercentage = usedArea / totalArea;
    if (debug_level >= 2) console.log("[geoblaze] percentage of sample area used:", usedPercentage);

    const sample_bboxes = usedPercentage > 0.01 ? [combined_geometry_bbox] : geometry_bboxes;

    const sample_image_bboxes = sample_bboxes.map(sample_bbox => {
      const [xmin, ymin, xmax, ymax] = sample_bbox;

      const snap_params = {
        bbox: [xmin.toString(), ymin.toString(), xmax.toString(), ymax.toString()],
        debug: false,
        origin: [georaster.xmin.toString(), georaster.ymax.toString()],
        overflow: false,
        padding: ["1", "1"], // add a little padding in case the geometry is smaller than half a pixel
        scale: [precisePixelWidth, "-" + precisePixelHeight],
        size: [georaster.width.toString(), georaster.height.toString()],
        precise: true
      };
      if (debug_level >= 2) console.log("[geoblaze] snapping:", snap_params);
      const snap_result = snap(snap_params);
      if (debug_level >= 2) console.log("[geoblaze] snap_result:", snap_result);

      const image_bbox = snap_result.bbox_in_grid_cells.map(n => Number(n));
      if (debug_level >= 2) console.log("[geoblaze] image_bbox:", image_bbox);

      return image_bbox;
    });

    // combine image bboxes that overlap, preventing double counting pixels
    const sample_image_bboxes_union = union(sample_image_bboxes);

    // get values for each sample area
    samples = sample_image_bboxes_union.map(sample_image_bbox => {
      const [left, bottom, right, top] = sample_image_bbox;

      const sample_height = bottom - top;
      const sample_width = right - left;

      const getValuesPromise = georaster.getValues({
        left,
        bottom,
        right,
        top,
        width: sample_width,
        height: sample_height,
        resampleMethod: "near"
      });

      // compute bbox in srs from bbox in pixel coordinates
      const precise_sample_bbox = reproject(sample_image_bbox, geotransfrom.forward, { async: false, density: 0 });

      const sample_bbox = precise_sample_bbox.map(str => Number(str));

      console.log({vrm});
      console.log(JSON.stringify(geometry));
      const intersect_params = {
        debug: true,
        raster_bbox: sample_bbox,
        raster_height: sample_height * yvrm,
        raster_width: sample_width * xvrm,
        pixel_height: georaster.pixelHeight / yvrm,
        pixel_width: georaster.pixelWidth / xvrm,
        geometry
      };
      console.log("intersect_params:", intersect_params);

      const intersections = dufour_peyton_intersection.calculate(intersect_params);
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
                const row = band[Math.floor(irow / yvrm)];
                if (row) {
                  const value = row[Math.floor(icol / xvrm)];
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
