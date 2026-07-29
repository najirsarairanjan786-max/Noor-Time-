#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

ICON="/app/applet/public/icon-512.png"

# Crop the center to remove text (assuming text is at bottom, we crop top portion)
convert $ICON -gravity North -crop 512x400+0+0 -gravity center -background transparent -extent 512x512 /tmp/cropped.png

# Generate Foreground (The cropped logo)
convert /tmp/cropped.png -resize 432x432 -background transparent -gravity center -extent 432x432 /tmp/ic_launcher_foreground.png

# Generate Background (Solid color based on the corner of the original image)
BG_COLOR=$(convert $ICON -format "%[pixel:p{0,0}]" info:)
convert -size 432x432 xc:"$BG_COLOR" /tmp/ic_launcher_background.png

# Generate standard ic_launcher.png (Foreground over Background)
convert /tmp/ic_launcher_background.png /tmp/ic_launcher_foreground.png -composite /tmp/ic_launcher.png

# Generate round ic_launcher_round.png (Circular mask)
convert -size 512x512 xc:none -fill white -draw "circle 256,256 256,1" /tmp/mask.png
convert /tmp/ic_launcher.png -resize 512x512 \
    /tmp/mask.png -alpha off -compose CopyOpacity -composite \
    /tmp/ic_launcher_round.png

# Now distribute to mipmap folders
RES="/app/applet/android/app/src/main/res"

# mdpi - 48x48
mkdir -p $RES/mipmap-mdpi
convert /tmp/ic_launcher.png -resize 48x48 $RES/mipmap-mdpi/ic_launcher.png
convert /tmp/ic_launcher_round.png -resize 48x48 $RES/mipmap-mdpi/ic_launcher_round.png
convert /tmp/ic_launcher_foreground.png -resize 108x108 $RES/mipmap-mdpi/ic_launcher_foreground.png
convert /tmp/ic_launcher_background.png -resize 108x108 $RES/mipmap-mdpi/ic_launcher_background.png

# hdpi - 72x72
mkdir -p $RES/mipmap-hdpi
convert /tmp/ic_launcher.png -resize 72x72 $RES/mipmap-hdpi/ic_launcher.png
convert /tmp/ic_launcher_round.png -resize 72x72 $RES/mipmap-hdpi/ic_launcher_round.png
convert /tmp/ic_launcher_foreground.png -resize 162x162 $RES/mipmap-hdpi/ic_launcher_foreground.png
convert /tmp/ic_launcher_background.png -resize 162x162 $RES/mipmap-hdpi/ic_launcher_background.png

# xhdpi - 96x96
mkdir -p $RES/mipmap-xhdpi
convert /tmp/ic_launcher.png -resize 96x96 $RES/mipmap-xhdpi/ic_launcher.png
convert /tmp/ic_launcher_round.png -resize 96x96 $RES/mipmap-xhdpi/ic_launcher_round.png
convert /tmp/ic_launcher_foreground.png -resize 216x216 $RES/mipmap-xhdpi/ic_launcher_foreground.png
convert /tmp/ic_launcher_background.png -resize 216x216 $RES/mipmap-xhdpi/ic_launcher_background.png

# xxhdpi - 144x144
mkdir -p $RES/mipmap-xxhdpi
convert /tmp/ic_launcher.png -resize 144x144 $RES/mipmap-xxhdpi/ic_launcher.png
convert /tmp/ic_launcher_round.png -resize 144x144 $RES/mipmap-xxhdpi/ic_launcher_round.png
convert /tmp/ic_launcher_foreground.png -resize 324x324 $RES/mipmap-xxhdpi/ic_launcher_foreground.png
convert /tmp/ic_launcher_background.png -resize 324x324 $RES/mipmap-xxhdpi/ic_launcher_background.png

# xxxhdpi - 192x192
mkdir -p $RES/mipmap-xxxhdpi
convert /tmp/ic_launcher.png -resize 192x192 $RES/mipmap-xxxhdpi/ic_launcher.png
convert /tmp/ic_launcher_round.png -resize 192x192 $RES/mipmap-xxxhdpi/ic_launcher_round.png
convert /tmp/ic_launcher_foreground.png -resize 432x432 $RES/mipmap-xxxhdpi/ic_launcher_foreground.png
convert /tmp/ic_launcher_background.png -resize 432x432 $RES/mipmap-xxxhdpi/ic_launcher_background.png

echo "Icons generated successfully"
