import { Point, Polygon, Feature, BBox } from "geojson";
import { Georaster } from "georaster";

// re-rexport for easy access by downstream user
export { Georaster } from "georaster"

type GeoblazeBBox = {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
};

interface HistogramOptions {
  scaleType: "nominal" | "ratio";
  numClasses: number;
  classType: "equal-interval" | "quantile";
}

interface Histogram {
  [binKey: string]: number[];
}

// Some geoblaze methods accept a geometry, and its accepted in a variety of
// forms.  These types group them for easy reuse
type InputPolygon = number[][][] | Polygon | Feature<Polygon>;
type InputPoint = number[] | Point | Feature<Point>;
type InputBBox = BBox | GeoblazeBBox;

export const bandArithmetic: (
  raster: Georaster,
  operation: string
) => Promise<Georaster>;

export const get: (
  raster: Georaster,
  geom: InputBBox | null | undefined,
  flat: boolean
) => number[] | number[][];

export const histogram: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined,
  options: HistogramOptions
) => Histogram[];

export const identify: (
  raster: Georaster,
  geom: string | InputPoint | null | undefined
) => number[];

export const load: (urlOrFile: object | string) => Promise<Georaster>;

export const max: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => number[];

export const mean: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => number[];

export const median: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => number[];

export const min: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => number[];

export const mode: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => number[];

export const rasterCalculator: (
  raster: Georaster,
  operation: ((...cellValuesPerBand: number[]) => number) | string
) => Promise<Georaster>;

export const sum: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined,
  test?: (cellValue: number) => boolean,
  debug?: boolean
) => number[];

// Create typed object matching default export in index.js
declare const defaultExports: {
  bandArithmetic: typeof bandArithmetic;
  get: typeof get;
  histogram: typeof histogram;
  identify: typeof identify;
  load: typeof load;
  max: typeof max;
  mean: typeof mean;
  median: typeof median;
  min: typeof min;
  mode: typeof mode;
  rasterCalculator: typeof rasterCalculator;
  sum: typeof sum;
};
export default defaultExports;
