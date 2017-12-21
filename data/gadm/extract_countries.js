const fs = require("fs");
const shapefile = require("shapefile");

shapefile.open("gadm28_adm0.shp")
  .then(source => source.read()
    .then(function log(result) {
      if (result.done) return;
      let value = result.value;
      let name = value.properties.NAME_ENGLI;
      console.log(name);
      let filepath = "geojsons/" + name + ".geojson";
      fs.writeFile(filepath, JSON.stringify(value), error => {
        if (error) throw error;
        console.log("wrote " + filepath);
      });
      return source.read().then(log);
    }))
  .catch(error => console.error(error.stack));
