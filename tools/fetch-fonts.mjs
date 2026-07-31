/**
 * Baixa as fontes do design system para public/fonts/ e gera o CSS com @font-face
 * apontando para os arquivos locais.
 *
 * Auto-hospedar é decisão de projeto: nenhuma requisição a CDN de terceiros, nem
 * na primeira visita. Este script existe para que isso seja reproduzível — rodar
 * de novo produz exatamente os mesmos arquivos.
 *
 *   node tools/fetch-fonts.mjs
 *
 * Só precisa rodar quando o conjunto de fontes ou pesos mudar.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'fonts');
const CSS_OUT = join(ROOT, 'src', 'styles', 'fonts.css');

// Chrome moderno, para a API devolver woff2 em vez de formatos legados.
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Pesos deliberadamente enxutos: cada peso extra é mais um arquivo na rede.
// Zilla 400 e 700 cobrem título e ênfase; mono 400 basta para rótulo e anotação.
//
// Source Serif 4 é fonte variável, e isso muda como ela deve ser pedida: solicitar
// 400 e 600 como instâncias nomeadas faz o Google devolver o MESMO arquivo duas
// vezes (confirmado por md5 — eram 218 KB a mais). Pedindo a faixa `400..600`, vem
// um arquivo só, declarado com `font-weight: 400 600`. Zilla Slab e IBM Plex Mono
// são estáticas, então nelas cada peso é de fato um arquivo diferente.
const API =
  'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;700' +
  '&family=Source+Serif+4:opsz,wght@8..60,400..600' +
  '&family=IBM+Plex+Mono:wght@400&display=swap';

/** Só o que o site escreve: português e inglês. Cirílico, grego e vietnamita ficam fora. */
const SUBSETS = {
  latin: 'U+0000-00FF',
  'latin-ext': 'U+0100-02BA',
};

function subsetOf(unicodeRange) {
  for (const [name, marker] of Object.entries(SUBSETS)) {
    if (unicodeRange.startsWith(marker)) return name;
  }
  return null;
}

function slug(family) {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseFaces(css) {
  const faces = [];
  for (const block of css.split('@font-face').slice(1)) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
    const weight = block.match(/font-weight:\s*([^;]+);/)?.[1].trim();
    const style = block.match(/font-style:\s*([^;]+);/)?.[1].trim() ?? 'normal';
    const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
    if (family && weight && url && range) faces.push({ family, weight, style, url, range });
  }
  return faces;
}

const response = await fetch(API, { headers: { 'User-Agent': UA } });
if (!response.ok) throw new Error(`Google Fonts respondeu ${response.status}`);

const wanted = parseFaces(await response.text()).filter((face) => subsetOf(face.range));

await mkdir(OUT_DIR, { recursive: true });
await mkdir(dirname(CSS_OUT), { recursive: true });

const rules = [];
/** URL já baixada -> arquivo local. Duas @font-face podem apontar para o mesmo arquivo. */
const downloaded = new Map();
let bytes = 0;

for (const face of wanted) {
  const subset = subsetOf(face.range);
  const file = `${slug(face.family)}-${face.weight.replace(/\s+/g, '-')}-${subset}.woff2`;

  if (downloaded.has(face.url)) {
    console.log(`${file}  (reaproveita ${downloaded.get(face.url)})`);
  } else {
    const font = await fetch(face.url, { headers: { 'User-Agent': UA } });
    if (!font.ok) throw new Error(`falhou baixar ${face.url}: ${font.status}`);

    const buffer = Buffer.from(await font.arrayBuffer());
    await writeFile(join(OUT_DIR, file), buffer);
    downloaded.set(face.url, file);
    bytes += buffer.byteLength;

    console.log(`${file}  ${(buffer.byteLength / 1024).toFixed(1)} KB`);
  }

  rules.push(
    [
      '@font-face {',
      `  font-family: '${face.family}';`,
      `  font-style: ${face.style};`,
      `  font-weight: ${face.weight};`,
      '  font-display: swap;',
      `  src: url('/fonts/${downloaded.get(face.url)}') format('woff2');`,
      `  unicode-range: ${face.range};`,
      '}',
    ].join('\n'),
  );
}

const header = [
  '/*',
  ' * GERADO POR tools/fetch-fonts.mjs — NÃO EDITAR À MÃO.',
  ' *',
  ' * Zilla Slab, Source Serif 4 e IBM Plex Mono, todas sob SIL Open Font License 1.1.',
  ' * Ver public/fonts/LICENSE.md.',
  ' */',
  '',
].join('\n');

await writeFile(CSS_OUT, `${header}${rules.join('\n\n')}\n`);

console.log(`\n${wanted.length} arquivos, ${(bytes / 1024).toFixed(1)} KB no total`);
console.log(`CSS escrito em ${CSS_OUT}`);
