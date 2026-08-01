/**
 * Auditoria estrutural de acessibilidade sobre o HTML já construído.
 *
 *   bun run build && bun tools/audit-a11y.mjs
 *
 * Roda sobre dist/ e não sobre os .astro de propósito: o que chega no leitor de
 * tela é o HTML final, depois de componente, condicional e i18n. Um `<h4>` que
 * parece certo no componente pode ser um salto de nível na página que o usa —
 * foi exatamente isso que apareceu nas páginas de arquivo do blog.
 *
 * Cobre o que dá para verificar sem navegador: hierarquia de títulos, nome
 * acessível, âncora quebrada, id duplicado, landmark, zoom travado. O que
 * depende de layout renderizado — tamanho de alvo, ordem de foco, foco
 * obscurecido por elemento fixo — continua sendo teclado e leitor de tela na
 * mão, e nenhum script substitui isso.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

const problems = [];
const note = (file, kind, detail) => problems.push({ file, kind, detail });

const textOf = (html) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

for await (const file of htmlFiles(DIST)) {
  const src = await readFile(file, 'utf8');
  const page = file.replace(`${DIST}/`, '');

  if (!/<html[^>]*\blang="[^"]+"/.test(src)) note(page, 'lang', 'sem lang no <html>');
  if (!textOf(src.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''))
    note(page, 'title', 'sem <title>');

  // Zoom travado reprova em 1.4.4. É um erro de uma linha e caro de descobrir tarde.
  const viewport = src.match(/<meta name="viewport"[^>]*content="([^"]*)"/)?.[1] ?? '';
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?!\d)/.test(viewport)) {
    note(page, 'zoom', `viewport impede ampliar: ${viewport}`);
  }

  const levels = [...src.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1Count = levels.filter((level) => level === 1).length;
  if (h1Count !== 1) note(page, 'h1', `${h1Count} elementos h1, esperado 1`);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      // Um salto soa, no leitor de tela, como se uma seção inteira tivesse sumido.
      note(page, 'titulo', `salta de h${levels[i - 1]} para h${levels[i]}`);
    }
  }

  for (const match of src.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(match[0])) note(page, 'img', `sem alt: ${match[0].slice(0, 70)}`);
  }

  /*
   * Canvas decorativo tem que estar escondido da tecnologia assistiva, não
   * rotulado. O objeto 3D não carrega informação nenhuma que o texto já não
   * diga — anunciá-lo seria ruído, e `aria-hidden` com `tabindex="-1"` é a
   * forma correta. Só cobra rótulo o canvas que NÃO está escondido.
   */
  for (const match of src.matchAll(/<canvas\b[^>]*>/g)) {
    const hidden = /aria-hidden="true"/.test(match[0]);
    const labelled = /aria-label|aria-labelledby|role="img"/.test(match[0]);
    if (!hidden && !labelled) note(page, 'canvas', `visível à leitura e sem rótulo`);
    if (hidden && !/tabindex="-1"/.test(match[0])) {
      // Escondido do leitor mas ainda focável é o pior dos dois: o foco some.
      note(page, 'canvas', 'aria-hidden sem tabindex="-1"');
    }
  }

  for (const match of src.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const [, attrs, inner] = match;
    const text = textOf(inner);
    if (!text && !/aria-label|aria-labelledby|title=/.test(attrs)) {
      note(page, 'link', `sem texto acessível: ${match[0].slice(0, 70)}`);
    }
    if (/^(clique aqui|click here|leia mais|read more|aqui|here|saiba mais)$/i.test(text)) {
      note(page, 'link', `texto sem sentido fora de contexto: "${text}"`);
    }
    if (/target="_blank"/.test(attrs) && !/rel="[^"]*noopener/.test(attrs)) {
      note(page, 'link', `_blank sem noopener: ${match[0].slice(0, 70)}`);
    }
  }

  for (const match of src.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (!textOf(match[2]) && !/aria-label|aria-labelledby/.test(match[1])) {
      note(page, 'botao', `sem nome: ${match[0].slice(0, 70)}`);
    }
  }

  const ids = [...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of new Set(ids)) {
    // id repetido quebra aria-labelledby e faz a âncora cair no primeiro que achar.
    if (ids.filter((other) => other === id).length > 1) note(page, 'id', `duplicado: ${id}`);
  }
  for (const match of src.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(match[1])) note(page, 'ancora', `#${match[1]} não existe na página`);
  }

  for (const match of src.matchAll(/tabindex="([1-9]\d*)"/g)) {
    // Positivo tira o elemento da ordem natural do documento e bagunça o resto.
    note(page, 'tabindex', `positivo: ${match[1]}`);
  }

  if (!/<main\b/.test(src)) note(page, 'landmark', 'sem <main>');
  if (!/<nav\b/.test(src)) note(page, 'landmark', 'sem <nav>');
  if (!/class="skip-link"/.test(src)) note(page, 'landmark', 'sem link de pular para o conteúdo');
}

/*
 * O reset universal de movimento reduzido.
 *
 * Verificado uma vez no CSS inteiro, e não declaração por declaração: as
 * transições dos componentes são neutralizadas por um bloco `*` global, então
 * cobrar guarda local em cada uma acusaria dezenas de problemas que não existem.
 */
const cssDir = join(DIST, '_astro');
const css = (
  await Promise.all(
    (
      await readdir(cssDir)
    )
      .filter((name) => name.endsWith('.css'))
      .map((name) => readFile(join(cssDir, name), 'utf8')),
  )
).join('\n');

const reduce = css.match(/@media \(prefers-reduced-motion:\s*reduce\)\{([\s\S]*?)\}\}/)?.[1] ?? '';
if (!/transition-duration:[^;]*!important/.test(reduce)) {
  note('(css)', 'movimento', 'sem reset universal de transition-duration em reduced-motion');
}
if (!/animation-duration:[^;]*!important/.test(reduce)) {
  note('(css)', 'movimento', 'sem reset universal de animation-duration em reduced-motion');
}
if (/scroll-behavior:\s*smooth/.test(css) && !/scroll-behavior:\s*auto/.test(reduce)) {
  note('(css)', 'movimento', 'scroll suave sem desligar em reduced-motion');
}
if (!/:focus-visible/.test(css)) {
  note('(css)', 'foco', 'nenhum estilo de :focus-visible');
}

if (problems.length === 0) {
  console.log('nenhum problema estrutural encontrado');
} else {
  const byKind = new Map();
  for (const problem of problems) {
    if (!byKind.has(problem.kind)) byKind.set(problem.kind, []);
    byKind.get(problem.kind).push(problem);
  }
  for (const [kind, list] of byKind) {
    console.log(`\n[${kind}] ${list.length}`);
    const seen = new Set();
    for (const { file, detail } of list) {
      if (seen.has(detail)) continue;
      seen.add(detail);
      console.log(`  ${file}: ${detail}`);
    }
  }
  process.exitCode = 1;
}
