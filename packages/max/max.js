'use strict';

let get = require('../get/get');
let utils = require('../utils/utils');
let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('../intersect-polygon/intersect-polygon');

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

/**
 * The max function takes a raster as an input and an optional geometry.
 * If a geometry is included, the function returns the max of all the pixels
 * in that area. If no geometry is included, the pixels returns the max of
 * all the pixels for each band in the raster.
 * @name max
 * @param {Object} a georaster from georaster library
 * @param {Object} [input=undefined] a geometry, which we'll use for clipping result
 * @returns {Object} array of maxs for each band
 * @example
 * var maxs = geoblaze.max(georaster, geometry);
 */
function get_max_for_raster(georaster, geom) {
    
    try {
        
        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let flat = true;
            let values = get(georaster, geom, flat);
            let no_data_value = georaster.no_data_value;

            // get max value
            return values.map(band => get_max(band, no_data_value));
            
        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let values = [];

            intersect_polygon(georaster, geom, (value, band_index) => {
                if (!values[band_index]) {
                    values[band_index] = value; 
                } else if (value > values[band_index]) {
                    values[band_index] = value; 
                }
            });

            if (values) return values;
            else throw 'No Values were found in the given geometry';

        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}
module.exports = get_max_for_raster;
