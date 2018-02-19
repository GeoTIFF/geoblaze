'use strict';

let _ = require("underscore");

let utils = require("./../utils/utils");
let fetch_json = utils.fetch_json;
let fetch_jsons = utils.fetch_jsons;

const fs = require("fs");

let expect = require('chai').expect;
let load = require('./../load/load');
let sum = require('./sum');
const turf_bbox = require("@turf/bbox");
const turf_polygon = require("@turf/helpers").polygon;

let url_rwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bbox_rwanda = require("../../data/RwandaBufferedBoundingBox.json");

let url_to_data = "http://localhost:3000/data/";
let url_to_geojsons =  url_to_data + "gadm/geojsons/";
let url_to_arcgis_jsons = url_to_data + "gadm/arcgis/";

let url_to_population_raster_tile = url_to_data + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_60_40.tif";

let in_browser = typeof window === 'object';
let fetch = in_browser ? window.fetch : require('node-fetch');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 262516.50;

let polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
let expected_polygon_value = 3165731.9;


let polygon_geojson_1 = `{
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

let expected_polygon_geojson_value_1 = 320113.1;

let polygon_geojson_2 = `{
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

let expected_polygon_geojson_value_2 = 141335.5;

let polygon_geojson_collection = `{
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

let expected_polygon_geojson_collection_value = expected_polygon_geojson_value_1 + expected_polygon_geojson_value_2;

let test = () => {
  describe('Geoblaze Sum Feature', function() {
    describe('Get Sum', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let actual_value = Number(sum(georaster)[0].toFixed(2));
          let expected_value = 108343045.4;
          expect(actual_value).to.equal(expected_value);
        });
      });
    });
    describe('Get Sum from Bounding Box', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, bbox)[0].toFixed(2));
          expect(value).to.equal(expected_bbox_value);
        });
      });
    });
    describe('Get Sum from Bounding Box Greater Then Raster', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url_rwanda).then(georaster => {
          let value_with_buffered_bbox = Number(sum(georaster, bbox_rwanda)[0].toFixed(2));
          let value_without_bbox = Number(sum(georaster)[0].toFixed(2));
          expect(value_with_buffered_bbox).to.equal(104848.45);
          expect(value_without_bbox).to.equal(104848.45);
          expect(value_with_buffered_bbox).to.equal(value_without_bbox);
        });
      });
    });
    describe('Get Same Sum from GeoJSON and ESRI JSON', function() {
      this.timeout(1000000);
      it('Got Matching Value', () => {
        let url_to_raster = url_to_data + "mapspam/spam2005v3r2_harvested-area_wheat_total.tiff";
        return load(url_to_raster).then(georaster => {
          let country_names = ["Afghanistan", "Ukraine"];
          let promises = country_names.map(name => {
            return fetch_jsons([url_to_geojsons + name + ".geojson", url_to_arcgis_jsons + name + ".json"], true)
            .then(jsons => {
              let [geojson, arcgis_json] = jsons;
              let value_via_geojson = Number(sum(georaster, geojson)[0].toFixed(2));
              let value_via_arcgis_json = Number(sum(georaster, arcgis_json)[0].toFixed(2));
              let value_via_arcgis_json_polygon = Number(sum(georaster, arcgis_json.geometry)[0].toFixed(2));
              console.log("value_via_arcgis_json:", value_via_arcgis_json);
              expect(value_via_geojson).to.equal(value_via_arcgis_json);
              expect(value_via_geojson).to.equal(value_via_arcgis_json_polygon);
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
          expect(value).to.equal(expected_polygon_value);
        });
      });
    });
    describe('Get Sum from Polygon (GeoJSON) 1', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygon_geojson_1)[0].toFixed(2));
          expect(value).to.equal(expected_polygon_geojson_value_1);
        });
      });
    });
    describe('Get Sum from Polygon (GeoJSON) 2', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygon_geojson_2)[0].toFixed(2));
          expect(value).to.equal(expected_polygon_geojson_value_2);
        });
      });
    });
    describe('Get Sum from Polygon (Multi-Polygon GeoJSON, 1 + 2)', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(sum(georaster, polygon_geojson_collection)[0].toFixed(2));
          expect(value).to.equal(expected_polygon_geojson_collection_value);
        });
      });
    });
    describe("Test sum for Country with Multiple Rings", function() {
      this.timeout(1000000);
      it("Got correct sum", () => {
        return load(url).then(georaster => {
          return utils.fetch_json(url_to_geojsons + "Akrotiri and Dhekelia.geojson")
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
        return utils.fetch_json(url_to_data + "gadm/derived/super-simplified-albanian-polygon.geojson").then(feature => {
          return load(url_to_data + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_60_40.tif").then(georaster => {
            let result = sum(georaster, turf_polygon(polygon))[0];
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
        //console.log("countries:", countries);
        let promises = countries.map(country => {
          //console.log("country:", country);
          return fetch_json(url_to_geojsons + country.name + ".geojson").then(country_geojson => {
            //console.log("country_geojson:", country_geojson);
            let country_bbox = turf_bbox(country_geojson);
            //console.log("country_bbox:", country_bbox);
            let [minX, minY, maxX, maxY] = country_bbox;
            let left = Math.round((minX - 5) / 10) * 10;
            let right = Math.round((maxX - 5) / 10) * 10;
            let _bottom = 90 - 10 * Math.floor((90 - minY) / 10);
            let _top = 90 - 10 * Math.floor((90 - maxY) / 10);
            //console.log("rounded:", [left, _bottom, right, _top]);

            let latitudes = _.range(_top, _bottom -1, -10);
            //console.log("latitudes:", latitudes);
            let longitudes = _.range(left, right + 1, 10);
            //console.log("longitudes:", longitudes);
            let tiles = [];
            latitudes.forEach(latitude => {
              longitudes.forEach(longitude => {
                tiles.push(load(url_to_data + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_" + longitude + "_" + latitude + ".tif"));
              });
            });
            return Promise.all(tiles).then(georasters => {
              //console.log("georaster tiles:", JSON.stringify(georasters.map(g => [g.xmin, g.ymax])));
              //console.log("country_geojson:", country_geojson.type);
              let total_sum = 0;
              if (country_geojson.geometry.type === "MultiPolygon") {
                //console.log("country is multipolygon");
                country_geojson.geometry.coordinates.map((polygon, polygon_index) => {

                  if (polygon_index === 129) {
                    fs.writeFile("/tmp/poly" + polygon_index + ".geojson", JSON.stringify(turf_polygon(polygon)));
                  }
                  try {
                    georasters.forEach(georaster => {
                      //console.log("\n\ngetting sum for polygon", polygon_index, "and georaster", Math.round(georaster.xmin), Math.round(georaster.ymax));
                      let partial_sum = sum(georaster, turf_polygon(polygon));
                      //console.log("partial_sum:", partial_sum, typeof partial_sum);
                      if (Array.isArray(partial_sum)) partial_sum = partial_sum[0];
                      if (partial_sum > 0) {
                        total_sum += partial_sum;
                        //console.log("total_sum:", total_sum);
                      }
                    });
                  } catch (error) {
                    console.error("Caught error on polygon_index:", polygon_index);
                    fs.writeFile("/tmp/poly" + polygon_index + ".geojson", JSON.stringify(turf_polygon(polygon)));
                    throw error;
                  }
                });
              } else {
                //total_sum = georasters.map(georaster => sum(georaster, country_geojson)[0]);
                georasters.forEach(georaster => {
                  let partial_sum = sum(georaster, country_geojson);
                  //console.log("partial_sum:", partial_sum, typeof partial_sum);
                  if (Array.isArray(partial_sum)) partial_sum = partial_sum[0];
                  if (partial_sum > 0) {
                    total_sum += partial_sum;
                    //console.log("total_sum:", total_sum);
                  }
                });
              }
              //let total_sum = georasters.reduce((running_sum, georaster) => running_sum + (sum(georaster, country_geojson)[0] || 0), 0);
              //console.log("country.population:", country.population);
              console.log("\tcomputed population of " + country.name + ": " + Math.round(total_sum).toLocaleString());
              let percent_off = Math.abs(country.population - total_sum) / country.population;
              console.log("percent_off:", percent_off);
              expect(percent_off).to.be.below(0.05);
              //expect(total_sum.toLocaleString()).to.equal(country.population.toLocaleString());
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
