import test from 'flug';
import load from '../load';
import max from './max.module';

const url = 'http://localhost:3000/data/test.tiff';

const bbox = [80.63, 7.42, 84.21, 10.10];
const expectedBboxValue = 5166.70;

const polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
const expectedPolygonValue = 7807.40;

test('Got Correct Get Max from Bounding Box', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(max(georaster, bbox)[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test('Get Max from Polygon', async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(max(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test('Get Max from Raster without polygon', async ({ eq }) => {
  const georaster = await load(url);
  const value = max(georaster)[0];
  eq(value, 8131.2);
});
