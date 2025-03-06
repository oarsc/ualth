#!/usr/bin/env bash

function removeFolder {
    folderPath="$1"
    originPath="$2"

    rm -fr "$folderPath"

    ln -s "$PWD/$originPath" "$folderPath"
}

removeFolder "out/ualth-linux-x64/resources/app/assets" "assets"
removeFolder "out/ualth-linux-x64/resources/app/build" "build"
removeFolder "out/ualth-linux-x64/resources/app/dist" "dist"
removeFolder "out/ualth-linux-x64/resources/app/node_modules" "node_modules"
removeFolder "out/ualth-linux-x64/resources/app/public" "public"
removeFolder "out/ualth-linux-x64/resources/app/src" "src"
removeFolder "build/icons" "public/icons"
