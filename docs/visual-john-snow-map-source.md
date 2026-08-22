# John Snow cholera map replacement

This replaces the site-authored cholera schematic with the clean high-resolution
John Snow map selected by the site owner:

https://commons.wikimedia.org/wiki/File:Snow-cholera-map-1.jpg

The fetch script downloads Wikimedia's 3840×3602 derivative and creates a
2400-pixel-wide WebP for site display.

From the repository root:

    bash scripts/fetch-john-snow-cholera-map.sh
    npm run build

The source file is a faithful reproduction of John Snow's 1854 public-domain map.
Wikimedia Commons marks it as free of known copyright restrictions.
