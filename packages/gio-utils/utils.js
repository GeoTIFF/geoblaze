'use strict';

let _ = require('underscore');

module.exports = {

    is_bbox(geometry) {

        // check if we are using the gio format and return true right away if so
        if (Array.isArray(geometry) && geometry.length === 4) { // array 
            return true;
        }

        // convert possible inputs to a list of coordinates
        let coors;
        if (typeof geometry === 'string') { // stringified geojson
            let geojson = JSON.parse(geometry);
            coors = geojson.coordinates[0];
        } else if (typeof geometry === 'object') { // geojson
            coors = geometry.coordinates[0];
        } else {
            return false;
        }

        // check to make sure coordinates make up a bounding box
        if (coors.length === 5 && _.isEqual(coors[0], coors[4])) {
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
    }
}