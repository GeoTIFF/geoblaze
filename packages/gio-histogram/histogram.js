'use strict';

let _ = require('underscore');

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

let get_equal_interval_bins = (values, num_classes) => {

    // get min and max values
    let min_value = _.min(values);
    let max_value = _.max(values);

    // divide up based on number of classes
    let interval = (max_value - min_value) / num_classes;
    return _.range(num_classes)
        .map((num, index) => [num * interval, (num + 1) * interval]);
}

let get_quantile_bins = (values, num_classes) => {

    // get the interval to divide values by
    let interval = values.length / num_classes;
    let result = _.range(num_classes)
        .map((num, index) => {
            if (index === 0) {
                return [num * interval, (num + 1) * interval + 1];
            } else {
                return [num * interval + 1, (num + 1) * interval + 1];
            }
        });
        return result;
}

let get_histogram = (values, options) => {

    // pull out options, possible options are:
    // scale_type: measurement scale, options are: nominal, ratio
    // num_classes: number of classes/bins, only available for ratio data
    // class_type: method of breaking data into classes, only available
    //             for ratio data, options are: equal-interval, quantile
    //             
    var options = options || {};
    let scale_type = options.scale_type;
    let num_classes = options.num_classes;
    let class_type = options.class_type;

    if (!scale_type) {
        throw 'Insufficient options were provided, need a value for "scale_type." Possible values include "nominal" and "ratio".';
    }

    let results;

    // when working with nominal data, we simply create a new object attribute
    // for every new value, and increment for each additional value.
    if (scale_type === 'nominal') {
        results = {};
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if (results[value]) results[value] += 1;
            else results[value] = 1;
        }
    } else if (scale_type === 'ratio') {
        results = {};

        if (!num_classes) {
            throw 'Insufficient options were provided, need a value for "num_classes".';
        } else if (!class_type) {
            throw 'Insufficient options were provided, need a value for "class_type". Possible values include "equal-interval" and "quantile"';
        }

        // specify bins, bins represented as a list of [min, max] values
        let bins;
        if (class_type === 'equal-interval') {
            bins = get_equal_interval_bins(values, num_classes);
        } else if (class_type === 'quantile') {
            bins = get_quantile_bins(values, num_classes);
        } else {
            throw 'The class_type provided is either not supported or incorrectly specified.';
        }

        console.error('bins: ', bins)

        // sort values to make binning more efficient
        values = values.sort((a, b) => a - b);

        let bin_index = 0;
        let bin = bins[bin_index];
        let bin_key = `${bin[0]} - ${bin[1]}`;

        // set first bin in results to eliminate the need to check
        // for the existence of the key in every iteration
        let first_value = values[0];
        while (first_value > bin[1]) { // this is in case the first value isn't in the first bin
            bin_index += 1;
            bin = bins[bin_key];
            bin_key = `>${bin[0]} - ${bin[1]}`;
        }
        results[bin_key] = 1;

        // add to results based on bins
        for (var i = 1; i < values.length; i++) {
            let value = values[i];
            if (value <= bin[1]) { // add to existing bin if its in the correct range
                results[bin_key] += 1;
            } else { // otherwise keep searching for an appropriate bin until one is found
                while (value > bin[1]) {
                    bin_index += 1;
                    bin = bins[bin_index];
                    bin_key = `>${bin[0]} - ${bin[1]}`;
                }
                // console.error('next bin: ', bin_key)
                results[bin_key] = 1; // initialize that bin with the first occupant
            }
        }
    }

    console.error('got results! ', results);

    if (results) return results;
    else throw 'An unexpected error occurred while running the get_histogram function.';
}

module.exports = (image, geom, options) => {

    try {

        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);
            let no_data_value = utils.get_no_data_value(image);

            // grab array of values by band
            let values = get(image, geom);

            // run through histogram function
            return values.map(band => get_histogram(band, options));

        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let no_data_value = utils.get_no_data_value(image);

            // grab array of values by band
            let values = [];
            intersect_polygon(image, geom, (value, band_index) => {
                if (values[band_index]) {
                    values[band_index].push(value); 
                } else {
                    values[band_index] = [value];
                }
            });

            // run through histogram function
            return values.map(band => get_histogram(band, options));

        } else {
            throw 'Only Bounding Box and Polygon geometries are currently supported.'
        }
    } catch(e) {
        console.error(e);
        throw e;
    }

}