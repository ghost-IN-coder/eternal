Generate `images/logo.png` from the SVG

This repo includes `images/logo.svg`. To generate a PNG fallback named `images/logo.png` (recommended), run the following locally:

1. Initialize npm (if you don't already have a package.json):

```bash
npm init -y
```

2. Install `sharp`:

```bash
npm install sharp
```

3. Run the generator script:

```bash
node tools/generate_logo_png.js
```

This will produce `images/logo.png` in the `images/` folder. If you prefer not to install `sharp`, you can open `images/logo.svg` in an image editor and export to PNG manually.
 
Note: the script now generates both `images/logo_skull.png` and `images/logo_skull.webp` (if `sharp` is installed).
