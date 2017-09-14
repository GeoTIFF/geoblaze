'use strict';

let load = require('../gio-load/index');
let utils = require('../gio-utils/index');
let convert_geometry = require('../gio-convert-geometry/index');

module.exports = (image, geom) => {
    
    if (utils.is_bbox(geom)) { // bounding box
        
        // convert geometry
        let geometry = convert_geometry('bbox', geom);

        // convert image
        let fd = image.fileDirectory;
        let geoKeys = image.getGeoKeys();

        // TEMPORARY: make sure raster is in wgs 84
        if (geoKeys.GTModelTypeGeoKey === 2 && geoKeys.GeographicTypeGeoKey === 4326) {
            
            // get image dimensions
            let origin = image.getOrigin();
            let lng_0 = origin[0];
            let lat_0 = origin[1];
            let cell_width = fd.ModelPixelScale[0];
            let cell_height = fd.ModelPixelScale[1];

            // pull out bounding box values;
            let lng_min = geometry[0];
            let lat_min = geometry[1];
            let lng_max = geometry[2];
            let lat_max = geometry[3];

            // map bounding box values to image coordinate space
            /* y_min uses lat_max while y_max uses lat_min because the image coordinate
            system is inverted along the y axis relative to the lat/long (geographic)
            coordinate system */
            let x_min = Math.floor(Math.abs(lng_min - lng_0) / cell_width);
            let y_min = Math.floor(Math.abs(lat_0 - lat_max) / cell_height);
            let x_max = Math.ceil(Math.abs(lng_max - lng_0) / cell_width);
            let y_max = Math.ceil(Math.abs(lat_0 - lat_min) / cell_height);

            try {

                // get values
                return image.readRasters({ window: [x_min, y_min, x_max, y_max] });

            } catch (e) {
                throw e;
            }
        } else {
            throw 'This feature currently only works with geotiffs in WGS 84. Please reproject the geotiff';
        }
    } else {
        throw 'Geometry is not a bounding box - please make sure to send a bounding box when using gio-get';
    }
}