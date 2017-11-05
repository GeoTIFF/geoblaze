'use strict';

let get = require('../gio-get/get');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');
let intersect_polygon = require('../gio-intersect-polygon/intersect-polygon');

module.exports = (georaster, geom) => {
    
    try {
        
        if (utils.is_bbox(geom)) {
            geom = convert_geometry('bbox', geom);

            let values = get(georaster, geom);
            let height = georaster.height;
            let width = georaster.width;
            let no_data_value = georaster.no_data_value;

            // sum values
            return values.map(band => { // iterate over each band which include rows of pixels
                return band.reduce((sum_of_band, row) => { // reduce all the rows into one sum
                    return sum_of_band + row.reduce((sum_of_row, cell_value) => { // reduce each row to a sum of its pixel values
                        return cell_value !== no_data_value ? sum_of_row + cell_value : sum_of_row;
                    }, 0);
                }, 0);
            });

        } else if (utils.is_polygon(geom)) {
            geom = convert_geometry('polygon', geom);
            let sums = [];
            
            // the third argument of intersect_polygon is a function which
            // is run on every value, we use it to increment the sum 
            intersect_polygon(georaster, geom, (value, band_index) => {
                if (sums[band_index]) {
                    sums[band_index] += value; 
                } else {
                    sums[band_index] = value;
                }
            });

            if (sums.length > 0) return sums;
            else throw 'No Values were found in the given geometry';
            
        } else {
            throw 'Non-Bounding Box geometries are currently not supported.'
        }            
    } catch(e) {
        console.error(e);
        throw e;
    }
}
