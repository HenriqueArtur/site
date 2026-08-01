export interface TextSegment {
  text: string;
  marked: boolean;
}

/** `*assim*`. Exige conteúdo entre os asteriscos, então `**` não conta. */
const MARK = /\*([^*]+)\*/g;

/**
 * Separa um texto em trechos marcados e não marcados.
 *
 * A sintaxe existe para o conteúdo continuar legível em `profile.ts` — HTML cru
 * dentro de uma string de conteúdo é difícil de revisar e fácil de quebrar. E
 * como o resultado são segmentos, e não marcação, nada de HTML atravessa: o
 * componente decide que elemento usar.
 *
 * Asterisco sem par fica como está. "3 * 4" é aritmética, não ênfase.
 */
export function parseEmphasis(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(MARK)) {
    const start = match.index;
    const [full, inner] = match;

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), marked: false });
    }

    segments.push({ text: inner as string, marked: true });
    cursor = start + full.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), marked: false });
  }

  return segments;
}
