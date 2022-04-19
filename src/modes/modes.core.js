import resolve from "quick-resolve";
import stats from "../stats";

export default function modes(georaster, geometry) {
  return resolve(stats(georaster, geometry, { calcModes: true })).then(stats => stats.map(({ modes }) => modes));
}
