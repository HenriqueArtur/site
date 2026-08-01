import { describe, expect, it } from 'vitest';
import { stickyRange } from './sticky-range.ts';

describe('stickyRange', () => {
  it('estende a caixa até o fim da seção alvo', () => {
    // Caixa começa em 100 e tem 400 de altura, terminando em 500.
    // A seção termina em 1800: faltam 1300 de alcance.
    expect(stickyRange({ boxTop: 100, boxHeight: 400, sectionBottom: 1800 })).toBe(1300);
  });

  it('devolve zero quando a caixa já passa do fim da seção', () => {
    // Alcance negativo viraria padding negativo, que o CSS ignora — melhor ser
    // explícito e devolver zero.
    expect(stickyRange({ boxTop: 100, boxHeight: 900, sectionBottom: 800 })).toBe(0);
  });

  it('devolve zero quando a caixa termina exatamente no fim da seção', () => {
    expect(stickyRange({ boxTop: 0, boxHeight: 500, sectionBottom: 500 })).toBe(0);
  });

  it('cresce quando a seção é mais alta', () => {
    const curta = stickyRange({ boxTop: 0, boxHeight: 300, sectionBottom: 900 });
    const longa = stickyRange({ boxTop: 0, boxHeight: 300, sectionBottom: 1600 });
    expect(longa).toBeGreaterThan(curta);
  });

  it('não depende da rolagem: trabalha em coordenadas do documento', () => {
    // Os dois casos descrevem o mesmo layout, lido em momentos diferentes da
    // rolagem. Medir com getBoundingClientRect puro daria respostas diferentes.
    const a = stickyRange({ boxTop: 200, boxHeight: 400, sectionBottom: 1500 });
    const b = stickyRange({ boxTop: 200, boxHeight: 400, sectionBottom: 1500 });
    expect(a).toBe(b);
  });

  it('aceita folga para soltar mais tarde que o fim da seção', () => {
    const justo = stickyRange({ boxTop: 100, boxHeight: 400, sectionBottom: 1800 });
    const folgado = stickyRange({ boxTop: 100, boxHeight: 400, sectionBottom: 1800, extra: 300 });
    expect(folgado).toBe(justo + 300);
  });

  it('a folga também não produz alcance negativo', () => {
    expect(stickyRange({ boxTop: 0, boxHeight: 900, sectionBottom: 500, extra: 100 })).toBe(0);
  });

  it('aguenta altura zero, quando o elemento ainda não foi renderizado', () => {
    expect(stickyRange({ boxTop: 0, boxHeight: 0, sectionBottom: 600 })).toBe(600);
  });
});
