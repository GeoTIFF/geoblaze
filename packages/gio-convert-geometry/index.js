'use strict';

let is_bbox = require('../gio-utils/index').is_bbox;

let convert_point = geometry => {
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
		throw `Invalid point object was used.
			Please use either a [lng, lat] array or GeoJSON point.`;
	}

	return point;
}

let convert_bbox = geometry => {
	let bbox;
	if (is_bbox(geometry)) {
		if (Array.isArray(geometry) && geometry.length === 4) { // array
			bbox = geometry;
		} else if (typeof geometry === 'string') { // stringified geojson
			let geojson = JSON.parse(geometry);
			let coors = geojson.coordinates[0];
			if (geojson.type === 'Polygon') {
				let lngs = coors.map(coor => coor[0]);
				let lats = coors.map(coor => coor[1]);
				bbox = [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
			}
		} else if (typeof geometry === 'object') { // geojson
			let coors = geometry.coordinates[0];
			if (geometry.type === 'Polygon') {
				let lngs = coors.map(coor => coor[0]);
				let lats = coors.map(coor => coor[1]);
				bbox = [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
			}
		}
	}
		

	if (!bbox) {
		throw `Invalid bounding box object was used. 
			Please use either a [xmin, ymin, xmax, ymax] array or GeoJSON polygon.`
	}

	return bbox;
}

module.exports = (type_of_geometry, geometry) => {
	try {
		if (type_of_geometry === 'point') {
			return convert_point(geometry);
		} else if (type_of_geometry === 'bbox') {
			return convert_bbox(geometry);
		} else {
			throw 'Invalid geometry type was specified. Please use either "point" or "polygon"';
		}
	} catch(e) {
		console.error(e);
	}
}