import test from 'flug';
import nodeFetch from 'node-fetch';
import load from '../load';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';
import bboxPolygon from '@turf/bbox-polygon';

const urlToGeojson = 'http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson';

const inBrowser = typeof window === 'object';
const fetch = inBrowser ? window.fetch : nodeFetch;

const urlToData = 'http://localhost:3000/data/';

const url = urlToData + 'test.tiff';

test('Testing intersection of box', async ({ eq }) => {
  const georaster = await load(url);

  let expectedNumberOfIntersectingPixels = 0;
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(value => {
        if (value != georaster.noDataValue) {
          expectedNumberOfIntersectingPixels++;
        }
      });
    });
  });

  const pixelHeight = georaster.pixelHeight;
  const pixelWidth = georaster.pixelWidth;

  // minX, minY, maxX, maxY
  const geom = bboxPolygon([georaster.xmin + .5 * pixelWidth, georaster.ymin + .5 * pixelHeight, georaster.xmax - .5 * pixelWidth, georaster.ymax - .5 * pixelHeight]);
  const coordinates = utils.getGeojsonCoors(geom);
  let numberOfIntersectingPixels = 0;
  intersectPolygon(georaster, coordinates, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, expectedNumberOfIntersectingPixels);
});


test('Test intersection/sum calculations for Country with Multiple Rings', async ({ eq }) => {
  const georaster = await load(urlToData + 'ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif');
  const response = await fetch(urlToGeojson);
  const country = await response.json();
  let numberOfIntersectingPixels = 0;
  const geom = convertGeometry('polygon', country);
  intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, 281);
});
