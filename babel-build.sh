#!/bin/bash
rm -rf ./build
file_str=$(ls | grep -v ".sh\|node_modules\|.md\|.log\|.json\|Dockerfile\|webpack.config.js")
# 更改默认切片符号
OLD_IFS="$IFS"
IFS=" "
file_arr=($file_str)
IFS="$OLD_IFS"

for var in ${file_arr}
do
    if [ $(echo ${var} | grep '\.js') ];then
        babel ${var} -o build/${var}
        # echo "babel ${var} -o ${var}"
    else
        babel ${var} --out-dir build/${var}
        # echo  "babel ${var} --out-dir ${var}"
    fi
done
cp   dataBase/aldsd/redData.json  build/dataBase/aldsd/redData.json
cp  -r node_modules   build