'use strict';

let parse_georaster = require("georaster");

let in_browser = typeof window === 'object';
var fetch = in_browser ? window.fetch : require('node-fetch');
var URL = in_browser ? window.URL : require("url").parse;

let cache = require('../gio-cache/cache');

module.exports = (url_or_file) => (

    new Promise((resolve, reject) => {
        if (!in_browser && typeof url_or_file === 'object') {
            throw `Direct raster loading is currently not supported outside of the browser
                due to dependency limitations. Please use either a url or run the code 
                in the browser.`
        }

        let url = typeof url_or_file === 'object' ? URL.createObjectURL(url_or_file) : url_or_file;
        //console.log("url:", url);

        if (cache[url]) {
            resolve(cache[url]);
        } else {
            fetch(url).then(
                response => in_browser ? response.arrayBuffer() : response.buffer() ,
                error => {
                    let domain = new URL(url).host;
                    let error_message = `Gio could not get the file from ${domain}.  
                        This is often because a website's security prevents cross domain requests.  
                        Download the file and load it manually.`;
                    console.error(error_message);
                    reject(error_message);
                }
            ).then(b => {
                //console.log("b:", b);
                if (b) {
                    let array_buffer;
                    if (in_browser) {
                        array_buffer = b;
                    } else {
                        array_buffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
                    }
                    parse_georaster(array_buffer).then(georaster => {
                        cache[url] = georaster;
                        //console.log("resolving:", georaster);
                        resolve(georaster);
                    });
                }
            });
        }
    })
);
