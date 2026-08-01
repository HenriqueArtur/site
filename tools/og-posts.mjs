/**
 * Compõe a imagem de compartilhamento de cada post.
 *
 * Roda no build, como integração do Astro (ver astro.config.mjs), e escreve
 * direto em `dist/og/`. Nada disso entra no git: a imagem é função pura do
 * frontmatter, dos tokens e da fonte, então é saída de build como o resto do
 * `dist/` — commitá-la seria versionar binário derivado, e cresceria 2 arquivos
 * por post para sempre.
 *
 * As letras viram `<path>` porque o libvips embutido no sharp é compilado sem
 * pango e sem fontconfig: um `<text>` num SVG rasteriza como nada, sem erro.
 * Ver tools/ttf-text.mjs.
 */
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { tokens } from '../src/lib/design/tokens.ts';
import { blogVisible } from '../src/lib/routes/blog-visible.ts';
import { ogImage } from '../src/lib/seo/og-image.ts';
import { loadFont, textPath, textWidth, wrapText } from './ttf-text.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'content', 'blog');
const FONTS = join(ROOT, 'assets', 'fonts');

const { color } = tokens;

const W = 1200;
const H = 630;
const INSET = 44;
const X = 96;
const CONTENT_WIDTH = W - X * 2;

const MONTHS = {
  'pt-BR': [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

/** Todo `index*.md` sob content/blog, com o caminho relativo à raiz da coleção. */
async function findPosts(dir, prefix = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...(await findPosts(path, id)));
    else if (/^index(\.en)?\.md$/.test(entry.name)) found.push({ id, path });
  }
  return found;
}

/**
 * Título e data do frontmatter.
 *
 * Leitura mínima, sem parser de YAML: são dois campos de formato conhecido, já
 * validados pelo schema da coleção no próprio Astro. Se o formato fugir, o erro
 * é explícito — melhor que gerar imagem com o título errado.
 */
function frontmatter(source, id) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) throw new Error(`post sem frontmatter: ${id}`);

  const read = (field) => {
    const line = block[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    if (!line) throw new Error(`post sem "${field}" no frontmatter: ${id}`);
    return line[1].trim().replace(/^['"]|['"]$/g, '');
  };

  return { title: read('title'), date: read('date') };
}

function blueprintGrid(minor, major) {
  const stroke = (d, color) =>
    `<path d="${d.join(' ')}" stroke="${color}" stroke-width="1" fill="none"/>`;
  const minors = [];
  const majors = [];
  for (let x = minor; x < W; x += minor) (x % major === 0 ? majors : minors).push(`M${x} 0 V${H}`);
  for (let y = minor; y < H; y += minor) (y % major === 0 ? majors : minors).push(`M0 ${y} H${W}`);
  return stroke(minors, color.lineSoft) + stroke(majors, color.line);
}

function registrationMarks(arm) {
  const corners = [
    [INSET, INSET],
    [W - INSET, INSET],
    [INSET, H - INSET],
    [W - INSET, H - INSET],
  ];
  const d = corners.map(([x, y]) => `M${x - arm} ${y} H${x + arm} M${x} ${y - arm} V${y + arm}`);
  return `<path d="${d.join(' ')}" stroke="${color.lineStrong}" stroke-width="1.5" fill="none"/>`;
}

/** O mesmo gesto que marca palavras no texto do site. */
function sketchRule(x, y, width) {
  const p = (fraction) => x + width * fraction;
  return (
    `M${x} ${y + 4} C ${p(0.17)} ${y - 3}, ${p(0.31)} ${y + 6}, ${p(0.48)} ${y + 1} ` +
    `S ${p(0.79)} ${y - 3}, ${x + width} ${y + 3}`
  );
}

function postSvg(fonts, { title, date, locale }) {
  /*
   * O corpo do título encolhe conforme ele cresce.
   *
   * Tamanho fixo obriga a escolher entre título curto tímido e título longo
   * estourando o quadro. Os degraus param em 46px porque abaixo disso a leitura
   * na miniatura do feed começa a sofrer.
   */
  let size = 76;
  let lines = wrapText(fonts.bold, title, size, CONTENT_WIDTH);
  for (const [limit, next] of [
    [2, 60],
    [3, 46],
  ]) {
    if (lines.length > limit) {
      size = next;
      lines = wrapText(fonts.bold, title, size, CONTENT_WIDTH);
    }
  }
  // Mais de quatro linhas viraria parede de texto. As reticências são
  // deliberadas: corte seco parece defeito, reticências dizem que há mais.
  if (lines.length > 4) lines = [...lines.slice(0, 3), `${lines[3]}…`];

  const leading = size * 1.2;
  const blockTop = 300 - ((lines.length - 1) * leading) / 2;

  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  const eyebrow = `BLOG · ${day} ${MONTHS[locale][month - 1].toUpperCase()} ${year}`;

  const eyebrowPath = textPath(fonts.mono, eyebrow, { x: X, y: 150, size: 22, letterSpacing: 2.2 });
  const titlePaths = lines.map((line, index) =>
    textPath(fonts.bold, line, { x: X, y: blockTop + index * leading, size }),
  );

  const ruleWidth = Math.min(textWidth(fonts.bold, lines.at(-1), size), CONTENT_WIDTH);
  const ruleY = blockTop + (lines.length - 1) * leading + size * 0.28;

  const author = textPath(fonts.regular, 'Henrique Artur', { x: X, y: 542, size: 30 });

  // Alinhado à direita: medir e depois posicionar. Não existe `text-anchor`
  // quando o texto já virou caminho.
  const site = 'henriqueartur.com';
  const sitePath = textPath(fonts.mono, site, {
    x: W - X - textWidth(fonts.mono, site, 22),
    y: 542,
    size: 22,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${color.paper}"/>
  ${blueprintGrid(25, 125)}
  <rect x="${INSET}" y="${INSET}" width="${W - INSET * 2}" height="${H - INSET * 2}"
        fill="none" stroke="${color.line}" stroke-width="1.5"/>
  ${registrationMarks(10)}
  <path d="${eyebrowPath.d}" fill="${color.accentDeep}"/>
  ${titlePaths.map((path) => `<path d="${path.d}" fill="${color.ink}"/>`).join('\n  ')}
  <path d="${sketchRule(X, ruleY, ruleWidth)}" stroke="${color.accent}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="${author.d}" fill="${color.inkSoft}"/>
  <path d="${sitePath.d}" fill="${color.inkSoft}"/>
</svg>`;
}

/**
 * Escreve uma imagem por post dentro de `outDir`.
 *
 * @param {string} outDir normalmente `dist/`
 * @returns {Promise<number>} quantas foram geradas
 */
export async function buildOgPosts(outDir) {
  /*
   * Sem blog publicado não há página apontando para estas imagens, e gerá-las
   * seria despejar binário no dist/ que ninguém referencia.
   *
   * O `false` é literal e correto: `astro:build:done` só dispara em `astro
   * build`, então este código nunca roda em desenvolvimento. Quando o blog for
   * publicado, `blogVisible` passa a devolver true dos dois lados e as imagens
   * voltam sozinhas. Ver src/lib/routes/blog-visible.ts.
   */
  if (!blogVisible(false)) return 0;

  const fonts = {
    bold: loadFont(await readFile(join(FONTS, 'ZillaSlab-Bold.ttf'))),
    regular: loadFont(await readFile(join(FONTS, 'ZillaSlab-Regular.ttf'))),
    mono: loadFont(await readFile(join(FONTS, 'IBMPlexMono-Regular.ttf'))),
  };

  const target = join(outDir, 'og');
  await mkdir(target, { recursive: true });

  const posts = await findPosts(POSTS);
  for (const post of posts) {
    const { title, date } = frontmatter(await readFile(post.path, 'utf8'), post.id);
    const locale = post.id.endsWith('.en.md') ? 'en' : 'pt-BR';

    await sharp(Buffer.from(postSvg(fonts, { title, date, locale })))
      .png({ compressionLevel: 9 })
      .toFile(join(target, ogImage(post.id).name));
  }

  return posts.length;
}

/**
 * Integração do Astro.
 *
 * `astro:build:done` porque só aí existe o diretório de saída, e porque a
 * imagem não serve para nada em desenvolvimento — nenhum agregador de link
 * visita localhost.
 */
export function ogPosts() {
  return {
    name: 'og-posts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const count = await buildOgPosts(fileURLToPath(dir));
        logger.info(
          count > 0
            ? `${count} imagens de compartilhamento geradas em og/`
            : 'blog não publicado — nenhuma imagem de compartilhamento gerada',
        );
      },
    },
  };
}
