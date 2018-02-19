'use strict';

const turf_featureCollection = require("@turf/helpers").featureCollection;
const turf_lineString = require("@turf/helpers").lineString;
//const fs = require("fs");

const _ = require('underscore');

const get = require('../get/get');
const utils = require('../utils/utils');
const categorize_intersection = utils.categorize_intersection;
const cluster_line_segments = utils.cluster_line_segments;
const couple = utils.couple;
const force_within = utils.force_within;
const merge_ranges = utils.merge_ranges;

const get_line_from_points = utils.get_line_from_points;
const get_intersection_of_two_lines = utils.get_intersection_of_two_lines;
const get_slope_of_line = utils.get_slope_of_line;
const get_slope_of_line_segment = utils.get_slope_of_line_segment;

const logger = require('../../logger');

const get_edges_for_polygon = polygon => {
  let edges = [];
  polygon.forEach(ring => {
    for (let i = 1; i < ring.length; i++) {
      let start_point = ring[i - 1];
      let end_point = ring[i];
      edges.push([start_point, end_point]);
    }
  });
  return edges;
};

module.exports = (georaster, geom, run_this_function_on_each_pixel_inside_geometry) => {

  let cell_width = georaster.pixelWidth;
  let cell_height = georaster.pixelHeight;
  logger.debug("cell_height:", cell_height);

  let no_data_value = georaster.no_data_value;
  let image_height = georaster.height;
  logger.debug("image_height: " + image_height);

  let image_width = georaster.width;

  // get values in a bounding box around the geometry
  let latlng_bbox = utils.get_bounding_box(geom);
  logger.debug("latlng_bbox:", latlng_bbox);

  let image_bands = get(georaster, latlng_bbox)

  // set origin points of bbox of geometry in image space
  let lat_0 = latlng_bbox.ymax + ((georaster.ymax - latlng_bbox.ymax) % cell_height);
  logger.debug("lat_0:", lat_0);
  let lng_0 = latlng_bbox.xmin - ((latlng_bbox.xmin - georaster.xmin) % cell_width);
  logger.debug("lng_0:", lng_0);

  // calculate size of bbox in image coordinates
  // to derive out the row length
  let image_bbox = utils.convert_crs_bbox_to_image_bbox(georaster, latlng_bbox);
  logger.debug("image_bbox:", image_bbox);

  let x_min = image_bbox.xmin,
    y_min = image_bbox.ymin,
    x_max = image_bbox.xmax,
    y_max = image_bbox.ymax;

  let row_length = x_max - x_min;
  logger.debug("row_length:", row_length);

  // iterate through image rows and convert each one to a line
  // running through the middle of the row
  let image_lines = [];
  let num_rows = image_bands[0].length;

  if (num_rows === 0) return;

  logger.debug("num_rows:", num_rows);
  for (let y = 0; y < num_rows; y++) {

    let lat = lat_0 - cell_height * y - cell_height / 2;

    // use that point, plus another point along the same latitude to
    // create a line
    let point_0 = [lng_0, lat];
    let point_1 = [lng_0 + 1, lat];
    let line = get_line_from_points(point_0, point_1);
    image_lines.push(line);
  }
  logger.debug("image_lines.length:", image_lines.length);
  logger.debug("image_lines[0]:", image_lines[0]);


  // collapse geometry down to a list of edges
  // necessary for multi-part geometries
  let depth = utils.get_depth(geom);
  logger.debug("depth:", depth);
  let polygon_edges = depth === 4  ? geom.map(get_edges_for_polygon) : [get_edges_for_polygon(geom)];
  logger.debug("polygon_edges.length:", polygon_edges.length);

  polygon_edges.forEach((edges, edges_index) => {

    logger.debug(() => {
      console.log("edges.length", edges.length);
      let target = 41.76184321688703;
      let overlaps = [];
      edges.forEach((edge, index) => {
        let [[x1,y1], [x2,y2]] = edge;
        let ymin = Math.min(y1, y2);
        let ymax = Math.max(y1, y2);
        if (target >= ymin && target <= ymax) {
          overlaps.push(JSON.stringify({ index, edge}));
        }
      });
      console.log("overlaps:", overlaps);
    });

    // iterate through the list of polygon vertices, convert them to
    // lines, and compute the intersections with each image row
    let intersections_by_row = _.range(num_rows).map(row => []);
    logger.debug("intersections_by_row.length:", intersections_by_row.length);
    let number_of_edges = edges.length;
    logger.debug("number_of_edges:", number_of_edges);
    for (let i = 0; i < number_of_edges; i++) {


      // get vertices that make up an edge and convert that to a line
      let edge = edges[i];

      let [start_point, end_point] = edge;
      let [ x1, y1 ] = start_point;
      let [ x2, y2 ] = end_point;

      let direction = Math.sign(y2 - y1);
      let horizontal = y1 === y2;
      let vertical = x1 === x2;

      let edge_y = y1;

      let edge_line = get_line_from_points(start_point, end_point);

      let edge_ymin = Math.min(y1, y2);
      let edge_ymax = Math.max(y1, y2);

      logger.debug("\nedge", i, ":", edge);
      logger.debug("direction:", direction);
      logger.debug("horizontal:", horizontal);
      logger.debug("vertical:", vertical);
      logger.debug("edge_ymin:", edge_ymin);
      logger.debug("edge_ymax:", edge_ymax);

      let start_lng, start_lat, end_lat, end_lng;
      if (x1 < x2) {
        [ start_lng, start_lat ] = start_point;
        [ end_lng, end_lat ] = end_point;
      } else {
        [ start_lng, start_lat ] = end_point;
        [ end_lng, end_lat ]  = start_point;
      }


      if (start_lng === undefined) throw Error("start_lng is " + start_lng);

      // find the y values in the image coordinate space
      let y_1 = Math.round((lat_0 - .5*cell_height - start_lat ) / cell_height);
      let y_2 = Math.round((lat_0 - .5*cell_height - end_lat) / cell_height);

      // make sure to set the start and end points so that we are
      // incrementing upwards through rows
      let row_start, row_end;
      if (y_1 < y_2) {
        row_start = y_1;
        row_end = y_2;
      } else {
        row_start = y_2;
        row_end = y_1;
      }


      row_start = force_within(row_start, 0, num_rows - 1);
      row_end = force_within(row_end, 0, num_rows - 1);

      logger.debug("row_start:", row_start);
      logger.debug("row_end:", row_end);

      // iterate through image lines within the change in y of
      // the edge line and find all intersections
      for (let j = row_start; j < row_end + 1; j++) {
        let image_line = image_lines[j];


        if (image_line === undefined) {
          console.error("j:", j);
          console.error("image_lines:", image_lines);
          throw Error("image_lines");
        }

        // because you know x is zero in ax + by = c, so by = c and b = -1, so -1 * y = c or y = -1 * c
        let image_line_y = -1 * image_line.c;
        //if (j === row_start) console.log("image_line_y:", image_line_y);

        let starts_on_line = y1 === image_line_y;
        let ends_on_line = y2 === image_line_y;
        let ends_off_line = !ends_on_line;

        let xmin_on_line, xmax_on_line;
        if (horizontal) {
          //console.log("horizontal line:", edge_y);
          //console.log("image_line_:", image_line_y);
          if (edge_y === image_line_y) {
            //console.log("horizontal on line!:", edge_y);
            xmin_on_line = start_lng;
            xmax_on_line = end_lng;
          } else {
            continue; // stop running calculations for this horizontal line because it doesn't intersect at all
          }
        } else if (vertical) {
          /* we have to have a seprate section for vertical bc of floating point arithmetic probs with get_inter..." */
          if (image_line_y >= edge_ymin && image_line_y <= edge_ymax) {
            xmin_on_line = start_lng;
            xmax_on_line = end_lng;
          }
        } else if (starts_on_line) {
          // we know that the other end is not on the line because then it would be horizontal
          xmin_on_line = xmax_on_line = x1;
        } else if (ends_on_line) {
          // we know that the other end is not on the line because then it would be horizontal
          xmin_on_line = xmax_on_line = x2;
        } else {
          try {
            xmin_on_line = xmax_on_line = get_intersection_of_two_lines(edge_line, image_line).x;
          } catch (error) {
            logger.error('error getting intersection of two lines: ', error);
            logger.info("j:", j);
            logger.info("edge:", edge);
            logger.info("image_line_y:", image_line_y);
            logger.info("edge_line:", edge_line);
            logger.info("image_line:", image_line);
            logger.info("image_lines:", image_lines);
            throw error;
          }
        }

        // check to see if the intersection point is within the range of
        // the edge line segment. If it is, add the intersection to the
        // list of intersections at the corresponding index for that row
        // in intersections_by_row
        if (xmin_on_line && xmax_on_line && (horizontal || (xmin_on_line >= start_lng && xmax_on_line <= end_lng && image_line_y <= edge_ymax && image_line_y >= edge_ymin))) {
          //let image_pixel_index = Math.floor((intersection.x - lng_0) / cell_width);
          //intersections_by_row[j].push(image_pixel_index);
          intersections_by_row[j].push({
            direction,
            index: i,
            edge: edge,
            ends_on_line,
            ends_off_line,
            horizontal,
            starts_on_line,
            vertical,
            xmin: xmin_on_line,
            xmax: xmax_on_line,
            image_line_y
          });
        }
      }
    }

    logger.debug("intersections_by_row.length:", intersections_by_row.length);


    let line_strings = [];
    intersections_by_row.map((segments_in_row, row_index) => {
      logger.debug(row_index, "segments_in_row.length:", segments_in_row.length);
      if (segments_in_row.length > 0) {
        //console.log("\n\nsegments in row:", segments_in_row);
        let clusters = cluster_line_segments(segments_in_row, number_of_edges);
        //console.log('clusters:', clusters);
        let categorized = clusters.map(categorize_intersection);
        //console.log("categorized:", categorized);
        let [ throughs, nonthroughs ] = _.partition(categorized, item => item.through);

        if (throughs.length % 2 === 1) {
          logger.error('number of indexes for this row are incorrect, resolving as an odd number');
          logger.info("row_index:", row_index);
          logger.info("segments_in_row.length:", segments_in_row.length);
          logger.info("segments_in_row:", JSON.stringify(segments_in_row));
          logger.info("clusters.length:", clusters.length);
          logger.info("clusters:", clusters);
          logger.info("categorized:", categorized);
          throw Error("throughs.length for " + row_index + " is odd with " + throughs.length);
        }

        //console.log("throughs:", throughs);
        //console.log("nonthroughs:", nonthroughs);
        let insides = nonthroughs.map(intersection => [intersection.xmin, intersection.xmax]);
        //console.log("insides from nonthroughs:", insides);

        throughs = _.sortBy(throughs, "xmin");
        //console.log("sorted throughs", throughs);

        let couples = couple(throughs).map(couple => {
          let [left, right] = couple;
          return [left.xmin, right.xmax];
        });

        insides = insides.concat(couples);

        /*
          This makes sure we don't double count pixels.
          For example, converts `[[0,10],[10,10]]` to `[[0,10]]`
        */
        insides = merge_ranges(insides);


        logger.debug(() => {
          insides.forEach(insidepair => {
            let [x1, x2] = insidepair;
            let y = segments_in_row[0].image_line_y;
            line_strings.push(turf_lineString([[x1, y], [x2, y]], {"stroke": "red", "stroke-width": 1,"stroke-opacity": 1}));
          });
        });

        insides.forEach(pair => {

          let [xmin, xmax] = pair;

          //convert left and right to image pixels
          let left = Math.round((xmin - (lng_0 + .5*cell_width)) / cell_width);
          let right = Math.round((xmax - (lng_0 + .5*cell_width)) / cell_width);

          let start_column_index = Math.max(left, 0);
          let end_column_index = Math.min(right, image_width);


          for (let column_index = start_column_index; column_index <= end_column_index; column_index++) {
            image_bands.forEach((band, band_index) => {
              var value = band[row_index][column_index];
              if (value != undefined && value !== no_data_value) {
                run_this_function_on_each_pixel_inside_geometry(value, band_index);
              }
            });
          }
        });
      }
    });

    logger.debug(() => {
      let fc = turf_featureCollection(line_strings);
      //fs.writeFileSync("/tmp/lns" + edges_index + ".geojson", JSON.stringify(fc));
    });
  });
}
