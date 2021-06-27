import { Point, Polygon, Feature, BBox } from "geojson";
import { Georaster } from "georaster"

export type GeoblazeBBox = {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
};

export interface HistogramOptions {
  scaleType: "nominal" | "ratio";
  numClasses: number;
  classType: "equal-interval" | "quantile";
}

export interface Histogram {
  [binKey: string]: number[];
}

export type InputPolygon = number[][][] | Polygon | Feature<Polygon>;
export type InputPoint = number[] | Point | Feature<Point>;
export type InputBBox = BBox | GeoblazeBBox;

export const bandArithmetic: (
  raster: Georaster,
  operation: string
) => Promise<Georaster>;

export const get: (
  raster: Georaster,
  geom: InputBBox | null | undefined,
  flat: boolean
) => Promise<Georaster>;

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
) => Promise<Georaster>;

export const mean: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => Promise<Georaster>;

export const median: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => Promise<Georaster>;

export const min: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => Promise<Georaster>;

export const mode: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined
) => Promise<Georaster>;

export const rasterCalculator: (
  raster: Georaster,
  operation: ((...cellValuesPerBand: number[]) => number) | string
) => Georaster;

export const sum: (
  raster: Georaster,
  geom: string | InputPolygon | null | undefined,
  test?: (cellValue: number) => boolean,
  debug?: boolean
) => Promise<Array<number>>;
