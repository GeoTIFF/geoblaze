import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import statsCore from "./stats.core";

export default function stats(...rest) {
  return wrapParse(wrapGeom(statsCore))(...rest);
}