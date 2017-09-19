'use strict';

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

let get_median = values => {

    // sort values
    values.sort();
    let values_length = values.length;

    // pull middle value from sorted array
    if (values_length % 2 !== 0) {
        let middle = Math.floor(values_length / 2);
        return values[middle];
    } else {
        let middle = values_length / 2;
        return (values[middle - 1] + values[middle]) / 2;
    }
}

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // get median
            if (values.length === 1) { // one band
                let filtered_values = values[0]
                    .filter(value => value !== no_data_value);
                return get_median(filtered_values)
            } else {
                return values
                    .map(band => band.filter(value => value !== no_data_value))
                    .map(get_median);
            }
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}