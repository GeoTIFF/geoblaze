'use strict';

let load = require('../gio-load/index');
let convert_geometry = require('../gio-convert-geometry/index');

module.exports = (image, geometry) => {
		
	// convert point
	let point = convert_geometry('point', geometry);
	let lng = point[0];
	let lat = point[1];

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

		// map lat/lng values to image coordinate space
		let x = Math.floor(Math.abs(lng - lng_0) / cell_width);
		let y = Math.floor(Math.abs(lat_0 - lat) / cell_height);

		try {

			// get value
			let values = image.readRasters({ window: [x, y, x + 1, y + 1]});
			return values.length === 1 ? values[0][0] : values.map(value => value[0]);
		} catch(e) {
			throw e;
		}
	} else {
		throw 'Identification currently only works with geotiffs in WGS 84. Please reproject the geotiff';
	}
}