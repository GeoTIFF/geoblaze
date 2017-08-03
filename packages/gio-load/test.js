'use strict';

let expect = require('chai').expect;
let gio_load = require('./index');

let test = () => (
	describe('Gio Load Feature', () => {
		describe('Load from URL', () => {
			it('Loaded tiff file', () => {
				let url = 'geotiff.io/data/spam2005v2r0_physical-area_rice_total.tiff';
				gio_load(url).then(tiff => {
					let image = tiff.getImage();
					expect(image).to.have.property('fileDirectory');
					expect(image).to.have.property('geoKeys');
					expect(image).to.have.property('dataView');
				});
			});
		});
	})
)

test();

module.exports = test;