'use strict';

let _ = require('underscore');

let utils = require('../utils/utils');

// let turf = require('@turf/turf');

let convert_point = geometry => {
    let point;
    if (Array.isArray(geometry) && geometry.length === 2) { // array
        point = geometry;
    } else if (typeof geometry === 'string') { // stringified geojson
        let geojson = JSON.parse(geometry);
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
}

let convert_bbox = geometry => {
    let bbox;
    if (utils.is_bbox(geometry)) {
        if (typeof geometry.xmin !== "undefined" && typeof geometry.ymax !== "undefined") {
            bbox = geometry;
        }
        else if (Array.isArray(geometry) && geometry.length === 4) { // array
            bbox = { xmin: geometry[0], ymin: geometry[1], xmax: geometry[2], ymax: geometry[3] };
        } else if (typeof geometry === 'string') { // stringified geojson
            let geojson = JSON.parse(geometry);
            let coors = utils.get_geojson_coors(geojson)[0];
            let lngs = coors.map(coor => coor[0]);
            let lats = coors.map(coor => coor[1]);
            bbox = { xmin: Math.min(...lngs), ymin: Math.min(...lats), xmax: Math.max(...lngs), ymax: Math.max(...lats) };
        } else if (typeof geometry === 'object') { // geojson
            let coors = utils.get_geojson_coors(geometry)[0];
            let lngs = coors.map(coor => coor[0]);
            let lats = coors.map(coor => coor[1]);
            bbox = { xmin: Math.min(...lngs), ymin: Math.min(...lats), xmax: Math.max(...lngs), ymax: Math.max(...lats) };
        }
    }
        
    if (!bbox) {
        throw `Invalid bounding box object was used. 
            Please use either a [xmin, ymin, xmax, ymax] array or GeoJSON polygon.`
    }

    return bbox;
}

let convert_polygon = geometry => {
    let polygon;
    if (utils.is_polygon(geometry)) {
        if (Array.isArray(geometry)) { // array
            polygon = geometry;
        } else if (typeof geometry === 'string') { // stringified geojson
            let geojson = JSON.parse(geometry);
            polygon = utils.get_geojson_coors(geojson);
        } else if (typeof geometry === 'object') { // geojson
            polygon = utils.get_geojson_coors(geometry);
        }
    }

    if (!polygon) {
        throw `Invalild polygon object was used.
            Please use either a [[[x00,y00],...,[x0n,y0n],[x00,y00]]...] array or GeoJSON polygon.`
    }

    return polygon;
}

module.exports = (type_of_geometry, geometry) => {
    try {
        if (type_of_geometry === 'point') {
            return convert_point(geometry);
        } else if (type_of_geometry === 'bbox') {
            return convert_bbox(geometry);
        } else if (type_of_geometry === 'polygon') {
            return convert_polygon(geometry);
        } else {
            throw 'Invalid geometry type was specified. Please use either "point" or "polygon"';
        }
    } catch(e) {
        console.error(e);
        throw e;
    }
}
