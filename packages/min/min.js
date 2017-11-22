'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');

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

module.exports = (georaster, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let values = get(georaster, geom, true);
            let no_data_value = georaster.no_data_value;

            // get min value
            return values.map(band => get_min(band, no_data_value));
            
        
        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let values = [];

            intersect_polygon(georaster, geom, (value, band_index) => {
                if (typeof values[band_index] === 'undefined') {
                    values[band_index] = value; 
                } else if (value < values[band_index]) {
                    values[band_index] = value; 
                }
            });

            if (values.length > 0) return values;
            else throw 'No Values were found in the given geometry';

        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}
