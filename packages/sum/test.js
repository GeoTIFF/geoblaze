'use strict';

let _ = require("underscore");

let utils = require("./../utils/utils");
let fetchJson = utils.fetchJson;
let fetchJsons = utils.fetchJsons;

const fs = require("fs");

let expect = require('chai').expect;
let load = require('./../load/load');
let sum = require('./sum');
const turfBbox = require("@turf/bbox");
const turfPolygon = require("@turf/helpers").polygon;

let urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

let urlToData = "http://localhost:3000/data/";
let urlToGeojsons =  urlToData + "gadm/geojsons/";
let urlToArcgisJsons = urlToData + "gadm/arcgis/";

let urlToPopulationRasterTile = urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_60_40.tif";

let inBrowser = typeof window === 'object';
let fetch = inBrowser ? window.fetch : require('node-fetch');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expectedBboxValue = 262516.50;

let polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
let expectedPolygonValue = 3165731.9;


let polygonGeojson1 = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        86.220703125,
        22.156883186860703
      ],
      [
        86.341552734375,
        21.43261686447735
      ],
      [
        86.912841796875,
        21.70847301324597
      ],
      [
        87.000732421875,
        22.39071391683855
      ],
      [
        85.968017578125,
        22.49225722008518
      ],
      [
        85.726318359375,
        21.912470952680266
      ],
      [
        86.220703125,
        22.156883186860703
      ]
      ]
    ]
    }
  }]
}`;

let expectedPolygonGeojsonValue1 = 320113.1;

let polygonGeojson2 = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        85.869140625,
        20.64306554672647
      ],
      [
        86.12182617187499,
        21.022982546427425
      ],
      [
        85.330810546875,
        21.361013117950915
      ],
      [
        84.44091796875,
        21.3303150734318
      ],
      [
        85.594482421875,
        21.074248926792812
      ],
      [
        85.067138671875,
        20.715015145512087
      ],
      [
        85.869140625,
        20.64306554672647
      ]
      ]
    ]
    }
  }]
}`;

let expectedPolygonGeojsonValue2 = 141335.5;

let polygonGeojsonCollection = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        86.220703125,
        22.156883186860703
      ],
      [
        86.341552734375,
        21.43261686447735
      ],
      [
        86.912841796875,
        21.70847301324597
      ],
      [
        87.000732421875,
        22.39071391683855
      ],
      [
        85.968017578125,
        22.49225722008518
      ],
      [
        85.726318359375,
        21.912470952680266
      ],
      [
        86.220703125,
        22.156883186860703
      ]
      ]
    ]
    }
  },
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        85.869140625,
        20.64306554672647
      ],
      [
        86.12182617187499,
        21.022982546427425
      ],
      [
        85.330810546875,
        21.361013117950915
      ],
      [
        84.44091796875,
        21.3303150734318
      ],
      [
        85.594482421875,
        21.074248926792812
      ],
      [
        85.067138671875,
        20.715015145512087
      ],
      [
        85.869140625,
        20.64306554672647
      ]
      ]
    ]
    }
  }
  ]
}`;

let expectedPolygonGeojsonCollectionValue = expectedPolygonGeojsonValue1 + expectedPolygonGeojsonValue2;

let test = () => {
  describe('Geoblaze Sum Feature', function() {
    describe("Get Sum from Veneto Geonode", function() {
      this.timeout(1000000);
      it("Got Correct Value", () => {
        return Promise.all([
            load("https://s3.amazonaws.com/geoblaze/geonode_atlanteil.tif"),
            fetchJson("https://s3.amazonaws.com/geoblaze/veneto.geojson")
        ]).then(values => {
          let [georaster, geojson] = values;
          let actualValue = Number(sum(georaster, geojson)[0].toFixed(2));
          let expectedValue = 25323.11;
          expect(actualValue).to.equal(expectedValue);
        });
      });
    });
    describe('Get Sum', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let actualValue = Number(sum(georaster)[0].toFixed(2));
          let expectedValue = 108343045.4;
          expect(actualValue).to.equal(expectedValue);
        });
      });
    });
    describe('Get Sum from Bounding Box', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, bbox)[0].toFixed(2));
          expect(value).to.equal(expectedBboxValue);
        });
      });
    });
    describe('Get Sum from Bounding Box Greater Then Raster', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(urlRwanda).then(georaster => {
          let valueWithBufferedBbox = Number(sum(georaster, bboxRwanda)[0].toFixed(2));
          let valueWithoutBbox = Number(sum(georaster)[0].toFixed(2));
          expect(valueWithBufferedBbox).to.equal(104848.45);
          expect(valueWithoutBbox).to.equal(104848.45);
          expect(valueWithBufferedBbox).to.equal(valueWithoutBbox);
        });
      });
    });
    describe('Get Same Sum from GeoJSON and ESRI JSON', function() {
      this.timeout(1000000);
      it('Got Matching Value', () => {
        let urlToRaster = urlToData + "mapspam/spam2005v3r2_harvested-area_wheat_total.tiff";
        return load(urlToRaster).then(georaster => {
          let countryNames = ["Afghanistan", "Ukraine"];
          let promises = countryNames.map(name => {
            return fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"], true)
            .then(jsons => {
              let [geojson, arcgisJson] = jsons;
              let valueViaGeojson = Number(sum(georaster, geojson)[0].toFixed(2));
              let valueViaArcgisJson = Number(sum(georaster, arcgisJson)[0].toFixed(2));
              let valueViaArcgisJsonPolygon = Number(sum(georaster, arcgisJson.geometry)[0].toFixed(2));
              expect(valueViaGeojson).to.equal(valueViaArcgisJson);
              expect(valueViaGeojson).to.equal(valueViaArcgisJsonPolygon);
            });
          });
          return Promise.all(promises);
        });
      });
    });
    describe('Get Sum from Polygon', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygon)[0].toFixed(2));
          expect(value).to.equal(expectedPolygonValue);
        });
      });
    });
    describe('Get Sum from Polygon (GeoJSON) 1', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygonGeojson1)[0].toFixed(2));
          expect(value).to.equal(expectedPolygonGeojsonValue1);
        });
      });
    });
    describe('Get Sum from Polygon (GeoJSON) 2', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygonGeojson2)[0].toFixed(2));
          expect(value).to.equal(expectedPolygonGeojsonValue2);
        });
      });
    });
    describe('Get Sum from Polygon (Multi-Polygon GeoJSON, 1 + 2)', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygonGeojsonCollection)[0].toFixed(2));
          expect(value).to.equal(expectedPolygonGeojsonCollectionValue);
        });
      });
    });
    describe("Test sum for Country with Multiple Rings", function() {
      this.timeout(1000000);
      it("Got correct sum", () => {
        return load(url).then(georaster => {
          return utils.fetchJson(urlToGeojsons + "Akrotiri and Dhekelia.geojson")
          .then(country => {
            let value = sum(georaster, country);
            console.log("value:", value);
          });
        });
      });
    });
    describe('Get Sum from Polygon Above X Value', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygon, v => v > 3000)[0].toFixed(2));
          expect(value).to.equal(1501820.8);
        });
      });
    });
    describe("Test Super Simplified Albanian Polygon", function() {
      it("Finish calculation", () => {
        return utils.fetchJson(urlToData + "gadm/derived/super-simplified-albanian-polygon.geojson").then(feature => {
          return load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_60_40.tif").then(georaster => {
            let result = sum(georaster, turfPolygon(polygon))[0];
            console.log("result:", result);
            expect(result).to.equal(0);
          });
        });
      });
    });
    describe("Get Populations", function() {
      this.timeout(1000000);
      it("Got Correct Populations for a Sample of Countries", () => {
        let countries = [
          {"population": 790242.0, "name": "Cyprus"},
          {"population": 5066313.5, "name": "Nicaragua"},
          {"population": 5554059.5, "name": "Lebanon"},
          {"population": 2332581.75, "name": "Jamaica"},
          {"population": 4685367.5, "name": "Croatia"},
          {"population": 2234089.5, "name": "Macedonia"},
          {"population": 3303561.5, "name": "Uruguay"}
        ];
        let promises = countries.map(country => {
          return fetchJson(urlToGeojsons + country.name + ".geojson").then(countryGeojson => {
            let countryBbox = turfBbox(countryGeojson);
            let [minX, minY, maxX, maxY] = countryBbox;
            let left = Math.round((minX - 5) / 10) * 10;
            let right = Math.round((maxX - 5) / 10) * 10;
            let _bottom = 90 - 10 * Math.floor((90 - minY) / 10);
            let _top = 90 - 10 * Math.floor((90 - maxY) / 10);

            let latitudes = _.range(_top, _bottom -1, -10);
            //console.log("latitudes:", latitudes);
            let longitudes = _.range(left, right + 1, 10);
            //console.log("longitudes:", longitudes);
            let tiles = [];
            latitudes.forEach(latitude => {
              longitudes.forEach(longitude => {
                tiles.push(load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_" + longitude + "_" + latitude + ".tif"));
              });
            });
            return Promise.all(tiles).then(georasters => {
              //console.log("georaster tiles:", JSON.stringify(georasters.map(g => [g.xmin, g.ymax])));
              //console.log("countryGeojson:", countryGeojson.type);
              let totalSum = 0;
              if (countryGeojson.geometry.type === "MultiPolygon") {
                //console.log("country is multipolygon");
                countryGeojson.geometry.coordinates.map((polygon, polygonIndex) => {

                  if (polygonIndex === 129) {
                    fs.writeFile("/tmp/poly" + polygonIndex + ".geojson", JSON.stringify(turfPolygon(polygon)));
                  }
                  try {
                    georasters.forEach(georaster => {
                      let partialSum = sum(georaster, turfPolygon(polygon));
                      if (Array.isArray(partialSum)) partialSum = partialSum[0];
                      if (partialSum > 0) {
                        totalSum += partialSum;
                      }
                    });
                  } catch (error) {
                    console.error("Caught error on polygonIndex:", polygonIndex);
                    fs.writeFile("/tmp/poly" + polygonIndex + ".geojson", JSON.stringify(turfPolygon(polygon)));
                    throw error;
                  }
                });
              } else {
                georasters.forEach(georaster => {
                  let partialSum = sum(georaster, countryGeojson);
                  if (Array.isArray(partialSum)) partialSum = partialSum[0];
                  if (partialSum > 0) {
                    totalSum += partialSum;
                  }
                });
              }
              let percentOff = Math.abs(country.population - totalSum) / country.population;
              expect(percentOff).to.be.below(0.05);
            });
          });
        });
        return Promise.all(promises);
      });
    });
  });
}

test();

module.exports = test;
