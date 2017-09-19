'use strict';

let _ = require('underscore');

module.exports = {

	is_bbox(geometry) {

		// check if we are using the gio format and return true right away if so
		if (Array.isArray(geometry) && geometry.length === 4) { // array 
			return true;
		}

		// convert possible inputs to a list of coordinates
		let coors;
		if (typeof geometry === 'string') { // stringified geojson
			let geojson = JSON.parse(geometry);
			coors = geojson.coordinates[0];
		} else if (typeof geometry === 'object') { // geojson
			coors = geometry.coordinates[0];
		} else {
			return false;
		}

		// check to make sure coordinates make up a bounding box
		if (coors.length === 5 && _.isEqual(coors[0], coors[4])) {
			let lngs = coors.map(coor => coor[0]);
			let lats = coors.map(coor => coor[1]);
			if (lngs[0] === lngs[3] && lats[0] === lats[1] && lngs[1] === lngs[2]) {
				return true;
			}
		}
		return false;
	},

	get_no_data_value(image) {

		// so far haven't found a reason not to return as an integer
		return parseInt(image.fileDirectory.GDAL_NODATA);
	}
}