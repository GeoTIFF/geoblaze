import utils from '../utils';

const convertPoint = geometry => {
  let point;
  if (Array.isArray(geometry) && geometry.length === 2) { // array
    point = geometry;
  } else if (typeof geometry === 'string') { // stringified geojson
    const geojson = JSON.parse(geometry);
    if (geojson.type === 'Point') {
      point = geojson.coordinates;
    }
  } else if (typeof geometry === 'object') { // geojson
    if (geometry.type === 'Point') {
      point = geometry.coordinates;
    }
  }

  if (!point) {
    throw `Invalid point object was used.
      Please use either a [lng, lat] array or GeoJSON point.`;
  }

  return point;
};

const convertBbox = geometry => {
  let bbox;
  if (utils.isBbox(geometry)) {
    if (typeof geometry.xmin !== 'undefined' && typeof geometry.ymax !== 'undefined') {
      bbox = geometry;
    }
    else if (Array.isArray(geometry) && geometry.length === 4) { // array
      bbox = { xmin: geometry[0], ymin: geometry[1], xmax: geometry[2], ymax: geometry[3] };
    } else if (typeof geometry === 'string') { // stringified geojson
      const geojson = JSON.parse(geometry);
      const coors = utils.getGeojsonCoors(geojson)[0];
      const lngs = coors.map(coor => coor[0]);
      const lats = coors.map(coor => coor[1]);
      bbox = { xmin: Math.min(...lngs), ymin: Math.min(...lats), xmax: Math.max(...lngs), ymax: Math.max(...lats) };
    } else if (typeof geometry === 'object') { // geojson
      const coors = utils.getGeojsonCoors(geometry)[0];
      const lngs = coors.map(coor => coor[0]);
      const lats = coors.map(coor => coor[1]);
      bbox = { xmin: Math.min(...lngs), ymin: Math.min(...lats), xmax: Math.max(...lngs), ymax: Math.max(...lats) };
    }
  }

  if (!bbox) {
    throw `Invalid bounding box object was used.
      Please use either a [xmin, ymin, xmax, ymax] array or GeoJSON polygon.`;
  }

  return bbox;
};

const convertPolygon = geometry => {
  let polygon;
  if (utils.isPolygon(geometry)) {
    if (Array.isArray(geometry)) { // array
      polygon = geometry;
    } else if (typeof geometry === 'string') { // stringified geojson
      const parsed = JSON.parse(geometry);
      const geojson = utils.convertToGeojsonIfNecessary(parsed);
      polygon = utils.getGeojsonCoors(geojson);
    } else if (typeof geometry === 'object') { // geojson
      const geojson = utils.convertToGeojsonIfNecessary(geometry);
      polygon = utils.getGeojsonCoors(geojson);
    }
  }

  if (!polygon) {
    throw `Invalild polygon object was used.
      Please use either a [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] array or GeoJSON polygon.`;
  }

  return polygon;
};

const convertGeometry = (typeOfGeometry, geometry) => {
  try {
    if (typeOfGeometry === 'point') {
      return convertPoint(geometry);
    } else if (typeOfGeometry === 'bbox') {
      return convertBbox(geometry);
    } else if (typeOfGeometry === 'polygon') {
      return convertPolygon(geometry);
    } else {
      throw 'Invalid geometry type was specified. Please use either "point" or "polygon"';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

export default convertGeometry;
