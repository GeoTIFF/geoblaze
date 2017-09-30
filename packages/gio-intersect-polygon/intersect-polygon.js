'use strict';

let _ = require('underscore');

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');

let get_line_from_points = utils.get_line_from_points;
let get_intersection_of_two_lines = utils.get_intersection_of_two_lines;

module.exports = (image, geom, run_on_values) => {

	// get the cell width and height, will use later
	let info = utils.get_image_info(image);
    let cell_width = info.cell_width;
    let cell_height = info.cell_height;

    let no_data_value = utils.get_no_data_value(image);

    // get values in a bounding box around the geometry
    let latlng_bbox = utils.get_bounding_box(geom);
    let image_bands = get(image, latlng_bbox)

    // set origin points of image, ie returned bbox
    let lat_0 = latlng_bbox[3];
    let lng_0 = latlng_bbox[0];

    // calculate size of bbox in image coordinates
    // to derive out the row length
    let image_bbox = utils.convert_latlng_bbox_to_image_bbox(image, latlng_bbox);
    let x_min = image_bbox[0],
        y_min = image_bbox[1],
        x_max = image_bbox[2],
        y_max = image_bbox[3];

    let row_length = x_max - x_min;

    // iterate through image rows and convert each one to a line
    // running through the middle of the row
    let image_lines = [];
    let image_size = image_bands[0].length;
    for (let y = 0; y < image_size; y += row_length) {

        // get latitude of current row 
        let lat = lat_0 + (cell_height * y / row_length) + (cell_height / 2);
        
        // use that point, plus another point along the same latitude to
        // create a line
        let point_0 = [lng_0, lat];
        let point_1 = [lng_0 + 1, lat];
        let line = get_line_from_points(point_0, point_1);
        image_lines.push(line);
    }

    // iterate through the list of polygon vertices, convert them to
    // lines, and compute the intersections with each image row
    let num_rows = Math.floor(image_size / row_length);
    let intersections_by_row = _.range(num_rows).map(row => []);
    geom.forEach(part => {
        for (let i = 1; i < part.length; i++) {
            
            // get vertices that make up an edge and convert that to a line
            let start_point = part[i - 1];
            let end_point = part[i];
            let edge_line = get_line_from_points(start_point, end_point);

            // find the y values in the image coordinate space
            let y_1 = Math.floor(lat_0 - start_point[1]) / cell_height;
            let y_2 = Math.floor(lat_0 - end_point[1]) / cell_height;

            // make sure to set the start and end points so that we are
            // incrementing upwards
            let row_start, row_end;
            if (y_1 < y_2) {
                row_start = y_1;
                row_end = y_2;
            } else {
                row_start = y_2;
                row_end = y_1;
            }

            // iterate through image lines within the change in y of
            // the edge line and find all intersections
            for (let j = row_start; j < row_end + 1; j++) {
                let image_line = image_lines[j];
                let intersection = get_intersection_of_two_lines(edge_line, image_line);

                // check to see if the intersection point is inside the image row
                // and if it is, add the intersection to the list of intersections
                // at the corresponding index for that row in intersections_by_row
                let image_pixel_index = Math.floor((intersection.x - lng_0) / cell_width);
                
                if (image_pixel_index >= 0 && image_pixel_index <= row_length) {
                    intersections_by_row[j].push(image_pixel_index);
                }
            }
        }
    });

    // iterate through the list of computed intersections for each row.
    // use these intersections to split up each row into pixels that fall
    // within the polygon and pixels that fall outside the polygon
    // for more information on this, review the ray casting algorithm
    for (let i = 0; i < num_rows; i++) {

        // we make sure to sort intersections here because we don't know the order
        // in which they were recorded, as it was based on the order of polygon
        // edges
        let row_intersections = intersections_by_row[i].sort();
        let num_intersections = row_intersections.length;
        if (num_intersections > 0) { // make sure the row is in the polygon

            // iterate through intersections and get the start and end
            // indexes at odd intervals, ie where pixels are inside the
            // polygon
            for (let j = 0; j < num_intersections; j++) {
                if (j % 2 === 1) {
                    let start_row_index = row_intersections[j - 1];
                    let end_row_index = row_intersections[j];

                    // convert the start and end row indexes to indexes
                    // in the image
                    let start_index = i * row_length + start_row_index;
                    let end_index = i * row_length + end_row_index;

                    // use the start and end indexes to pull pixels out of
                    // the corresponding image row
                    for (let r = start_index; r < end_index; r++) {
                        image_bands.forEach((band, band_index) => {
                            let value = band[r];
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