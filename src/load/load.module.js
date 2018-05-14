import parseGeoraster from 'georaster';
import nodeFetch from 'node-fetch';
import nodeUrl from 'url';
import { ERROR_LOAD_FILE_OUTSIDE_BROWSER, ERROR_BAD_URL, ERROR_PARSING_GEOTIFF } from '../error-constants';
import cache from '../cache';

const inBrowser = typeof window === 'object';

const fetch = inBrowser ? window.fetch : nodeFetch;
const URL = inBrowser ? window.URL : nodeUrl.parse;

const load = urlOrFile => {
  return new Promise((resolve, reject) => {
    if (!inBrowser && typeof urlOrFile === 'object') {
      reject(new Error(ERROR_LOAD_FILE_OUTSIDE_BROWSER));
    }

    const url = typeof urlOrFile === 'object' ? URL.createObjectURL(urlOrFile) : urlOrFile;

    if (cache[url]) {
      resolve(cache[url]);
    } else {
      fetch(url)
        .then(response => {
          if (response.ok) return inBrowser ? response.arrayBuffer() : response.buffer();

          reject(new Error(ERROR_BAD_URL));
        })
        .catch(e => reject(new Error(ERROR_BAD_URL)))
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
              }, error => reject(new Error(ERROR_PARSING_GEOTIFF)));
            }
          } catch (e) {
            reject(new Error(ERROR_PARSING_GEOTIFF));
          }
        });
    }
  });
};

export default load;
