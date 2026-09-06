import { describe, expect, it } from 'vitest';
import { activeHeading } from './active-heading.ts';

const line = 120;

describe('activeHeading', () => {
  it('não marca nada antes do primeiro título', () => {
    // A introdução não é uma seção; acender a primeira ali seria mentira.
    expect(activeHeading({ tops: [300, 900, 1500], line })).toBeNull();
  });

  it('marca o título assim que ele cruza a linha', () => {
    expect(activeHeading({ tops: [120, 900], line })).toBe(0);
    expect(activeHeading({ tops: [119, 900], line })).toBe(0);
  });

  it('segura a seção enquanto o leitor está no meio dela', () => {
    // O título já saiu da janela faz tempo, e continua sendo a seção atual.
    expect(activeHeading({ tops: [-2000, 800], line })).toBe(0);
  });

  it('escolhe o último que cruzou, não o primeiro', () => {
    expect(activeHeading({ tops: [-900, -400, -10, 700], line })).toBe(2);
  });

  it('no fim da página o último vence, mesmo sem ter cruzado', () => {
    // Seção final curta: o título dela nunca sobe além da linha, e sem esta
    // regra o índice ficaria preso na penúltima para sempre.
    expect(activeHeading({ tops: [-900, 400], line, atEnd: true })).toBe(1);
  });

  it('sem títulos, não há nada para marcar', () => {
    expect(activeHeading({ tops: [], line })).toBeNull();
    expect(activeHeading({ tops: [], line, atEnd: true })).toBeNull();
  });

  it('aceita linha zero, que é o topo da janela', () => {
    expect(activeHeading({ tops: [0, 500], line: 0 })).toBe(0);
    expect(activeHeading({ tops: [1, 500], line: 0 })).toBeNull();
  });
});
