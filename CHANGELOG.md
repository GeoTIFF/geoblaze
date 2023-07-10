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
