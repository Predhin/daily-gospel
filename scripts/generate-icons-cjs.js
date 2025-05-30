const sharp = require('sharp');
const path = require('path');

const sizes = [192, 512];
const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');

async function generateIcon(size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', 'public', `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} icon`);
  } catch (error) {
    console.error(`Error generating ${size}x${size} icon:`, error);
  }
}

Promise.all(sizes.map(generateIcon))
  .then(() => console.log('All icons generated'))
  .catch(console.error);
