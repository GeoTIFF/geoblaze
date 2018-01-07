declare -a relevant_tiles=("-90_20" "-80_20" "-60_-30" "10_50" "20_50" "30_40" "60_40")

for name in "${relevant_tiles[@]}"
do
    tilename="GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_${name}.tif";
    aws s3 cp "tiles/${tilename}" s3://geoblaze/GHSL_Tiles/${tilename};
done
