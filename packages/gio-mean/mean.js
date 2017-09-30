'use strict';

let _ = require('underscore');

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

module.exports = (image, geom) => {
    
    try {

        if (utils.is_bbox(geom)) { // if geometry is a bounding box
            let no_data_value = utils.get_no_data_value(image);

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
            let sum = 0;
            let num_values = 0;
            
            // the third argument of intersect_polygon is a function which
            // is run on every value, we use it to increment the sum so we
            // can later divide it by the total value count to get the mean
            intersect_polygon(image, geom, value => {
                sum += value;
                num_values += 1;
            });

            if (num_values > 0) return sum / num_values;
            else throw 'No Values were found in the given geometry';
        } else {
            throw 'Only Bounding Box and Polygon geometries are currently supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}