/**
 * Converte texto em contornos SVG lendo o arquivo TrueType direto.
 *
 * Existe porque o libvips embutido no sharp é compilado sem pango e sem
 * fontconfig — `sharp.text()` nem é uma operação registrada, e um `<text>`
 * dentro de um SVG rasteriza como nada, sem erro nenhum. A única forma de pôr
 * a tipografia real do site numa imagem gerada é transformar as letras em
 * desenho antes de rasterizar.
 *
 * A alternativa era satori + resvg, duas dependências nativas para produzir uma
 * única imagem estática. Este arquivo roda em tools/, nunca vai para o site, e
 * segue o mesmo caminho que RSS, sitemap e escape de XML já seguem aqui.
 *
 * Cobre o que este projeto usa: glifos simples, glifos compostos (necessários
 * para ê, ç, ã) e largura de avanço. Não faz kerning nem ligadura — em título
 * curto a diferença não aparece, e GPOS custaria mais que o problema.
 */

const ON_CURVE = 0x01;
const X_SHORT = 0x02;
const Y_SHORT = 0x04;
const REPEAT = 0x08;
const X_SAME_OR_POSITIVE = 0x10;
const Y_SAME_OR_POSITIVE = 0x20;

const ARGS_ARE_WORDS = 0x0001;
const ARGS_ARE_XY = 0x0002;
const HAVE_SCALE = 0x0008;
const MORE_COMPONENTS = 0x0020;
const HAVE_XY_SCALE = 0x0040;
const HAVE_2X2 = 0x0080;

/**
 * Lê o diretório de tabelas e devolve um objeto navegável.
 *
 * @param {Buffer} buffer conteúdo de um .ttf
 */
export function loadFont(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const numTables = view.getUint16(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(
      buffer[record],
      buffer[record + 1],
      buffer[record + 2],
      buffer[record + 3],
    );
    tables[tag] = { offset: view.getUint32(record + 8), length: view.getUint32(record + 12) };
  }

  for (const required of ['head', 'hhea', 'maxp', 'cmap', 'loca', 'glyf', 'hmtx']) {
    if (!tables[required]) throw new Error(`fonte sem a tabela ${required}`);
  }

  const unitsPerEm = view.getUint16(tables.head.offset + 18);
  // 0 = offsets em loca guardados pela metade, em uint16. 1 = uint32 direto.
  const longLoca = view.getInt16(tables.head.offset + 50) === 1;
  const numGlyphs = view.getUint16(tables.maxp.offset + 4);
  const numberOfHMetrics = view.getUint16(tables.hhea.offset + 34);

  const font = {
    view,
    tables,
    unitsPerEm,
    longLoca,
    numGlyphs,
    numberOfHMetrics,
    ascender: view.getInt16(tables.hhea.offset + 4),
    descender: view.getInt16(tables.hhea.offset + 6),
  };
  font.cmap = readCmap(font);
  return font;
}

/** Sub-tabela Unicode BMP, formato 4 — a que toda fonte moderna traz. */
function readCmap(font) {
  const { view, tables } = font;
  const base = tables.cmap.offset;
  const numSubtables = view.getUint16(base + 2);

  let subtable = null;
  for (let i = 0; i < numSubtables; i++) {
    const record = base + 4 + i * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = base + view.getUint32(record + 4);
    // (3,1) Windows BMP é o alvo; (0,x) Unicode serve igual.
    if ((platform === 3 && encoding === 1) || platform === 0) {
      if (view.getUint16(offset) === 4) subtable = offset;
      if (platform === 3 && encoding === 1 && subtable) break;
    }
  }
  if (subtable === null) throw new Error('fonte sem cmap formato 4 em Unicode');

  const segCount = view.getUint16(subtable + 6) / 2;
  const endCodes = subtable + 14;
  const startCodes = endCodes + segCount * 2 + 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;

  return { view, segCount, endCodes, startCodes, idDeltas, idRangeOffsets };
}

/** Índice do glifo para um code point, ou 0 (.notdef) se a fonte não o tem. */
export function glyphIndex(font, codePoint) {
  const { view, segCount, endCodes, startCodes, idDeltas, idRangeOffsets } = font.cmap;

  for (let i = 0; i < segCount; i++) {
    if (view.getUint16(endCodes + i * 2) < codePoint) continue;
    if (view.getUint16(startCodes + i * 2) > codePoint) return 0;

    const rangeOffset = view.getUint16(idRangeOffsets + i * 2);
    if (rangeOffset === 0) {
      return (codePoint + view.getInt16(idDeltas + i * 2)) & 0xffff;
    }

    // O offset é medido a partir da própria posição em idRangeOffset — é um
    // ponteiro relativo dentro da tabela, não um índice.
    const at =
      idRangeOffsets + i * 2 + rangeOffset + (codePoint - view.getUint16(startCodes + i * 2)) * 2;
    const glyph = view.getUint16(at);
    return glyph === 0 ? 0 : (glyph + view.getInt16(idDeltas + i * 2)) & 0xffff;
  }
  return 0;
}

/** Largura de avanço, em unidades de em. */
export function advanceWidth(font, glyph) {
  const index = Math.min(glyph, font.numberOfHMetrics - 1);
  return font.view.getUint16(font.tables.hmtx.offset + index * 4);
}

function glyphRange(font, glyph) {
  const { view, tables, longLoca } = font;
  const loca = tables.loca.offset;
  const start = longLoca ? view.getUint32(loca + glyph * 4) : view.getUint16(loca + glyph * 2) * 2;
  const end = longLoca
    ? view.getUint32(loca + (glyph + 1) * 4)
    : view.getUint16(loca + (glyph + 1) * 2) * 2;
  // start === end significa glifo sem desenho, como o espaço.
  return start === end
    ? null
    : { start: tables.glyf.offset + start, end: tables.glyf.offset + end };
}

/**
 * Contornos de um glifo, em unidades de em, eixo Y apontando para cima.
 *
 * @returns {Array<Array<{x:number,y:number,on:boolean}>>}
 */
function glyphContours(font, glyph, depth = 0) {
  if (depth > 5) throw new Error('glifo composto aninhado demais');

  const range = glyphRange(font, glyph);
  if (!range) return [];

  const { view } = font;
  const numberOfContours = view.getInt16(range.start);

  if (numberOfContours < 0) return compositeContours(font, range, depth);

  let at = range.start + 10;
  const endPts = [];
  for (let i = 0; i < numberOfContours; i++) {
    endPts.push(view.getUint16(at));
    at += 2;
  }
  const numPoints = numberOfContours === 0 ? 0 : endPts[endPts.length - 1] + 1;

  // As instruções de hinting não interessam: só afetam a grade de pixels.
  at += 2 + view.getUint16(at);

  const flags = [];
  while (flags.length < numPoints) {
    const flag = view.getUint8(at++);
    flags.push(flag);
    if (flag & REPEAT) {
      let times = view.getUint8(at++);
      while (times-- > 0) flags.push(flag);
    }
  }

  // X e Y vêm em blocos separados, e cada um é um delta em relação ao anterior.
  const xs = [];
  let x = 0;
  for (const flag of flags) {
    if (flag & X_SHORT) {
      const delta = view.getUint8(at++);
      x += flag & X_SAME_OR_POSITIVE ? delta : -delta;
    } else if (!(flag & X_SAME_OR_POSITIVE)) {
      x += view.getInt16(at);
      at += 2;
    }
    xs.push(x);
  }

  const ys = [];
  let y = 0;
  for (const flag of flags) {
    if (flag & Y_SHORT) {
      const delta = view.getUint8(at++);
      y += flag & Y_SAME_OR_POSITIVE ? delta : -delta;
    } else if (!(flag & Y_SAME_OR_POSITIVE)) {
      y += view.getInt16(at);
      at += 2;
    }
    ys.push(y);
  }

  const contours = [];
  let from = 0;
  for (const endPt of endPts) {
    const contour = [];
    for (let i = from; i <= endPt; i++) {
      contour.push({ x: xs[i], y: ys[i], on: (flags[i] & ON_CURVE) !== 0 });
    }
    contours.push(contour);
    from = endPt + 1;
  }
  return contours;
}

/** Glifo montado a partir de outros — é assim que ê, ç e ã são guardados. */
function compositeContours(font, range, depth) {
  const { view } = font;
  let at = range.start + 10;
  const contours = [];

  for (;;) {
    const flags = view.getUint16(at);
    const componentGlyph = view.getUint16(at + 2);
    at += 4;

    let dx = 0;
    let dy = 0;
    if (flags & ARGS_ARE_WORDS) {
      dx = view.getInt16(at);
      dy = view.getInt16(at + 2);
      at += 4;
    } else {
      dx = view.getInt8(at);
      dy = view.getInt8(at + 1);
      at += 2;
    }
    // Sem esta flag os argumentos são índices de ponto a casar, não deslocamento.
    // Nenhuma fonte aqui usa isso; tratar como 0 é mais honesto que deslocar errado.
    if (!(flags & ARGS_ARE_XY)) {
      dx = 0;
      dy = 0;
    }

    let a = 1;
    let b = 0;
    let c = 0;
    let d = 1;
    if (flags & HAVE_SCALE) {
      a = d = f2dot14(view, at);
      at += 2;
    } else if (flags & HAVE_XY_SCALE) {
      a = f2dot14(view, at);
      d = f2dot14(view, at + 2);
      at += 4;
    } else if (flags & HAVE_2X2) {
      a = f2dot14(view, at);
      b = f2dot14(view, at + 2);
      c = f2dot14(view, at + 4);
      d = f2dot14(view, at + 6);
      at += 8;
    }

    for (const contour of glyphContours(font, componentGlyph, depth + 1)) {
      contours.push(
        contour.map((point) => ({
          x: a * point.x + c * point.y + dx,
          y: b * point.x + d * point.y + dy,
          on: point.on,
        })),
      );
    }

    if (!(flags & MORE_COMPONENTS)) break;
  }
  return contours;
}

/** Ponto fixo com 2 bits de inteiro e 14 de fração. */
function f2dot14(view, at) {
  return view.getInt16(at) / 16384;
}

/**
 * Um contorno vira um subcaminho SVG.
 *
 * TrueType guarda curvas quadráticas, e um ponto fora da curva entre dois
 * outros fora da curva implica um ponto na curva no meio dos dois — a fonte
 * economiza espaço deixando esse ponto subentendido.
 */
function contourToPath(contour, project) {
  if (contour.length === 0) return '';

  // O subcaminho tem que começar num ponto na curva. Se o contorno inteiro é de
  // pontos de controle, o início é o meio entre o último e o primeiro.
  let startIndex = contour.findIndex((point) => point.on);
  let start;
  if (startIndex === -1) {
    startIndex = 0;
    start = midpoint(contour[contour.length - 1], contour[0]);
  } else {
    start = contour[startIndex];
  }

  const at = project(start);
  const parts = [`M${at.x} ${at.y}`];

  const count = contour.length;
  let i = 1;
  while (i <= count) {
    const point = contour[(startIndex + i) % count];

    if (point.on) {
      const to = project(point);
      parts.push(`L${to.x} ${to.y}`);
      i += 1;
      continue;
    }

    const next = contour[(startIndex + i + 1) % count];
    const end = next.on ? next : midpoint(point, next);
    const control = project(point);
    const to = project(end);
    parts.push(`Q${control.x} ${control.y} ${to.x} ${to.y}`);
    i += next.on ? 2 : 1;
  }

  parts.push('Z');
  return parts.join(' ');
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true };
}

const round = (value) => Math.round(value * 100) / 100;

/**
 * Desenha uma linha de texto e devolve o `d` de um `<path>` mais a largura.
 *
 * @param {object} font resultado de loadFont
 * @param {string} text
 * @param {{x:number,y:number,size:number,letterSpacing?:number}} options
 *   x e y são o início da linha de base, em pixels da imagem final.
 */
export function textPath(font, text, options) {
  const { x = 0, y = 0, size, letterSpacing = 0 } = options;
  const scale = size / font.unitsPerEm;

  let pen = x;
  const parts = [];

  for (const char of text) {
    const glyph = glyphIndex(font, char.codePointAt(0));
    const penAt = pen;

    // O eixo Y da fonte aponta para cima e o do SVG para baixo: subir na letra
    // é diminuir y na imagem.
    const project = (point) => ({
      x: round(penAt + point.x * scale),
      y: round(y - point.y * scale),
    });

    for (const contour of glyphContours(font, glyph)) {
      const path = contourToPath(contour, project);
      if (path) parts.push(path);
    }

    pen += advanceWidth(font, glyph) * scale + letterSpacing;
  }

  return { d: parts.join(' '), width: pen - x - letterSpacing };
}

/** Largura da linha sem desenhar nada — serve para centralizar e alinhar. */
export function textWidth(font, text, size, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  let width = 0;
  for (const char of text) {
    width += advanceWidth(font, glyphIndex(font, char.codePointAt(0))) * scale + letterSpacing;
  }
  return width - letterSpacing;
}
