'use strict';

let _ = require('underscore');

let get = require('../get/get');
let utils = require('../utils/utils');

let get_line_from_points = utils.get_line_from_points;
let get_intersection_of_two_lines = utils.get_intersection_of_two_lines;

module.exports = (georaster, geom, run_on_values) => {

    let cell_width = georaster.pixelWidth;
    let cell_height = georaster.pixelHeight;
    let no_data_value = georaster.no_data_value;
    let image_height = georaster.height;

    // get values in a bounding box around the geometry
    let latlng_bbox = utils.get_bounding_box(geom);
    //console.log("latlng_bbox:", latlng_bbox); //good
    let image_bands = get(georaster, latlng_bbox)
    //console.log("image_bands:", image_bands);

    // set origin points of bbox of geometry in image space
    let lat_0 = latlng_bbox.ymax + ((georaster.ymax - latlng_bbox.ymax) % cell_height);
    //console.log("lat_0:", lat_0); //good
    let lng_0 = latlng_bbox.xmin - ((latlng_bbox.xmin - georaster.xmin) % cell_width);
    //console.log("lng_0:", lng_0); //good

    // calculate size of bbox in image coordinates
    // to derive out the row length
    let image_bbox = utils.convert_latlng_bbox_to_image_bbox(georaster, latlng_bbox);
    //console.log("image_bbox:", image_bbox); //good
    let x_min = image_bbox.xmin,
        y_min = image_bbox.ymin,
        x_max = image_bbox.xmax,
        y_max = image_bbox.ymax;

    let row_length = x_max - x_min;
    //console.log("row_length:", row_length); //good

    // collapse geometry down to a list of edges
    // necessary for multi-part geometries
    let edges = [];
    geom.forEach(part => {
        for (let i = 1; i < part.length; i++) {
            let start_point = part[i - 1];
            let end_point = part[i];
            edges.push([start_point, end_point]);
        }
    });

    // iterate through image rows and convert each one to a line
    // running through the middle of the row
    let image_lines = [];
    let num_rows = image_bands[0].length;
    //console.log("num_rows:", num_rows);//good
    for (let y = 0; y < num_rows; y++) {

        // I don't understand this
        let lat = lat_0 - (cell_height * y + cell_height / 2);
        //console.log("lat:", lat); //good

        // use that point, plus another point along the same latitude to
        // create a line
        let point_0 = [lng_0, lat];
        let point_1 = [lng_0 + 1, lat];
        let line = get_line_from_points(point_0, point_1);
        image_lines.push(line);
    }
    //console.log("image_lines:", image_lines);

    // iterate through the list of polygon vertices, convert them to
    // lines, and compute the intersections with each image row
    let intersections_by_row = _.range(num_rows).map(row => []);
    for (let i = 0; i < edges.length; i++) {
        
        // get vertices that make up an edge and convert that to a line
        let edge = edges[i];
        let start_point = edge[0];
        let end_point = edge[1];
        let edge_line = get_line_from_points(start_point, end_point);

        let start_lng, end_lng;
        if (start_point[0] < end_point[0]) {
            start_lng = start_point[0];
            end_lng = end_point[0];
        } else {
            start_lng = end_point[0];
            end_lng = start_point[0];
        }
        //console.log("\n\n\n");
        //console.log("start_lng:", start_lng);
        //console.log("end_lng:", end_lng);

        // find the y values in the image coordinate space
        let y_1 = Math.floor((lat_0 - start_point[1]) / cell_height);
        let y_2 = Math.floor((lat_0 - end_point[1]) / cell_height);

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
        //console.log("row_start, row_end", [row_start, row_end]);

        // iterate through image lines within the change in y of
        // the edge line and find all intersections
        for (let j = row_start; j < row_end + 1; j++) {
            let image_line = image_lines[j];
            //console.log("image_line:", image_line);
            try {
            var intersection = get_intersection_of_two_lines(edge_line, image_line);
            } catch (error) {
                console.log("j:", j);
                console.log("edge_line:", edge_line);
                console.log("image_line:", image_line);
                console.log("image_lines:", image_lines);
                console.error(error)
                throw error;
            }
            //console.log("intersection:", intersection);

            // check to see if the intersection point is within the range of 
            // the edge line segment. If it is, add the intersection to the 
            // list of intersections at the corresponding index for that row 
            // in intersections_by_row
            if (intersection && intersection.x >= start_lng && intersection.x <= end_lng) {
                let image_pixel_index = Math.floor((intersection.x - lng_0) / cell_width);
                intersections_by_row[j].push(image_pixel_index);
            }
        }
    }

    //console.log("intersections by row", intersections_by_row);

    // iterate through the list of computed intersections for each row.
    // use these intersections to split up each row into pixels that fall
    // within the polygon and pixels that fall outside the polygon
    // for more information on this, review the ray casting algorithm
    for (let i = 0; i < num_rows; i++) {

        // we make sure to sort intersections here because we don't know the order
        // in which they were recorded, as it was based on the order of polygon
        // edges
        let row_intersections = intersections_by_row[i]
            .sort((a, b) => a - b);
        let num_intersections = row_intersections.length;
        if (num_intersections > 0) { // make sure the row is in the polygon

            // iterate through intersections and get the start and end
            // indexes at odd intervals, ie where pixels are inside the
            // polygon
            for (let j = 0; j < num_intersections; j++) {
                if (j % 2 === 1) {

                    let start_column_index = row_intersections[j - 1];
                    let end_column_index = row_intersections[j];
                    //console.log("start_row_index:end_row_index", start_row_index,":",end_row_index);

                    // convert to start and end in the clipped image    
                    //let start_index = start_row_index - x_min;
                    //let end_index = end_row_index - x_min;

                    //console.log("start_index:end_index", start_index,":",end_index);

                    // use the start and end indexes to pull pixels out of
                    // the corresponding image row
                    for (let column_index = start_column_index; column_index <= end_column_index; column_index++) {
                        image_bands.forEach((band, band_index) => {
                            //console.log("band:", band);
                            try {
                                var value = band[i][column_index];
                            } catch (error) {
                                //console.log("band:", band);
                                //console.log("row_index:", row_index);
                                //console.log("column_index:", column_index);
                                //console.error(error);
                                throw error;
                            }
                            if (value !== no_data_value) {
                                // run the function provided as a parameter input
                                // on the value
                                run_on_values(value, band_index);
                            }
                        });
                    }
                }
            }
        }
    }
}
