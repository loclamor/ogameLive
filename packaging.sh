#!/bin/bash

rm -R ./dist
mkdir ./dist

MANIFEST_FILE_NAME="manifest.json"

cp -r src/ dist/src
cp -r contribs/ dist/contribs
cp -r _locales/ dist/_locales
cp  $MANIFEST_FILE_NAME ./dist/$MANIFEST_FILE_NAME

cd ./dist
sed -i "s/12345/$1/g" "$MANIFEST_FILE_NAME"

zip -qr -X "ogamelive-$1-chrome.zip" * 
echo "Packing zip for chrome $1 complete!"

# Modifing chrome-extension:// to moz-extension://
# sed -i "s/chrome/moz/g" "$CSS_FILE_NAME"
zip -qrm -X "ogamelive-$1-firefox.zip" * -x "ogamelive-$1-chrome.zip"
echo "Packing zip for firefox $1 complete!"
