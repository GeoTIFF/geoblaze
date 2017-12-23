'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');
let bifurcate = utils.bifurcate;
let categorize_intersection = utils.categorize_intersection;
let cluster = utils.cluster;
let couple = utils.couple;
let force_within = utils.force_within;

let get_line_from_points = utils.get_line_from_points;
let get_intersection_of_two_lines = utils.get_intersection_of_two_lines;
let get_slope_of_line = utils.get_slope_of_line;

let get_edges_for_polygon = polygon => {
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

module.exports = (georaster, geom, run_this_function_on_each_pixel_inside_geometry, debug_level=2) => {

    let cell_width = georaster.pixelWidth;
    let cell_height = georaster.pixelHeight;
    console.log("cell_height:", cell_height);
    let no_data_value = georaster.no_data_value;
    let image_height = georaster.height;
    console.log("image_height: " + image_height);
    let image_width = georaster.width;

    // get values in a bounding box around the geometry
    let latlng_bbox = utils.get_bounding_box(geom);
    console.log("latlng_bbox:", latlng_bbox); //good
    let image_bands = get(georaster, latlng_bbox)
    //console.log("image_bands:", image_bands);

    // set origin points of bbox of geometry in image space
    let lat_0 = latlng_bbox.ymax + ((georaster.ymax - latlng_bbox.ymax) % cell_height);
    console.log("lat_0:", lat_0); //good
    let lng_0 = latlng_bbox.xmin - ((latlng_bbox.xmin - georaster.xmin) % cell_width);
    console.log("lng_0:", lng_0); //good

    // calculate size of bbox in image coordinates
    // to derive out the row length
    let image_bbox = utils.convert_crs_bbox_to_image_bbox(georaster, latlng_bbox);
    console.log("image_bbox:", image_bbox);
    let x_min = image_bbox.xmin,
        y_min = image_bbox.ymin,
        x_max = image_bbox.xmax,
        y_max = image_bbox.ymax;

    let row_length = x_max - x_min;
    console.log("row_length:", row_length); 

    // iterate through image rows and convert each one to a line
    // running through the middle of the row
    let image_lines = [];
    let num_rows = image_bands[0].length;
    console.log("num_rows:", num_rows);
    for (let y = 0; y < num_rows; y++) {

        // I don't understand this
        let lat = lat_0 - cell_height * y - cell_height / 2;
        //console.log("lat:", lat); //good

        // use that point, plus another point along the same latitude to
        // create a line
        let point_0 = [lng_0, lat];
        let point_1 = [lng_0 + 1, lat];
        let line = get_line_from_points(point_0, point_1);
        image_lines.push(line);
    }
    console.log("image_lines.length:", image_lines.length);


    // collapse geometry down to a list of edges
    // necessary for multi-part geometries
    let depth = utils.get_depth(geom);
    console.log("depth:", depth);
    let polygon_edges = depth === 4  ? geom.map(get_edges_for_polygon) : [get_edges_for_polygon(geom)];
    if (debug_level >= 1) console.log("polygon_edges.length:", polygon_edges.length);

    polygon_edges.forEach(edges => {

      if (debug_level >= 1) console.log("edges.length", edges.length);

      // iterate through the list of polygon vertices, convert them to
      // lines, and compute the intersections with each image row
      let intersections_by_row = _.range(num_rows).map(row => []);
      if (debug_level >= 1) console.log("intersections_by_row.length:", intersections_by_row.length);
      let number_of_edges = edges.length;
      if (debug_level >= 1) console.log("number_of_edges:", number_of_edges);
      for (let i = 0; i < number_of_edges; i++) {
        
        // get vertices that make up an edge and convert that to a line
        let edge = edges[i];
        let [start_point, end_point] = edge;
        if (debug_level >= 1) console.log("[start_point, end_point]:", start_point, end_point);

        let edge_y = start_point[1];

        let edge_line = get_line_from_points(start_point, end_point);

        let start_lng, start_lat, end_lat, end_lng;
        if (start_point[0] < end_point[0]) {
            [ start_lng, start_lat ] = start_point;
            [ end_lng, end_lat ] = end_point;
        } else {
            [ start_lng, start_lat ] = end_point;
            [ end_lng, end_lat ]  = start_point;
        }
        //console.log("\n\n\n");
        //console.log("start_lng:", start_lng);
        //console.log("end_lng:", end_lng);

        // find the y values in the image coordinate space
        console.log("unrounede:", (lat_0 - .5*cell_height - start_lat) / cell_height);
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

        if (debug_level >= 1) console.log("row_start, row_end", [row_start, row_end]);

        row_start = force_within(row_start, 0, num_rows - 1);
        row_end = force_within(row_end, 0, num_rows - 1);

        if (debug_level >= 1) console.log("row_start, row_end", [row_start, row_end]);
        // iterate through image lines within the change in y of
        // the edge line and find all intersections
        for (let j = row_start; j < row_end + 1; j++) {
            let image_line = image_lines[j];

            // because you know x is zero in ax + by = c, so by = c and b = -1, so -1 * y = c or y = -1 * c
            let image_line_y = -1 * image_line.c;
            //console.log("image_line_y for " + j + ": " + JSON.stringify(image_line));

            let slope = get_slope_of_line(edge_line);
            //if (debug_level >= 2) console.log("slope:", slope);

            let horizontal = slope === 0 || slope === -0;

            let direction = Math.sign(slope);

            let xmin_on_line, xmax_on_line;
            if (horizontal) {
                console.log("horizontal line:", edge_y);
                console.log("image_line_:", image_line_y);
                if (edge_y === image_line_y) {
                    console.log("horizontal on line!:", edge_y);
                    xmin_on_line = start_lng;
                    xmax_on_line = end_lng
                }
            } else {
                try {
                    xmin_on_line = xmax_on_line = get_intersection_of_two_lines(edge_line, image_line).x;
                    //console.log("xmin_on_line:", xmin_on_line);
                } catch (error) {
                    console.log("j:", j);
                    console.log("edge_line:", edge_line);
                    console.log("image_line:", image_line);
                    console.log("image_lines:", image_lines);
                    console.error(error)
                    throw error;
                }
            }
            //console.log("intersection:", intersection);

            // check to see if the intersection point is within the range of 
            // the edge line segment. If it is, add the intersection to the 
            // list of intersections at the corresponding index for that row 
            // in intersections_by_row
            if (horizontal || (xmin_on_line && xmin_on_line >= start_lng && xmax_on_line <= end_lng)) {
                //console.log("pushing");
                //let image_pixel_index = Math.floor((intersection.x - lng_0) / cell_width);
                //intersections_by_row[j].push(image_pixel_index);
                intersections_by_row[j].push({
                    direction: direction,
                    index: i,
                    edge: edge,
                    xmin: xmin_on_line,
                    xmax: xmax_on_line
                });
            }
        }
      }

      if (debug_level >= 1) console.log("intersections_by_row.length:", intersections_by_row.length);


      intersections_by_row.map((segments_in_row, row_index) => {
          if (segments_in_row.length > 0) {
              //console.log("\n\nsegments in row:", segments_in_row);
              let clusters = cluster(segments_in_row, "index", 1, number_of_edges);
              //console.log('clusters:', clusters);
              let categorized = clusters.map(categorize_intersection);
              //console.log("categorized:", categorized);
              let [ throughs, nonthroughs ] = bifurcate(categorized, "through", 1);
              //console.log("throughs:", throughs);
              //console.log("nonthroughs:", nonthroughs);
              let insides = nonthroughs.map(intersection => [intersection.xmin, intersection.xmax]);
              //console.log("insides from nonthroughs:", insides);

              if (throughs % 2 === 1) {
                  console.error("throughs.length is odd with " + throughs.length);
              }
              throughs = _.sortBy(throughs, "xmin");
              //console.log("sorted throughs", throughs);

              let couples = couple(throughs).map(couple => {
                  //console.log("couple:", couple);
                  let [left, right] = couple;
                  return [left.xmin, right.xmax];
              });
              //console.log("couples:", couples);

              insides = insides.concat(couples);
              //console.log("insides for iterating:", insides);

              insides.forEach(pair => {

                  let [xmin, xmax] = pair;

                  //convert left and right to image pixels
                  let left = Math.round((xmin - (lng_0 + .5*cell_width)) / cell_width);
                  let right = Math.round((xmax - (lng_0 + .5*cell_width)) / cell_width);
                  //console.log("left:", left, right);

                  let start_column_index = Math.max(left, 0);
                  let end_column_index = Math.min(right, image_width);
                  //console.log("a-z", start_column_index, end_column_index);

                  for (let column_index = start_column_index; column_index <= end_column_index; column_index++) {
                      image_bands.forEach((band, band_index) => {
                          var value = band[row_index][column_index];
                          if (value !== no_data_value) {
                              run_this_function_on_each_pixel_inside_geometry(value, band_index);
                          }
                      });
                  }
              });
          }
      });
  });
}
