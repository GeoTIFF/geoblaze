'use strict';

let load = require('../gio-load/load');
let utils = require('../gio-utils/utils');
let convert_geometry = require('../gio-convert-geometry/convert-geometry');

module.exports = (image, geom) => {
    
    if (utils.is_bbox(geom)) { // bounding box
        
        // convert geometry
        let geometry = convert_geometry('bbox', geom);

        let geoKeys = image.getGeoKeys();

        // TEMPORARY: make sure raster is in wgs 84
        if (geoKeys.GTModelTypeGeoKey === 2 && geoKeys.GeographicTypeGeoKey === 4326) {
            
            // use a utility function that converts from the lat/long coordinate
            // space to the image coordinate space
            let bbox = utils.convert_latlng_bbox_to_image_bbox(image, geometry);

            try {

                // get values
                return image.readRasters({ window: bbox });

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