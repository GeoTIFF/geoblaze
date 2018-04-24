'use strict';

let _ = require('underscore');

let combine = require('@turf/combine');

let polygon = require("@turf/helpers").polygon;

let inBrowser = typeof window === 'object';
let fetch = inBrowser ? window.fetch : require('node-fetch');

let ArcGIS = require('terraformer-arcgis-parser');

function fetchJson(url) {
  return fetch(url).then(response => response.json());
}

function fetchJsons(urls, debug=false) {
  if (debug) console.log("starting fetchJsons with", urls);
  try {
    return Promise.all(urls.map(fetchJson));
  } catch (error) {
    console.error("urls:", urls);
    console.error(error);
    throw error;
  }
}

/*
  Runs on each value in a table,
  represented by an array of rows.
*/
function runOnTableOfValues(table, noDataValue, runOnValues) {
  let numberOfRows = table.length;
  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    let row = table[rowIndex];
    let numberOfCells = row.length;
    for (let columnIndex = 0; columnIndex < numberOfCells; columnIndex++) {
      let value = row[columnIndex];
      if (value !== noDataValue) {
        runOnValues(value);
      }
    }
  }
}

function getBoundingBox(geometry) {

  let xmin, ymin, xmax, ymax;

  if (typeof(geometry[0][0]) === "number") {
    let numberOfPoints = geometry.length;
    xmin = xmax = geometry[0][0];
    ymin = ymax = geometry[0][1];
    for (let i = 1; i < numberOfPoints; i++) {
      let [x, y] = geometry[i];
      if (x < xmin) xmin = x;
      else if (x > xmax) xmax = x;
      if (y < ymin) ymin = y;
      else if (y > ymax) ymax = y;
    }
  } else {
    let bboxes = geometry.forEach((part, index) => {
      let bbox = getBoundingBox(part);
      if (index == 0) {
        xmin = bbox.xmin;
        xmax = bbox.xmax;
        ymin = bbox.ymin;
        ymax = bbox.ymax;
      } else {
        if (bbox.xmin < xmin) xmin = bbox.xmin;
        else if (bbox.xmax > xmax) xmax = bbox.xmax;
        if (bbox.ymin < ymin) ymin = bbox.ymin;
        else if (bbox.ymax > ymax) ymax = bbox.ymax;
      }
    });
  }

  return { xmin, ymin, xmax, ymax };
}

function cluster(items, newClusterTest) {
  try {
    let numberOfItems = items.length;
    let clusters = [];
    let cluster = [];
    for (let i = 0; i < numberOfItems; i++) {
      let item = items[i];
      cluster.push(item);
      if (newClusterTest(item)) {
        clusters.push(cluster);
        cluster = [];
      }
    }

    if (cluster.length > 0) clusters.push(cluster);

    return clusters;
  } catch (error) {
    console.error("[cluster]:", error);
  }
}

function clusterLineSegments(lineSegments, numberOfEdges, debug=false) {

  try {

    let clusters = cluster(lineSegments, s => s.endsOffLine);

    let numberOfClusters = clusters.length;

    if (debug) console.log("numberOfClusters", numberOfClusters);

    if (numberOfClusters >= 2) {

      let firstCluster = clusters[0];
      let firstSegment = firstCluster[0];
      let lastCluster = _.last(clusters);
      let lastSegment = _.last(lastCluster);

      if (
        lastSegment.index === numberOfEdges - 1
        && firstSegment.index === 0
        && lastSegment.endsOnLine
      ) {
        clusters[0] = clusters.pop().concat(firstCluster);
      }

    }

    return clusters;

  } catch (error) {
    console.error("[clusterLineSegments]", error);
  }

}

module.exports = {

  /*
   * This function takes in an array with an even number of elements and returns an array that couples every two consecutive elements;
   * @name
   * @param {Object} array of anything
   * @returns {Object} array of consecutive pairs
   * @example
   * let items = [0, 1, 18, 77, 99, 103];
   * let unflattened = utils.couple(items);
   * // unflattened
   * // [ [0, 1], [18, 77], [99, 103] ]
  */
  couple(array) {
    let couples = [];
    let lengthOfArray = array.length;
    for (let i = 0; i < lengthOfArray; i+=2) {
      couples.push([ array[i], array[i+1] ]);
    }
    return couples;
  },

  forceWithin(n, min, max) {
    if (n < min) n = min;
    else if (n > max) n = max;
    return n;
  },

  runOnTableOfValues,


  /*
   * This function categorizes an intersection
   * @name
   * @param {Object} edges
  */
  categorizeIntersection(segments) {
    try {


      let through, end, xmin, xmax;

      let n = segments.length;

      let first = segments[0];

      if (n === 1) {
        through = true;
        xmin = first.xmin;
        xmax = first.xmax;
      } else /* n > 1 */ {
        let last = segments[n - 1];
        through = first.direction === last.direction;
        xmin = Math.min(first.xmin, last.xmin);
        xmax = Math.max(first.xmax, last.xmax);
      }

      if (xmin === undefined || xmax === undefined || through === undefined || isNaN(xmin) || isNaN(xmax)) {
        throw Error("categorizeIntersection failed with xmin", xmin, "and xmax", xmax);
      }

      return { xmin, xmax, through };
    } catch (error) {
      console.error("[categorizeIntersection] segments:", segments);
      console.error("[categorizeIntersection]", error);
      throw error;
    }

  },

  convertToGeojsonIfNecessary(input, debug=false) {
    if (this.isEsriJson(input, debug)) {
      return this.toGeoJSON(input, debug);
    } else {
      return input;
    }
  },

  countValuesInTable(table, noDataValue) {
    let counts = {};
    runOnTableOfValues(table, noDataValue, value => {
      if (value in counts) counts[value]++;
      else counts[value] = 1;
    });
    return counts;
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
      xmin: Math.floor((crsXMin - georaster.xmin) / georaster.pixelWidth),
      ymin: Math.floor((georaster.ymax - crsYMax) / georaster.pixelHeight),
      xmax: Math.ceil((crsXMax - georaster.xmin) / georaster.pixelWidth),
      ymax: Math.ceil((georaster.ymax - crsYMin) / georaster.pixelHeight)
    };
  },

  getGeojsonCoors(geojson, debug=false) {
    let result;
    if (geojson.features) { // for feature collections

      // make sure that if any polygons are overlapping, we get the union of them
      geojson = combine(geojson);

      // turf adds extra arrays when running combine, so we need to remove them
      // as we return the coordinates
      result = geojson.features[0].geometry.coordinates
        .map(coors => coors[0]);
    } else if (geojson.geometry) { // for individual feature
      result = geojson.geometry.coordinates;
    } else if (geojson.coordinates) { // for just the geometry
      result = geojson.coordinates;
    }
    return result;
  },

  isBbox(geometry) {

    if (geometry === undefined || geometry === null) {
      return false;
    }

    // check if we are using the geoblaze format and return true right away if so
    if (geometry.xmin !== undefined && geometry.xmax !== undefined && geometry.ymax !== undefined && geometry.ymin !== undefined) {
      return true;
    }

    if ((Array.isArray(geometry) && geometry.length === 4)) { // array
      return true;
    }

    // convert possible inputs to a list of coordinates
    let coors;
    if (typeof geometry === 'string') { // stringified geojson
      let geojson = JSON.parse(geometry);
      let geojsonCoors = this.getGeojsonCoors(geojson);
      if (geojsonCoors.length === 1 && geojsonCoors[0].length === 5) {
        coors = geojsonCoors[0];
      }
    } else if (typeof geometry === 'object') { // geojson
      let geojsonCoors = this.getGeojsonCoors(geometry);
      if (geojsonCoors) coors = geojsonCoors[0];
    } else {
      return false;
    }

    // check to make sure coordinates make up a bounding box
    if (coors && coors.length === 5 && _.isEqual(coors[0], coors[4])) {
      let lngs = coors.map(coor => coor[0]);
      let lats = coors.map(coor => coor[1]);
      if (lngs[0] === lngs[3] && lats[0] === lats[1] && lngs[1] === lngs[2]) {
        return true;
      }
    }
    return false;
  },

  getDepth(geometry) {
    let depth = 0;
    let part = geometry;
    while (Array.isArray(part)) {
      depth++;
      part = part[0];
    }
    return depth;
  },

  /*
   * This function takes in an array of number pairs and combines where there's overlap
   * @name
   * @param {Object} array of anything
   * @returns {Object} array of index ranges
   * @example
   * let ranges = [ [0, 10], [10, 10], [20, 30], [30, 40] ];
   * let mergedRanges = utils.mergeRanges(ranges);
   * // mergedRanges
   * // [ [0, 10], [20, 40] ]
  */
  mergeRanges(ranges) {
    let numberOfRanges = ranges.length;
    if (numberOfRanges > 0) {
      let firstRange = ranges[0];
      let previousEnd = firstRange[1];
      let previousStart = firstRange[0];
      let result = [firstRange];
      for (let i = 1; i < numberOfRanges; i++) {
        let tempRange = ranges[i];
        let [start, end] = tempRange;
        if (start <= previousEnd) {
          result[result.length - 1][1] = end;
        } else {
          result.push(tempRange);
        }
        previousEnd = end;
        previousStart = start;
       }
       return result;
    }
  },

  isEsriJson(input, debug=false) {
    if (debug) console.log("starting isEsriJson with", input);
    let inputType = typeof input;
    let obj = inputType === "string" ? JSON.parse(input) : inputType === "object" ? input : null;
    let geometry = obj.geometry ? obj.geometry : obj;
    if (geometry) {
      if (geometry.rings || (geometry.x && geometry.y)) {
        try {
          if(ArcGIS.parse(obj)) {
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

  toGeoJSON(input, debug=false) {
    let parsed = ArcGIS.toGeoJSON(input);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  },

  isPolygon(geometry, debug=false) {

    // convert to a geometry
    let coors;
    if (Array.isArray(geometry)) {
      coors = geometry;
    } else if (typeof geometry === 'string') {
      let parsed = JSON.parse(geometry);
      let geojson = this.convertToGeojsonIfNecessary(parsed, debug);
      coors = this.getGeojsonCoors(geojson, debug);
    } else if (typeof geometry === 'object') {
      let geojson = this.convertToGeojsonIfNecessary(geometry, debug);
      coors = this.getGeojsonCoors(geojson, debug);
    }

    if (coors) {

      // iterate through each geometry and make sure first and
      // last point are the same

      let depth = this.getDepth(coors);
      if (debug) console.log("depth:", depth);
      if (depth === 4) {
        return coors.map(() => this.isPolygon).every(Boolean);
      } else if (depth === 3) {
        let isPolygonArray = true;
        coors.forEach(part => {
          let firstVertex = part[0];
          let lastVertex = part[part.length - 1]
          if (firstVertex[0] !== lastVertex[0] || firstVertex[1] !== lastVertex[1]) {
            isPolygonArray = false;
          }
        });
        return isPolygonArray;
      }
    } else {
      return false;
    }
  },

  fetchJson,

  fetchJsons,

  getBoundingBox,

  // function to convert two points into a
  // representation of a line
  getLineFromPoints(startPoint, endPoint) {

    // get a, b, and c from line equation ax + by = c
    let x1 = startPoint[0],
      x2 = endPoint[0],
      y1 = startPoint[1],
      y2 = endPoint[1];
    let a = y2 - y1;
    let b = x1 - x2;
    let c = a * x1 + b * y1

    // return just a b and c since that is all we need
    // to compute the intersection
    return { a, b, c };
  },

  // function to get the point at which two lines intersect
  // the input uses the line representations from the
  // getLineFromPoints function
  getIntersectionOfTwoLines(line1, line2) {

    // calculate the determinant, ad - cb in a square matrix |a b|
    let det = line1.a * line2.b - line2.a * line1.b; /*  |c d| */

    if (det) { // this makes sure the lines aren't parallel, if they are, det will equal 0
      let x = (line2.b * line1.c - line1.b * line2.c) / det;
      let y = (line1.a * line2.c - line2.a * line1.c) / det;
      return { x, y };
    }
  },

  getSlopeOfLine(line) {
    // assuming ax + by = c
    // http://www.purplemath.com/modules/solvelit2.htm
    return -1 * line.a / line.b;
  },

  getSlopeOfLineSegment(lineSegment) {
    let [ [x1, y1], [x2, y2] ] = lineSegment;
    // make sure slope goes from left most to right most, so order of points doesn't matter
    if (x2 > x1) {
      return y2 - y1 / x2 - x1;
    } else {
      return y1 - y2 / x1 - x2;
    }
  },

  cluster,

  clusterLineSegments,

  sum(values) {
    return values.reduce((a, b) => a + b);
  }
}
