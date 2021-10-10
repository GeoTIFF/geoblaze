import parseGeoraster from "georaster";
import fetch from "cross-fetch";
import nodeUrl from "url";
import { ERROR_LOAD_FILE_OUTSIDE_BROWSER, ERROR_BAD_URL, ERROR_PARSING_GEOTIFF } from "../error-constants";
import cache from "../cache";

const inBrowser = typeof window === "object";

const URL = inBrowser ? window.URL : nodeUrl.parse;

async function toArrayBuffer(response) {
  try {
    if (response.arrayBuffer) {
      return response.arrayBuffer();
    } else if (response.buffer) {
      const buffer = await response.buffer();
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
  } catch (error) {
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
    console.error(error);
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

async function load(urlOrFile, { useCache = true } = { useCache: true }) {
  if (!inBrowser && typeof urlOrFile === "object") {
    throw new Error(ERROR_LOAD_FILE_OUTSIDE_BROWSER);
  }

  const url = typeof urlOrFile === "object" ? URL.createObjectURL(urlOrFile) : urlOrFile;

  const loadGeoRaster = async () => {
    const response = await fetchWithErrorHandling(url);
    const arrayBuffer = await toArrayBuffer(response);
    const georaster = await parseGeorasterWithErrorHandling(arrayBuffer);
    return georaster;
  };

  if (useCache) {
    if (!cache[url]) cache[url] = loadGeoRaster();
    return cache[url];
  } else {
    return loadGeoRaster();
  }
}

export default load;
