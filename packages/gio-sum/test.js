'use strict';

let expect = require('chai').expect;
let load = require('./../gio-load/load');
let sum = require('./sum');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 262516.50;

let polygon = [[
    [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
    [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
    [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
    [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
let expected_polygon_value = 2959534.3;


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

let expected_polygon_geojson_value_1 = 259802.5;

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

let expected_polygon_geojson_value_2 = 122663.3;

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
    describe('Gio Sum Feature', function() {
        describe('Get Sum from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(sum(image, bbox)[0].toFixed(2));
                    expect(value).to.equal(expected_bbox_value);
                });
            });
        });
        describe('Get Sum from Polygon', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(sum(image, polygon)[0].toFixed(2));
                    expect(value).to.equal(expected_polygon_value);
                });
            });
        });
        describe('Get Sum from Polygon (GeoJSON) 1', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(sum(image, polygon_geojson_1)[0].toFixed(2));
                    expect(value).to.equal(expected_polygon_geojson_value_1);
                });
            });
        });
        describe('Get Sum from Polygon (GeoJSON) 2', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(sum(image, polygon_geojson_2)[0].toFixed(2));
                    expect(value).to.equal(expected_polygon_geojson_value_2);
                });
            });
        });
        describe('Get Sum from Polygon (Multi-Polygon GeoJSON)', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(sum(image, polygon_geojson_collection)[0].toFixed(2));
                    expect(value).to.equal(expected_polygon_geojson_collection_value);
                });
            });
        });
    })
}

test();

module.exports = test;