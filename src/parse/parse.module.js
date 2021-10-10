import parseGeoRaster from "georaster";
import nodeUrl from "url";
import { ERROR_PARSING_GEOTIFF } from "../error-constants";
import cache from "../cache";
import utils from "../utils";

const inBrowser = typeof window === "object";

const URL = inBrowser ? window.URL : nodeUrl.parse;

async function parseGeorasterWithErrorHandling(it, { logErrors = true } = { logErrors: true }) {
  try {
    return await parseGeoRaster(it);
  } catch (error) {
    if (logErrors) console.error(error);
    throw new Error(ERROR_PARSING_GEOTIFF);
  }
}

export default async function parse(it, { logErrors = true, useCache = true } = { logErrors: true, useCache: true }) {
  if (["Blob", "File"].includes(utils.getConstructorName(it))) it = URL.createObjectURL(it);

  if (useCache && typeof it === "string") {
    if (!cache[it]) cache[it] = parseGeorasterWithErrorHandling(it, { logErrors });
    return await cache[it];
  } else {
    return await parseGeorasterWithErrorHandling(it);
  }
}
