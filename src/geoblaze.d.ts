import { Point, Polygon, Feature, BBox } from "geojson";

/** Migrate to georaster library */
export class GeoRaster {
  constructor(
    data: object | string | Buffer | ArrayBuffer | number[][],
    metadata: any,
    debug: any
  );
}

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

export function bandArithmetic(
  raster: GeoRaster,
  operation: string
): Promise<GeoRaster>;

export function get(
  raster: GeoRaster,
  geom: InputBBox | null | undefined,
  flat: boolean
): Promise<GeoRaster>;

// Done
export function histogram(
  raster: GeoRaster,
  geom: string | InputPolygon | null | undefined,
  options: HistogramOptions
): Histogram[];

export function identify(
  raster: GeoRaster,
  geom?: string | InputPoint | null
): unknown[];

export function load(urlOrFile: object | string): Promise<GeoRaster>;

export function max(
  raster: GeoRaster,
  geom: string | InputPolygon | null
): Promise<GeoRaster>;

export function mean(
  raster: GeoRaster,
  geom: string | InputPolygon | null
): Promise<GeoRaster>;

export function median(
  raster: GeoRaster,
  geom: string | InputPolygon | null
): Promise<GeoRaster>;

export function min(
  raster: GeoRaster,
  geom: string | InputPolygon | null
): Promise<GeoRaster>;

export function mode(
  raster: GeoRaster,
  geom: string | InputPolygon | null
): Promise<GeoRaster>;

export function rasterCalculator(
  raster: GeoRaster,
  operation: (() => unknown) | string
): GeoRaster;

export function sum(
  raster: GeoRaster,
  geom: string | InputPolygon | null,
  test?: (cellValue: unknown) => boolean,
  debug?: boolean
): Promise<Array<unknown>>;
