import parseGeoraster from 'georaster';
import nodeFetch from 'node-fetch';
import nodeUrl from 'url';
import { ERROR_LOAD_FILE_OUTSIDE_BROWSER, ERROR_BAD_URL, ERROR_PARSING_GEOTIFF } from '../error-constants';
import cache from '../cache';

const inBrowser = typeof window === 'object';

const fetch = inBrowser ? window.fetch : nodeFetch;
const URL = inBrowser ? window.URL : nodeUrl.parse;

function toArrayBuffer (response) {
  try {
    if (response.arrayBuffer) {
      return response.arrayBuffer();
    } else if (response.buffer) {
      return response.buffer().then(buffer => {
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      });
    }
  } catch (error) {
    throw error;
  }
}

function fetchWithErrorHandling (url) {
  try {
    return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(ERROR_BAD_URL);
      }
      return response;
    })
    .catch(error => {
      throw new Error(ERROR_BAD_URL);
    });
  } catch (error) {
    throw new Error(ERROR_BAD_URL);
  }
}

function parseGeorasterWithErrorHandling (arrayBuffer) {
  try {
    return parseGeoraster(arrayBuffer);
  } catch (error) {
    throw new Error(ERROR_PARSING_GEOTIFF);
  }
}

function load (urlOrFile) {

  if (!inBrowser && typeof urlOrFile === 'object') {
    throw new Error(ERROR_LOAD_FILE_OUTSIDE_BROWSER);
  }

  const url = typeof urlOrFile === 'object' ? URL.createObjectURL(urlOrFile) : urlOrFile;

  if (!cache[url]) {
    cache[url] = fetchWithErrorHandling(url)
    .then(toArrayBuffer)
    .then(parseGeorasterWithErrorHandling);
  }
  return cache[url];
}

export default load;
