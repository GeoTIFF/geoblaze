'use strict';

let expect = require('chai').expect;
let gio_convert_geometry = require('./index');

let array_point = [102, 0.5];

let geojson_point_str = '{"type": "Point", "coordinates": [102.0, 0.5]}';
let geojson_point = JSON.parse(geojson_point_str);

let array_bbox = [100.0, 0.0, 101.0, 1.0];

let geojson_bbox_str = '{ "type": "Polygon", "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],[100.0, 1.0], [100.0, 0.0]]]}';
let geojson_bbox = JSON.parse(geojson_bbox_str);

let test_point_load = (feature) => {
	let point = gio_convert_geometry('point', feature);
	expect(point[0]).to.equal(102);
	expect(point[1]).to.equal(0.5);
}

let test_bbox_load = (feature) => {
	let bbox = gio_convert_geometry('bbox', feature);
	expect(bbox[0]).to.equal(100);
	expect(bbox[1]).to.equal(0);
	expect(bbox[2]).to.equal(101);
	expect(bbox[3]).to.equal(1);
}

let test = () => {
	describe('Gio Convert Geometry Feature', () => {
		describe('Load point geometry', () => {
			it('Loaded from array', () => {
				test_point_load(array_point);
			});
			it('Loaded from geojson string', () => {
				test_point_load(geojson_point_str);
			});
			it('Loaded from geojson obj', () => {
				test_point_load(geojson_point);
			});
		});

		describe('Load bbox geometry', () => {
			it('Loaded from array', () => {
				test_bbox_load(array_bbox);
			});
			it('Loaded from geojson string', () => {
				test_bbox_load(geojson_bbox_str);
			});
			it('Loaded from geosjon obj', () => {
				test_bbox_load(geojson_bbox);
			});
		});
	})
}

test();

module.exports = test;