'use strict';

let convert_point = (geometry) => {
	let point;
	if (Array.isArray(geometry) && geometry.length === 2) { // array
		point = geometry;
	} else if (typeof geometry === 'string') { // stringified geojson
		let geojson = JSON.parse(geometry);
		if (geojson.type === 'Point') {
			point = geojson.coordinates;
		}
	} else if (typeof geometry === 'object') { // geojson
		if (geometry.type === 'Point') {
			point = geometry.coordinates;
		}
	}

	if (!point) {
		throw 'Invalid point object was used. Please use either a [lng, lat] array or GeoJSON point.';
	}

	return point;
}

module.exports = (type_of_geometry, geometry) => {
	try {
		if (type_of_geometry === 'point') {
			return convert_point(geometry);
		} else {
			throw 'Invalid geometry type was specified. Please use either "point" or "polygon"';
		}
	} catch(e) {
		console.error(e);
	}
}