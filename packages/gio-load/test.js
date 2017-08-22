'use strict';

let expect = require('chai').expect;

let load = require('./index');

let path = 'http://geotiff.io/data/test.tiff';

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
				return load(path).then(tiff => {
					let image = tiff.getImage();
					properties.forEach(property => {
						expect(image).to.have.property(property);
					});
				});
			});
		});
	})
)

test();

module.exports = test;