'use strict';

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

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
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
    }
}