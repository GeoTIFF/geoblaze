'use strict';

let expect = require('chai').expect;

let load = require('../gio-load/index');
let identify = require('./index');

let url = 'http://localhost:3000/data/test.tiff';
let point = [80.63, 7.42];
let expected_value = 350.7;

let test = () => (
	describe('Gio Identify Feature', function() {
		describe('Identify Point in Raster', function() {
			this.timeout(1000000);
			it('Identified Point Correctly', () => {
				return load(url).then(tiff => {
					let image = tiff.getImage();
					let value = identify(image, point);
					expect(value).to.equal(expected_value);
				});
			});
		});
	})
)

test();

module.exports = test;