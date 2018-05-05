import { expect } from 'chai';
import convertGeometry from './convert-geometry.module';

const arrayPoint = [102, 0.5];

const geojsonPointStr = '{"type": "Point", "coordinates": [102.0, 0.5]}';
const geojsonPoint = JSON.parse(geojsonPointStr);

const arrayBbox = [100.0, 0.0, 101.0, 1.0];

const geojsonBboxStr = `{
  "type": "Polygon",
  "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],[100.0, 1.0], [100.0, 0.0]]]
}`;
const geojsonBbox = JSON.parse(geojsonBboxStr);

const arrayPolygon = [
  [ [100.0, 0.0], [101.0, 0.0], [101.5, 1.0], [100.0, 0.5], [100.0, 0.0] ],
  [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.4], [100.2, 0.2] ]
];

const geojsonPolygonStr1 = `{
  "type": "Polygon",
  "coordinates": [
    [ [100.0, 0.0], [101.0, 0.0], [101.5, 1.0], [100.0, 0.5], [100.0, 0.0] ],
    [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.4], [100.2, 0.2] ]
  ]
}`;

const geojsonPolygonStr2 = `{
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
}`;

const geojsonPolygon1 = JSON.parse(geojsonPolygonStr1);
const geojsonPolygon2 = JSON.parse(geojsonPolygonStr2);

const testPointLoad = feature => {
  const point = convertGeometry('point', feature);
  expect(point[0]).to.equal(102);
  expect(point[1]).to.equal(0.5);
};

const testBboxLoad = feature => {
  const bbox = convertGeometry('bbox', feature);
  expect(bbox.xmin).to.equal(100);
  expect(bbox.ymin).to.equal(0);
  expect(bbox.xmax).to.equal(101);
  expect(bbox.ymax).to.equal(1);
};

const testPolygonLoad = feature => {
  return convertGeometry('polygon', feature);
};

describe('Gio Convert Geometry Feature', () => {
  describe('Load point geometry', () => {
    it('Loaded from array', () => {
      testPointLoad(arrayPoint);
    });
    it('Loaded from geojson string', () => {
      testPointLoad(geojsonPointStr);
    });
    it('Loaded from geojson obj', () => {
      testPointLoad(geojsonPoint);
    });
  });

  describe('Load bbox geometry', () => {
    it('Loaded from array', () => {
      testBboxLoad(arrayBbox);
    });
    it('Loaded from geojson string', () => {
      testBboxLoad(geojsonBboxStr);
    });
    it('Loaded from geojson obj', () => {
      testBboxLoad(geojsonBbox);
    });
  });

  describe('Load polygon geometry', () => {
    it('Loaded from array', () => {
      testPolygonLoad(arrayPolygon);
    });
    it('Loaded from geojson string (simple)', () => {
      testPolygonLoad(geojsonPolygonStr1);
    });
    it('Loaded from geojson string (complex)', () => {
      testPolygonLoad(geojsonPolygonStr2);
    });
    it('Loaded from geojson obj (simple)', () => {
      testPolygonLoad(geojsonPolygon1);
    });
    it('Loaded from geojson obj (complex)', () => {
      testPolygonLoad(geojsonPolygon2);
    });
  });
});
