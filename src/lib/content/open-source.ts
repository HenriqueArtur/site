import type { Localized } from '../i18n/locales.ts';

export interface Repository {
  id: string;
  name: string;
  href: string;
  language: string;
  description: Localized;
  /** Destaque abre a seção com mais espaço que os demais. */
  featured?: boolean;
}

/** Seção 07 da home. */
export const openSource: Repository[] = [
  {
    id: 'archwarden',
    name: 'archwarden',
    href: 'https://github.com/HenriqueArtur/archwarden',
    language: 'Rust',
    featured: true,
    description: {
      'pt-BR':
        'Linter de arquitetura para TypeScript e JavaScript, escrito em Rust. Impõe as regras que um projeto já tem mas ninguém lembra: que pastas podem existir, que arquivo exige teste, que camada pode importar qual. Uma config, rodando em milissegundos, feita para ser consultada por agentes de código antes de escreverem.',
      en: 'An architecture linter for TypeScript and JavaScript, written in Rust. It enforces the rules a project already has but nobody remembers: which folders may exist, which files require a test, which layer may import which. One config, running in milliseconds, designed to be queried by coding agents before they write.',
    },
  },
  {
    id: 'cano-ts',
    name: 'cano-ts',
    href: 'https://github.com/HenriqueArtur/cano-ts',
    language: 'TypeScript',
    description: {
      'pt-BR':
        'Utilitário leve inspirado no operador pipe do Elixir, para compor funções síncronas e assíncronas em cadeias legíveis.',
      en: 'A lightweight utility inspired by Elixir’s pipe operator, for composing sync and async functions into readable chains.',
    },
  },
  {
    id: 'max-elixir-pokeapi',
    name: 'Max-Elixir-PokeAPI',
    href: 'https://github.com/HenriqueArtur/Max-Elixir-PokeAPI',
    language: 'Elixir',
    description: {
      'pt-BR':
        'Wrapper de Elixir para a PokéAPI, com cache automático. Listado na documentação oficial da PokéAPI, entre as bibliotecas da comunidade.',
      en: 'An Elixir wrapper for PokéAPI, with automatic caching. Listed in the official PokéAPI documentation among the community libraries.',
    },
  },
];
