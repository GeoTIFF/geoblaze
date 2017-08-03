'use strict';

let geotiff = require('geotiff');
let gio = require('../gio/index');

module.exports = (url_or_file) => (

	new Promise((resolve, reject) => {
		let url = url_or_file instanceof Blob ? URL.createObjectURL(url_or_file) : url;

		if (gio.cache.rasters[url]) {
			resolve(gio.cache.rasters[url]);
		} else {
			fetch(url).then(
				response => response.arrayBuffer(),
				error => {
					let domain = new URL(input_url).host;
                	console.error(
                		`Gio could not get the file from ${domain}.  
                		This is often because a website's security prevents cross domain requests.  
                		Download the file and load it manually.`
                	);
				}
			).then(buffer => {
				if (buffer) {
					let tiff = geotiff.parse(tiff);
					gio.cache.rasters[url] = tiff;
					resolve(tiff);
				}
			});
		}
	})
);

module.exports.meta = {
	name: 'Load GeoTIFF',
	desc: 'Load a GeoTIFF on to the map by adding a url or uploading a file.'
}