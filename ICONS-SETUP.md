# Installation des icônes PWA

Pour générer les icônes PNG à partir du fichier SVG, vous avez plusieurs options :

## Option 1 : Avec ImageMagick (Recommandé)

### Windows
1. Téléchargez ImageMagick depuis : https://imagemagick.org/script/download.php
2. Installez-le (cochez "Add to PATH" pendant l'installation)
3. Exécutez `generate-icons.bat`

### Linux/Mac
```bash
# Installer ImageMagick
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick

# Puis générer les icônes
bash generate-icons.sh
```

## Option 2 : En ligne (Plus simple)

1. Allez sur https://convertio.co/svg-png/
2. Uploadez `icon.svg`
3. Convertissez en PNG
4. Redimensionnez à 192x192 pixels → Sauvegardez comme `icon-192.png`
5. Redimensionnez à 512x512 pixels → Sauvegardez comme `icon-512.png`

## Option 3 : Avec un éditeur d'images

Ouvrez `icon.svg` dans :
- Inkscape (gratuit)
- Adobe Illustrator
- Figma
- GIMP

Exportez en PNG aux dimensions :
- 192 x 192 pixels → `icon-192.png`
- 512 x 512 pixels → `icon-512.png`

## Vérification

Après génération, vous devriez avoir :
- ✅ icon.svg
- ✅ icon-192.png
- ✅ icon-512.png

Ces fichiers permettront à l'application d'être installée comme PWA sur mobile!
