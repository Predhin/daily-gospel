import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons() {
  const sizes = [192, 512];
  
  // Create a rounded square with the app color
  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#fbbf24" rx="64"/>
      <rect x="96" y="96" width="320" height="320" fill="white" rx="16"/>
      <path d="M256 176v160M176 256h160" stroke="#fbbf24" stroke-width="32" stroke-linecap="round"/>
    </svg>
  `;

  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '..', 'public', `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error);
