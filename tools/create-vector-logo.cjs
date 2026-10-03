// Derive trial assets without changing the active site logos.
// Usage: node tools/create-vector-logo.cjs <path-to-sharp>
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require(process.argv[2] || 'sharp');
const assets = path.resolve(__dirname, '../src/assets');
const source = fs.readFileSync(path.join(assets, 'logo_new.svg'), 'utf8');
const saintSource = fs.readFileSync(path.resolve(__dirname, '../../tema/icons/img/sbernardo.svg'), 'utf8');
const extended = fs.readFileSync(path.resolve(__dirname, '../../tema/img/logo_extended.svg'), 'utf8');
const paths = source.match(/<path\b[^>]*\/>/g);
assert.equal(paths.length, 247, 'Review the extraction if the source logo changes');
assert(!/<image\b/.test(source), 'The source must be vector-only');
assert(!/<image\b|<script\b/.test(saintSource), 'The saint source must contain only vector artwork');
const palette = Object.fromEntries([...saintSource.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-f]+);\s*\}/gi)].map(match => [match[1], match[2]]));
const saintArtwork = saintSource.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<defs>[\s\S]*?<\/defs>/, '').replace(/<\/svg>\s*$/, '').replace(/[ \t]+$/gm, '').trim().replace(/class="(cls-\d+)"/g, (_, name) => {
  assert(palette[name], `Missing colour for ${name}`);
  return `fill="${palette[name]}"`;
});
const saintScale = 138 / 1441.21;
const portrait = `<g transform="translate(${(107 - 1090.01 * saintScale) / 2} 0) scale(${saintScale})">${saintArtwork}</g>`;
// The dark-panel family has its own supplied portrait; other families stay intact.
const darkSource = fs.readFileSync(path.resolve(__dirname, '../../tema/icons/img/SVG/sbernardo.svg'), 'utf8');
assert(!/<image\b|<script\b/.test(darkSource), 'The dark portrait must be vector-only');
const darkPalette = Object.fromEntries([...darkSource.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-f]+);\s*\}/gi)].map(match => [match[1], match[2]]));
const darkArtwork = darkSource.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/<defs>[\s\S]*?<\/defs>/, '').replace(/<\/svg>\s*$/, '').replace(/[ \t]+$/gm, '').trim().replace(/class="(cls-\d+)"/g, (_, name) => {
  assert(darkPalette[name], `Missing dark portrait colour for ${name}`);
  return `fill="${darkPalette[name]}"`;
});
const darkScale = 138 / 1441.01;
const darkPortrait = `<g transform="translate(${(107 - 1089.98 * darkScale) / 2} 0) scale(${darkScale})">${darkArtwork}</g>`;
const iconSource = fs.readFileSync(path.resolve(__dirname, '../../tema/icons/img/SVG/sbernardo-semplificato.svg'), 'utf8');
assert(!/<image\b|<script\b/.test(iconSource), 'The simplified icon must be vector-only');
const iconPalette = Object.fromEntries([...iconSource.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-f]+);\s*\}/gi)].map(match => [match[1], match[2]]));
const iconArtwork = iconSource.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/<defs>[\s\S]*?<\/defs>/, '').replace(/<\/svg>\s*$/, '').replace(/[ \t]+$/gm, '').trim().replace(/class="(cls-\d+)"/g, (_, name) => {
  assert(iconPalette[name], `Missing simplified icon colour for ${name}`);
  return `fill="${iconPalette[name]}"`;
});
const iconScale = 138 / 616.66;
const iconPortrait = `<g transform="translate(${(107 - 465.1 * iconScale) / 2} 0) scale(${iconScale})">${iconArtwork}</g>`;
const lettering = (extended.match(/<path\b[^>]*\/>/g) || []).filter(p => /fill="rgb\((89,0,0|138,1,1)\)"/.test(p));
assert.equal(lettering.length, 34, 'Expected the 34 outlined letters of the extended logo');
const svg = (box, content, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none"><title>${title}</title>\n${content}\n</svg>\n`;
// Only the outer silhouette is cropped; the original coloured paths are untouched.
const headClip = 'M57 0 C79 0 96 19 94 39 C102 44 94 61 91 71 C90 88 79 106 66 112 C56 114 40 110 34 100 C27 90 23 81 19 71 C15 58 10 42 12 29 C17 11 38 0 57 0Z';
const head = `<defs><clipPath id="head"><path d="${headClip}"/></clipPath></defs><g clip-path="url(#head)">${portrait}</g>`;
// A tall, warm halo surrounds the upper head, with space above the crown.
// It remains an independent vector element, so the original drawing is unaltered.
const white = content => content.replace(/\sfill="[^"]+"/g, ' fill="#F7F7F7"');
// Preserve the portrait's shading while removing colour from each vector fill.
const grayscale = content => content.replace(/fill="#([0-9a-f]{6})"/gi, (_, hex) => {
  const channels = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  const level = Math.round(.2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]);
  return `fill="#${level.toString(16).padStart(2, '0').repeat(3)}"`;
});
const files = {
  'logo_vector.svg': svg('0 0 382 138', `${portrait}${paths.slice(0, 34).join('\n')}`, 'Parrocchia San Bernardo da Chiaravalle'),
  'saint-head.svg': svg('-10 -5 128 128', head, 'San Bernardo — testa vettoriale'),
  'saint-head-white.svg': svg('-10 -5 128 128', grayscale(head), 'San Bernardo — testa in scala di grigi'),
  'favicon-vector.svg': svg('-10 -5 128 128', head, 'San Bernardo'),
  'logo_vector_white.svg': svg('0 0 382 138', `${grayscale(portrait)}${white(paths.slice(0, 34).join('\n'))}`, 'Parrocchia San Bernardo da Chiaravalle — bianco'),
  'logo_extended_vector.svg': svg('0 0 1442 94', `<defs><clipPath id="portrait"><rect width="107" height="138"/></clipPath></defs><g transform="scale(.68116)" clip-path="url(#portrait)">${portrait}</g><g transform="translate(-441.04187022793417 -224.42986645246788)">${lettering.join('\n')}</g>`, 'Parrocchia San Bernardo da Chiaravalle'),
  'logo_extended_vector_white.svg': svg('0 0 1442 94', `<defs><clipPath id="portrait"><rect width="107" height="138"/></clipPath></defs><g transform="scale(.68116)" clip-path="url(#portrait)">${grayscale(portrait)}</g><g transform="translate(-441.04187022793417 -224.42986645246788)">${white(lettering.join('\n'))}</g>`, 'Parrocchia San Bernardo da Chiaravalle — bianco'),
};
async function main() {
  // Same artwork and dimensions: only the portrait panel gains a dark backdrop.
  for (const suffix of ['']) {
    // Inset the backdrop into the artwork, avoiding dark rails beside the bust.
    const panel = '<rect x="1.6" y="0" width="103.8" height="137.5" rx="6" fill="#0A0D19"/>';
    for (const prefix of ['logo_vector', 'logo_extended_vector']) {
      const name = `${prefix}${suffix}.svg`;
      files[`${prefix}${suffix}_dark.svg`] = files[name].replace(portrait, darkPortrait).replace(
        prefix === 'logo_vector' ? '</title>\n' : 'clip-path="url(#portrait)">',
        match => match + panel
      );
    }
    const iconSuffix = suffix ? '-halo' : '';
    const iconName = `favicon-vector${iconSuffix}.svg`;
    const iconPanel = `<rect x="-10" y="${suffix ? -18 : -5}" width="128" height="${suffix ? 141 : 128}" rx="8" fill="#0A0D19"/>`;
    files[`favicon-vector${iconSuffix}-dark.svg`] = files[iconName].replace(portrait, darkPortrait).replace('</title>\n', '</title>\n' + iconPanel);
  }
  // Full simplified bust, never the head clip: square canvases preserve all artwork.
  for (const variant of ['', '-dark']) {
    const hasHalo = variant.includes('halo');
    const top = hasHalo ? -20 : -5;
    const side = hasHalo ? 166 : 148;
    const left = (107 - side) / 2;
    const panel = variant.includes('dark') ? `<rect x="${left}" y="${top}" width="${side}" height="${side}" rx="8" fill="#0A0D19"/>` : '';
    files[`favicon-vector${variant}.svg`] = svg(`${left} ${top} ${side} ${side}`, `${panel}${iconPortrait}`, 'San Bernardo — icona completa semplificata');
  }
  for (const [name, data] of Object.entries(files)) {
    assert(!/<(?:image|text)\b|data:image/.test(data), `${name} must have no raster images or font dependencies`);
    fs.writeFileSync(path.join(assets, name), data);
  }
  for (const size of [192, 512]) {
    const iconContent = `<rect width="512" height="512" fill="#f0f1f2"/><svg x="102" y="102" width="308" height="308" viewBox="-20.5 -5 148 148">${iconPortrait}</svg>`;
    const pwa = svg('0 0 512 512', iconContent, 'San Bernardo — icona PWA');
    await sharp(Buffer.from(pwa), {density: 192}).resize(size, size).png().toFile(path.join(assets, `pwa-icon-maskable-${size}.png`));
    await sharp(Buffer.from(files['favicon-vector.svg']), {density: 384}).resize(size, size, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toFile(path.join(assets, `pwa-icon-${size}.png`));
  }
  for (const variant of ['', '-dark']) {
  const icon = Buffer.from(files[`favicon-vector${variant}.svg`]);
  for (const size of [16, 32, 48, 180, 192, 512]) {
    await sharp(icon, {density: 384}).resize(size, size, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toFile(path.join(assets, `saint-icon${variant}-${size}.png`));
  }
  // Standard multi-resolution ICO directory, using lossless PNG frames.
  const frames = [16, 32, 48].map(size => ({size, data: fs.readFileSync(path.join(assets, `saint-icon${variant}-${size}.png`))}));
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({size, data}, i) => {
    const p = 6 + i * 16;
    header[p] = header[p + 1] = size;
    header.writeUInt16LE(1, p + 4);
    header.writeUInt16LE(32, p + 6);
    header.writeUInt32LE(data.length, p + 8);
    header.writeUInt32LE(offset, p + 12);
    offset += data.length;
  });
  fs.writeFileSync(path.join(assets, `favicon-vector${variant}.ico`), Buffer.concat([header, ...frames.map(f => f.data)]));
  }
  console.log('Created logos from sbernardo.svg, grayscale white variants, favicon assets and standard/maskable PWA icons.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
