'use strict';

let _ = require('underscore');

module.exports = {

    get_image_info(image) {
        let fd = image.fileDirectory;
        let origin = image.getOrigin();
        let cell_width = fd.ModelPixelScale[0];
        let cell_height = fd.ModelPixelScale[1];
        let lng_0 = origin[0];
        let lat_0 = origin[1];
        return { lng_0, lat_0, cell_width, cell_height };
    },

    convert_latlng_bbox_to_image_bbox(image, latlng_bbox) {

        let info = this.get_image_info(image);

        // pull out bounding box values
        let lng_min = latlng_bbox[0];
        let lat_min = latlng_bbox[1];
        let lng_max = latlng_bbox[2];
        let lat_max = latlng_bbox[3];

        // map bounding box values to image coordinate space
        /* y_min uses lat_max while y_max uses lat_min because the image coordinate
        system is inverted along the y axis relative to the lat/long (geographic)
        coordinate system */
        let x_min = Math.floor(Math.abs(lng_min - info.lng_0) / info.cell_width);
        let y_min = Math.floor(Math.abs(info.lat_0 - lat_max) / info.cell_height);
        let x_max = Math.ceil(Math.abs(lng_max - info.lng_0) / info.cell_width);
        let y_max = Math.ceil(Math.abs(info.lat_0 - lat_min) / info.cell_height);

        return [x_min, y_min, x_max, y_max];
    },

    is_bbox(geometry) {

        // check if we are using the gio format and return true right away if so
        if (Array.isArray(geometry) && geometry.length === 4) { // array 
            return true;
        }

        // convert possible inputs to a list of coordinates
        let coors;
        if (typeof geometry === 'string') { // stringified geojson
            let geojson = JSON.parse(geometry);
            if (geojson.coordinates) {
                coors = geojson.coordinates[0];
            }
        } else if (typeof geometry === 'object') { // geojson
            if (geometry.coordinates) {
                coors = geometry.coordinates[0];
            }
        } else {
            return false;
        }

        // check to make sure coordinates make up a bounding box
        if (coors && coors.length === 5 && _.isEqual(coors[0], coors[4])) {
            let lngs = coors.map(coor => coor[0]);
            let lats = coors.map(coor => coor[1]);
            if (lngs[0] === lngs[3] && lats[0] === lats[1] && lngs[1] === lngs[2]) {
                return true;
            }
        }
        return false;
    },

    is_polygon(geometry) {

        // convert to a geometryp
        let coors;
        if (Array.isArray(geometry)) {
            coors = geometry;
        } else if (typeof geometry === 'string') {
            let geojson = JSON.parse(geometry);
            coors = geojson.coordinates;
        } else if (typeof geometry === 'object') {
            coors = geometry.coordinates;
        }

        if (coors) {
            // iterate through each geometry and make sure first and
            // last point are the same
            let is_polygon_array = true;
            coors.forEach(part => {
                let first_vertex = part[0];
                let last_vertex = part[part.length - 1]
                if (first_vertex[0] !== last_vertex[0] || first_vertex[1] !== last_vertex[1]) {
                    is_polygon_array = false;
                }
            });
            return is_polygon_array;
        }

        return false;
    },

    get_no_data_value(image) {

        // so far haven't found a reason not to return as an integer
        return parseInt(image.fileDirectory.GDAL_NODATA);
    },

    get_bounding_box(geometry) {

        // initialize the min and max values to the first
        // point so that we don't have to run a null check
        // when iterating over each point
        let first_point = geometry[0][0];
        let xmin = first_point[0],
            ymin = first_point[1],
            xmax = first_point[0],
            ymax = first_point[1];

        geometry.forEach(part => {

            // iterate through each point in the polygon
            // and reset min/max values accordingly
            for (var i = 0; i < part.length; i++) {
                let point = part[i];
                if (point[0] < xmin) xmin = point[0];
                if (point[1] < ymin) ymin = point[1];
                if (point[0] > xmax) xmax = point[0];
                if (point[1] > ymax) ymax = point[1];
            }

        });

        return [ xmin, ymin, xmax, ymax ];
    },

    // function to convert two points into a 
    // representation of a line
    get_line_from_points(start_point, end_point) {

        // get a, b, and c from line equation ax + by = c
        let x1 = start_point[0],
            x2 = end_point[0],
            y1 = start_point[1],
            y2 = end_point[1];
        let a = y2 - y1;
        let b = x1 - x2;
        let c = a * x1 + b * y1

        // return just a b and c since that is all we need 
        // to compute the intersection
        return { a, b, c };
    }, 

    // function to get the point at which two lines intersect
    // the input uses the line representations from the 
    // get_line_from_points function
    get_intersection_of_two_lines(line_1, line_2) {

        // calculate the determinant, ad - cb in a square matrix |a b|
        let det = line_1.a * line_2.b - line_2.a * line_1.b; /*  |c d| */

        if (det === 0) { // this means the lines are parellel, we need a way to account for this

        } else { // otherwise, get x and y coordinates of intersection
            let x = (line_2.b * line_1.c - line_1.b * line_2.c) / det;
            let y = (line_1.a * line_2.c - line_2.a * line_1.c) / det;
            return { x, y };
        }
    }
}