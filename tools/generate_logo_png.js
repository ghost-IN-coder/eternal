// Node script to convert images/logo.svg -> images/logo.png using sharp
// Usage:
//   npm init -y
//   npm install sharp
//   node tools/generate_logo_png.js

const fs = require('fs');
const path = require('path');

(async ()=>{
  try{
    const sharp = require('sharp');
    const svgPath = path.join(__dirname, '..', 'images', 'logo_skull.svg');
    const outPath = path.join(__dirname, '..', 'images', 'logo_skull.png');
    const outWebP = path.join(__dirname, '..', 'images', 'logo_skull.webp');
    if(!fs.existsSync(svgPath)){
      console.error('logo.svg not found at', svgPath); process.exit(1);
    }
    const svg = fs.readFileSync(svgPath);
    await sharp(svg).png({compressionLevel:9}).toFile(outPath);
    await sharp(svg).webp({quality:90}).toFile(outWebP);
    console.log('Wrote', outPath);
    console.log('Wrote', outWebP);
  }catch(err){
    console.error('Error: make sure you installed sharp (npm install sharp)');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
