'use strict';

let _ = require('underscore');

let combine = require('@turf/combine');

let polygon = require("@turf/helpers").polygon;

/*
    Runs on each value in a table,
    represented by an array of rows.
*/
function run_on_table_of_values(table, no_data_value, run_on_values) {
    let number_of_rows = table.length;
    for (let row_index = 0; row_index < number_of_rows; row_index++) {
        let row = table[row_index];
        let number_of_cells = row.length;
        for (let column_index = 0; column_index < number_of_cells; column_index++) {
            let value = row[column_index]; 
            if (value !== no_data_value) {
                run_on_values(value);
            }
        }
    }
}

function get_bounding_box(geometry) {

    let xmin, ymin, xmax, ymax;

    if (typeof(geometry[0][0]) === "number") {
        let number_of_points = geometry.length;
        xmin = xmax = geometry[0][0];
        ymin = ymax = geometry[0][1];
        for (let i = 1; i < number_of_points; i++) {
            let [x, y] = geometry[i];
            if (x < xmin) xmin = x;
            else if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            else if (y > ymax) ymax = y;
        }
    } else {
        let bboxes = geometry.forEach((part, index) => {
            let bbox = get_bounding_box(part);
            if (index == 0) {
                xmin = bbox.xmin;
                xmax = bbox.xmax;
                ymin = bbox.ymin;
                ymax = bbox.ymax;
            } else {
                if (bbox.xmin < xmin) xmin = bbox.xmin;
                else if (bbox.xmax > xmax) xmax = bbox.xmax;
                if (bbox.ymin < ymin) ymin = bbox.ymin;
                else if (bbox.ymax > ymax) ymax = bbox.ymax;
            }
        });
    }

    return { xmin, ymin, xmax, ymax };
}



module.exports = {

    bifurcate(items, test) {
        let trues = [];
        let falses = [];
        let items_length = items.length;
        for (let i = 0; i < items_length; i++) {
            let item = items[i];
            if (test(item)) trues.push(item);
            else falses.push(item);
        }
        return [trues, falses];
    },


    /**
     * This function takes in an array with an even number of elements and returns an array that couples every two consecutive elements;
     * @name couple
     * @param {Object} array of anything
     * @returns {Object} array of consecutive pairs
     * @example
     * let items = [0, 1, 18, 77, 99, 103];
     * let unflattened = utils.couple(items);
     * // unflattened
     * // [ [0, 1], [18, 77], [99, 103] ]
    */
    couple(array) {
        let couples = [];
        let length_of_array = array.length;
        for (let i = 0; i < length_of_array; i+=2) {
            couples.push([ array[i], array[i+1] ]);
        }
        return couples;
    },

    run_on_table_of_values,


    /**
     * This function categorizes an intersection 
     * @name categorize_intersection
     * @param {Object} edges
    */ 
    categorize_intersection(segments) {
        console.log("categorize_intersection:", segments);
        let through, end, xmin, xmax;

        let n = segments.length;
        let first = segments[0];

        if (n === 1) {
            through = true;
            xmin = first.xmin;
            xmax = first.xmax;
        } else /* n > 1 */ {
            let last = segments[n - 1];
            through = first.direction === last.direction;
            xmin = Math.min(first.xmin, last.xmin); 
            xmax = Math.max(first.xmax, last.xmax);
        }

        return { xmin, xmax, through };
    },


    /**
     * This function clusters an array of items based on a distance.
     * It is ordered however so the items must already be sorted by the property
     * @name cluster
     * @param {Object} Array of Objects
     * @param {string} name_of_property
     * @param {number} threshold
     * @returns {Object} 2-dimensional array of items, clustered by distance
     * @example
     * let objs = [{x: 3}, {x: 4}, {x: 5}, {x: 1000}, {x: 1002}];
     * let actual = utils.cluster(objs, "x", 1);
    */
    cluster(items, name_of_property, threshold) {
        let number_of_items = items.length;
        let clusters = [];
        let cluster = [];
        let previous_value;
        for (let i = 0; i < number_of_items; i++) {
            let item = items[i];
            let value = item[name_of_property];
            let number_in_cluster = cluster.length;
            if (number_in_cluster === 0) {
                cluster.push(item);
            } else /* assuming > 0 */ {
                if (value >= previous_value - threshold && value <= previous_value + threshold) {
                    cluster.push(item);
                } else {
                    clusters.push(cluster);
                    cluster = [ item ];
                }
            }
            previous_value = value;
        }
        if (cluster.length > 0) clusters.push(cluster);
        return clusters;
    },

    count_values_in_table(table, no_data_value) {
        let counts = {};
        run_on_table_of_values(table, no_data_value, value => {
            if (value in counts) counts[value]++;
            else counts[value] = 1;
        });
        return counts;
    },

    convert_crs_bbox_to_image_bbox(georaster, crs_bbox) {

        let crs_xmin, crs_ymin, crs_xmax, crs_ymax;
        if (typeof crs_bbox.xmin !== "undefined") {
            crs_xmin = crs_bbox.xmin;
            crs_ymin = crs_bbox.ymin;
            crs_xmax = crs_bbox.xmax;
            crs_ymax = crs_bbox.ymax;
        } else if (Array.isArray(crs_bbox) && crs_bbox.length === 4) {
            // pull out bounding box values
            crs_xmin = crs_bbox[0];
            crs_ymin = crs_bbox[1];
            crs_xmax = crs_bbox[2];
            crs_ymax = crs_bbox[3];
        }

        // map bounding box values to image coordinate space
        /* y_min uses lat_max while y_max uses lat_min because the image coordinate
        system is inverted along the y axis relative to the lat/long (geographic)
        coordinate system */
        return {
            xmin: Math.floor((crs_xmin - georaster.xmin) / georaster.pixelWidth),
            ymin: Math.floor((georaster.ymax - crs_ymax) / georaster.pixelHeight),
            xmax: Math.ceil((crs_xmax - georaster.xmin) / georaster.pixelWidth),
            ymax: Math.ceil((georaster.ymax - crs_ymin) / georaster.pixelHeight)
        };
    },

    get_geojson_coors(geojson) {
        if (geojson.features) { // for feature collections

            // make sure that if any polygons are overlapping, we get the union of them
            geojson = combine(geojson);
            
            // turf adds extra arrays when running combine, so we need to remove them
            // as we return the coordinates
            return geojson.features[0].geometry.coordinates
                .map(coors => coors[0]);
        } else if (geojson.geometry) { // for individual feature
            return geojson.geometry.coordinates;
        } else if (geojson.coordinates) { // for just the geometry
            return geojson.coordinates;
        }
    },

    is_bbox(geometry) {

        if (geometry === undefined || geometry === null) {
            return false;
        }

        // check if we are using the gio format and return true right away if so
        if (geometry.xmin !== undefined && geometry.xmax !== undefined && geometry.ymax !== undefined && geometry.ymin !== undefined) {
            return true;
        }

        if ((Array.isArray(geometry) && geometry.length === 4)) { // array 
            return true;
        }

        // convert possible inputs to a list of coordinates
        let coors;
        if (typeof geometry === 'string') { // stringified geojson
            let geojson = JSON.parse(geometry);
            let geojson_coors = this.get_geojson_coors(geojson);
            if (geojson_coors.length === 1 && geojson_coors[0].length === 5) {
                coors = geojson_coors[0];
            }
        } else if (typeof geometry === 'object') { // geojson
            let geojson_coors = this.get_geojson_coors(geometry);
            if (geojson_coors) coors = geojson_coors[0];
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


    get_depth(geometry) {
        let depth = 0;
        let part = geometry;
        while (Array.isArray(part)) {
            depth++;
            part = part[0];
        }
        return depth;
    },

    is_polygon(geometry) {

        // convert to a geometry
        let coors;
        if (Array.isArray(geometry)) {
            coors = geometry;
        } else if (typeof geometry === 'string') {
            let geojson = JSON.parse(geometry);
            coors = this.get_geojson_coors(geojson);
        } else if (typeof geometry === 'object') {
            coors = this.get_geojson_coors(geometry);
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

    get_bounding_box,

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

        if (det) { // this makes sure the lines aren't parallel, if they are, det will equal 0
            let x = (line_2.b * line_1.c - line_1.b * line_2.c) / det;
            let y = (line_1.a * line_2.c - line_2.a * line_1.c) / det;
            return { x, y };
        }
    },

    get_slope_of_line(line) {
        // assuming ax + by = c
        // http://www.purplemath.com/modules/solvelit2.htm
        return -1 * line.a / line.b;
    },

    sum(values) {
        return values.reduce((a, b) => a + b);
    }
}
