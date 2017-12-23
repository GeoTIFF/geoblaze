if [ ! -f gadm28_levels.shp.zip ]; then
    wget http://biogeo.ucdavis.edu/data/gadm2.8/gadm28_levels.shp.zip
fi

if [ ! -f gadm28_adm0.shp ]; then
    unzip gadm28_levels.shp.zip
fi
