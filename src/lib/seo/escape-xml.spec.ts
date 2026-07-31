import { describe, expect, it } from 'vitest';
import { escapeXml } from './escape-xml.ts';

describe('escapeXml', () => {
  it('escapa os cinco caracteres que quebram XML', () => {
    expect(escapeXml('&')).toBe('&amp;');
    expect(escapeXml('<')).toBe('&lt;');
    expect(escapeXml('>')).toBe('&gt;');
    expect(escapeXml('"')).toBe('&quot;');
    expect(escapeXml("'")).toBe('&apos;');
  });

  it('escapa o & primeiro, para não gerar &amp;lt; a partir de <', () => {
    // Ordem errada produz dupla escapada: & vira &amp;, e o & do &lt; recém-criado
    // seria escapado de novo. É o bug clássico de escape manual.
    expect(escapeXml('<a & b>')).toBe('&lt;a &amp; b&gt;');
  });

  it('não mexe em texto sem caractere especial', () => {
    expect(escapeXml('Contraste como teste')).toBe('Contraste como teste');
  });

  it('preserva acentos e caracteres não-ASCII', () => {
    expect(escapeXml('Sistemas que eu ajudei a existir — ação')).toBe(
      'Sistemas que eu ajudei a existir — ação',
    );
  });

  it('lida com string vazia', () => {
    expect(escapeXml('')).toBe('');
  });

  it('escapa todas as ocorrências, não só a primeira', () => {
    expect(escapeXml('a & b & c')).toBe('a &amp; b &amp; c');
  });

  it('neutraliza uma tentativa de injetar marcação', () => {
    expect(escapeXml('</title><script>alert(1)</script>')).toBe(
      '&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });
});
