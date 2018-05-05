import { featureCollection, lineString } from '@turf/helpers';
import _ from 'underscore';
import get from '../get';
import utils from '../utils';

const {
  categorizeIntersection,
  clusterLineSegments,
  couple,
  forceWithin,
  mergeRanges,
  getLineFromPoints,
  getIntersectionOfTwoLines,
  getSlopeOfLine,
  getSlopeOfLineSegment,
} = utils;

const getEdgesForPolygon = polygon => {
  let edges = [];
  polygon.forEach(ring => {
    for (let i = 1; i < ring.length; i++) {
      let startPoint = ring[i - 1];
      let endPoint = ring[i];
      edges.push([startPoint, endPoint]);
    }
  });
  return edges;
};

const intersectPolygon = (georaster, geom, perPixelFunction) => {

  let cellWidth = georaster.pixelWidth;
  let cellHeight = georaster.pixelHeight;

  let noDataValue = georaster.no_data_value;
  let imageHeight = georaster.height;

  let imageWidth = georaster.width;

  // get values in a bounding box around the geometry
  let latlngBbox = utils.getBoundingBox(geom);

  let imageBands = get(georaster, latlngBbox)

  // set origin points of bbox of geometry in image space
  let lat0 = latlngBbox.ymax + ((georaster.ymax - latlngBbox.ymax) % cellHeight);
  let lng0 = latlngBbox.xmin - ((latlngBbox.xmin - georaster.xmin) % cellWidth);

  // calculate size of bbox in image coordinates
  // to derive out the row length
  let imageBbox = utils.convertCrsBboxToImageBbox(georaster, latlngBbox);

  let xmin = imageBbox.xmin,
    ymin = imageBbox.ymin,
    xmax = imageBbox.xmax,
    ymax = imageBbox.ymax;

  let rowLength = xmax - xmin;

  // iterate through image rows and convert each one to a line
  // running through the middle of the row
  let imageLines = [];
  let numRows = imageBands[0].length;

  if (numRows === 0) return;

  for (let y = 0; y < numRows; y++) {

    let lat = lat0 - cellHeight * y - cellHeight / 2;

    // use that point, plus another point along the same latitude to
    // create a line
    let point0 = [lng0, lat];
    let point1 = [lng0 + 1, lat];
    let line = getLineFromPoints(point0, point1);
    imageLines.push(line);
  }

  // collapse geometry down to a list of edges
  // necessary for multi-part geometries
  let depth = utils.getDepth(geom);
  let polygonEdges = depth === 4  ? geom.map(getEdgesForPolygon) : [getEdgesForPolygon(geom)];

    // iterate through the list of polygon vertices, convert them to
    // lines, and compute the intersections with each image row
    let intersectionsByRow = _.range(numRows).map(row => []);
    let numberOfEdges = edges.length;
    for (let i = 0; i < numberOfEdges; i++) {


      // get vertices that make up an edge and convert that to a line
      let edge = edges[i];

      let [startPoint, endPoint] = edge;
      let [ x1, y1 ] = startPoint;
      let [ x2, y2 ] = endPoint;

      let direction = Math.sign(y2 - y1);
      let horizontal = y1 === y2;
      let vertical = x1 === x2;

      let edgeY = y1;

      let edgeLine = getLineFromPoints(startPoint, endPoint);

      let edgeYMin = Math.min(y1, y2);
      let edgeYMax = Math.max(y1, y2);

      let startLng, startLat, endLat, endLng;
      if (x1 < x2) {
        [ startLng, startLat ] = startPoint;
        [ endLng, endLat ] = endPoint;
      } else {
        [ startLng, startLat ] = endPoint;
        [ endLng, endLat ]  = startPoint;
      }

      if (startLng === undefined) throw Error("startLng is " + startLng);

      // find the y values in the image coordinate space
      const imageY1 = Math.round((lat0 - .5*cellHeight - startLat ) / cellHeight);
      const imageY2 = Math.round((lat0 - .5*cellHeight - endLat) / cellHeight);

      // make sure to set the start and end points so that we are
      // incrementing upwards through rows
      let rowStart, rowEnd;
      if (imageY1 < imageY2) {
        rowStart = imageY1;
        rowEnd = imageY2;
      } else {
        rowStart = imageY2;
        rowEnd = imageY1;
      }

      rowStart = forceWithin(rowStart, 0, numRows - 1);
      rowEnd = forceWithin(rowEnd, 0, numRows - 1);

      // iterate through image lines within the change in y of
      // the edge line and find all intersections
      for (let j = rowStart; j < rowEnd + 1; j++) {
        let imageLine = imageLines[j];


        if (imageLine === undefined) {
          console.error("j:", j);
          console.error("imageLines:", imageLines);
          throw Error("imageLines");
        }

        // because you know x is zero in ax + by = c, so by = c and b = -1, so -1 * y = c or y = -1 * c
        let imageLineY = -1 * imageLine.c;
        //if (j === rowStart) console.log("imageLineY:", imageLineY);

        let startsOnLine = y1 === imageLineY;
        let endsOnLine = y2 === imageLineY;
        let endsOffLine = !endsOnLine;

        let xminOnLine, xmaxOnLine;
        if (horizontal) {
          if (edgeY === imageLineY) {
            xminOnLine = startLng;
            xmaxOnLine = endLng;
          } else {
            continue; // stop running calculations for this horizontal line because it doesn't intersect at all
          }
        } else if (vertical) {
          /* we have to have a seprate section for vertical bc of floating point arithmetic probs with get_inter..." */
          if (imageLineY >= edgeYMin && imageLineY <= edgeYMax) {
            xminOnLine = startLng;
            xmaxOnLine = endLng;
          }
        } else if (startsOnLine) {
          // we know that the other end is not on the line because then it would be horizontal
          xminOnLine = xmaxOnLine = x1;
        } else if (endsOnLine) {
          // we know that the other end is not on the line because then it would be horizontal
          xminOnLine = xmaxOnLine = x2;
        } else {
          try {
            xminOnLine = xmaxOnLine = getIntersectionOfTwoLines(edgeLine, imageLine).x;
          } catch (error) {
            throw error;
          }
        }

        // check to see if the intersection point is within the range of
        // the edge line segment. If it is, add the intersection to the
        // list of intersections at the corresponding index for that row
        // in intersectionsByRow
        if (xminOnLine && xmaxOnLine && (horizontal || (xminOnLine >= startLng && xmaxOnLine <= endLng && imageLineY <= edgeYMax && imageLineY >= edgeYMin))) {
          //let image_pixel_index = Math.floor((intersection.x - lng0) / cellWidth);
          //intersectionsByRow[j].push(image_pixel_index);
          intersectionsByRow[j].push({
            direction,
            index: i,
            edge: edge,
            endsOnLine,
            endsOffLine,
            horizontal,
            startsOnLine,
            vertical,
            xmin: xminOnLine,
            xmax: xmaxOnLine,
            imageLineY
          });
        }
      }
    }

    let lineStrings = [];
    intersectionsByRow.map((segmentsInRow, rowIndex) => {
      if (segmentsInRow.length > 0) {
        let clusters = clusterLineSegments(segmentsInRow, numberOfEdges);
        let categorized = clusters.map(categorizeIntersection);
        let [ throughs, nonthroughs ] = _.partition(categorized, item => item.through);

        if (throughs.length % 2 === 1) {
          throw Error("throughs.length for " + rowIndex + " is odd with " + throughs.length);
        }

        let insides = nonthroughs.map(intersection => [intersection.xmin, intersection.xmax]);

        throughs = _.sortBy(throughs, "xmin");

        let couples = couple(throughs).map(couple => {
          let [left, right] = couple;
          return [left.xmin, right.xmax];
        });

        insides = insides.concat(couples);

        /*
          This makes sure we don't double count pixels.
          For example, converts `[[0,10],[10,10]]` to `[[0,10]]`
        */
        insides = mergeRanges(insides);

        insides.forEach(pair => {

          let [xmin, xmax] = pair;

          //convert left and right to image pixels
          let left = Math.round((xmin - (lng0 + .5*cellWidth)) / cellWidth);
          let right = Math.round((xmax - (lng0 + .5*cellWidth)) / cellWidth);

          let startColumnIndex = Math.max(left, 0);
          let endColumnIndex = Math.min(right, imageWidth);


          for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex++) {
            imageBands.forEach((band, bandIndex) => {
              var value = band[rowIndex][columnIndex];
              if (value != undefined && value !== noDataValue) {
                perPixelFunction(value, bandIndex, rowIndex, columnIndex);
              }
            });
          }
        });
      }
    });
  });
}

export default intersectPolygon;
