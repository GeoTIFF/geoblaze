'use strict';

let expect = require('chai').expect;
let geoblaze_convert_geometry = require('./convert-geometry');

let array_point = [102, 0.5];

let geojson_point_str = '{"type": "Point", "coordinates": [102.0, 0.5]}';
let geojson_point = JSON.parse(geojson_point_str);

let array_bbox = [100.0, 0.0, 101.0, 1.0];

let geojson_bbox_str = `{
  "type": "Polygon",
  "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],[100.0, 1.0], [100.0, 0.0]]]
}`;
let geojson_bbox = JSON.parse(geojson_bbox_str);

let array_polygon = [
  [ [100.0, 0.0], [101.0, 0.0], [101.5, 1.0], [100.0, 0.5], [100.0, 0.0] ],
  [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.4], [100.2, 0.2] ]
];

let geojson_polygon_str_1 = `{
  "type": "Polygon",
  "coordinates": [
    [ [100.0, 0.0], [101.0, 0.0], [101.5, 1.0], [100.0, 0.5], [100.0, 0.0] ],
    [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.4], [100.2, 0.2] ]
  ]
}`;

let geojson_polygon_str_2 = `{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [ [100.0, 0.0], [101.0, 0.1], [101.5, 1.0], [100.0, 0.5], [100.0, 0.0] ]
        ]
      },
      "properties": {
        "prop0": "value0",
        "prop1": {"this": "that"}
      }
     }
  ]
}`

let geojson_polygon_1 = JSON.parse(geojson_polygon_str_1);
let geojson_polygon_2 = JSON.parse(geojson_polygon_str_2);

let test_point_load = feature => {
  let point = geoblaze_convert_geometry('point', feature);
  expect(point[0]).to.equal(102);
  expect(point[1]).to.equal(0.5);
}

let test_bbox_load = feature => {
  let bbox = geoblaze_convert_geometry('bbox', feature);
  expect(bbox.xmin).to.equal(100);
  expect(bbox.ymin).to.equal(0);
  expect(bbox.xmax).to.equal(101);
  expect(bbox.ymax).to.equal(1);
}

let test_polygon_load = feature => {
  let polygon = geoblaze_convert_geometry('polygon', feature);

}

let test = () => {
  describe('Gio Convert Geometry Feature', () => {
    describe('Load point geometry', () => {
      it('Loaded from array', () => {
        test_point_load(array_point);
      });
      it('Loaded from geojson string', () => {
        test_point_load(geojson_point_str);
      });
      it('Loaded from geojson obj', () => {
        test_point_load(geojson_point);
      });
    });

    describe('Load bbox geometry', () => {
      it('Loaded from array', () => {
        test_bbox_load(array_bbox);
      });
      it('Loaded from geojson string', () => {
        test_bbox_load(geojson_bbox_str);
      });
      it('Loaded from geojson obj', () => {
        test_bbox_load(geojson_bbox);
      });
    });

    describe('Load polygon geometry', () => {
      it('Loaded from array', () => {
        test_polygon_load(array_polygon);
      });
      it('Loaded from geojson string (simple)', () => {
        test_polygon_load(geojson_polygon_str_1);
      });
      it('Loaded from geojson string (complex)', () => {
        test_polygon_load(geojson_polygon_str_2);
      });
      it('Loaded from geojson obj (simple)', () => {
        test_polygon_load(geojson_polygon_1);
      });
      it('Loaded from geojson obj (complex)', () => {
        test_polygon_load(geojson_polygon_2);
      });
    })
  })
}

test();

module.exports = test;
