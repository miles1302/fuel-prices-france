@echo off
echo Creating PWA icons...
echo.
echo Note: This requires ImageMagick to be installed.
echo If you don't have it, you can:
echo 1. Install from: https://imagemagick.org/script/download.php
echo 2. Or use an online converter: https://convertio.co/svg-png/
echo 3. Upload icon.svg and convert to 192x192 and 512x512 PNG
echo.

where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ImageMagick not found on this system.
    echo Please install it or convert icon.svg manually.
    pause
    exit /b
)

echo Converting icon.svg to PNG formats...
magick convert -background none -resize 192x192 icon.svg icon-192.png
magick convert -background none -resize 512x512 icon.svg icon-512.png

echo.
echo Done! Icons created:
echo - icon-192.png
echo - icon-512.png
echo.
pause
