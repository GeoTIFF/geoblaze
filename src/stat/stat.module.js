import QuickPromise from "quick-promise";
import stats from "../stats";

export default function stat(georaster, geometry, stat, test, options) {
  return QuickPromise.resolve(stats(georaster, geometry, { stats: [stat] }, test, options)).then(stats => stats.map(it => it[stat]));
}
