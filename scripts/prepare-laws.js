import fs from 'fs';
import path from 'path';
import { Pretext } from '../src/utils/pretext.js';

/**
 * Script de preparación de leyes:
 * Lee archivos de /raw_laws, los limpia con Pretext y los guarda en /src/content/leyes/.
 */

const RAW_DIR = './raw_laws';
const DEST_DIR = './src/content/leyes';

if (!fs.existsSync(RAW_DIR)) {
  console.log(`[Error] Directorio ${RAW_DIR} no encontrado. Creándolo...`);
  fs.mkdirSync(RAW_DIR);
}

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.log("[Info] No hay archivos Markdown en /raw_laws para procesar.");
} else {
  files.forEach(file => {
    const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf8');
    const cleanContent = Pretext.cleanMarkdown(content);
    
    fs.writeFileSync(path.join(DEST_DIR, file), cleanContent);
    console.log(`[Pretext] Archivo procesado y guardado: ${file}`);
  });
}
