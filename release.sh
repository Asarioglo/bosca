#!/bin/bash

# get the first parameter from the command line. Must be prod or staging
# exit with an error if no parameter provided
if [ -z "$1" ]
  then
    echo "No argument supplied. Must be prod or staging"
    exit 1
fi
DEPL_TYPE=$1

# If prod, then get the production manifest, if staging get the staging manifest
if [ $DEPL_TYPE = "prod" ]
  then
    MANIFEST=configs/production.manifest.json
elif [ $DEPL_TYPE = "staging" ]
  then
    MANIFEST=configs/staging.manifest.json
else
  echo "Invalid argument. Must be prod or staging"
  exit 1
fi

DIST_DIR="dist"
VERSION=$(jq -r '.version' $MANIFEST)
NAME=$(jq -r '.name' $MANIFEST)
ZIP_NAME="$NAME-$DEPL_TYPE-$VERSION.zip"

########## BUILD CONTENT AND BACKGROUND SCRIPTS ##########
# remove the dist folder if it exists
rm -r $DIST_DIR

# copy the production configuration file
mv src/background/config.json src/background/config.json.bak
cp configs/production.config.json src/background/config.json

npm run build:prod
# copy the original configuration file back
mv src/background/config.json.bak src/background/config.json

########## END BUILD CONTENT AND BACKGROUND SCRIPTS ##########

########## BUILD POPUP ##########
# navigate to the popup-react folder and build the project
cd src/popup-react
npm run build
########## END BUILD POPUP ##########

# navigate back to the parent directory
cd ../..

shopt -s extglob # enable extended globbing syntax

# Copy the necessary folders
# cp -r background $DIST_DIR/
cp -r assets $DIST_DIR/
cp $MANIFEST $DIST_DIR/manifest.json

# Now copy the popup files, but it needs some special treatment

# create a popup-react/build directory in dist if it doesn't exist
mkdir -p $DIST_DIR/src/popup
# react's manifest is conflicting with the extension maniffest, remove it
rm src/popup-react/build/manifest.json
# sed -i '/<link rel="manifest" href="\.\/manifest\.json" \/>/d' popup-react/build/index.html

# copy the popup-react/build folder to dist, preserving the directory structure
cp -r src/popup-react/build/* $DIST_DIR/src/popup/

# create a zip archive of the dist directory
zip -r $ZIP_NAME $DIST_DIR/*
mv $ZIP_NAME $DIST_DIR/

# remove the dist directory
# rm -r dist

echo "Done!"