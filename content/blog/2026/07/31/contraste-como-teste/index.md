---
title: Contraste como teste, não como inspeção
description: Acessibilidade que depende de alguém lembrar de conferir não é garantia. Como transformei a paleta deste site em algo que o build verifica.
date: 2026-07-31
tags: [acessibilidade, design, testes]
draft: false
---

Quase toda equipe que conheço trata contraste de cor como etapa de revisão: alguém abre
uma ferramenta, cola dois hexadecimais, confere se passa em AA e segue a vida. Funciona
até a primeira vez que alguém ajusta um tom "só um pouquinho" seis meses depois.

O problema não é a falta de cuidado. É que a verificação mora fora do código, então nada
a executa de novo quando o código muda.

## O que eu fiz aqui

A paleta deste site vive num módulo TypeScript, não num arquivo CSS:

```ts
export const tokens = {
  color: {
    paper: '#F7F4ED',
    ink: '#2A241C',
    accent: '#E2571E',
    accentDeep: '#A93C10',
    // ...
  },
};
```

As custom properties do CSS são **geradas** a partir desse objeto. Isso já elimina uma
classe inteira de bugs — não existe uma segunda cópia da paleta para sair de sincronia.

Mas o ganho de verdade é que agora dá para escrever isto:

```ts
describe('contraste do texto sobre os fundos', () => {
  it('ink sobre paper atinge 4.5:1', () => {
    expect(contrastRatio(color.ink, color.paper)).toBeGreaterThanOrEqual(4.5);
  });
});
```

Mudar uma cor e quebrar acessibilidade passou a falhar o build.

## Duas coisas que só apareceram porque eram testadas

A primeira: o token que eu usava para as linhas da grade **reprovou** em 3:1. Isso está
correto — é decoração, não carrega informação. Mas revelou que eu não tinha nenhum token
para bordas que *delimitam* conteúdo, que precisam passar. Nasceu um segundo token, e a
distinção entre "linha decorativa" e "linha que significa algo" virou explícita no design
system em vez de morar na minha cabeça.

A segunda é o meu teste favorito do projeto:

```ts
it('accent NÃO atinge 4.5:1, e por isso accentDeep existe', () => {
  expect(contrastRatio(color.accent, color.paper)).toBeLessThan(4.5);
});
```

Ele afirma uma limitação. O laranja forte não serve como cor de texto — só como borda e
ícone — e é exatamente por isso que existe um segundo laranja mais escuro. Se um dia
alguém clarear o fundo o suficiente para o primeiro passar em 4.5, o teste falha e avisa
que o par virou redundante.

Um teste que documenta *por que* uma decisão existe vale mais do que um comentário, porque
o comentário não avisa quando deixa de ser verdade.

## O padrão

Isto não é sobre cor. É sobre onde a garantia mora.

Toda regra que você verifica manualmente é uma regra que vai ser violada — não por
descuido, mas porque a pessoa que a viola não sabia que ela existia. Se a regra pode ser
escrita como código, ela deve ser: não para automatizar o trabalho, mas para que a próxima
pessoa descubra a regra pela falha, no segundo em que a quebrar, em vez de meses depois
num relatório.
