import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, 'public')

async function createScreenshot(width, height, filename, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#4f46e5"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" rx="0"/>
    
    <!-- Logo circle -->
    <circle cx="${width/2}" cy="${height/2 - 60}" r="70" fill="rgba(255,255,255,0.15)"/>
    <circle cx="${width/2}" cy="${height/2 - 60}" r="50" fill="white"/>
    
    <!-- Dumbbell -->
    <circle cx="${width/2 - 30}" cy="${height/2 - 60}" r="18" fill="#22c55e"/>
    <rect x="${width/2 - 12}" y="${height/2 - 68}" width="24" height="16" fill="#1f2937" rx="3"/>
    <circle cx="${width/2 + 30}" cy="${height/2 - 60}" r="18" fill="#f97316"/>
    
    <!-- Title -->
    <text x="${width/2}" y="${height/2 + 40}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="bold" fill="white">FitConnect</text>
    <text x="${width/2}" y="${height/2 + 75}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">Gestión integral de gimnasios</text>
    
    <!-- Feature pills -->
    <rect x="${width/2 - 180}" y="${height/2 + 100}" width="110" height="36" rx="18" fill="rgba(255,255,255,0.15)"/>
    <text x="${width/2 - 125}" y="${height/2 + 123}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="white">Miembros</text>
    
    <rect x="${width/2 - 55}" y="${height/2 + 100}" width="110" height="36" rx="18" fill="rgba(255,255,255,0.15)"/>
    <text x="${width/2}" y="${height/2 + 123}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="white">Pedidos</text>
    
    <rect x="${width/2 + 70}" y="${height/2 + 100}" width="110" height="36" rx="18" fill="rgba(255,255,255,0.15)"/>
    <text x="${width/2 + 125}" y="${height/2 + 123}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="white">Reportes</text>
  </svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(PUBLIC, filename))

  console.log(`✅ ${filename} (${width}x${height}) - ${label}`)
}

console.log('📸 Generando screenshots PWA...\n')

await createScreenshot(1280, 720, 'screenshot-wide.png', 'Desktop / Wide')
await createScreenshot(540, 720, 'screenshot-narrow.png', 'Mobile / Narrow')

console.log('\n✨ Screenshots generados en public/')
