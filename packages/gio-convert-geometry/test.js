'use strict';

let expect = require('chai').expect;
let gio_convert_geometry = require('./index');

let array_point = [102, 0.5];

let geojson_point_str = '{"type": "Point", "coordinates": [102.0, 0.5]}';
let geojson_point = JSON.parse(geojson_point_str);

let geojson_polygon_str = '{ "type": "Polygon", "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],[100.0, 1.0], [100.0, 0.0]]]}';
let geojson_polygon = JSON.parse(geojson_polygon_str);

let test_x_y_from_point_load = (feature) => {
	let point = gio_convert_geometry('point', feature);
	expect(point[0]).to.equal(102);
	expect(point[1]).to.equal(0.5);
}

try {
	gio_convert_geometry('hello world');
} catch(e) {
	console.error(e);
}

let test = () => {
	describe('Gio Convert Geometry Feature', () => {
		describe('Load point geometry', () => {
			it('Loaded from array', () => {
				test_x_y_from_point_load(array_point);
			});
			it('Loaded from geojson string', () => {
				test_x_y_from_point_load(geojson_point_str);
			});
			it('Loaded from geojson obj', () => {
				test_x_y_from_point_load(geojson_point);
			});
		})
	})
}

test();

module.exports = test;