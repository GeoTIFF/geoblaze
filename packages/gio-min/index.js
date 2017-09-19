'use strict';

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

let get_min = (values, no_data_value) => {
    let number_of_values = values.length;
    if (number_of_values > 0) {
        let min = null;
        for (let i = 0; i < number_of_values; i++) {
            let value = values[i];
            if (value !== no_data_value) {

                /* We first compare the current value to the stored minimum.
                If the new value is less than the stored minimum, replace the
                stored minimum with the new value. Also check to see
                if the minimum value has not yet been defined, and 
                define it as the current value if that is the case. */

                if (value < min || min === null) {
                    min = value;
                }
            }
        }
        return min;
    } else {
        throw 'No values were provided';
    }
}

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // get min value
            if (values.length === 1) { // one band
                return get_min(values[0], no_data_value);
            } else { // multiple bands
                return values.map(band => get_min(band, no_data_value));
            }
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}