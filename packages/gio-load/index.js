'use strict';

let geotiff = require('geotiff');

let in_browser = typeof window === 'object';
var fetch = in_browser ? window.fetch : require('node-fetch');

let cache = require('../gio-cache/index');



module.exports = (url_or_file) => (

	new Promise((resolve, reject) => {
		console.error(url_or_file);	
		if (!in_browser && typeof url_or_file === 'object') {
			throw `Direct TIFF loading is currently not supported outside of the browser
				due to dependency limitations. Please use either a url or run the code 
				in the browser.`
		}

		let url = typeof url_or_file === 'object' ? URL.createObjectURL(url_or_file) : url_or_file;

		if (cache[url]) {
			resolve(cache[url]);
		} else {
			fetch(url).then(
				response => in_browser ? response.arrayBuffer() : response.buffer() ,
				error => {
					let domain = new URL(url).host;
                	console.error(
                		`Gio could not get the file from ${domain}.  
                		This is often because a website's security prevents cross domain requests.  
                		Download the file and load it manually.`
                	);
				}
			).then(b => {
				if (b) {
					let array_buffer;
					if (in_browser) {
						array_buffer = b;
					} else {
						array_buffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
					}
					let tiff = geotiff.parse(array_buffer);
					cache[url] = tiff;
					resolve(tiff);
				}
			});
		}
	})
);