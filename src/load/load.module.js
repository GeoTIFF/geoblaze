import parseGeoraster from 'georaster';
import nodeFetch from 'node-fetch';
import nodeUrl from 'url';
import { ERROR_LOAD_FILE_OUTSIDE_BROWSER, ERROR_BAD_URL, ERROR_PARSING_GEOTIFF } from '../error-constants';
import cache from '../cache';

const inBrowser = typeof window === 'object';

const fetch = inBrowser ? window.fetch : nodeFetch;
const URL = inBrowser ? window.URL : nodeUrl.parse;

function toArrayBuffer(buffer) {
  try {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch (error) {
    console.log("buffer:", buffer);
    throw error;
  }
}

async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(ERROR_BAD_URL);
    }
    return response;
  } catch (error) {
    throw new Error(ERROR_BAD_URL);
  }
}

async function parseGeorasterWithErrorHandling(arrayBuffer) {
  try {
    return await parseGeoraster(arrayBuffer);
  } catch (error) {
    throw new Error(ERROR_PARSING_GEOTIFF);
  }
}

export async function load(urlOrFile) {

  if (!inBrowser && typeof urlOrFile === 'object') {
    throw new Error(ERROR_LOAD_FILE_OUTSIDE_BROWSER);
  }

  const url = typeof urlOrFile === 'object' ? URL.createObjectURL(urlOrFile) : urlOrFile;

  if (cache[url]) {
    return cache[url];
  } else {

    const response = await fetchWithErrorHandling(url);

    const arrayBuffer = inBrowser ? await response.arrayBuffer() : toArrayBuffer(await response.buffer());

    const georaster = await parseGeorasterWithErrorHandling(arrayBuffer);
    cache[url] = georaster;
    return georaster;
  }
};

export default load;
