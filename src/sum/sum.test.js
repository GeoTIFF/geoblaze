import utils from '../utils';
import test from 'flug';
import load from '../load';
import sum from './sum.module';
import { polygon as turfPolygon } from '@turf/helpers';

const { fetchJson, fetchJsons } = utils;

const urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const bboxRwanda = require('../../data/RwandaBufferedBoundingBox.json');

const urlToData = 'http://localhost:3000/data/';
const urlToGeojsons =  urlToData + 'gadm/geojsons/';
const urlToArcgisJsons = urlToData + 'gadm/arcgis/';

const url = 'http://localhost:3000/data/test.tiff';
const bbox = [80.63, 7.42, 84.21, 10.10];
const expectedBboxValue = 262516.50;

const polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
const expectedPolygonValue = 3165731.9;


const polygonGeojson1 = `{
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

const expectedPolygonGeojsonValue1 = 320113.1;

const polygonGeojson2 = `{
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

const expectedPolygonGeojsonValue2 = 141335.5;

const polygonGeojsonCollection = `{
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

const expectedPolygonGeojsonCollectionValue = expectedPolygonGeojsonValue1 + expectedPolygonGeojsonValue2;

test('Get Sum from Veneto Geonode', async ({ eq }) => {
  const values = [
    await load('https://s3.amazonaws.com/geoblaze/geonode_atlanteil.tif'),
    await fetchJson('https://s3.amazonaws.com/geoblaze/veneto.geojson')
  ];
  const [georaster, geojson] = values;
  const actualValue = Number(sum(georaster, geojson)[0].toFixed(2));
  const expectedValue = 25323.11;
  eq(actualValue, expectedValue);
});

test('Get Sum', async ({ eq }) => {
  const georaster = await load(url);
  const actualValue = Number(sum(georaster)[0].toFixed(2));
  const expectedValue = 108343045.4;
  eq(actualValue, expectedValue);
});

test('Get Sum from Bounding Box', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, bbox)[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test('Get Sum from Bounding Box Greater Then Raster', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const valueWithBufferedBbox = Number(sum(georaster, bboxRwanda)[0].toFixed(2));
  const valueWithoutBbox = Number(sum(georaster)[0].toFixed(2));
  eq(valueWithBufferedBbox, 104848.45);
  eq(valueWithoutBbox, 104848.45);
  eq(valueWithBufferedBbox, valueWithoutBbox);
});

test('Get Same Sum from GeoJSON and ESRI JSON', async ({ eq }) => {
  const urlToRaster = urlToData + 'mapspam/spam2005v3r2_harvested-area_wheat_total.tiff';
  const georaster = await load(urlToRaster);
  const countryNames = ['Afghanistan', 'Ukraine'];
  for (let i = 0; i < countryNames.length; i++) {
    const name = countryNames[i];
    const jsons = await fetchJsons([urlToGeojsons + name + '.geojson', urlToArcgisJsons + name + '.json'], true);
    const [geojson, arcgisJson] = jsons;
    const valueViaGeojson = Number(sum(georaster, geojson)[0].toFixed(2));
    const valueViaArcgisJson = Number(sum(georaster, arcgisJson)[0].toFixed(2));
    const valueViaArcgisJsonPolygon = Number(sum(georaster, arcgisJson.geometry)[0].toFixed(2));
    eq(valueViaGeojson, valueViaArcgisJson);
    eq(valueViaGeojson, valueViaArcgisJsonPolygon);
  }
});

test('Get Sum from Polygon', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});


test('Get Sum from Polygon (GeoJSON) 1', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojson1)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue1);
});

test('Get Sum from Polygon (GeoJSON) 2', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojson2)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue2);
});

test('Get Sum from Polygon (Multi-Polygon GeoJSON, 1 + 2)', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojsonCollection)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonCollectionValue);
});

test('Test sum for Country with Multiple Rings', async ({ eq }) => {
  const georaster = await load(url);
  const country = await utils.fetchJson(urlToGeojsons + 'Akrotiri and Dhekelia.geojson');
  const result = sum(georaster, country);
  // eq(result, [123]);
});

test('Get Sum from Polygon Above X Value', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygon, v => v > 3000)[0].toFixed(2));
  eq(value, 1501820.8);
});



test('Test Super Simplified Albanian Polygon', async ({ eq }) => {
  const feature = await utils.fetchJson(urlToData + 'gadm/derived/super-simplified-albanian-polygon.geojson');
  const georaster = await load(urlToData + 'ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_60_40.tif');
  const result = sum(georaster, turfPolygon(polygon))[0];
  eq(result, 0);
});

// describe('Get Populations', function () {
//   this.timeout(1000000);
//   it('Got Correct Populations for a Sample of Countries', () => {
//     const countries = [
//       { 'population': 790242.0, 'name': 'Cyprus' },
//       { 'population': 5066313.5, 'name': 'Nicaragua' },
//       { 'population': 5554059.5, 'name': 'Lebanon' },
//       { 'population': 2332581.75, 'name': 'Jamaica' },
//       { 'population': 4685367.5, 'name': 'Croatia' },
//       { 'population': 2234089.5, 'name': 'Macedonia' },
//       { 'population': 3303561.5, 'name': 'Uruguay' }
//     ];
//     const promises = countries.map(country => {
//       return fetchJson(urlToGeojsons + country.name + '.geojson').then(countryGeojson => {
//         const countryBbox = turfBbox(countryGeojson);
//         const [minX, minY, maxX, maxY] = countryBbox;
//         const left = Math.round((minX - 5) / 10) * 10;
//         const right = Math.round((maxX - 5) / 10) * 10;
//         const _bottom = 90 - 10 * Math.floor((90 - minY) / 10);
//         const _top = 90 - 10 * Math.floor((90 - maxY) / 10);

//         const latitudes = _.range(_top, _bottom -1, -10);
//         const longitudes = _.range(left, right + 1, 10);
//         const tiles = [];
//         latitudes.forEach(latitude => {
//           longitudes.forEach(longitude => {
//             tiles.push(load(urlToData + 'ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_' + longitude + '_' + latitude + '.tif'));
//           });
//         });
//         return Promise.all(tiles).then(georasters => {
//           let totalSum = 0;
//           if (countryGeojson.geometry.type === 'MultiPolygon') {
//             countryGeojson.geometry.coordinates.map((polygon, polygonIndex) => {

//               if (polygonIndex === 129) {
//                 fs.writeFile('/tmp/poly' + polygonIndex + '.geojson', JSON.stringify(turfPolygon(polygon)));
//               }
//               try {
//                 georasters.forEach(georaster => {
//                   let partialSum = sum(georaster, turfPolygon(polygon));
//                   if (Array.isArray(partialSum)) partialSum = partialSum[0];
//                   if (partialSum > 0) {
//                     totalSum += partialSum;
//                   }
//                 });
//               } catch (error) {
//                 fs.writeFile('/tmp/poly' + polygonIndex + '.geojson', JSON.stringify(turfPolygon(polygon)));
//                 throw error;
//               }
//             });
//           } else {
//             georasters.forEach(georaster => {
//               let partialSum = sum(georaster, countryGeojson);
//               if (Array.isArray(partialSum)) partialSum = partialSum[0];
//               if (partialSum > 0) {
//                 totalSum += partialSum;
//               }
//             });
//           }
//           const percentOff = Math.abs(country.population - totalSum) / country.population;
//           expect(percentOff).to.be.below(0.05);
//         });
//       });
//     });
//     return Promise.all(promises);
//   });
// });
