'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // sum values
            if (values.length === 1) { // one band
                return values[0]
                    .filter(value => value !== no_data_value)
                    .reduce((sum, value) => sum += value, 0);
            } else {
                return values.map(band => { // multiple bands
                    return band
                        .filter(value => value !== no_data_value)
                        .reduce((sum, value) => sum += value, 0)
                });
            }
        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let sums = [];
            
            // the third argument of intersect_polygon is a function which
            // is run on every value, we use it to increment the sum 
            intersect_polygon(image, geom, (value, band_index) => {
                if (sums[band_index]) {
                    sums[band_index] += value; 
                } else {
                    sums[band_index] = value;
                }
            });

            if (sums.length === 1) {
                return sums[0];
            } else if (sums.length > 1) {
                return sums;
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