const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convert() {
  const inputPath = path.join(__dirname, '..', 'designs', 'muscle-front.svg');
  const outputDir = path.join(__dirname, '..', 'assets', 'images', 'characters');
  const outputPath = path.join(outputDir, 'muscle-front.png');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(inputPath)
    .resize(555, 1116)
    .png()
    .toFile(outputPath);

  const stat = fs.statSync(outputPath);
  console.log('Done: muscle-front.png 555x1116 (' + stat.size + ' bytes)');
}

convert().catch(console.error);
