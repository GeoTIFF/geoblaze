import resolve from "quick-resolve";
import stats from "../stats";

export default function mode(georaster, geometry) {
  return resolve(stats(georaster, geometry, { calcMode: true })).then(stats => stats.map(({ mode }) => mode));
}
