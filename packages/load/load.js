'use strict';

const parseGeoraster = require("georaster");

const inBrowser = typeof window === 'object';
var fetch = inBrowser ? window.fetch : require('node-fetch');
var URL = inBrowser ? window.URL : require("url").parse;

const errorLoadFileOutsideBrowser = require('../../constants').ERROR_LOAD_FILE_OUTSIDE_BROSWER;
const errorBadURL = require('../../constants').ERROR_BAD_URL;
const errorParsingGeotiff = require('../../constants').ERROR_PARSING_GEOTIFF;

let cache = require('../cache/cache');

/**
 * The load function takes a url to a geotiff or geotiff file as an input
 * and returns a promise. The promise resolves as a georaster, which
 * can be used as input in other geoblaze methods, such as identify, sum,
 * or histogram.
 * @name load
 * @param {Object|string} urlOrFile - a string representation of a url or a geotiff file
 * @example
 * const sums = geoblaze.load(urlOrFile).then(georaster => sum(georaster, geometry));
 */
function load(urlOrFile) {
  return new Promise((resolve, reject) => {
    if (!inBrowser && typeof urlOrFile === 'object') {
      reject(new Error(errorLoadFileOutsideBrowser));
    }

    const url = typeof urlOrFile === 'object' ? URL.createObjectURL(urlOrFile) : urlOrFile;

    if (cache[url]) {
      resolve(cache[url]);
    } else {
      fetch(url)
        .then(response => {
          if (response.ok) return inBrowser ? response.arrayBuffer() : response.buffer()

          reject(new Error(errorBadURL));
        })
        .catch(e => reject(new Error(errorBadURL)))
        .then(b => {
          try {
            if (b) {
              let arrayBuffer;
              if (inBrowser) {
                arrayBuffer = b;
              } else {
                arrayBuffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
              }
              parseGeoraster(arrayBuffer).then(georaster => {
                cache[url] = georaster;
                resolve(georaster);
              }, error => reject(new Error(error_parsing_geotiff)));
            }
          } catch (e) {
            reject(new Error(errorParsingGeotiff));
          }
        });
    }
  });
}

module.exports = load;
