#!/usr/bin/env node

/**
 * Script para generar iconos PWA desde el logo SVG.
 * Uso: npm install sharp && node generate-all-icons.js
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = path.join(__dirname, 'public')
const LOGO_SVG = path.join(PUBLIC_DIR, 'logo.svg')

// Definir iconos con sus propiedades
const ICONS_CONFIG = {
  png: [
    { file: 'icon-192x192.png', size: 192, padding: 0 },
    { file: 'icon-512x512.png', size: 512, padding: 0 },
    { file: 'icon-192x192-maskable.png', size: 192, padding: 20, isMaskable: true },
    { file: 'icon-512x512-maskable.png', size: 512, padding: 20, isMaskable: true },
  ],
  ico: {
    file: 'favicon.ico',
    sizes: [16, 32, 48, 64],
  }
};

// Crear SVG con padding para maskable
function createPaddedSvg(originalSvg, paddingPercent = 0) {
  if (paddingPercent === 0) return originalSvg;
  
  const scale = (100 - paddingPercent) / 100;
  const transform = `scale(${scale}) translate(${512 * (1 - scale) / 2}, ${512 * (1 - scale) / 2})`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="transparent"/>
    <g transform="${transform}">
      ${originalSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
    </g>
  </svg>`;
}

async function generateImage(input, outputPath, size, padding = 0) {
  let buffer = input;
  
  if (padding > 0) {
    buffer = Buffer.from(createPaddedSvg(input.toString(), padding));
  }

  return sharp(buffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 99, g: 102, b: 241, alpha: 1 } // Color primario
    })
    .png({ quality: 100 })
    .toFile(outputPath);
}

async function generateFavicon(input, outputPath) {
  // Generar favicon 64x64 y convertir a ICO
  // Para más compatibilidad, generamos varios tamaños
  
  const sizes = [16, 32, 48, 64];
  const buffers = [];
  
  for (const size of sizes) {
    const pngData = await sharp(input)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 99, g: 102, b: 241, alpha: 1 }
      })
      .png()
      .toBuffer();
    
    buffers.push(pngData);
  }
  
  // Como sharp no soporta ICO directamente, generamos el maior
  // y lo guardamos como .ico (que los navegadores pueden leer si es PNG con extensión .ico)
  const largestSize = await sharp(input)
    .resize(64, 64, {
      fit: 'contain',
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    })
    .png()
    .toFile(outputPath + '.png');
  
  // Copiar como favicon.ico (los navegadores son tolerantes)
  fs.copyFileSync(outputPath + '.png', outputPath);
  fs.unlinkSync(outputPath + '.png');
  
  return largestSize;
}

async function generateAllIcons() {
  try {
    console.log('🎨 Generador de Iconos - FitConnect PWA\n');
    console.log('📦 Verificando dependencias...');

    if (!fs.existsSync(LOGO_SVG)) {
      console.error(`❌ Error: No se encontró ${LOGO_SVG}`);
      process.exit(1);
    }

    const logoSvg = fs.readFileSync(LOGO_SVG);

    console.log('✅ SVG encontrado\n');
    console.log('🚀 Generando iconos PNG...\n');

    // Generar PNGs
    for (const iconConfig of ICONS_CONFIG.png) {
      try {
        await generateImage(
          logoSvg,
          path.join(PUBLIC_DIR, iconConfig.file),
          iconConfig.size,
          iconConfig.padding
        );
        
        const maskLabel = iconConfig.isMaskable ? ' [maskable]' : '';
        console.log(`  ✅ ${iconConfig.file} (${iconConfig.size}x${iconConfig.size})${maskLabel}`);
      } catch (error) {
        console.error(`  ❌ Error: ${iconConfig.file}:`, error.message);
      }
    }

    console.log('\n🚀 Generando favicon...\n');
    
    try {
      await generateFavicon(
        logoSvg,
        path.join(PUBLIC_DIR, ICONS_CONFIG.ico.file)
      );
      console.log(`  ✅ ${ICONS_CONFIG.ico.file}`);
    } catch (error) {
      console.error(`  ❌ Error: ${ICONS_CONFIG.ico.file}:`, error.message);
    }

    console.log('\n✨ ¡Proceso completado!\n');
    console.log('📋 Archivos generados en public/:\n');
    
    const files = fs.readdirSync(PUBLIC_DIR).filter(f => 
      f.startsWith('icon-') || f === 'favicon.ico'
    );
    
    files.forEach(f => {
      const stat = fs.statSync(path.join(PUBLIC_DIR, f));
      const size = (stat.size / 1024).toFixed(2);
      console.log(`  📄 ${f} (${size} KB)`);
    });

    console.log('\n🎯 Próximos pasos:\n');
    console.log('  1. Commit los nuevos archivos');
    console.log('  2. Ejecuta: npm run build');
    console.log('  3. Prueba la instalación: npm run preview');
    console.log('  4. Verifica en DevTools → Application → Manifest');
    console.log('  5. ¡Instala la PWA desde tu navegador!');
    console.log('\n💡 Tip: Usa maskable.app/editor para ver cómo se ven los iconos maskable\n');

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  }
}

generateAllIcons();
