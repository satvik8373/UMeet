import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];

async function generateIcons() {
  const publicDir = join(__dirname, '..', 'public');
  const iconsDir = join(publicDir, 'icons');

  // Ensure icons directory exists
  await mkdir(iconsDir, { recursive: true });

  // Read the SVG file
  const svgBuffer = await sharp(join(iconsDir, 'icon.svg'))
    .toBuffer();

  // Generate PNG files for each size
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 