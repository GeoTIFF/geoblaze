import resolve from "quick-resolve";
import stats from "../stats";

export default function max(georaster, geometry) {
  return resolve(stats(georaster, geometry, { calcMax: true })).then(stats => stats.map(({ max }) => max));
}
