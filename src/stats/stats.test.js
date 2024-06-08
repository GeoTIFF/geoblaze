import { readFileSync } from "fs";

import test from "flug";
import fetch from "cross-fetch";
import { serve } from "srvd";
import parseGeoraster from "georaster";
import reprojectGeoJSON from "reproject-geojson";

import load from "../load";
import parse from "../parse";
import stats from "./stats.module";

serve({ debug: true, max: 35, port: 3000, wait: 240 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));

const EXPECTED_RASTER_STATS = [
  {
    count: 9331200,
    invalid: 8510683,
    max: 8131.2,
    mean: 132.04241399017369,
    median: 0,
    min: 0,
    mode: 0,
    modes: [0],
    product: 0,
    range: 8131.2,
    std: 562.8169687364914,
    sum: 108343045.39997534,
    valid: 820517,
    variance: 316762.94029773277
  }
];

const EXPECTED_BBOX_STATS = [
  {
    count: 1376,
    invalid: 1188,
    max: 5166.7,
    mean: 1257.6351063829786,
    median: 915.85,
    min: 0,
    mode: 0,
    modes: [0],
    product: 0,
    range: 5166.7,
    std: 1216.4677587709607,
    sum: 236435.4,
    valid: 188,
    variance: 1479793.808129244
  }
];

const EXPECTED_POLYGON_STATS = [
  {
    count: 1722,
    invalid: 50,
    max: 7807.4,
    mean: 1853.7104066985623,
    median: 1637.35,
    min: 0,
    mode: 0,
    modes: [0],
    product: 0,
    range: 7807.4,
    std: 1507.3255322956486,
    sum: 3_099_403.799999996, // rasterstats says 3,099,403.8
    valid: 1672, // same as rasterstats
    variance: 2_272_030.2603103607
  }
];

test("(Sync) Stats without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, undefined);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Async) Stats without Geometry", async ({ eq }) => {
  const results = await stats(url, undefined);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Sync) Stats with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, bbox);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Async) Stats with Bounding Box", async ({ eq }) => {
  const results = await stats(url, bbox);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Sync) Stats with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, polygon);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_POLYGON_STATS);
});

test("(Async) Stats with Polygon", async ({ eq }) => {
  const results = await stats(url, polygon);
  results.forEach(band => {
    delete band.frequency;
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_POLYGON_STATS);
});

test("hole", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/gadas-4326.tif";
  const url_to_geometry = "http://localhost:3000/data/holes/hole.geojson";
  const geometry = await fetch(url_to_geometry).then(r => r.json());
  const results = await stats(url, geometry);
  const mode = results.map(stats => stats.mode);
  eq(mode, [61, 133, 170, 255]); // #3d85aad9
});

test("Hole Test", async ({ eq }) => {
  const georaster = await parseGeoraster(
    [
      [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    ],
    {
      noDataValue: 0,
      projection: 4326,
      xmin: 0, // left
      ymax: 20, // top
      pixelWidth: 5,
      pixelHeight: 5
    }
  );
  const url = "http://localhost:3000/data/holes/hole-2.geojson";
  const geojson = await fetch(url).then(res => res.json());
  const results = await stats(georaster, geojson);
  eq(results[0].count, 12);
  eq(results[0].sum, 12);
});

test("antimerdian #1", async ({ eq }) => {
  const georaster = await parse("http://localhost:3000/data/gfwfiji_6933_COG.tiff");
  let geom = JSON.parse(readFileSync("./data/antimeridian/right-edge.geojson", "utf-8"));
  geom = reprojectGeoJSON(geom, { from: 4326, to: georaster.projection });
  const results = await stats(georaster, geom, { stats: ["count", "invalid", "min", "max", "sum", "valid"] });
  eq(results, [{ count: 328425, valid: 314930, invalid: 13495, min: 0.20847222208976746, max: 492.3219299316406, sum: 12783872.545041203 }]);
});

test("antimerdian #2 (split at antimeridian)", async ({ eq }) => {
  // converted GeoTIFF to all 1's
  const georaster = await parse("http://localhost:3000/data/gfwfiji_6933_COG_Binary.tif");
  let geom = JSON.parse(readFileSync("./data/antimeridian/split.geojson", "utf-8"));
  geom = reprojectGeoJSON(geom, { from: 4326, to: georaster.projection });
  const results = await stats(georaster, geom, { stats: ["count", "min", "max", "sum"] });
  eq(results, [{ count: 327_972, min: 1, max: 1, sum: 327_972 }]);
});

test("antimeridian New Zealand EEZ and Habitat", async ({ eq }) => {
  const georaster = await parse("http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif");
  const geojson = JSON.parse(readFileSync("./data/geojson-test-data/eez_land_union/EEZ_Land_v3_202030_New_Zealand.geojson", "utf-8"));
  const results = await stats(georaster, geojson, { stats: ["count", "invalid", "min", "max", "sum", "valid"] });
  eq(results, [{ count: 487, invalid: 33, min: 1, max: 71, sum: 4512, valid: 454 }]);

  const results2 = await Promise.all(
    geojson.features[0].geometry.coordinates.map(geom => stats(georaster, geom, { stats: ["count", "invalid", "min", "max", "sum", "valid"] }))
  );
  eq(results2, [[{ count: 354, valid: 322, invalid: 32, min: 1, max: 71, sum: 3931 }], [{ count: 133, valid: 132, invalid: 1, min: 1, max: 22, sum: 581 }]]);
});

test("antimerdian #3 (across antimeridian on left-side)", async ({ eq }) => {
  return; // XXX
  // converted GeoTIFF to all 1's
  const georaster = await parse("http://localhost:3000/data/gfwfiji_6933_COG_Binary.tif");
  const geojson = JSON.parse(readFileSync("./data/antimeridian/across.geojson", "utf-8"));
  console.log(JSON.stringify(geojson));
  let geom = reprojectGeoJSON(geojson, { from: 4326, to: georaster.projection });
  console.log(JSON.stringify(geom));
  geom = { geometry: geojson, srs: 4326 };
  const results = await stats(georaster, geom, { stats: ["count", "invalid", "min", "max", "sum", "valid"] });
  // Size is 65_208, 3_515
  eq(results[0].valid, 327_972);
  eq(results, [{ count: 327_972, min: 1, max: 1, sum: 327_972 }]);
});

test("edge", async ({ eq }) => {
  // converted GeoTIFF to all 1's
  const georaster = await parse("http://localhost:3000/data/geotiff-test-data/gfw-azores.tif");
  const geojson = JSON.parse(readFileSync("./data/santa-maria/santa-maria-mpa.geojson", "utf-8"));
  const results = await stats(georaster, geojson, { stats: ["count", "min", "max", "sum"] });
  eq(results, [{ count: 2, min: 9.936111450195312, max: 19.24805450439453, sum: 29.184165954589844 }]);
});

test("issue #224", async ({ eq }) => {
  const geojson = JSON.parse(readFileSync("./data/antimeridian/clip-test-clipped.json", "utf-8"));
  const georaster = await parse("http://localhost:3000/data/antimeridian/fiji_anticross_random_test.tif");
  const _stats = ["count", "invalid", "min", "max", "sum", "valid"];

  const expected = [{ count: 4, valid: 1, invalid: 3, min: 3, max: 3, sum: 3 }];
  eq(await stats(georaster, geojson, { stats: _stats }, undefined, { debug_level: 0 }), expected);
});

test("multipolygon vs 2 polygons", async ({ eq }) => {
  const geojson = JSON.parse(readFileSync("./data/antimeridian/split.geojson", "utf-8"));
  const georaster = await parse("http://localhost:3000/data/geotiff-test-data/spam2005v3r2_harvested-area_wheat_total.tiff");
  const _stats = ["count", "invalid", "min", "max", "sum", "valid"];

  const expected = [{ count: 1152, valid: 4, invalid: 1148, min: 0, max: 0, sum: 0 }];
  eq(await stats(georaster, geojson, { stats: _stats }, undefined, { debug_level: 0 }), expected);
  eq(await stats(georaster, geojson.features[0], { stats: _stats }), expected);

  const [poly1, poly2] = geojson.features[0].geometry.coordinates;
  const results1 = await stats(georaster, poly1, { debug_level: 0, stats: _stats });
  eq(results1, [{ count: 576, valid: 0, invalid: 576, sum: 0, min: undefined, max: undefined }]);

  const results2 = await stats(georaster, poly2, { debug_level: 0, stats: _stats });
  eq(results2, [{ count: 576, valid: 4, invalid: 572, min: 0, max: 0, sum: 0 }]);
});

test("virtual resampling, contained", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = await fetch("http://localhost:3000/data/virtual-resampling/virtual-resampling-one.geojson").then(res => res.json());
  const result = await stats(url, geojson, undefined, undefined, { debug_level: 0, rescale: true, vrm: "minimal" });
  eq(result, [
    {
      count: 0.007936507936507936,
      frequency: { 38: { n: 38, freq: 1 } },
      invalid: 0,
      median: 38,
      min: 38,
      max: 38,
      product: 0.022738725119677502,
      sum: 0.30158730158730157,
      range: 0,
      mean: 38,
      valid: 0.007936507936507936,
      variance: 0,
      std: 0,
      histogram: { 38: { n: 38, ct: 0.007936507936507936 } },
      modes: [38],
      mode: 38,
      uniques: [38]
    }
  ]);
});

test("virtual resampling, intersecting 4 pixels", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = JSON.parse(readFileSync("./data/virtual-resampling/virtual-resampling-intersect.geojson", "utf-8"));
  const result = await stats(url, geojson, null, null, { include_meta: false, rescale: true, vrm: [10, 10] });
  eq(result, [
    {
      count: 0.18,
      invalid: 0,
      median: 38,
      min: 1,
      max: 38,
      product: 1.5122637183654097e-10,
      sum: 6.17,
      range: 37,
      mean: 34.27777777777778,
      valid: 0.18,
      variance: 112.20061728395062,
      std: 10.592479279373201,
      frequency: {
        1: {
          freq: 0.05555555555555555,
          n: 1
        },
        8: {
          freq: 0.05555555555555555,
          n: 8
        },
        38: {
          freq: 0.8888888888888888,
          n: 38
        }
      },
      histogram: {
        1: {
          n: 1,
          ct: 0.01
        },
        8: {
          n: 8,
          ct: 0.01
        },
        38: {
          n: 38,
          ct: 0.16
        }
      },
      modes: [38],
      mode: 38,
      uniques: [1, 8, 38]
    }
  ]);
});
