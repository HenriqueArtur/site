/**
 * Gera favicon, ícones de app e as imagens de compartilhamento.
 *
 *   bun tools/build-icons.mjs
 *
 * Só precisa rodar quando a paleta, o nome ou a assinatura mudarem. A saída é
 * commitada em public/ — nem o sharp nem as fontes TTF são necessários para
 * buildar o site, apenas para regenerar estes arquivos.
 *
 * As cores vêm de tokens.ts, e não estão redigitadas aqui. Um favicon com o
 * laranja levemente diferente do resto do site é o tipo de erro que ninguém
 * percebe olhando, e que dura anos.
 *
 * Por que as letras viram `<path>` em vez de `<text>`: o libvips embutido no
 * sharp é compilado sem pango e sem fontconfig, então um `<text>` rasteriza
 * como nada — sem aviso, sem erro. Ver tools/ttf-text.mjs.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tokens } from '../src/lib/design/tokens.ts';
import { loadFont, textPath, textWidth } from './ttf-text.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
const FONT_CACHE = join(ROOT, 'node_modules', '.cache', 'site-fonts');

/**
 * As mesmas famílias do site, em TTF.
 *
 * public/fonts/ tem só .woff2, que serve ao navegador mas não a um leitor de
 * contornos — o formato guarda as tabelas comprimidas e transformadas. Estes
 * arquivos ficam fora do git: são insumo de build, não conteúdo do site.
 */
const FONTS = {
  displayBold: 'ofl/zillaslab/ZillaSlab-Bold.ttf',
  display: 'ofl/zillaslab/ZillaSlab-Regular.ttf',
  mono: 'ofl/ibmplexmono/IBMPlexMono-Regular.ttf',
};

const { color } = tokens;

async function fetchFont(path) {
  const name = path.split('/').pop();
  const cached = join(FONT_CACHE, name);
  try {
    return await readFile(cached);
  } catch {
    const url = `https://github.com/google/fonts/raw/main/${path}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`não baixou ${name}: HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await mkdir(FONT_CACHE, { recursive: true });
    await writeFile(cached, buffer);
    console.log(`  baixado ${name} (${(buffer.length / 1024).toFixed(0)} KB)`);
    return buffer;
  }
}

/**
 * Traço à mão, o mesmo gesto que marca palavras no texto do site.
 *
 * Refeito nas coordenadas finais em vez de escalado: esticar o SVG de 64×8
 * esticaria a espessura junto, e o traço ficaria grosso na horizontal e fino na
 * vertical.
 *
 * `wave` controla a altura da ondulação, e existe porque ela não pode ser
 * absoluta. O mesmo desvio de 4px que soa como gesto sob um nome de 600px vira
 * uma minhoca sob um traço de 20px no favicon.
 */
function sketchRule(x, y, width, wave = 1) {
  const p = (fraction) => x + width * fraction;
  const d = (offset) => y + offset * wave;
  return (
    `M${x} ${d(4)} C ${p(0.17)} ${d(-3)}, ${p(0.31)} ${d(6)}, ${p(0.48)} ${d(1)} ` +
    `S ${p(0.79)} ${d(-3)}, ${x + width} ${d(3)}`
  );
}

/** Grade do blueprint, fraca o bastante para não competir com o texto. */
function blueprintGrid(width, height, minor, major) {
  const lines = [];
  for (let x = minor; x < width; x += minor) {
    lines.push(`M${x} 0 V${height}`);
  }
  for (let y = minor; y < height; y += minor) {
    lines.push(`M0 ${y} H${width}`);
  }
  const majors = [];
  for (let x = major; x < width; x += major) {
    majors.push(`M${x} 0 V${height}`);
  }
  for (let y = major; y < height; y += major) {
    majors.push(`M0 ${y} H${width}`);
  }
  return (
    `<path d="${lines.join(' ')}" stroke="${color.lineSoft}" stroke-width="1" fill="none"/>` +
    `<path d="${majors.join(' ')}" stroke="${color.line}" stroke-width="1" fill="none"/>`
  );
}

/** Marca de registro de prancha técnica, nos cantos do quadro. */
function registrationMarks(inset, width, height, arm) {
  const corners = [
    [inset, inset],
    [width - inset, inset],
    [inset, height - inset],
    [width - inset, height - inset],
  ];
  const d = corners.map(([x, y]) => `M${x - arm} ${y} H${x + arm} M${x} ${y - arm} V${y + arm}`);
  return `<path d="${d.join(' ')}" stroke="${color.lineStrong}" stroke-width="1.5" fill="none"/>`;
}

function faviconSvg(fontBold) {
  // Letra real da fonte de títulos, não um H desenhado à mão: o site inteiro é
  // Zilla Slab, e a diferença aparece justamente nas serifas retangulares.
  const size = 24;
  const width = textWidth(fontBold, 'H', size);
  const { d } = textPath(fontBold, 'H', { x: (32 - width) / 2, y: 22, size });

  // Barra reta, e não o traço à mão que marca as palavras no texto.
  //
  // Em 16px qualquer ondulação vira caroço — o gesto precisa de tamanho para
  // ser lido como gesto. O que o ícone tem que entregar nesse tamanho é a cor
  // da marca e a letra, e ambas sobrevivem retas.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Henrique Artur">
  <rect width="32" height="32" fill="${color.paper}"/>
  <path d="${d}" fill="${color.ink}"/>
  <rect x="5" y="25" width="22" height="3.4" fill="${color.accent}"/>
</svg>
`;
}

function ogSvg(fonts, locale) {
  const W = 1200;
  const H = 630;
  const INSET = 44;
  const X = 96;

  const tagline = {
    'pt-BR': 'Construindo melhores softwares e criando ótimas experiências',
    en: 'Building better software and creating great experiences',
  }[locale];

  const eyebrow = 'SOFTWARE, QUALITY AND EXPERIENCE';
  const eyebrowPath = textPath(fonts.mono, eyebrow, { x: X, y: 152, size: 23, letterSpacing: 2.4 });

  const name = textPath(fonts.displayBold, 'Henrique Artur', { x: X, y: 318, size: 92 });
  const role = textPath(fonts.display, tagline, { x: X, y: 412, size: 32 });
  const url = textPath(fonts.mono, 'henriqueartur.com', { x: X, y: 540, size: 24 });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${color.paper}"/>
  ${blueprintGrid(W, H, 25, 125)}
  <rect x="${INSET}" y="${INSET}" width="${W - INSET * 2}" height="${H - INSET * 2}"
        fill="none" stroke="${color.line}" stroke-width="1.5"/>
  ${registrationMarks(INSET, W, H, 10)}
  <path d="${eyebrowPath.d}" fill="${color.accentDeep}"/>
  <path d="${name.d}" fill="${color.ink}"/>
  <path d="${sketchRule(X, 340, name.width)}" stroke="${color.accent}" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="${role.d}" fill="${color.inkSoft}"/>
  <path d="${url.d}" fill="${color.inkSoft}"/>
</svg>
`;
}

async function png(svg, size, file) {
  const image = sharp(Buffer.from(svg));
  const resized = size ? image.resize(size, size) : image;
  // A superfície do site é opaca; achatar evita PNG com alfa onde nenhum cliente
  // de e-mail ou app de mensagem sabe o que pôr atrás.
  const { size: bytes } = await resized
    .flatten({ background: color.paper })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`  ${file.replace(`${ROOT}/`, '')} — ${(bytes / 1024).toFixed(1)} KB`);
}

console.log('fontes:');
const fonts = {
  displayBold: loadFont(await fetchFont(FONTS.displayBold)),
  display: loadFont(await fetchFont(FONTS.display)),
  mono: loadFont(await fetchFont(FONTS.mono)),
};

console.log('ícones:');
const favicon = faviconSvg(fonts.displayBold);
await writeFile(join(OUT, 'favicon.svg'), favicon);
console.log(`  public/favicon.svg — ${(favicon.length / 1024).toFixed(1)} KB`);

// PNG só onde o SVG não basta: iOS ignora favicon.svg, e o manifest pede raster.
await png(favicon, 180, join(OUT, 'apple-touch-icon.png'));
await png(favicon, 192, join(OUT, 'icon-192.png'));
await png(favicon, 512, join(OUT, 'icon-512.png'));

console.log('compartilhamento:');
await png(ogSvg(fonts, 'pt-BR'), null, join(OUT, 'og.png'));
await png(ogSvg(fonts, 'en'), null, join(OUT, 'og-en.png'));
