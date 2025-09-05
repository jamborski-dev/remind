#!/bin/bash

# PWA Icon Generator Script
# Usage: ./generate-icons.sh path/to/source-logo.png

SOURCE_LOGO=${1:-"assets/img/logo.png"}

if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Error: Source logo not found at $SOURCE_LOGO"
    echo "Usage: $0 path/to/source-logo.png"
    exit 1
fi

echo "Generating PWA icons from $SOURCE_LOGO..."

# Check if we're in the public directory, if not, navigate to it
if [ ! -d "public" ]; then
    if [ -d "../public" ]; then
        cd ..
    else
        echo "Error: Cannot find public directory"
        exit 1
    fi
fi

cd public

# Generate different sizes
echo "Creating 192x192 icon..."
sips -z 192 192 "$SOURCE_LOGO" --out logo192.png

echo "Creating 512x512 icon..."
sips -z 512 512 "$SOURCE_LOGO" --out logo512.png

echo "Creating Apple Touch Icons..."
sips -z 180 180 "$SOURCE_LOGO" --out apple-touch-icon.png
sips -z 152 152 "$SOURCE_LOGO" --out apple-touch-icon-152x152.png

echo "Creating favicons..."
sips -z 32 32 "$SOURCE_LOGO" --out favicon-32x32.png
sips -z 16 16 "$SOURCE_LOGO" --out favicon-16x16.png

echo "Creating favicon.ico..."
sips -s format ico favicon-32x32.png --out favicon.ico

echo "✅ All PWA icons generated successfully!"
echo ""
echo "Generated files:"
echo "- logo192.png (192x192)"
echo "- logo512.png (512x512)"
echo "- apple-touch-icon.png (180x180)"
echo "- apple-touch-icon-152x152.png (152x152)"
echo "- favicon-32x32.png (32x32)"
echo "- favicon-16x16.png (16x16)"
echo "- favicon.ico"
echo ""
echo "Your PWA manifest and HTML files should now reference these icons."
