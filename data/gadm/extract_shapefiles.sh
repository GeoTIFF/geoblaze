# extract some countries to shapefiles
countries="Afghanistan Croatia Cyprus Jamaica Lebanon Macedonia Mexico Nicaragua Ukraine Uruguay"
for country in $countries
do
    ogr2ogr -f "ESRI Shapefile" -where "NAME_ENGLI = '$country'" shapefiles/$country.shp gadm28_adm0.shp
    bash -c "cd shapefiles && zip -r $country.zip $country.*"
done
