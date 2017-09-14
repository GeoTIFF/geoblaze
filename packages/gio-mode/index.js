'use strict';

let _ = require('underscore');

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

let get_mode_from_values = (values) => {

    // iterate through values and store in obj
    let store = {};
    let value_length = values.length;
    let mode = [null, 0];
    for (let i = 0; i < value_length; i++) {
        let value = values[i];
        if (store[value]) {
            store[value] += 1;
        } else {
            store[value] = 1;
        }
    }

    // iterate through values to get highest frequency
    let buckets = _.sortBy(_.pairs(store), pair => pair[1])
    let max_frequency = buckets[buckets.length - 1][1];
    let modes = buckets
        .filter(pair => pair[1] === max_frequency)
        .map(pair => Number(pair[0]));
    return modes.length === 1 ? modes[0] : modes; 
}

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            if (values.length === 1) { // one band
                let filtered_values = values[0].filter(value => value !== no_data_value)
                return get_mode_from_values(filtered_values);
            } else { // multiple bands
                return values
                    .map(band => band.filter(value => value !== no_data_value))
                    .map(band => get_mode_from_values(band));
            }
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }  
    } catch(e) {
        console.error(e);
    }

}