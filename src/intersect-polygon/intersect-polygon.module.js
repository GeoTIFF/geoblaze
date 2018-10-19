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
} = utils;

const getEdgesForPolygon = polygon => {
  const edges = [];
  polygon.forEach(ring => {
    for (let i = 1; i < ring.length; i++) {
      const startPoint = ring[i - 1];
      const endPoint = ring[i];
      edges.push([startPoint, endPoint]);
    }
  });
  return edges;
};

const intersectPolygon = (georaster, geom, perPixelFunction) => {

  const cellWidth = georaster.pixelWidth;
  const cellHeight = georaster.pixelHeight;

  const { noDataValue } = georaster;

  const imageWidth = georaster.width;

  // get values in a bounding box around the geometry
  const latlngBbox = utils.getBoundingBox(geom);

  const imageBands = get(georaster, latlngBbox);

  // set origin points of bbox of geometry in image space
  const lat0 = latlngBbox.ymax + ((georaster.ymax - latlngBbox.ymax) % cellHeight);
  const lng0 = latlngBbox.xmin - ((latlngBbox.xmin - georaster.xmin) % cellWidth);

  // iterate through image rows and convert each one to a line
  // running through the middle of the row
  const imageLines = [];
  const numRows = imageBands[0].length;

  if (numRows === 0) return;

  for (let y = 0; y < numRows; y++) {

    const lat = lat0 - cellHeight * y - cellHeight / 2;

    // use that point, plus another point along the same latitude to
    // create a line
    const point0 = [lng0, lat];
    const point1 = [lng0 + 1, lat];
    const line = getLineFromPoints(point0, point1);
    imageLines.push(line);
  }

  // collapse geometry down to a list of edges
  // necessary for multi-part geometries
  const depth = utils.getDepth(geom);
  const polygonEdges = depth === 4  ? geom.map(getEdgesForPolygon) : [getEdgesForPolygon(geom)];

  polygonEdges.forEach((edges, edgesIndex) => {
    // iterate through the list of polygon vertices, convert them to
    // lines, and compute the intersections with each image row
    const intersectionsByRow = _.range(numRows).map(row => []);
    const numberOfEdges = edges.length;
    for (let i = 0; i < numberOfEdges; i++) {


      // get vertices that make up an edge and convert that to a line
      const edge = edges[i];

      const [startPoint, endPoint] = edge;
      const [ x1, y1 ] = startPoint;
      const [ x2, y2 ] = endPoint;

      const direction = Math.sign(y2 - y1);
      const horizontal = y1 === y2;
      const vertical = x1 === x2;

      const edgeY = y1;

      const edgeLine = getLineFromPoints(startPoint, endPoint);

      const edgeYMin = Math.min(y1, y2);
      const edgeYMax = Math.max(y1, y2);

      let startLng, startLat, endLat, endLng;
      if (x1 < x2) {
        [ startLng, startLat ] = startPoint;
        [ endLng, endLat ] = endPoint;
      } else {
        [ startLng, startLat ] = endPoint;
        [ endLng, endLat ]  = startPoint;
      }

      if (startLng === undefined) throw Error('startLng is ' + startLng);

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
        const imageLine = imageLines[j];


        if (imageLine === undefined) {
          console.error('j:', j);
          console.error('imageLines:', imageLines);
          throw Error('imageLines');
        }

        // because you know x is zero in ax + by = c, so by = c and b = -1, so -1 * y = c or y = -1 * c
        const imageLineY = -1 * imageLine.c;
        //if (j === rowStart) console.log("imageLineY:", imageLineY);

        const startsOnLine = y1 === imageLineY;
        const endsOnLine = y2 === imageLineY;
        const endsOffLine = !endsOnLine;

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
            imageLineY,
          });
        }
      }
    }

    intersectionsByRow.map((segmentsInRow, rowIndex) => {
      if (segmentsInRow.length > 0) {
        const clusters = clusterLineSegments(segmentsInRow, numberOfEdges);
        const categorized = clusters.map(categorizeIntersection);
        const [ throughs, nonthroughs ] = _.partition(categorized, item => item.through);

        if (throughs.length % 2 === 1) {
          throw Error('throughs.length for ' + rowIndex + ' is odd with ' + throughs.length);
        }

        let insides = nonthroughs.map(intersection => [intersection.xmin, intersection.xmax]);

        const sortedThroughs = _.sortBy(throughs, 'xmin');

        const couples = couple(sortedThroughs).map(couple => {
          const [left, right] = couple;
          return [left.xmin, right.xmax];
        });

        insides = insides.concat(couples);

        /*
          This makes sure we don't double count pixels.
          For example, converts `[[0,10],[10,10]]` to `[[0,10]]`
        */
        insides = mergeRanges(insides);

        insides.forEach(pair => {

          const [xmin, xmax] = pair;

          //convert left and right to image pixels
          const left = Math.round((xmin - (lng0 + .5*cellWidth)) / cellWidth);
          const right = Math.round((xmax - (lng0 + .5*cellWidth)) / cellWidth);

          const startColumnIndex = Math.max(left, 0);
          const endColumnIndex = Math.min(right, imageWidth);

          for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex++) {
            imageBands.forEach((band, bandIndex) => {
              const value = band[rowIndex][columnIndex];
              if (value != undefined && value !== noDataValue) {
                perPixelFunction(value, bandIndex, rowIndex, columnIndex);
              }
            });
          }
        });
      }
    });
  });
};

export default intersectPolygon;
