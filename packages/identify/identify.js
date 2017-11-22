'use strict';

let load = require('../load/load');
let convert_geometry = require('../convert-geometry/convert-geometry');

/**
    Given a raster and a point geometry,
    the identify function returns the pixel
    value of the raster at the given point.

    @param {object} raster - a raster from the georaster library
    @param {string|object} geometry - geometry can be an [x,y] array, a GeoJSON point object, or a string representation of a GeoJSON point object.
*/
let identify = (georaster, geometry) => {

    // The convert_geometry function takes the input
    // geometry and converts it to a standard format.
    let point = convert_geometry('point', geometry);
    let lng = point[0];
    let lat = point[1];


    //console.log("georaster.projection:", georaster.projection);
    if (georaster.projection === 4326) {
        //console.log("assed proj");

        // By normalizing the difference in latitude and longitude between the image
        // origin and the point geometry by the cell height and width respectively,
        // we can map the latitude and longitude of the point geometry in the
        // coordinate space to their associated pixel location in the image space.
        // Note that the y value is inverted to account for the inversion between the
        // coordinate and image spaces.
        let x = Math.floor(Math.abs(lng - georaster.xmin) / georaster.pixelWidth);
        let y = Math.floor(Math.abs(georaster.ymax - lat) / georaster.pixelHeight);

        try {

            // iterate through the bands
            // get the row and then the column of the pixel that you want
            return georaster.values.map(rows => rows[y][x]);

        } catch(e) {
            throw e;
        }
    } else {
        throw 'Identification currently only works with geotiffs in WGS 84. Please reproject the geotiff';
    }
}

module.exports = identify;
