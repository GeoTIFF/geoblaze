'use strict';

let expect = require('chai').expect;

let load = require('./index');

let url = 'http://geotiff.io/data/spam2005v2r0_physical-area_rice_total.tiff';
let properties = [
	'fileDirectory',
	'geoKeys',
	'dataView'
];

let test = () => (
	describe('Gio Load Feature', function() {
		describe('Load from URL', function() {
			this.timeout(1000000);
			it('Loaded tiff file', () => {
				return load(url).then(tiff => {
					let image = tiff.getImage();
					properties.forEach(property => {
						expect(image).to.have.property(property);
					});
					// done();
				});
			});
		});
	})
)

test();

module.exports = test;