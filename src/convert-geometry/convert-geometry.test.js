import test from "flug";
import convertGeometry from "./convert-geometry.module";
import getDepth from "get-depth";

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
  [
    [100.0, 0.0],
    [101.0, 0.0],
    [101.5, 1.0],
    [100.0, 0.5],
    [100.0, 0.0]
  ],
  [
    [100.2, 0.2],
    [100.8, 0.2],
    [100.8, 0.8],
    [100.2, 0.4],
    [100.2, 0.2]
  ]
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

const testPointLoad = (feature, eq) => {
  const point = convertGeometry("point", feature);
  eq(point[0], 102);
  eq(point[1], 0.5);
};

const testBboxLoad = (feature, eq) => {
  const bbox = convertGeometry("bbox", feature);
  eq(bbox.xmin, 100);
  eq(bbox.ymin, 0);
  eq(bbox.xmax, 101);
  eq(bbox.ymax, 1);
};

const testPolygonLoad = (feature, eq) => {
  const poly = convertGeometry("polygon", feature);
  const depth = getDepth(poly);
  eq(depth, 3);
};

test("Load Point from array", ({ eq }) => {
  testPointLoad(arrayPoint, eq);
});
test("Load Point from geojson string", ({ eq }) => {
  testPointLoad(geojsonPointStr, eq);
});
test("Load Point from geojson obj", ({ eq }) => {
  testPointLoad(geojsonPoint, eq);
});

test("Load bbox from array", ({ eq }) => {
  testBboxLoad(arrayBbox, eq);
});
test("Load bbox from geojson string", ({ eq }) => {
  testBboxLoad(geojsonBboxStr, eq);
});
test("Load bbox from geojson obj", ({ eq }) => {
  testBboxLoad(geojsonBbox, eq);
});

test("Load Polygon from array", ({ eq }) => {
  testPolygonLoad(arrayPolygon, eq);
});
test("Load Polygon from geojson string (simple)", ({ eq }) => {
  testPolygonLoad(geojsonPolygonStr1, eq);
});
test("Load Polygon from geojson string (complex)", ({ eq }) => {
  testPolygonLoad(geojsonPolygonStr2, eq);
});
test("Load Polygon from geojson obj (simple)", ({ eq }) => {
  testPolygonLoad(geojsonPolygon1, eq);
});
test("Load Polygon from geojson obj (complex)", ({ eq }) => {
  testPolygonLoad(geojsonPolygon2, eq);
});
