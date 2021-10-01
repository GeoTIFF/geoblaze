import test from 'flug';
import fetch from 'cross-fetch';
import load from '../load';
import get from './get.module';

const urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const bboxRwanda = require('../../data/RwandaBufferedBoundingBox.json');

test('Got Correct Flat Values when Geom bigger than Raster', async ({ eq }) => {
  const georaster = await fetch(urlRwanda).then(r => r.arrayBuffer()).then(load);
  const actualValues = get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  console.log(actualValues[0].filter(it => it === undefined).length);
  eq(actualValues[0].length, georaster.height * georaster.width);
});

test('Got Correct 2-D Values when Geom bigger than Raster', async ({ eq }) => {
  const georaster = await fetch(urlRwanda).then(r => r.arrayBuffer()).then(load);
  const actualValues = get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height);
  eq(actualValues[0][0].length, georaster.width);
});

test('Got Correct flat values for whole raster', async ({ eq }) => {
  const georaster = await fetch(urlRwanda).then(r => r.arrayBuffer()).then(load);
  const flat = true;
  const actualValues = get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height * georaster.width);
});


test('Got Correct Flat Values when Geom bigger than Raster (from URL)', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height * georaster.width);
});

test('Got Correct 2-D Values when Geom bigger than Raster (from URL)', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height);
  eq(actualValues[0][0].length, georaster.width);
});

test('Got Correct flat values for whole raster (from URL)', async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const flat = true;
  const actualValues = await get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, georaster.height * georaster.width);
});
