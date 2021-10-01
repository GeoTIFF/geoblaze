import test from 'flug';
import load from '../load';
import get from './get.module';

const urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const bboxRwanda = require('../../data/RwandaBufferedBoundingBox.json');

test('Got Correct Flat Values when Geom bigger than Raster', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height * georaster.width);
});

test('Got Correct 2-D Values when Geom bigger than Raster', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height);
  eq(actualValues[0][0].length, georaster.width);
});

test('Got Correct flat values for whole raster', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const flat = true;
  const actualValues = get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height * georaster.width);
});
