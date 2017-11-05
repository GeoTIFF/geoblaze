'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');
let _ = require("underscore");

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

module.exports = (georaster, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);

            // grab array of values;
            let flat = false; // get values as a one dimensional flat array rather than as a table
            let values = get(georaster, geom, flat);
            //console.log("values:", values.length, values[0].length, values[0][0].length);
            let no_data_value = georaster.no_data_value;

            // get median
            //return values
            //    .map(band => band.filter(value => value !== no_data_value))
            //    .map(get_median);

            // median values
            let medians = []
            for (let band_index = 0; band_index < values.length; band_index++) {
                let band = values[band_index];
                let number_of_cells_with_values_in_band = 0;
                let number_of_rows = band.length;
                let counts = {};
                for (let row_index = 0; row_index < number_of_rows; row_index++) {
                    let row = band[row_index];
                    let number_of_cells = row.length;
                    for (let column_index = 0; column_index < number_of_cells; column_index++) {
                        let value = row[column_index];
                        if (value !== no_data_value) {
                            number_of_cells_with_values_in_band++;
                            if (value in counts) counts[value]++;
                            else counts[value] = 1;
                        }
                    }
                }
                let sorted_counts = _.pairs(counts).sort((pair1, pair2) => Number(pair1[0]) - Number(pair2[0]));
                //console.log("sorted_counts:", sorted_counts);
                let middle = number_of_cells_with_values_in_band / 2;
                let running_count = 0;
                for (let i = 0; i < sorted_counts.length; i++) {
                    let sorted_count = sorted_counts[i];
                    let value = Number(sorted_count[0]);
                    let count = sorted_count[1];
                    running_count += count;
                    if (running_count > middle) {
                        medians.push(value);
                        break;
                    } else if (running_count === middle) {
                        medians.push((value + Number(sorted_counts[i+1])) / 2);
                        break;
                    }
                }
                //console.log("medians:", medians);
            }
            return medians;

        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let values = [];

            // the third argument of this function is a function which
            // runs for every pixel in the polygon. Here we add them to
            // an array to run through the get_median function
            intersect_polygon(georaster, geom, (value, band_index) => {
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
