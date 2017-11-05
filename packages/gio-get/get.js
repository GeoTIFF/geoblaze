'use strict';

let load = require('../gio-load/load');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');

module.exports = (georaster, geom, flat) => {
    
    if (utils.is_bbox(geom)) { // bounding box
        
        // convert geometry
        let geometry = convert_geometry('bbox', geom);

        if (georaster.projection === 4326) {
            
            // use a utility function that converts from the lat/long coordinate
            // space to the image coordinate space
            // // left, top, right, bottom
            let bbox = utils.convert_latlng_bbox_to_image_bbox(georaster, geometry);
            //console.log("bbox:", bbox);
            let bbox_left = bbox.xmin;
            let bbox_top = bbox.ymin;
            let bbox_right = bbox.xmax;
            let bbox_bottom = bbox.ymax;

            try {
                if (flat) {
                    //console.log("flat is true");
                    return georaster.values.map(band => {
                        let values = [];
                        for (let row_index = bbox_top; row_index < bbox_bottom; row_index++) {
                            values = values.concat(Array.prototype.slice.call(band[row_index].slice(bbox_left, bbox_right)));
                        }
                        return values;
                    });
                } else {
                    return georaster.values.map(band => {
                        let table = [];
                        for (let row_index = bbox_top; row_index < bbox_bottom; row_index++) {
                            table.push(band[row_index].slice(bbox_left, bbox_right));
                        }
                        return table;
                    });
                }
            } catch (e) {
                throw e;
            }
        } else {
            throw 'This feature currently only works with geotiffs in WGS 84. Please reproject the geotiff';
        }
    } else {
        throw 'Geometry is not a bounding box - please make sure to send a bounding box when using gio-get';
    }
}
