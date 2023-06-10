from rasterstats import zonal_stats
from rasterstats.utils import VALID_STATS

# known limitations
# - just for first band
# - doesn't handle overlapping polygons

test_cases = [
  ["part-of-india.geojson", "test.tiff"],
  ["part-of-india-2.geojson", "test.tiff"],
  ["part-of-india-3.geojson", "test.tiff"],
  ["./gadm/geojsons/Akrotiri and Dhekelia.geojson", "test.tiff"],
  ["./gadm/geojsons/Afghanistan.geojson", "./mapspam/spam2005v3r2_harvested-area_wheat_total.tiff"],
  ["./gadm/geojsons/Akrotiri and Dhekelia.geojson", "./ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif"],
  ["./gadm/geojsons/Ukraine.geojson", "./mapspam/spam2005v3r2_harvested-area_wheat_total.tiff"],
  ["./veneto/veneto.geojson", "./veneto/geonode_atlanteil.tif"],
]

for i, (geom, raster) in enumerate(test_cases):
  print("\n\ncase: " + str(i + 1))
  feature_stats = zonal_stats(geom, raster, stats=VALID_STATS, band=1)

  # merge feature_stats (doesn't handle overlapping polygons)
  results = {
    "count": sum(f['count'] for f in feature_stats),
    "min": min(f['min'] for f in feature_stats),
    "max": min(f['max'] for f in feature_stats),
    "sum": sum(f['sum'] for f in feature_stats),
  }
  print("  vector: " + geom)
  print("  raster: " + raster)
  print("  result:")
  for key, value in results.items():
    print(f"        {key}: {value:,}")

