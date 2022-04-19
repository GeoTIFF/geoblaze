import resolve from "quick-resolve";
import stats from "../stats";

export default function mean(georaster, geometry) {
  return resolve(stats(georaster, geometry, { calcMean: true })).then(stats => stats.map(({ mean }) => mean));
}
