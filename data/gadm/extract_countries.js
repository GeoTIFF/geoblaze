const fs = require("fs");
const shapefile = require("shapefile");
const ArcGIS = require('terraformer-arcgis-parser');


const countries_to_extract = new Set([
  "Afghanistan",
  "Akrotiri and Dhekelia",
  "Croatia",
  "Cyprus",
  "Jamaica",
  "Nicaragua",
  "Lebanon",
  "Macedonia",
  "Uruguay",
  "Ukraine"
]);

function write_to_file(filepath, obj) {
  fs.writeFile(filepath, JSON.stringify(obj), error => {
  if (error) throw error;
    console.log("wrote " + filepath);
  });  
}

shapefile.open("gadm28_adm0.shp")
  .then(source => source.read()
    .then(function log(result) {
      if (result.done) return;

      let geojson = result.value;
      
      let name = geojson.properties.NAME_ENGLI;
      if (countries_to_extract.has(name)) {
        write_to_file("geojsons/" + name + ".geojson", geojson);
        write_to_file("arcgis/" + name + ".json", ArcGIS.convert(geojson));
      }
      return source.read().then(log);
    }))
  .catch(error => console.error(error.stack));