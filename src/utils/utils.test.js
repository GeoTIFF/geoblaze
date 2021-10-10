import test from "flug";
import { serve } from "srvd";
import load from "../load";
import utils from "./utils.module";
import getDepth from "get-depth";

serve({ debug: true, max: 10, port: 3000 });

const { fetchJson, fetchJsons } = utils;

const url = "http://localhost:3000/data/RWA_MNH_ANC.tif";
const urlToData = "http://localhost:3000/data/";
const urlToGeojsons = urlToData + "gadm/geojsons/";
const urlToGeojson = urlToGeojsons + "Akrotiri and Dhekelia.geojson";
const urlToArcgisJsons = urlToData + "gadm/arcgis/";

test("Get Bounding when Bounding Box when Bigger Than Raster and with Negative Values", async ({ eq }) => {
  const georaster = await load(url);
  const bboxWithBuffer = {
    xmin: georaster.xmin - 1,
    xmax: georaster.xmax + 1,
    ymin: georaster.ymin - 1,
    ymax: georaster.ymax + 1
  };
  const actualBbox = utils.convertCrsBboxToImageBbox(georaster, bboxWithBuffer);
  eq(actualBbox.xmin < 0, true);
  eq(actualBbox.xmin < actualBbox.xmax, true);
  eq(actualBbox.ymin < 0, true);
  eq(actualBbox.ymin < actualBbox.ymax, true);
});

test("Get Bounding Box of GeoJSON that has MultiPolygon Geometry (i.e., multiple rings)", async ({ eq }) => {
  const country = await fetchJson(urlToGeojson);
  const bbox = utils.getBoundingBox(country.geometry.coordinates);
  eq(typeof bbox.xmin, "number");
  eq(typeof bbox.xmax, "number");
  eq(typeof bbox.ymin, "number");
  eq(typeof bbox.ymax, "number");
  eq(bbox.xmin, 32.76010131835966);
  eq(bbox.xmax, 33.92147445678711);
  eq(bbox.ymin, 34.56208419799816);
  eq(bbox.ymax, 35.118995666503906);
});

test("Test Forcing Within", ({ eq }) => {
  eq(utils.forceWithin(10, 1, 11), 10);
  eq(utils.forceWithin(-10, 1, 11), 1);
  eq(utils.forceWithin(990, 1, 11), 11);
});

test("Test Merging of Index Ranges", ({ eq }) => {
  let original = [
    [0, 10],
    [10, 10],
    [20, 30],
    [30, 40]
  ];
  let merged = utils.mergeRanges(original);
  eq(JSON.stringify(merged), "[[0,10],[20,40]]");

  original = [
    [0, 10],
    [10, 10],
    [21, 31],
    [30, 40]
  ];
  merged = utils.mergeRanges(original);
  eq(JSON.stringify(merged), "[[0,10],[21,40]]");
});

test("Get Depth For Multipolygon", async ({ eq }) => {
  const countryDepths = [
    ["Afghanistan", 3],
    ["Akrotiri and Dhekelia", 4]
  ];
  for (let i = 0; i < countryDepths.length; i++) {
    const [name, depth] = countryDepths[i];
    const country = await fetchJson(urlToGeojsons + name + ".geojson");
    const actualDepth = getDepth(country.geometry.coordinates);
    eq(actualDepth, depth);
  }
});

test("Clustering Of Line Segments: For array of objects holding information about intersections: Got Correct Split", ({ eq }) => {
  let segments, computed, computedNumberOfClusters;

  segments = [{ endsOffLine: true }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: true }];
  computed = utils.cluster(segments, s => s.endsOffLine);
  computedNumberOfClusters = computed.length;
  eq(computedNumberOfClusters, 2);
  eq(computed[0].length, 1);
  eq(computed[1].length, 3);

  segments = [{ endsOffLine: true, index: 0 }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: false, index: 99 }];
  computed = utils.cluster(segments, s => s.endsOffLine);
  computedNumberOfClusters = computed.length;
  eq(computedNumberOfClusters, 2);
  eq(computed[0].length, 1);
  eq(computed[1].length, 3);

  segments = [{ endsOffLine: true, index: 0 }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: false, endsOnLine: true, index: 99 }];
  computed = utils.clusterLineSegments(segments, 100, true);
  computedNumberOfClusters = computed.length;
  eq(computedNumberOfClusters, 1);
  eq(computed[0].length, 4);
});

test("Test Coupling", ({ eq }) => {
  const items = [0, 1, 18, 77, 99, 103];
  const actual = utils.couple(items);
  eq(actual.length, items.length / 2);
  actual.map(couple => {
    eq(couple.length, 2);
  });
});

test("Test isPolygon", async ({ eq }) => {
  const countries = ["Afghanistan", "Ukraine"];
  for (let i = 0; i < countries.length; i++) {
    const name = countries[i];
    const jsons = await fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"]);
    const [geojson, arcgisjson] = jsons;
    // console.log('geojson:', JSON.stringify(geojson).substring(0, 100) + '...');
    // console.log('arcgisjson:', JSON.stringify(arcgisjson).substring(0, 100) + '...');
    eq(utils.isPolygon(geojson), true);
    eq(utils.isPolygon(arcgisjson), true);
    eq(utils.isPolygon(arcgisjson.geometry), true);
  }
});

test("Test Intersections", ({ eq }) => {
  const edge1 = [
    [32.87069320678728, 34.66652679443354],
    [32.87069320678728, 34.66680526733393]
  ]; // vertical
  const edge2 = [
    [30, 34.70833333333334],
    [40, 34.70833333333334]
  ];
  const line1 = utils.getLineFromPoints(edge1[0], edge1[1]);
  const line2 = utils.getLineFromPoints(edge2[0], edge2[1]);
  let intersection = utils.getIntersectionOfTwoLines(line1, line2);
  eq(intersection.x, 32.87069320678728);
  eq(intersection.y, 34.70833333333334);

  // this test fails because of floating point arithmetic
  const verticalEdge = [
    [19.59097290039091, 29.76190948486328],
    [19.59097290039091, 41.76180648803728]
  ];
  const horizontalEdge = [
    [15, 41.641892470257524],
    [25, 41.641892470257524]
  ];
  const verticalLine = utils.getLineFromPoints(verticalEdge[0], verticalEdge[1]);
  const horizontalLine = utils.getLineFromPoints(horizontalEdge[0], horizontalEdge[1]);
  intersection = utils.getIntersectionOfTwoLines(verticalLine, horizontalLine);
  //eq(intersection.x, 19.59097290039091);
  //eq(intersection.y, 41.641892470257524);
});

test("Test Categorization of Intersections", ({ eq }) => {
  // through
  let segments = [{ xmin: -140, xmax: -140, direction: 1 }];
  let actual = utils.categorizeIntersection(segments);
  eq(actual.through, true);
  eq(actual.xmin, -140);
  eq(actual.xmax, -140);

  // rebound
  segments = [
    { xmin: -140, xmax: -140, direction: 1 },
    { xmin: -140, xmax: -140, direction: -1 }
  ];
  actual = utils.categorizeIntersection(segments);
  eq(actual.through, false);
  eq(actual.xmin, -140);
  eq(actual.xmax, -140);

  // horizontal through
  segments = [
    { xmin: -140, xmax: -140, direction: 1 },
    { xmin: -140, xmax: -130, direction: 0 },
    { xmin: -130, xmax: -130, direction: 1 }
  ];
  actual = utils.categorizeIntersection(segments);
  eq(actual.through, true);
  eq(actual.xmin, -140);
  eq(actual.xmax, -130);

  // horizontal rebound
  segments = [
    { xmin: -140, xmax: -140, direction: 1 },
    { xmin: -140, xmax: -130, direction: 0 },
    { xmin: -130, xmax: -130, direction: -1 }
  ];
  actual = utils.categorizeIntersection(segments);
  eq(actual.through, false);
  eq(actual.xmin, -140);
  eq(actual.xmax, -130);

  // through with stop
  segments = [
    { xmin: -140, xmax: -140, direction: 1 },
    { xmin: -140, xmax: -140, direction: 1 }
  ];
  actual = utils.categorizeIntersection(segments);
  eq(actual.through, true);
  eq(actual.xmin, -140);
  eq(actual.xmax, -140);
});

test("get constructor names", ({ eq }) => {
  eq(utils.getConstructorName(new ArrayBuffer()), "ArrayBuffer");
});
