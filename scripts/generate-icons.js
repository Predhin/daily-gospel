import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons() {
  const sizes = [192, 512];
  const svgPath = join(__dirname, '..', 'public', 'icon.svg');

  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '..', 'public', `icon-${size}x${size}.png`));
  }
}

generateIcons().catch(console.error);
