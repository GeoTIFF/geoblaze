import QuickPromise from "quick-promise";
import stats from "./stats";

export default function stat(georaster, geometry, stat, test) {
  return QuickPromise.resolve(stats(georaster, geometry, { stats: [stat] }, test)).then(stats => stats.map(it => it[stat]));
}
