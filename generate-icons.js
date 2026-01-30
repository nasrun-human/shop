import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#050505"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="900" font-size="260" fill="#39ff14" stroke="#39ff14" stroke-width="12" style="paint-order: stroke fill">VS</text>
</svg>`;

const publicDir = path.join(process.cwd(), 'public');

async function generateIcons() {
  const icon64 = path.join(publicDir, 'pwa-64x64.png');
  const icon192 = path.join(publicDir, 'pwa-192x192.png');
  const icon256 = path.join(publicDir, 'pwa-256x256.png');
  const icon512 = path.join(publicDir, 'pwa-512x512.png');

  await sharp(Buffer.from(svg))
    .resize(64, 64)
    .toFile(icon64);
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .toFile(icon192);
  await sharp(Buffer.from(svg))
    .resize(256, 256)
    .toFile(icon256);

  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .toFile(icon512);

  console.log('PWA Icons Generated!');
}

generateIcons().catch(console.error);
