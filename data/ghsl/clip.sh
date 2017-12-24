echo "clipping select countries"

echo "clipping Croatia"

srcfile="GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326.tif";

geojsons="../gadm/geojsons/";
admins="admins/";

#https://stackoverflow.com/questions/8880603/loop-through-an-array-of-strings-in-bash
declare -a country_names=("Croatia" "Cyprus" "Lebanon" "Macedonia")

for name in "${country_names[@]}"
do
    gdalwarp -crop_to_cutline -cutline "${geojsons}${name}.geojson" -overwrite $srcfile "${admins}${name}.tif";
done