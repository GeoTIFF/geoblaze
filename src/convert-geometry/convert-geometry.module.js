import calc from "bbox-fns/calc.js";
import mpoly from "mpoly";
import validate from "bbox-fns/validate.js";
import utils from "../utils";

export function convertPoint(geom) {
  if (typeof geom === "string") geom = JSON.parse(geom);

  let point;
  if (Array.isArray(geom) && geom.length === 2 && typeof geom[0] === "number" && typeof geom[1] === "number") {
    // [x, y] point
    point = geom;
  } else if (typeof geom === "object") {
    if (/Point/i.test(geom.type)) {
      point = geom.coordinates;
    }
  }

  if (!point) {
    throw "Invalid point object was used. Please use either a [lng, lat] array or GeoJSON point.";
  }

  return point;
}

/**
 * @private
 * @param {convertBbox} geom
 * @returns {Object} bbox in form { xmin, ymin, xmax, ymax }
 */
export function convertBbox(geom) {
  if (typeof geom === "string") geom = JSON.parse(geom);

  let bbox;

  if (utils.isBbox(geom)) {
    if (typeof geom.xmin !== "undefined" && typeof geom.ymax !== "undefined") {
      bbox = geom;
    } else if (validate(geom)) {
      const [xmin, ymin, xmax, ymax] = geom;
      bbox = { xmin, ymin, xmax, ymax };
    } else if (typeof geom === "object") {
      const [xmin, ymin, xmax, ymax] = calc(geom);
      bbox = { xmin, ymin, xmax, ymax };
    }
  }

  if (!bbox) {
    throw "Invalid bounding box object was used. Please use either a [xmin, ymin, xmax, ymax] array or GeoJSON polygon.";
  }

  return bbox;
}

export function convertMultiPolygon(geom) {
  const ERROR_MESSAGE = "Invalild polygonal object was used.  Please use a GeoJSON polygon.";

  const polys = mpoly.get(geom);

  if (polys.length === 0) throw new Error(ERROR_MESSAGE);

  return polys;
}

export default function convertGeometry(typeOfGeometry, geometry) {
  try {
    if (typeOfGeometry === "point") {
      return convertPoint(geometry);
    } else if (typeOfGeometry === "bbox") {
      return convertBbox(geometry);
    } else if (typeOfGeometry === "multi-polygon") {
      return convertMultiPolygon(geometry);
    } else {
      throw 'Invalid geometry type was specified. Please use either "bbox", "multi-polygon", or "point".';
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
