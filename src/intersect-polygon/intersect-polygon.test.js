import { expect } from 'chai';
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

describe('Testing intersection of simple geometries', () => {
  describe('Testing intersection of box', () => {
    it('Got correct count of values', function () {
      this.timeout(1000000);
      return load(url).then(georaster => {

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
        expect(numberOfIntersectingPixels).to.equal(expectedNumberOfIntersectingPixels);
      });
    });
  });
});
describe('Intersect Polygon (getting pixels in raster that intersect polygon)', () => {
  describe('Test intersection calculations for Country with Multiple Rings', function () {
    this.timeout(1000000);
    it('Got correct sum', () => {
      return load(urlToData + 'ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif').then(georaster => {
        return fetch(urlToGeojson)
          .then(response => response.json())
          .then(country => {
            let numberOfIntersectingPixels = 0;
            const geom = convertGeometry('polygon', country);
            intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
            expect(numberOfIntersectingPixels).to.equal(281);
          });
      });
    });
  });
});
