#!/bin/bash

echo "Creating PWA icons from SVG..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null
then
    echo "ImageMagick not found. Please install it to generate PNG icons."
    echo "On Windows: https://imagemagick.org/script/download.php"
    echo "Or use an online SVG to PNG converter for icon.svg"
    exit 1
fi

# Generate 192x192 icon
convert -background none -resize 192x192 icon.svg icon-192.png
echo "Generated icon-192.png"

# Generate 512x512 icon
convert -background none -resize 512x512 icon.svg icon-512.png
echo "Generated icon-512.png"

echo "Done! Icons created successfully."
