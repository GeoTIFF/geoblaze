## v2.3.0 (2023-09-17)

### :boom: Breaking Changes
* refactored stats calculation such that no data values are now included in the total `"count"` property of the return object.  Previously, geoblaze completely ignored no data values.  However, this shouldn't impact any of the statistical results like sum and median.  If you want to get the total number of valid values in an area, look for the `"valid"` property value in the stats result object.
* improved antimeridian support (described below) could potentially lead to changed results for geometries that cross the antimeridian.  The new results should be treated as more accurate.

### :rocket: New Feature / Improvement
* when a multi-polygon is used where the polygons are far apart, geoblaze will now make multiple smaller samples instead of sampling the whole area that contains all the polygons.  A practical example is when a multipolygon includes polygons that border each side of the antimeridian, previously GeoBlaze would sample a bounding box across the whole world (from nearly -180 to 180 longitude).  This could lead to memory issues and stalling.  Now, GeoBlaze samples from each side of the world separately.

### :bug: Bug Fix
* fixed seemingly never-ending stalling when sampling across the antimeridian

### :house: Internal

* refactored stats to use the defaults as defined by https://github.com/danieljdufour/calc-stats
* added a geojson and shapefile that cross the antimeridian to the test data
* replace [quick-resolve](https://github.com/danieljdufour/quick-resolve) with [quick-promise](https://github.com/danieljdufour/quick-promise)

### :memo: Documentation

* No changes


## v2.2.0 (2023-08-12)

### :boom: Breaking Changes
* none

### :rocket: New Feature / Improvement
* stats now includes product (all pixel values within an area multiplied together) because we upgraded calc-stats to the newest version

### :bug: Bug Fix
* intersect-polygon now accounts for cases where the geometry's extent is totally outside the extent of the geotiff, returning early
* upgrading snap-bbox, fixing where pixels on the edge of a geotiff where missed

### :house: Internal

* added some tests
* updated some test values to account for new product value returned by calc-stats
* added some more test data

### :memo: Documentation

* No changes


## v2.1.0 (2023-07-23)

### :boom: Breaking Changes
* Updated convertCrsBboxToImageBbox to properly exclude pixels that barely touch a polygon (i.e. whose pixel centroid doesn't intersect the aoi geometry).  This will mean that stats results for rectangular aois could change.  You might also see an error thrown saying no valid pixels, whereas before some intersecting pixels were mistakenly included in the calculation.  Changes are only expected for rectangular geometries whether they are defined as bounding boxes or rectangular polygons (geoblaze is smart enough to identify a bbox masquerading as a polygon).  Non-rectangular geometries should not be affected by any of these changes.

### :rocket: New Feature / Improvement
* Refactored convertCrsBboxToImageBbox in utils.module.js, so that only pixels whose centroid is within the provided rectangle are used for stats calculations.  This is making sure rectangles and bounding boxes are treated the same as other polygons.

### :bug: Bug Fix
* Fixed bug in our Github CI workflow whereby gdal_translate wasn't working, because I had forgotten to add instructions to install it

### :house: Internal

* added roundDown function to utils.module.js (copying it from dufour-peyton-intersection)
* added more testing
* committed some new test data files

### :memo: Documentation

* No changes


## v2.0.0 (2023-07-10)

### :boom: Breaking Changes

* Pixels whose centroid lies precisely on the intersection of the polygon line segment and the center-line of a pixel row are now snapped out towards the exterior of the polygon.  (In other words, we round down from 0.5 not up when calculating the left edge or minimum x value of a strip of intersecting pixels)

### :rocket: New Feature / Improvement
* Rigorous support for topologically "complex" geometries with overlapping holes or polygons.  There is a small performance hit for geometries with holes or multiple polygons because of the new deconfliction/merging steps.

### :bug: Bug Fix
* Fixed bug where the bounding box calculation for MultiPolygon geometries was sometimes only using the first polygon.
* Fixed bug whereby overlapping polygons or overlapping holes were misidentifying overlap as "inside" the polygon
* Fixed bug where sometimes No Data or NaN values were passed to the statistical calculations

### :house: Internal

* Replaced bespoke code for pulling polygons from a provided geometry with [mpoly](https://github.com/DanielJDufour/mpoly)
* Replaced bespoke bounding box calculation with [bbox-fns](https://github.com/danieljdufour/bbox-fns)
* Used [rasterstats](https://github.com/perrygeo/python-rasterstats) to generate "truth" test data.  Results are now very similar to rasterstats, often identical.  However, sometimes rasterstats and geoblaze will have results that are a few pixels different (representing less than 1% of pixels) for large complex areas.  Further investigation is required.
* Use [write-image](https://github.com/danieljdufour/write-image) internally to visualize intersections, adding a manual visual way to check intersection calculations
* Use new version of [dufour-peyton-intersection](https://github.com/geotiff/dufour-peyton-intersection)

### :memo: Documentation

* No changes
