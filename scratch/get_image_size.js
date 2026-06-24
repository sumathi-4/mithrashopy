import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgPath = path.join(__dirname, '..', 'src', 'assets', 'hero_stationery.jpg');
try {
  const buffer = fs.readFileSync(imgPath);
  for (let i = 0; i < buffer.length - 8; i++) {
    if (buffer[i] === 0xFF && (buffer[i+1] === 0xC0 || buffer[i+1] === 0xC2 || buffer[i+1] === 0xC1 || buffer[i+1] === 0xC3)) {
      console.log('Found marker at index', i, buffer.slice(i, i+10));
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      console.log('Width:', width, 'Height:', height);
      break;
    }
  }
} catch (err) {
  console.error(err);
}
