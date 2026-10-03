const path = require('node:path');
const sharp = require(process.argv[2] || 'sharp');
const assets = path.resolve(__dirname, '../src/assets');
const output = path.resolve(__dirname, '../../.local');
const render = async (name, width) => sharp(path.join(assets, name), {density: 192}).resize({width}).png().toBuffer();
const label = text => Buffer.from(`<svg width="900" height="50" xmlns="http://www.w3.org/2000/svg"><text x="30" y="30" font-family="Arial" font-size="18" fill="#444">${text}</text></svg>`);
async function main() {
  await sharp({create: {width: 900, height: 820, channels: 4, background: '#f0f1f2'}}).composite([
    {input: label('Logo normale'), top: 0, left: 0},
    {input: await render('logo_vector.svg', 740), top: 50, left: 60},
    {input: label('Logo esteso'), top: 330, left: 0},
    {input: await render('logo_extended_vector.svg', 840), top: 400, left: 30},
    {input: Buffer.from('<svg width="900" height="290" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="290" fill="#303234"/></svg>'), top: 530, left: 0},
    {input: await render('logo_vector_white.svg', 620), top: 555, left: 140},
  ]).png().toFile(path.join(output, 'sbernardo-logos-preview.png'));
  const icons = [];
  for (const [size, left] of [[16, 40], [32, 130], [48, 230], [180, 350]]) {
    icons.push({input: await sharp(path.join(assets, `saint-icon-${size}.png`)).png().toBuffer(), top: 65, left});
  }
  await sharp({create: {width: 900, height: 590, channels: 4, background: '#f0f1f2'}}).composite([
    {input: label('Favicon: 16 / 32 / 48 px — testa a 180 px'), top: 0, left: 0},
    ...icons,
    {input: label('PWA: standard e maskable (anteprima a 192 px)'), top: 290, left: 0},
    {input: await render('pwa-icon-192.png', 192), top: 355, left: 100},
    {input: await render('pwa-icon-maskable-192.png', 192), top: 355, left: 400},
  ]).png().toFile(path.join(output, 'sbernardo-icons-preview.png'));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
