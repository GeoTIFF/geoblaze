import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import sumCore from "./sum.core";

export default function sum(...rest) {
  return wrapParse(wrapGeom(sumCore))(...rest);
}