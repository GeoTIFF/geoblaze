'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

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
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let values = get(image, geom);
            let no_data_value = utils.get_no_data_value(image);

            // get median
            return values
                .map(band => band.filter(value => value !== no_data_value))
                .map(get_median);

        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let values = [];

            // the third argument of this function is a function which
            // runs for every pixel in the polygon. Here we add them to
            // an array to run through the get_median function
            intersect_polygon(image, geom, (value, band_index) => {
                if (values[band_index]) {
                    values[band_index].push(value);
                } else {
                    values[band_index] = [value];
                }
            });

            if (values.length > 0) return values.map(get_median);
            else throw 'No Values were found in the given geometry';

        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }   
    } catch(e) {
        console.error(e);
        throw e;
    }
}