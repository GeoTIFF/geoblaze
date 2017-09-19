'use strict';

let load = require('../gio-load/index');
let convert_geometry = require('../gio-convert-geometry/index');

/**
    Given an image and a point geometry,
    the identify function returns the pixel
    value of the image at the given point.

    @param {object} image - the image is a raster representation derived from the getTiff() method of a GeoTIFF loaded using the geotiff npm package.
    @param {string|object} geometry - geometry can be an [x,y] array, a GeoJSON point object, or a string representation of a GeoJSON point object.
*/
let identify = (image, geometry) => {

    // The convert_geometry function takes the input
    // geometry and converts it to a standard format.
    let point = convert_geometry('point', geometry);
    let lng = point[0];
    let lat = point[1];

    // The file directory holds a set of GeoTIFF
    // tags. 
    let fd = image.fileDirectory;

    // Geo Keys are a set of metadata parameters
    // which provide information about the GeoTIFF.
    let geoKeys = image.getGeoKeys();

    // More information on tags and keys can be found
    // here: http://geotiff.maptools.org/spec/geotiff6.html
    
    // Here we use Geo Keys to determine if we are using
    // a geographic coordinate system with the WGS 84 datum
    // a GTModelTypeGeoKey of 2 specifies a geographic
    // coordinate system, while the GeographicTypeGeoKey
    // references the wkid of the spatial reference.
    if (geoKeys.GTModelTypeGeoKey === 2 && geoKeys.GeographicTypeGeoKey === 4326) {
        
        // Here we get necessary information to do a transformation from the image
        // coordinate space to the geographic coordinate space. The origin is the
        // [long,lat] value of the top left corner, which is point [0,0] in the image
        // coordinate space. 
        let origin = image.getOrigin();
        let lng_0 = origin[0];
        let lat_0 = origin[1];

        // The cell width and cell height, measured in the image coordinate space, 
        // are found in the ModelPixelScale tag in the file directory. 
        let cell_width = fd.ModelPixelScale[0];
        let cell_height = fd.ModelPixelScale[1];

        // By normalizing the difference in latitude and longitude between the image
        // origin and the point geometry by the cell height and width respectively,
        // we can map the latitude and longitude of the point geometry in the
        // coordinate space to their associated pixel location in the image space.
        // Note that the y value is inverted to account for the inversion between the
        // coordinate and image spaces.
        let x = Math.floor(Math.abs(lng - lng_0) / cell_width);
        let y = Math.floor(Math.abs(lat_0 - lat) / cell_height);

        try {

            // The image pixel values are extracted from the geotiff using the built-in
            // readRasters function
            let values = image.readRasters({ window: [x, y, x + 1, y + 1]});

            // This ternary expression makes sure that if there is only one image band,
            // the value is returned as a single number. Otherwise, the values for all
            // bands are returned as an array.
            return values.length === 1 ? values[0][0] : values.map(value => value[0]);
        } catch(e) {
            throw e;
        }
    } else {
        throw 'Identification currently only works with geotiffs in WGS 84. Please reproject the geotiff';
    }
}

module.exports = identify;