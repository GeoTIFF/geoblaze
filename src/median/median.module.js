import resolve from "quick-resolve";
import stats from "../stats";

export default function median(georaster, geometry) {
  return resolve(stats(georaster, geometry, { calcMedian: true })).then(stats => stats.map(({ median }) => median));
}
