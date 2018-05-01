import { expect } from 'chai';
import nodeFetch from 'node-fetch';
import load from '../load';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';

const urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

const urlToGeojson = 'http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson';

const inBrowser = typeof window === 'object';
const fetch = inBrowser ? window.fetch : nodeFetch;

const urlToData = "http://localhost:3000/data/";

const urlToRice = urlToData + "spam2005v2r0_physical-area_rice_total.tiff";

const url = urlToData + 'test.tiff';
const bbox = [80.63, 7.42, 84.21, 10.10];
const expectedBboxValue = 262516.50;

const urlToExampconstiff = urlToData + "example_4326.tif";

const turfBbox = require("@turf/bbox");
const turfBboxPolygon = require("@turf/bbox-polygon");

const test = () => {
  describe("Testing intersection of simple geometries", function() {
    describe("Testing intersection of box", function() {
      it("Got correct count of values", function() {
        this.timeout(1000000);
        return load(url).then(georaster => {

          let expectedNumberOfIntersectingPixels = 0;
          georaster.values.forEach(band => {
            band.forEach(row => {
              row.forEach(value => {
                if (value != georaster.no_data_value) {
                  expectedNumberOfIntersectingPixels++;
                }
              });
            });
          });

          let pixelHeight = georaster.pixelHeight;
          let pixelWidth = georaster.pixelWidth;
          // minX, minY, maxX, maxY
          let geom = turfBboxPolygon([georaster.xmin + .5 * pixelWidth, georaster.ymin + .5 * pixelHeight, georaster.xmax - .5 * pixelWidth, georaster.ymax - .5 * pixelHeight]);
          let coordinates = utils.getGeojsonCoors(geom);
          let numberOfIntersectingPixels = 0;
          intersectPolygon(georaster, coordinates, () => numberOfIntersectingPixels++);
          expect(numberOfIntersectingPixels).to.equal(expectedNumberOfIntersectingPixels);
        });
      });
    });
  });
  describe('Intersect Polygon (getting pixels in raster that intersect polygon)', function() {
    describe("Test intersection calculations for Country with Multiple Rings", function() {
      this.timeout(1000000);
      it("Got correct sum", () => {
        return load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif").then(georaster => {
          return fetch(urlToGeojson)
          .then(response => response.json())
          .then(country => {
            let numberOfIntersectingPixels = 0;
            let geom = convertGeometry('polygon', country);
            intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
            expect(numberOfIntersectingPixels).to.equal(281);
          });
        });
      });
    });
  })
}

test();

module.exports = test;
