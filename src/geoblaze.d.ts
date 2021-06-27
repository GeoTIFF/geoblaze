import { Point, Polygon, Feature, BBox } from "geojson";

export interface Georaster {
  /** raster values.  first dimension is raster band, remainder is 2D array of cell values */
  values: number[][][];
  /** raster height in units of projection */
  height: number;
  /** raster width in units of projection */
  width: number;
  /** raster height in pixels */
  pixelHeight: number;
  /** raster width in pixels */
  pixelWidth: number;
  /** Projection identifier */
  projection: unknown;
  /** left boundary, in units of projection*/
  xmin: number;
  /** right boundary, in units of projection */
  xmax: number;
  /** top boundary (image y-axis is inverse of cartesian), in units of projection */
  ymin: number;
  /** bottom boundary (image y-axis is inverse of cartesian), in units of projection */
  ymax: number;
  /** cell value representing "no data" in raster */
  noDataValue: number;
  /** number of raster bands */
  numberOfRasters: number;
  /** Minimum cell value for each raster band.  Indexed by band number */
  mins: number[]
  /** Maximum cell value for each raster band.  Indexed by band number */
  maxs: number[]
  /** difference between max and min for each raster band.  Indexed by band number */
  ranges: number[]
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
  raster: Georaster,
  operation: string
): Promise<Georaster>;

export function get(
  raster: Georaster,
  geom: InputBBox | null | undefined,
  flat: boolean
): Promise<Georaster>;

// Done
export function histogram(
  raster: Georaster,
  geom: string | InputPolygon | null | undefined,
  options: HistogramOptions
): Histogram[];

export function identify(
  raster: Georaster,
  geom?: string | InputPoint | null
): number[];

export function load(urlOrFile: object | string): Promise<Georaster>;

export function max(
  raster: Georaster,
  geom: string | InputPolygon | null
): Promise<Georaster>;

export function mean(
  raster: Georaster,
  geom: string | InputPolygon | null
): Promise<Georaster>;

export function median(
  raster: Georaster,
  geom: string | InputPolygon | null
): Promise<Georaster>;

export function min(
  raster: Georaster,
  geom: string | InputPolygon | null
): Promise<Georaster>;

export function mode(
  raster: Georaster,
  geom: string | InputPolygon | null
): Promise<Georaster>;

export function rasterCalculator(
  raster: Georaster,
  operation: ((...cellValuesPerBand: number[]) => number) | string
): Georaster;

export function sum(
  raster: Georaster,
  geom: string | InputPolygon | null,
  test?: (cellValue: number) => boolean,
  debug?: boolean
): Promise<Array<number>>;
