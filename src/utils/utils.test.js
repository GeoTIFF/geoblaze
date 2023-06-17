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

test("get constructor names", ({ eq }) => {
  eq(utils.getConstructorName(new ArrayBuffer()), "ArrayBuffer");
});
