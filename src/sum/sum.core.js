import resolve from "quick-resolve";
import stats from "../stats";

export default function sum(georaster, geometry, test) {
  return resolve(stats(georaster, geometry, { calcSum: true }, test)).then(stats => stats.map(({ sum }) => sum));
}
