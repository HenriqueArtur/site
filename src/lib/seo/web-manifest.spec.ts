import { describe, expect, it } from 'vitest';
import { tokens } from '../design/tokens.ts';
import { webManifest } from './web-manifest.ts';

describe('webManifest', () => {
  it('nomeia o site e traz nome curto para a tela inicial', () => {
    const manifest = webManifest('pt-BR');
    expect(manifest.name).toBe('Henrique Artur — Tech Lead');
    expect(manifest.short_name).toBe('Henrique Artur');
  });

  it('começa na home do idioma', () => {
    expect(webManifest('pt-BR').start_url).toBe('/');
    expect(webManifest('en').start_url).toBe('/en/');
  });

  it('abre no navegador, e não como aplicativo', () => {
    // Janela sem barra de endereço esconderia a URL e tiraria o botão de
    // voltar de quem instalou sem querer. Isto é um site.
    expect(webManifest('pt-BR').display).toBe('browser');
  });

  it('usa as cores do design system, sem segunda cópia da paleta', () => {
    const manifest = webManifest('pt-BR');
    expect(manifest.background_color).toBe(tokens.color.paper);
    expect(manifest.theme_color).toBe(tokens.color.paper);
  });

  it('declara os dois ícones que o build gera', () => {
    // Se um destes sumir do manifesto, o PNG correspondente fica órfão em
    // public/ — que foi exatamente o estado que este módulo veio corrigir.
    const sources = webManifest('pt-BR').icons.map((icon) => icon.src);
    expect(sources).toContain('/icon-192.png');
    expect(sources).toContain('/icon-512.png');
  });

  it('oferece uma variante recortável', () => {
    expect(webManifest('pt-BR').icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  });

  it('descreve no idioma pedido', () => {
    expect(webManifest('pt-BR').description).toMatch(/Construindo/);
    expect(webManifest('en').description).toMatch(/Building/);
    expect(webManifest('en').lang).toBe('en');
  });
});
