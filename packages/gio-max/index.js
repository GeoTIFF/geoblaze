'use strict';

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

let get_max = (values, no_data_value) => {
    let number_of_values = values.length;
    if (number_of_values > 0) {
        let max = null;
        for (let i = 0; i < number_of_values; i++) {
            let value = values[i];
            if (value !== no_data_value) {

                /* We first compare the current value to the stored maximum.
                If the new value is greater than the stored minimum, replace the
                stored minimum with the new value. When checking a greater than
                comparison aganist a null value, like in the first comparison,
                the statement resolves as true. */
            
                if (value > max) {
                    max = value;
                }
            }
        }
        return max;
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

            // get max value
            if (values.length === 1) { // one band
                return get_max(values[0], no_data_value);
            } else { // multiple bands
                return values.map(band => get_max(band, no_data_value));
            }
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}