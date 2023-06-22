import test from "flug";
import { serve } from "srvd";
import load from "../load";
import mpoly from "mpoly";
import utils from "./utils.module";
import getDepth from "get-depth";

serve({ debug: true, max: 12, port: 3000 });

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

test("Test isPolygonal", async ({ eq }) => {
  const countries = ["Afghanistan", "Ukraine"];
  for (let i = 0; i < countries.length; i++) {
    const name = countries[i];
    const jsons = await fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"]);
    const [geojson, arcgisjson] = jsons;
    eq(utils.isPolygonal(geojson), true);
    eq(utils.isPolygonal(arcgisjson), true);
    eq(utils.isPolygonal(arcgisjson.geometry), true);
  }
});

test("get constructor names", ({ eq }) => {
  eq(utils.getConstructorName(new ArrayBuffer()), "ArrayBuffer");
});

test("get multi-polygon", async ({ eq }) => {
  const geojson = await fetchJson(urlToGeojson);
  const result = mpoly.get(geojson);
  eq(getDepth(result), 4);
  eq(result.length, 2);
  eq(
    result.map(poly => poly.length),
    [1, 1]
  ); // no holes

  const countries = ["Afghanistan", "Ukraine"];
  for (let i = 0; i < countries.length; i++) {
    const name = countries[i];
    const jsons = await fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"]);
    const [geojson, arcgisjson] = jsons;

    const multipolygon_from_geojson = mpoly.get(geojson);
    const multipolygon_from_arcgis = mpoly.get(arcgisjson);

    eq(getDepth(multipolygon_from_geojson), getDepth(multipolygon_from_arcgis));
    eq(multipolygon_from_geojson, multipolygon_from_arcgis);
  }
});
