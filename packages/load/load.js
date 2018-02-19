'use strict';

const parse_georaster = require("georaster");

const in_browser = typeof window === 'object';
var fetch = in_browser ? window.fetch : require('node-fetch');
var URL = in_browser ? window.URL : require("url").parse;

const error_load_file_outside_browser = require('../../constants').ERROR_LOAD_FILE_OUTSIDE_BROSWER;
const error_bad_url = require('../../constants').ERROR_BAD_URL;
const error_parsing_geotiff = require('../../constants').ERROR_PARSING_GEOTIFF;

let cache = require('../cache/cache');

module.exports = (url_or_file) => (

  new Promise((resolve, reject) => {
    if (!in_browser && typeof url_or_file === 'object') {
      reject(new Error(error_load_file_outside_browser));
    }

    const url = typeof url_or_file === 'object' ? URL.createObjectURL(url_or_file) : url_or_file;

    if (cache[url]) {
      resolve(cache[url]);
    } else {
      fetch(url)
        .then(response => {
          if (response.ok) return in_browser ? response.arrayBuffer() : response.buffer()

          reject(new Error(error_bad_url));
        })
        .catch(e => reject(new Error(error_bad_url)))
        .then(b => {
          try {
            if (b) {
              let array_buffer;
              if (in_browser) {
                array_buffer = b;
              } else {
                array_buffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
              }
              parse_georaster(array_buffer).then(georaster => {
                cache[url] = georaster;
                resolve(georaster);
              });
            }
          } catch (e) {
            reject(new Error(error_parsing_geotiff));
          }
        });
    }
  })
);
