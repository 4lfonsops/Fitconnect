#!/usr/bin/env node

/**
 * Generador de iconos para PWA de FitConnect
 * Genera todos los tamaños y formatos necesarios desde el logo SVG
 * 
 * Uso:
 * npm install sharp
 * node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const LOGO_SVG = path.join(PUBLIC_DIR, 'logo.svg');

// Definir todos los iconos a generar
const ICONS_TO_GENERATE = [
  // PWA Icons regulares
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  
  // Maskable icons (con área segura)
  { name: 'icon-192x192-maskable.png', size: 192, maskable: true },
  { name: 'icon-512x512-maskable.png', size: 512, maskable: true },
];

// Crear versión maskable del SVG
function createMaskableSvg(svg, isMaskable = false) {
  if (!isMaskable) return svg;
  
  // Para maskable, agregamos padding 
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <!-- Fondo con padding para maskable -->
    <rect width="512" height="512" fill="#6366f1"/>
    <g transform="translate(256, 256) scale(0.85) translate(-256, -256)">
      ${svg.match(/<g.*?<\/g>|<rect.*?\/>/gs)?.join('') || svg}
    </g>
  </svg>`;
}

async function generateIcons() {
  try {
    console.log('🎨 Generando iconos para PWA FitConnect...\n');

    // Leer el SVG
    if (!fs.existsSync(LOGO_SVG)) {
      console.error(`❌ Error: No se encontró ${LOGO_SVG}`);
      console.error('Asegúrate de que logo.svg existe en la carpeta public/');
      process.exit(1);
    }

    const logoSvg = fs.readFileSync(LOGO_SVG);

    // Generar cada icono
    for (const icon of ICONS_TO_GENERATE) {
      try {
        let inputSvg = logoSvg;
        
        // Si es maskable, crear versión con padding
        if (icon.maskable) {
          inputSvg = Buffer.from(
            createMaskableSvg(logoSvg.toString(), true)
          );
        }

        // Generar PNG
        await sharp(inputSvg)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            position: 'center',
          })
          .png({ quality: 100 })
          .toFile(path.join(PUBLIC_DIR, icon.name));

        console.log(`✅ ${icon.name} (${icon.size}x${icon.size})${icon.maskable ? ' [maskable]' : ''}`);
      } catch (error) {
        console.error(`❌ Error generando ${icon.name}:`, error.message);
      }
    }

    console.log('\n✨ Iconos generados correctamente en public/');
    console.log('\nPróximos pasos:');
    console.log('1. Verifica que todos los archivos PNG se crearon');
    console.log('2. Ejecuta: npm run build');
    console.log('3. Prueba la instalación de PWA');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Verificar que Sharp está instalado
try {
  require.resolve('sharp');
} catch {
  console.error('❌ Error: sharp no está instalado');
  console.error('\nInstálalo con:');
  console.error('  npm install sharp');
  process.exit(1);
}

generateIcons();
