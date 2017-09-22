'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');

module.exports = (image, geom) => {
    
    try {

        let no_data_value = utils.get_no_data_value(image);
        
        if (utils.is_bbox(geom)) { // if geometry is a bounding box

            // grab array of values
            let values = get(image, geom);

            // run simple reduce to get average
            if (values.length === 1) { // one band
                let sum = values[0]
                    .filter(value => value !== no_data_value)
                    .reduce((sum, value) => sum += value, 0);
                return sum / values[0].length;
            } else {
                return values.map(band => { // multiple bands
                    return band
                        .filter(value => value !== no_data_value)
                        .reduce((sum, value) => sum += value, 0)
                        / band.length;
                });
            }
        } else if (utils.is_polygon(geom)) { // if geometry is a polygon

            // get values in a bounding box around the geometry
            let bbox = utils.get_bounding_box(geom);




        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}