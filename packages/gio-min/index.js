'use strict';

let quicksort = require('qsort.js').qSortSync;

let get = require('../gio-get/index');
let utils = require('../gio-utils/index');

module.exports = (image, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // get min value
            if (values.length === 1) { // one band
                let filtered_values = [].slice.call(values[0])
                	.filter(value => value !== no_data_value);
                let sorted_values = quicksort(filtered_values);
                return sorted_values[0];
            } else { // multiple bands
                return values.map(band => { 
                    let filtered_values = [].slice.call(band)
                    	.filter(value => value !== no_data_value);
					let sorted_values = quicksort(filtered_values);
					return sorted_values[0];
                });
            }
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}