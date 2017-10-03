'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

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
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // get min value
            if (values.length === 1) { // one band
                return get_min(values[0], no_data_value);
            } else { // multiple bands
                return values.map(band => get_min(band, no_data_value));
            }
        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let values = [];

            intersect_polygon(image, geom, (value, band_index) => {
                if (typeof values[band_index] === 'undefined') {
                    values[band_index] = value; 
                } else if (value < values[band_index]) {
                    values[band_index] = value; 
                }
            });

            if (values.length === 1) {
                return values[0];
            } else if (values.length > 1) {
                return values;
            } else {
                throw 'No Values were found in the given geometry';
            }

        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}