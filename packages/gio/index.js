'use strict';

let cache = {
	rasters: {}
}

let gio = {
	cache: cache,
	load: require('../gio-load/index.js'),
	
};

module.exports = gio;