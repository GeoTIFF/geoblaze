import fetch from "cross-fetch";
import mpoly from "mpoly";
import ArcGIS from "terraformer-arcgis-parser";
import booleanRectangle from "bbox-fns/boolean-rectangle.js";
import validate from "bbox-fns/validate.js";

function fetchJson(url) {
  return fetch(url).then(response => response.json());
}

function fetchJsons(urls) {
  try {
    return Promise.all(urls.map(fetchJson));
  } catch (error) {
    console.log("[geoblaze] fetchJsons failed because of the following error:", error);
    throw error;
  }
}

function roundDown(n) {
  return -1 * Math.round(-1 * n);
}

const utils = {
  convertToGeojsonIfNecessary(input, debug = false) {
    if (this.isEsriJson(input, debug)) {
      return this.toGeoJSON(input, debug);
    } else {
      return input;
    }
  },

  convertCrsBboxToImageBbox(georaster, crsBbox) {
    let crsXMin, crsYMin, crsXMax, crsYMax;
    if (typeof crsBbox.xmin !== "undefined") {
      crsXMin = crsBbox.xmin;
      crsYMin = crsBbox.ymin;
      crsXMax = crsBbox.xmax;
      crsYMax = crsBbox.ymax;
    } else if (Array.isArray(crsBbox) && crsBbox.length === 4) {
      // pull out bounding box values
      crsXMin = crsBbox[0];
      crsYMin = crsBbox[1];
      crsXMax = crsBbox[2];
      crsYMax = crsBbox[3];
    }

    // map bounding box values to image coordinate space
    /* yMin uses latMax while yMax uses latMin because the image coordinate
    system is inverted along the y axis relative to the lat/long (geographic)
    coordinate system */
    return {
      xmin: roundDown((crsXMin - georaster.xmin) / georaster.pixelWidth),
      ymin: roundDown((georaster.ymax - crsYMax) / georaster.pixelHeight),
      xmax: Math.round((crsXMax - georaster.xmin) / georaster.pixelWidth),
      ymax: Math.round((georaster.ymax - crsYMin) / georaster.pixelHeight)
    };
  },

  isBbox(geom, debug = false) {
    if (typeof geom === "string") geom = JSON.parse(geom);

    if (geom === undefined || geom === null) {
      if (debug) console.log("[geoblaze/src/utils/isBbox] geom is undefined or null");
      return false;
    }

    // check if we are using the geoblaze format and return true right away if so
    if (geom.xmin !== undefined && geom.xmax !== undefined && geom.ymax !== undefined && geom.ymin !== undefined) {
      if (debug) console.log("[geoblaze/src/utils/isBbox] geom is bbox object");
      return true;
    }

    // bbox in form [xmin, ymin, xmax, ymax]
    if (Array.isArray(geom) && validate(geom)) {
      if (debug) console.log("[geoblaze/src/utils/isBbox] geom is valid bbox");
      return true;
    }

    const coords = mpoly.get(geom);

    if (booleanRectangle(coords)) return true;

    return false;
  },

  isEsriJson(input, debug = false) {
    if (debug) console.log("starting isEsriJson with", input);

    if (typeof input === "undefined") return false;

    const obj = typeof input === "string" ? JSON.parse(input) : typeof input === "object" ? input : null;
    const geometry = obj.geometry ? obj.geometry : obj;
    if (geometry) {
      if (geometry.rings || (geometry.x && geometry.y)) {
        try {
          if (ArcGIS.parse(obj)) {
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  },

  isGeoJSON(input) {
    if (typeof input === "undefined") return false;
    if (input === null) return false;
    return !utils.isEsriJson(input) && ["FeatureCollection", "Feature", "Polygon", "MultiPolygon"].includes(input.type);
  },

  toGeoJSON(input, debug = false) {
    const parsed = ArcGIS.toGeoJSON(input);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  },

  // checks if bbox in form { xmin: 20, xmax: 32, ymin: -3, ymax: 0 }
  isBboxObj(geometry) {
    return (
      typeof geometry === "object" &&
      Array.isArray(geometry) === false &&
      typeof geometry.xmin === "number" &&
      typeof geometry.xmax === "number" &&
      typeof geometry.ymin === "number" &&
      typeof geometry.ymax === "number"
    );
  },

  isPolygonal(geometry) {
    const polys = mpoly.get(geometry);

    if (polys.length === 0) return false;

    // make sure first and last point are the same on each ring
    for (let p = 0; p < polys.length; p++) {
      const poly = polys[p];
      for (let r = 0; r < poly.length; r++) {
        const ring = poly[r];
        const [xStart, yStart] = ring[0];
        const [xEnd, yEnd] = ring[ring.length - 1];
        if (xStart !== xEnd || yStart !== yEnd) {
          return false;
        }
      }
    }

    return true;
  },

  fetchJson,

  fetchJsons,

  getConstructorName(obj) {
    try {
      if (typeof obj === "object" && typeof obj.constructor === "function" && typeof obj.constructor.name === "string") {
        return obj.constructor.name;
      }
    } catch (error) {
      return undefined;
    }
  },

  sum(values) {
    return values.reduce((a, b) => a + b);
  },

  isPromise(it) {
    return typeof it === "object" && typeof it.then === "function";
  },

  isSync(it) {
    return !this.isPromise(it);
  },

  listVariables(numVariables) {
    return [...Array(numVariables)].map((val, i) => String.fromCharCode(i + 65).toLowerCase());
  },

  round(n) {
    return Number(n.toFixed(2));
  },

  callAfterResolveArgs(func, ...rest) {
    if (rest.some(this.isPromise)) {
      return Promise.all(rest).then(vals => func(...vals));
    } else {
      return func(...rest);
    }
  },

  range(start, stop, step = 1) {
    const results = [];
    for (let i = start; step < 0 ? i > stop : i < stop; i += step) {
      results.push(i);
    }
    return results;
  },

  roundDown
};

export default utils;
