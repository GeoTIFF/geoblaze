declare -a relevant_tiles=("-90_20" "-80_20" "-60_-30" "10_50" "20_50" "30_40" "60_40")

for name in "${relevant_tiles[@]}"
do
    sleep 5; # avoid overloading AWS server and 503 Service Unavailable error
    tilename="GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_${name}.tif";
    wget "https://s3.amazonaws.com/geoblaze/GHSL_Tiles/${tilename}" -O "tiles/${tilename}"
done
