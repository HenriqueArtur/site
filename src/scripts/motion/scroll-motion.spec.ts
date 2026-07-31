import { describe, expect, it } from 'vitest';
import { markCentered, revealInView, shouldRunFallback } from './scroll-motion.ts';

function fake(top: number, height = 200) {
  const classes = new Set<string>();
  return {
    classes,
    getBoundingClientRect: () => ({ top, height }),
    classList: {
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
    },
  };
}

describe('shouldRunFallback', () => {
  it('roda quando o navegador não tem timeline por scroll', () => {
    expect(shouldRunFallback({ supportsScrollTimeline: false, reducedMotion: false })).toBe(true);
  });

  it('não roda quando o CSS já dá conta sozinho', () => {
    // Rodar os dois animaria duas vezes o mesmo elemento.
    expect(shouldRunFallback({ supportsScrollTimeline: true, reducedMotion: false })).toBe(false);
  });

  it('não roda sob prefers-reduced-motion, mesmo sem suporte no CSS', () => {
    // O fallback existe para reproduzir o que o CSS faria — e o CSS não faria
    // nada aqui. Ignorar a preferência por vir de outro caminho seria burlá-la.
    expect(shouldRunFallback({ supportsScrollTimeline: false, reducedMotion: true })).toBe(false);
    expect(shouldRunFallback({ supportsScrollTimeline: true, reducedMotion: true })).toBe(false);
  });
});

describe('shouldRunFallback — sobrevive à serialização para o script inline', () => {
  // Esta função é injetada no <head> via toString(), igual à redirectTarget. Se
  // alguém adicionar um import ou referenciar algo do módulo, ela continua
  // passando nos testes acima e quebra no navegador com "X is not defined" —
  // e o sintoma seria o site inteiro sem animação, sem erro visível.
  const reconstructed = new Function(
    `return (${shouldRunFallback.toString()})`,
  )() as typeof shouldRunFallback;

  it('é autocontida: roda fora do módulo sem referência indefinida', () => {
    expect(() =>
      reconstructed({ supportsScrollTimeline: false, reducedMotion: false }),
    ).not.toThrow();
  });

  it('responde igual à original em todas as combinações', () => {
    for (const supportsScrollTimeline of [true, false]) {
      for (const reducedMotion of [true, false]) {
        const env = { supportsScrollTimeline, reducedMotion };
        expect(reconstructed(env), JSON.stringify(env)).toBe(shouldRunFallback(env));
      }
    }
  });
});

describe('revealInView', () => {
  it('marca o elemento que já entrou na faixa visível', () => {
    const el = fake(500);
    revealInView([el], 800);
    expect(el.classes.has('is-in')).toBe(true);
  });

  it('não marca o que ainda está abaixo da faixa', () => {
    const el = fake(790);
    revealInView([el], 800);
    expect(el.classes.has('is-in')).toBe(false);
  });

  it('nunca desmarca: revelação é de mão única', () => {
    // Desmarcar faria o conteúdo desaparecer ao rolar de volta para cima.
    const el = fake(100);
    revealInView([el], 800);
    revealInView([{ ...el, getBoundingClientRect: () => ({ top: 2000, height: 200 }) }], 800);
    expect(el.classes.has('is-in')).toBe(true);
  });

  it('respeita o limiar recebido', () => {
    const el = fake(700);
    revealInView([el], 800, 0.5);
    expect(el.classes.has('is-in')).toBe(false);

    revealInView([el], 800, 0.95);
    expect(el.classes.has('is-in')).toBe(true);
  });

  it('aguenta lista vazia', () => {
    expect(() => revealInView([], 800)).not.toThrow();
  });
});

describe('markCentered', () => {
  it('marca só o elemento mais centralizado', () => {
    const a = fake(0);
    const b = fake(300);
    const c = fake(700);

    markCentered([a, b, c], 800);

    expect(a.classes.has('is-centered')).toBe(false);
    expect(b.classes.has('is-centered')).toBe(true);
    expect(c.classes.has('is-centered')).toBe(false);
  });

  it('move a marca ao rolar, sem deixar duas marcadas', () => {
    const a = fake(300);
    const b = fake(700);
    markCentered([a, b], 800);
    expect(a.classes.has('is-centered')).toBe(true);

    const a2 = { ...a, getBoundingClientRect: () => ({ top: -200, height: 200 }) };
    const b2 = { ...b, getBoundingClientRect: () => ({ top: 350, height: 200 }) };
    markCentered([a2, b2], 800);

    expect(a.classes.has('is-centered')).toBe(false);
    expect(b.classes.has('is-centered')).toBe(true);
  });

  it('apaga a marca quando nenhum elemento está na tela', () => {
    const a = fake(300);
    markCentered([a], 800);
    expect(a.classes.has('is-centered')).toBe(true);

    const fora = { ...a, getBoundingClientRect: () => ({ top: 2000, height: 200 }) };
    markCentered([fora], 800);
    expect(a.classes.has('is-centered')).toBe(false);
  });

  it('devolve o índice marcado, ou null', () => {
    expect(markCentered([fake(300)], 800)).toBe(0);
    expect(markCentered([fake(5000)], 800)).toBeNull();
  });
});
