# IDEIA — henriqueartur.com

Documento de planejamento. Nada foi implementado ainda. Este arquivo é a fonte da
verdade sobre o que vai ser construído; ele é revisado e aprovado antes da primeira
linha de código.

---

## 1. Objetivo

Site pessoal profissional de **Henrique Artur**, em `henriqueartur.com`, hospedado no
GitHub Pages a partir do repositório `HenriqueArtur/site`. Duas áreas no mínimo:

- `/` — página profissional completa: quem sou, o que faço, impacto gerado, stack,
  trajetória, formação, contato.
- `/blog` — artigos escritos em Markdown, agrupados por ano e mês.

Bilíngue (pt-BR e inglês), com o idioma inicial vindo da preferência do navegador.
Mobile first. Acessível segundo WCAG 2.2 nível AA.

Contato público: **contato@henriqueartur.com**.

---

## 2. Stack

Versões verificadas no npm em 30/07/2026.

| Peça | Escolha | Versão | Papel |
|---|---|---|---|
| Framework | Astro | 7.1.6 | SSG, rotas, i18n, pipeline de conteúdo |
| Testes | Vitest | 4.1.10 | TDD de comportamento |
| Lint/format | Biome | 2.5.6 | estilo, formatação e restrição de imports |
| Types | TypeScript (`tsc --noEmit`) | 5.9.3 | type check no CI |
| Arquitetura | archwarden | 0.5.1 | regras estruturais e de fronteira |
| 3D | three.js (+ `@types/three`) | 0.185.1 | modelo na home, carregado sob demanda |
| Hooks | husky | 9.1.7 | pre-commit e pre-push |
| Pacotes | bun | 1.3.14 | instalação e execução de scripts |
| Runtimes | mise | — | Node e bun fixados por `.mise.toml` |

**Todas as versões são exatas — nunca `^` nem `~`.** É convenção do projeto, travada em
`bunfig.toml` (`[install] exact = true`) para que instalações futuras não reintroduzam
faixas.

**Node 24 fixado por `.mise.toml`.** O global do ambiente está em 22.11.0, e Astro 7 exige
`>=22.12.0` — sem o pin, o instalador resolve silenciosamente para Astro 5, que carrega
CVEs conhecidos em `esbuild` e `sharp`. O pin é local ao projeto e não altera seu mise
global.

`@types/three` é dev dependency necessária: o pacote `three` não publica tipos próprios.

### 2.1 Duas decisões que precisam de aval

**Markdown — `marked` provavelmente sai.** Você escolheu `marked` quando a alternativa
era um SSG próprio. Com Astro, o pipeline de Markdown já existe: o Astro usa
`remark`/`rehype` internamente e essas dependências entram no `node_modules` querendo
ou não. Adicionar `marked` por cima não remove nada — só acrescenta um segundo parser
para fazer o que o primeiro já faz, e ainda nos tira as content collections (validação
de frontmatter, tipos gerados, `getCollection`).

> **Recomendação:** usar o Markdown nativo do Astro e **não** instalar `marked`.
> **Ainda aguardando seu aval.**

**Shiki e frontmatter validado — já vêm inclusos.** Shiki é o highlighter padrão do
Astro, em tempo de build, sem JS no cliente. Content collections validam frontmatter por
schema e quebram o build. Os dois "extras" que você pediu custam **zero** dependência
nova — viram configuração.

**RSS e sitemap.** Proponho gerar o XML com código nosso via endpoints estáticos
(`src/pages/rss.xml.ts`), ~60 linhas testáveis, em vez de `@astrojs/rss` +
`@astrojs/sitemap`. **Aguardando seu aval.**

**Saldo final de dependências de produção: `astro` + `three`.** O resto é dev
(`vitest`, `biome`, `archwarden`, `typescript`).

### 2.2 Sobre Astro e archwarden

Consequência conhecida e aceita: o archwarden **não lê arquivos `.astro`** hoje. O walk
classifica por extensão (`FileClass::Source` vs `Other`, em
`crates/archwarden-engine/src/walk.rs`) e o parser deriva o tipo via
`SourceType::from_path` (`crates/archwarden-parser/src/oxc.rs:63`), que rejeita
`.astro`. Regras estruturais (pasta e nome de arquivo) continuam valendo; `naming`,
`import-boundary`, `call-obligation` e `no-passthrough` não enxergam esses arquivos —
e hoje não avisam que não enxergaram.

Issue aberta: **[archwarden#13](https://github.com/HenriqueArtur/archwarden/issues/13)**
— propõe o parser de frontmatter com offset de spans, as semânticas que precisam de
decisão (export de componente `.astro`, `spec-pair` com extensão diferente, resolução
de `.astro`, client directives) e, separadamente, fazer o skip aparecer no relatório.

**Isso vira uma regra de arquitetura em vez de um problema:** todo `.astro` é apenas
apresentação — recebe dados prontos e devolve marcação. Qualquer lógica vive em `.ts`
sob `src/lib/`, onde o archwarden governa 100% e onde o Vitest testa sem renderizador.
Um `.astro` que comece a decidir coisas é um sintoma, não uma conveniência.

---

## 3. Identidade visual

Conceito: **planta técnica em papel envelhecido**. Blueprint, mas claro — linhas finas
sobre papel creme, anotações em monoespaçado, e laranja forte como única cor de
destaque. Nada arredondado. **Sem modo escuro** (decidido).

### 3.1 Paleta — implementada e verificada

Fonte única de verdade em `src/lib/design/tokens.ts`. As custom properties do CSS são
**geradas** a partir desse objeto (`css-variables.ts`), então não existe uma segunda
cópia da paleta num `.css` para sair de sincronia.

| Token | Valor | Papel | Contraste medido |
|---|---|---|---|
| `paper` | `#F7F4ED` | fundo principal | — |
| `paperDeep` | `#EDE6D8` | blocos alternados | — |
| `ink` | `#2A241C` | texto principal | **13.98** sobre paper |
| `inkSoft` | `#5B5145` | texto secundário | **7.06** sobre paper |
| `accentDeep` | `#A93C10` | link e texto laranja | **5.72** sobre paper |
| `accent` | `#E2571E` | borda, ícone, foco | **3.40** sobre paper |
| `lineStrong` | `#8F8166` | borda que delimita conteúdo | **3.48** sobre paper |
| `line` | `#C4B9A4` | grade do blueprint | 1.77 — decorativa |
| `lineSoft` | `#DED5C2` | grade fina | — decorativa |

**O contraste é verificado por teste automatizado, não por inspeção visual.**
`tokens.spec.ts` calcula a razão WCAG de cada par relevante e falha o build se algum
cair abaixo do mínimo (4.5:1 texto, 3:1 interface). Mudar uma cor e quebrar
acessibilidade fica impossível de passar despercebido.

Duas descobertas da fase 2 que mudaram a paleta original:

- **`line` reprovou em 3:1** (1.77). Correto: ele é a grade do blueprint, decoração pura.
  Mas faltava um token para bordas que *carregam significado* — daí nasceu o
  `lineStrong`, escolhido por busca até passar 3:1 nos dois fundos.
- **`accent` reprova como texto** (3.40 < 4.5), e há um teste que **afirma** isso. É o
  que justifica a existência do `accentDeep`. Se um dia o accent passar em 4.5, o teste
  falha e avisa que o par virou redundante.

O laranja **nunca** é o único portador de informação — sempre acompanhado de forma,
posição, sublinhado ou rótulo.

### 3.2 Superfícies — a grade é ritmo, não papel de parede

A primeira versão colocava a grade no `body` inteiro. Cansa a vista: vira ruído
constante em vez de referência, e depois de dois parágrafos o olho para de vê-la como
papel e passa a vê-la como sujeira.

Agora o fundo da página é liso e **cada seção escolhe sua textura**, definida em
`src/lib/design/section-surfaces.ts`:

| Superfície | Onde | Por quê |
|---|---|---|
| `grid` | Impacto, Trajetória, hero | Papel milimetrado é o lugar de anotar medida e cronologia |
| `dots` | Projetos, Contato | Mesma ideia de referência, metade do peso visual |
| `plain` | Sobre, Stack, Formação | Texto corrido não compete com trama |
| `inverted` | Open source | Único bloco escuro da página — acento repetido não acentua |

Duas regras viraram teste, para não se perderem na próxima edição: **nenhuma seção
vizinha repete a textura**, e **as seções de leitura longa são lisas**.

A grade também cresceu: era 8px/64px, agora é **20px/100px** — o quadradinho de 5mm em
tela. A 8px ela não lê como papel, lê como cinza.

**Consequência de acessibilidade que quase passou:** a superfície invertida troca papel
por tinta, e com isso todo par de cor muda. O `--accent` atinge só **4.11:1** sobre
tinta e reprovaria como texto lá. Daí nasceu `--accent-on-dark`, com dois testes
fixando a razão de haver dois: um afirma que o accent comum *não* serve sobre tinta,
outro que o novo *não* serve sobre papel.

### 3.3 Formas e mão livre

- `border-radius: 0` como padrão global. Exceções pontuais no máximo em 2px.
- Bordas de 1px em `--line`, no espírito de linha de cota de desenho técnico.
- **Desalinhamento intencional.** Cartões e itens de lista saem do prumo por até 0,45°,
  variando por posição; o número da seção, por 3°. Nada passa de 1° em elemento com
  texto longo — acima disso o olho lê como defeito, e texto inclinado cansa. Por isso a
  inclinação fica em cartão e rótulo, nunca em parágrafo.
- **Traço à mão sob cada título**, em SVG com caminho irregular, que se desenha sozinho
  conforme a seção entra na tela.
- **Anotação de margem** em monoespaçado inclinado, como lembrete a lápis ao lado do
  título: "resultado antes de responsabilidade", "sistemas, não empregadores".
- **Animação de entrada dirigida pelo scroll, sem uma linha de JavaScript**, via
  `animation-timeline: view()`. O estado inicial escondido vive dentro do
  `@supports`: onde a propriedade não existe, o conteúdo já está visível. O contrário
  — esconder por padrão e revelar por script — deixaria a página em branco para quem
  não executa JS. Tudo dentro de `prefers-reduced-motion: no-preference`.
- Elementos de planta baixa: réguas, marcas de canto, números de seção em monoespaçado
  (`01 —`, `02 —`), rótulos em caixa alta com letter-spacing.
- Sombras: nenhuma, ou deslocamento sólido sem blur (estilo carimbo).

### 3.3 Tipografia — **combinação A escolhida**

Todas auto-hospedadas em `woff2` com subset (nenhuma requisição a CDN externo), todas
com licença SIL Open Font License, todas com `font-display: swap` e fallback de sistema
que não quebra o layout.

**A — "Prancheta" — ✅ ESCOLHIDA**

| Papel | Fonte | Por quê |
|---|---|---|
| Títulos | **Zilla Slab** | Slab serif da Mozilla. Slab é literalmente o vocabulário de rótulo de máquina industrial e de carimbo de prancheta — encaixa no conceito sem virar fantasia |
| Corpo | **Source Serif 4** | Serifada desenhada para tela, excelente em texto longo de blog |
| Anotações | **IBM Plex Mono** | Mono técnica, desenhada para contexto de engenharia |

Vintage por vocabulário industrial, não por imitação. É a que envelhece melhor e a que
sustenta um blog com texto longo.

**Implementada.** `tools/fetch-fonts.mjs` baixa as fontes e gera `src/styles/fonts.css`
apontando para arquivos locais — o script é versionado para o processo ser reproduzível.
Só os subsets `latin` e `latin-ext`; cirílico, grego e vietnamita ficam de fora.

| Família | Pesos | Arquivos |
|---|---|---|
| Zilla Slab | 400, 700 | 4 |
| Source Serif 4 | 400–600 (variável) | 2 |
| IBM Plex Mono | 400 | 2 |

**332 KB no disco; ~192 KB é o que um visitante em português realmente baixa** (o
`latin-ext` só entra se a página usar caracteres dele). A fonte de corpo tem `preload`, e
`font-display: swap` faz o texto aparecer de imediato na fonte de sistema. Licenças em
`public/fonts/LICENSE.md`, como a OFL exige.

Armadilha encontrada e corrigida: pedir os pesos 400 e 600 de Source Serif 4 como
instâncias nomeadas fazia o Google devolver **o mesmo arquivo duas vezes** — é fonte
variável, e os md5 batiam. Pedindo a faixa `400..600`, vem um arquivo só. Foram 218 KB
que teriam entrado no repositório sem ninguém notar.

Otimização futura possível: subsetting por glifos realmente usados cortaria os 119 KB do
Source Serif para algo perto de 40 KB, mas exige `fonttools` como dependência de build.
Não vale antes de o conteúdo existir.

**B — "Ateliê" — não escolhida**

| Papel | Fonte | Por quê |
|---|---|---|
| Títulos + corpo | **EB Garamond** | Revival old-style genuíno do século XVI. É papel e tinta de verdade — o mais "vintage" possível |
| Anotações | **Courier Prime** | Datilografia real, redesenhada para tela |

Risco honesto: Garamond tem traço leve e altura-x baixa. Exige corpo maior e atenção
redobrada em contraste para passar em AA. Fica lindíssima em título, mais arriscada em
texto corrido no celular.

**C — "Cartaz" — não escolhida**

| Papel | Fonte | Por quê |
|---|---|---|
| Títulos | **Instrument Serif** | Didone de alto contraste, cara de cartaz do século XIX |
| Corpo | **Public Sans** | Neutra de propósito, deixa o título brilhar |
| Anotações | **Space Mono** | Mono com maneirismos retrô |

Muita personalidade no título; o contraste alto da Instrument Serif some em telas
pequenas, então ela funciona grande ou não funciona.

### 3.4 Modelo 3D — **decidido: Smol Ame in an upcycled terrarium**

Modelo escolhido por você:
[Smol Ame in an upcycled terrarium](https://sketchfab.com/3d-models/smol-ame-in-an-upcycled-terrarium-hololiveen-490cecc249d242188fda5ad3160a4b24),
de **Seafoam**, sob **CC BY 4.0**. 53,5k triângulos, 27,5k vértices.

Substitui a direção anterior ("um sistema se montando"), mantida abaixo como registro.

**Obrigações e riscos, registrados:**

- **Crédito é obrigatório.** A CC BY exige atribuição ao Seafoam, com link para o
  original e menção à licença. Vai no rodapé da home.
- **A licença cobre a modelagem, não a personagem.** Watson Amelia é IP da Cover Corp;
  a CC BY do Seafoam não pode licenciar o que não é dele. As diretrizes de fan content
  da Cover em geral permitem obra derivada não comercial, e um portfólio pessoal é uma
  zona cinzenta por ser autopromoção. Decisão tomada com isso à vista.
- **Peso.** É, com folga, o maior ativo do site — que hoje tem 32 KB de HTML e zero
  arquivo JS baixado. Orçamento a respeitar: **abaixo de 1,5 MB** para o `.glb` depois
  de compressão de malha e redução de textura. Acima disso, o modelo entra só em
  conexão rápida ou não entra.
- **Download manual.** A Sketchfab exige login, então o `.glb` precisa ser baixado por
  você e colocado em `public/models/`.

**Como será carregado** (regras que não mudam com a troca de modelo):

- `import()` dinâmico dentro de `IntersectionObserver`; nada de three.js no carregamento
  inicial.
- **Desligado** sob `prefers-reduced-motion: reduce`, com fallback estático sempre
  presente no HTML.
- `<canvas>` decorativo: `aria-hidden`, fora da ordem de tabulação, nenhuma informação
  exclusiva dele.
- Pausa quando a aba perde visibilidade e quando sai do viewport.
- Fallback também para ausência de WebGL e para tela pequena.

<details>
<summary>Direção anterior, substituída: um sistema se montando</summary>

O objeto não é uma peça bonita girando: é **um sistema que se monta e se desmonta**. O
movimento é o conteúdo. Duas formas dentro dessa direção, a decidir na fase 6:

- **Grafo de nós e arestas em 3D** — módulos se conectando e se reorganizando. Fala de
  arquitetura de software diretamente, sem virar ilustração genérica.
- **Vista explodida animada** — as partes se separam mostrando a estrutura interna e
  voltam a se juntar. É o desenho técnico de montagem, que é exatamente o vocabulário
  do resto do site.

Por que essa direção venceu: as anteriores eram todas "objeto vintage decorativo", com
teto baixo. Um sistema que se monta é ao mesmo tempo abstrato (não corre risco de virar
enfeite), técnico (linhas, cotas, estrutura) e autobiográfico (é o que você faz).

Consequência boa para acessibilidade e peso: a geometria é **gerada por código**, não
carregada de um arquivo `.glb`. Isso elimina o download do modelo, elimina a questão de
licença de terceiros, e torna o fallback estático trivial de derivar do mesmo dado.

<details>
<summary>Catálogo de candidatos descartados, por narrativa</summary>

Mantido como registro do que já foi considerado e recusado, para não voltar ao mesmo
terreno.

**Grupo 1 — Instrumentos de precisão e medição.** O mais alinhado ao conceito de planta
técnica.

- **Astrolábio / esfera armilar** — anéis concêntricos giram lindamente em wireframe,
  boa silhueta no celular; instrumento que orienta e mede.
- **Teodolito** — instrumento de topografia sobre tripé. Silhueta forte e inconfundível,
  literalmente a ferramenta de quem levanta uma planta. Talvez o mais "blueprint" de todos.
- **Sextante** — arco graduado, espelhos, latão. Elegante, mas lê pior de longe.
- **Paquímetro / compasso / esquadro** — discreto e barato de renderizar; menos memorável.
- **Régua de cálculo** — o computador do engenheiro antes da calculadora. Problema: é
  plano, então perde muito em 3D.

**Grupo 2 — Computação antes do computador.** Narrativa de engenharia de software.

- **Máquina diferencial de Babbage / trem de engrenagens** — a primeira máquina de
  computar, em engrenagens vitorianas. Densa em linhas, gira sozinha, e conta uma história
  sobre a sua profissão sem precisar de legenda. Forte candidata.
- **Mecanismo de relojoaria exposto** — precisão e "sistemas que funcionam de verdade".
- **Ábaco** — computação antiga, mas visualmente pobre em wireframe.

**Grupo 3 — Mídia e escrita.** Liga com o blog e com Sistemas e Mídias Digitais / UFCTV.

- **Máquina de escrever** — silhueta ótima, afetiva, e coerente com um site cujo coração
  é um blog. A mais "acolhedora" da lista.
- **Câmera de fole / projetor de cinema** — puxa sua formação em mídias e a bolsa na UFCTV.
- **Prensa tipográfica / tipos móveis** — conversa diretamente com a tipografia do site.

**Grupo 4 — Sua história.** Memorável e pessoal.

- **Mecha / super robô, referência ao Super Gattai** — easter egg de quem fundou estúdio
  de jogos. Alto risco de destoar do tom profissional, alto retorno em memorabilidade.
- **Gabinete de arcade ou joystick retrô** — vintage anos 80 em vez de século XIX; é outro
  vintage, mas também é o seu.

**Grupo 5 — Abstrato e seguro.**

- **Sólido platônico com estrutura interna** — nunca erra, nunca marca.
- **Edifício isométrico em wireframe** — blueprint arquitetônico literal.

Se algum dia a direção mudar para um objeto pronto: procurar no Smithsonian Open Access
(domínio público), Poly Haven (CC0) ou Sketchfab filtrando CC0/CC-BY, exigindo glTF/GLB,
licença compatível com uso comercial e menos de ~500KB depois de decimação.

</details>

**Regras não negociáveis de implementação:**

- Carregado com `import()` dinâmico dentro de um `IntersectionObserver`; nada de
  three.js no carregamento inicial. Ilha Astro com `client:visible`.
- **Desligado** sob `prefers-reduced-motion: reduce`, com fallback estático (SVG
  wireframe) sempre presente no HTML.
- `<canvas>` é decorativo: `aria-hidden="true"`, fora da ordem de tabulação, e nenhuma
  informação existe apenas nele.
- Pausa quando a aba perde visibilidade, para não drenar bateria.
- Fallback também para ausência de WebGL.

</details>

---

## 4. Idiomas

- **pt-BR é o padrão**, na raiz: `/`, `/blog`, `/2026/07/30/post/`.
- **Inglês sob prefixo**: `/en/`, `/en/blog`, `/en/2026/07/30/post/`.
- Ambas existem como HTML estático real — indexáveis, compartilháveis, funcionais sem JS.

### 4.1 Detecção pelo navegador

GitHub Pages não tem servidor, então não existe negociação por `Accept-Language`. A
detecção é no cliente, com script mínimo inline no `<head>`:

1. Escolha explícita salva em `localStorage` sempre vence.
2. Senão, na **primeira** visita a uma URL sem prefixo, olha `navigator.languages`. Se
   nenhum item começar com `pt`, redireciona para o equivalente em `/en/`.
3. O redirecionamento acontece uma vez e fica registrado, para nunca sequestrar quem
   chegou por link direto.

Salvaguardas: seletor de idioma visível e funcional sem JS em toda página; `<html lang>`
sempre reflete o idioma real; `<link rel="alternate" hreflang>` liga as versões (mais
`x-default`); o redirect nunca ocorre se a URL já tem prefixo.

### 4.2 Conteúdo traduzido

- Interface: dicionários tipados em `src/lib/i18n/`, com o TypeScript garantindo que
  nenhuma chave falte em nenhum idioma.
- Posts: `index.md` é pt-BR, `index.en.md` é inglês. Post sem tradução não aparece na
  listagem daquele idioma; quem chegar pela URL traduzida vê aviso claro com link para a
  versão existente. Nada de página em branco nem idioma trocado sem avisar.

---

## 5. Blog

### 5.1 Layout no disco

```
content/blog/
  2026/
    07/
      30/
        meu-primeiro-post/
          index.md        ← pt-BR
          index.en.md     ← inglês
          capa.jpg        ← assets junto do post
```

### 5.2 URLs geradas

```
/2026/07/30/meu-primeiro-post/        pt-BR
/en/2026/07/30/meu-primeiro-post/     inglês
/blog                                  índice agrupado por ano › mês
/blog/2026                             ano
/blog/2026/07                          mês
/rss.xml   /en/rss.xml                 feeds
/sitemap.xml
```

### 5.3 Frontmatter

```yaml
---
title: Título do post
description: Resumo de uma ou duas frases, usado em SEO e na listagem.
date: 2026-07-30
tags: [arquitetura, typescript]
draft: false
---
```

Validado por schema. Post sem título, sem data, ou com data que não bate com o caminho
do arquivo, **quebra o build**. `draft: true` some do build de produção.

---

## 6. Arquitetura

```
site/
├── IDEIA.md
├── arch.config.json          regras do archwarden
├── astro.config.mjs
├── biome.json
├── tsconfig.json
├── package.json
├── content/
│   └── blog/<ano>/<mês>/<dia>/<slug>/index{,.en}.md
├── public/
│   ├── CNAME                 henriqueartur.com
│   ├── fonts/
│   └── models/               .glb do objeto 3D
└── src/
    ├── pages/                rotas (.astro) — só montagem
    ├── layouts/              (.astro)
    ├── components/           (.astro) — só apresentação
    ├── lib/                  ⟵ toda a lógica, .ts, 100% testada
    │   ├── posts/            carregar, ordenar, agrupar por ano/mês, parear traduções
    │   ├── i18n/             dicionários, negociação de idioma, formatação por locale
    │   ├── routes/           construção e parsing de URL de post
    │   ├── seo/              metadados, Open Graph, JSON-LD
    │   └── content/          dados profissionais (experiência, skills) tipados
    ├── scripts/              ⟵ comportamento no cliente, .ts, testado
    │   ├── language/         seletor e detecção
    │   └── three/            única pasta autorizada a importar three.js
    └── styles/
```

**A regra central:** `.astro` não decide nada. Recebe pronto e desenha.

### 6.1 Regras do archwarden

| # | Tipo | O que trava |
|---|---|---|
| 1 | `structure` | Subpastas permitidas em `src/lib/*` — pasta nova exige decisão consciente |
| 2 | `structure` | `content/blog/*/*/*/*` só aceita `index.md`, `index.en.md` e assets |
| 3 | `spec-pair` | Todo `.ts` em `src/lib/**` e `src/scripts/**` exige `.spec.ts` irmão, com `require_non_empty_spec: true` — o gate real de TDD |
| 4 | `import-boundary` | `src/lib/**` não importa de `src/scripts/**` nem de `src/components/**` |
| 5 | *(Biome, não archwarden)* | Só `src/scripts/three/**` importa `three` — ver 6.3 |
| 6 | `import-boundary` | `src/lib/**` não toca APIs de browser — mantém tudo testável em Node |
| 7 | `no-passthrough` | Sem barrel files (`forms: ["reexport"]`) |
| 8 | `naming` | Arquivo dita símbolo exportado nos módulos de `src/lib/` |

Rodam em `pnpm check:arch`, no pre-commit e no CI.

### 6.2 Limitação declarada — `.astro`

Regras 4 a 8 dependem de facts e **não alcançam `.astro`** (issue
[#13](https://github.com/HenriqueArtur/archwarden/issues/13)). A mitigação é a regra 1
mais a disciplina de manter `.astro` sem lógica. Registrado para que ninguém leia um
`check` verde como "a fronteira foi verificada em todo lugar".

Já confirmado na prática na fase 1 — `archwarden check --format json` na página
placeholder devolve:

```json
"checks_skipped": 1,
"skipped_checks": [{ "rule_id": "no-barrel-files", "path": "src/pages/index.astro" }]
```

A saída de texto mostra só `1 skipped`, sem dizer qual nem por quê. Evidência anexada à
issue.

### 6.3 Limitação declarada — dependência externa

O archwarden v0 **não expressa proibição sobre um pacote**: `RULES.md` seção 4 diz que
globs casam contra caminhos relativos ao repo, e um pacote em `node_modules` não tem um.
Ou seja, "só `src/scripts/three/**` importa `three`" não é escrevível em
`arch.config.json`.

**Mitigação:** a regra vive no Biome, via `style/noRestrictedImports` proibindo `three`
globalmente, com um `override` liberando `src/scripts/three/**`. Funciona, mas divide uma
decisão de arquitetura entre dois arquivos de config — e o `archwarden describe` não
enxerga a metade que está no Biome, o que importa porque agentes consultam justamente esse
comando antes de escrever código.

Issue com o caso de uso e um esboço de design:
[#14](https://github.com/HenriqueArtur/archwarden/issues/14).

### 6.4 Regras que ainda não casam com nada

`archwarden config doctor` reporta 2 concerns esperados: `scripts-allowed-folders` e
`scripts-needs-spec` apontam para `src/scripts`, que só nasce na fase 4. As regras ficam
declaradas de propósito, para que a pasta já nasça governada. `check` não falha por isso.

---

## 7. TDD

Teste primeiro; ele falha; o código faz passar. Testamos **comportamento**, não marcação
renderizada.

**Com teste obrigatório:**

- Agrupamento de posts por ano e mês, com bordas: ano com um post só, mês vazio, ordem
  decrescente, dois posts no mesmo dia.
- Pareamento de traduções: só pt, só inglês, ambos.
- Construção e parsing de URL a partir do caminho; coerência entre data do frontmatter e
  data no caminho.
- Negociação de idioma: `navigator.languages` com `pt`, `pt-BR`, `en-US`, `es`, lista
  vazia; precedência da escolha salva sobre a do navegador.
- Formatação de data por locale.
- Validação de frontmatter: cada campo obrigatório ausente produz erro nomeando o arquivo.
- Módulo 3D: inicializa só quando visível; **não** inicializa sob `prefers-reduced-motion`;
  libera recursos ao sair da tela; pausa com aba oculta.
- Seletor de idioma: persiste a escolha, navega para a URL equivalente correta.
- RSS e sitemap: XML válido, escapes corretos, datas no formato certo.

**Sem teste unitário:** aparência dos `.astro`. Cobertos por verificação de build (o site
compila e as rotas esperadas existem) e por auditoria de acessibilidade.

---

## 8. Acessibilidade — WCAG 2.2 AA

- HTML semântico e landmarks; um `h1` por página, hierarquia sem pulos.
- Skip link para o conteúdo principal.
- Navegação completa por teclado, sem armadilhas de foco; indicador de foco visível e de
  alto contraste (nada de `outline: none` sem substituto).
- Contraste AA verificado em todas as combinações; cor nunca é o único sinal.
- `prefers-reduced-motion` respeitado em toda animação, inclusive o 3D.
- Texto reflui a 320px e suporta zoom de 200% sem perda de conteúdo.
- Alvos de toque de no mínimo 24×24px.
- `alt` significativo; decorativas com `alt=""`.
- `lang` correto por documento e em trechos em outro idioma.
- Funciona sem JavaScript: todo o conteúdo é HTML estático; JS só melhora.
- Auditoria manual com teclado e leitor de tela antes de considerar pronto.

---

## 9. Publicação

- Repositório: **`git@github.com:HenriqueArtur/site.git`** (público, já existe).
  Descrição definida: `📐 | My personal site and blog — henriqueartur.com`.
- Build por GitHub Actions, deploy no GitHub Pages.
- `public/CNAME` com `henriqueartur.com`; DNS com registros `A` para os IPs do GitHub
  Pages (apex) e `CNAME` para `www`; "Enforce HTTPS" ligado.
- Pipeline no CI, nesta ordem: `biome ci` → `tsc --noEmit` → `archwarden check` →
  `vitest run` → `astro build`. Qualquer etapa vermelha bloqueia o deploy.
- **Hooks locais com husky:**
  - `pre-commit` → `bun run check` (Biome + tsc + archwarden). Rápido, roda a cada commit.
  - `pre-push` → `bun run check` + `bun run test`. Os testes ficam no push para não
    tornar o commit lento, mas nada sai da máquina sem passar por eles.
  - Os hooks detectam `mise` e o usam quando presente, já que bun e Node são fixados por
    `.mise.toml`.
- Telemetria do Astro desligada (`astro telemetry disable` local e
  `ASTRO_TELEMETRY_DISABLED=1` no CI), coerente com a decisão de não ter rastreamento.

### 9.1 Regras de qualidade travadas no Biome

- **`any` é erro**, não aviso (`suspicious/noExplicitAny: "error"`).
- **`three` é importável só de `src/scripts/three/**`** (`style/noRestrictedImports` com
  override) — ver 6.3.
- Formatação: 2 espaços, largura 100, aspas simples, ponto e vírgula, vírgula final.

**Limitação do Biome com `.astro`**, encontrada na fase 1: o Biome analisa apenas o
frontmatter de um `.astro` e não enxerga o template, então toda variável declarada no
frontmatter e usada só na marcação é reportada como não utilizada. É a mesma classe de
problema do archwarden (6.2), por uma razão parecida. Mitigação: `noUnusedVariables`
desligado em `**/*.astro` via override. O `tsc` continua cobrindo o que importa ali.

---

## 10. Conteúdo da home

Estrutura pensada para o seu recado: **o que eu fiz importa mais do que onde eu passei.**
As empresas aparecem como contexto, não como espinha dorsal.

**01 — Abertura.** "Henrique Artur", Tech Lead, uma frase de resumo. O objeto 3D
ancorando visualmente. Links diretos: GitHub, LinkedIn, contato@henriqueartur.com.
**Sem foto** (decidido).

**02 — Sobre.** Design, qualidade e assertividade como perfil; sistemas que resolvem
problemas de verdade; a formação em Sistemas e Mídias Digitais dando a base dupla de
design e programação; entusiasta de código aberto; valorização de ambiente colaborativo
e compartilhamento de conhecimento.

Enquadramento de senioridade acordado: **"mais de 6 anos liderando times e projetos"**
— conta desde a gestão de projetos na Container Digital Jr. (mai/2019) e a fundação da
The Guardian Dog Studio (out/2019), passando por Tech Lead no Nosso Lar e na Sunne. É
verdadeiro e verificável contra o LinkedIn, ao contrário de "4 anos como Tech Lead".

**03 — Impacto.** A seção mais importante. Resultados com número:

- **Mais de 60% de redução no custo de infraestrutura**, unificando no Google Cloud
  projetos espalhados por Vercel, Render, DigitalOcean e AWS — com mais autonomia para
  os times.
- **Cycle time de 1 semana para 1 dia**, via boas práticas de Jira, CI/CD com GitHub
  Actions e code review.
- Testes automatizados e monitoramento de qualidade implantados, reduzindo erros em
  produção.
- Observabilidade reestruturada (logs e alertas no Papertrail).
- Formação de time: pair programming, 1:1, workshops, adoção de IA no fluxo de
  desenvolvimento, encontros internos de disseminação de conteúdo e treinamento com
  agentes.
- Produto do zero ao lançamento: app mobile + backoffice de atendimento psicológico
  empresarial.

**04 — O que eu construí.** Sistemas, não empregadores:

- CRM interno integrado ao HubSpot.
- Plataforma de gestão de usinas e unidades consumidoras de créditos de energia.
- Plataforma de aluguel e gestão de placas solares.
- Plataforma de venda de energia.
- App mobile e backoffice de atendimento psicológico empresarial, do zero ao lançamento.
- Plataforma Omnichannel com integração WhatsApp/BSP e ERPs, em microsserviços
  (neWave Telecom).
- Sistemas para o **Sistema S — FIEC, SENAI, SESI, IEL**, entregues como projetos pela
  Bugaboo Studio.
- Bibliotecas internas: componentes React, utilitários e framework de servidor, em
  paradigma funcional e documentadas.
- **Super Gattai** — jogo pela The Guardian Dog Studio, eleito Melhor Jogo do Ceará em
  2020. Não está mais disponível na Play Store, então entra como conquista, sem link de
  download.

**05 — Como eu trabalho.** Liderança técnica alinhada à visão da empresa; interlocução
direta com C-level, produto e diretoria para priorização, KPIs e direcionamento;
metodologias ágeis; documentação técnica como continuidade; governança com fornecedores;
identificação e mitigação de riscos.

**06 — Stack.** TypeScript, Node.js, React, Rust, PostgreSQL, MongoDB, Redis, Docker,
GCP, AWS, Render, Cloudflare, Firebase, Flutter, Linux, CI/CD, TDD, IA aplicada a
desenvolvimento. Passagens anteriores: Vue/Nuxt, PHP/WordPress, Strapi, MySQL,
Unity3D/C#, Elixir, Go.

**07 — Open source.** `archwarden` — linter de arquitetura para TypeScript escrito em
Rust, autoria sua. Mais `cano-ts`, `TYPE` (engine de jogos em TypeScript),
`neo-gitmoji.nvim`, `Simple-Firebase` e o que você quiser destacar.

**08 — Trajetória.** Linha do tempo enxuta — empresa, cargo, período, uma linha de
contexto. As descrições ricas ficam em "Impacto" e "O que eu construí".

| Período | Empresa | Cargo |
|---|---|---|
| fev/2024 – hoje | **Sunne Energias Renováveis** | Dev Fullstack Sênior → **Tech Lead** (desde mai/2024) |
| jun–jul/2024 | **Rede ICC Saúde** (contrato) | Consultor de Tecnologia |
| jan–dez/2023 | **Nosso Lar Hospital / Amar.Elo** | Full-stack → **Tech Lead** (desde jul/2023) |
| abr/2022 – jan/2023 | **Bugaboo Studio** | Full-stack Developer |
| mar/2021 – abr/2022 | **neWave Telecom** | Analista de Desenvolvimento Jr. I → II → III |
| nov/2020 – fev/2022 | **CosMonkeys** | Co-fundador, Produtor e Desenvolvedor |
| out/2019 – mar/2021 | **The Guardian Dog Studio** | Co-fundador e Produtor Executivo → Produtor e Desenvolvedor |
| out–nov/2020 | **LME – Laboratório de Mídias Educacionais (UFC)** | Bolsista Frontend |
| ago/2018 – out/2019 | **Container Digital Jr.** | Trainee → Frontend Developer → Project Manager |
| abr–dez/2018 | **UFCTV** | Bolsista de Audiovisual |
| fev–mar/2018 | **Secretaria de Sistemas e Mídias Digitais (UFC)** | Bolsista |

A Amar.Elo Saúde Mental era empresa do Nosso Lar Hospital e **hoje se chama Thera** — por
isso as duas linhas do LinkedIn aparecem sobrepostas. No site elas viram **uma única
entrada**, o que conta a história certa e elimina a impressão de erro. O nome atual
(Thera) é citado entre parênteses para quem for buscar.

**Domínios atravessados:** energia renovável, saúde e saúde mental, telecomunicações,
jogos, educação, agência digital.

**09 — Formação.**

- **MBA em Engenharia de Software** — USP/Esalq, mai/2024 – jan/2026 (concluído).
- **Bacharelado em Sistemas e Mídias Digitais** — UFC, ago/2017 – set/2021. Empresa
  júnior (Container Digital Jr. e The Guardian Dog Studio), monitoria e bolsas.

**10 — Contato.** contato@henriqueartur.com, LinkedIn, GitHub. Sem formulário (site
estático; formulário exigiria serviço de terceiros). Sem CV em PDF (decidido).

Tudo existe nos dois idiomas, com o inglês escrito para leitor internacional — não
tradução literal.

---

## 11. Fases

1. ✅ **Fundação** — repo, Astro, Biome, TypeScript, Vitest, archwarden, husky, CI.
2. ✅ **Design system** — tokens em TS com CSS gerado, contraste como teste, tipografia
   "Prancheta" auto-hospedada, grade de blueprint.
3. ✅ **Home** — conteúdo profissional completo, mobile first, **zero JavaScript**.
   Entregue com 8 seções em vez das 10 planejadas: o hero absorveu a abertura e o
   contato virou seção própria no fim. Todo o conteúdo já está escrito **nos dois
   idiomas** — antecipar isso evitou reescrever a camada de conteúdo na fase 4, que
   agora fica reduzida a roteamento, detecção e seletor.

   Ordem final: 01 Sobre · 02 Impacto · 03 Construído · 04 Stack · 05 Open source ·
   06 Trajetória · 07 Formação · 08 Contato.
4. ✅ **i18n** — inglês completo, detecção pelo navegador, seletor e `hreflang`.

   A detecção roda **inline e bloqueante no `<head>`**, de propósito: um script
   diferido redirecionaria depois da primeira pintura e o visitante veria a página
   piscar do português para o inglês.

   Para não haver duas cópias da regra, a função `redirectTarget` é serializada com
   `toString()` e injetada — o que roda no navegador é literalmente o código coberto
   pelos testes. O risco dessa técnica é alguém adicionar um `import` na função: ela
   continuaria passando em todos os testes e quebraria no navegador com "X is not
   defined", só para o visitante. Por isso existe um teste que **reconstrói a função a
   partir do próprio texto**, num escopo sem acesso ao módulo, e confirma que ela
   responde igual em todos os casos.
5. ✅ **Blog** — coleção, rotas por data, índice agrupado por ano › mês, páginas de ano e
   de mês, RSS por idioma, sitemap, e um post de exemplo nos dois idiomas.

   Rotas geradas: `/blog/`, `/blog/<ano>/`, `/blog/<ano>/<mês>/`,
   `/<ano>/<mês>/<dia>/<slug>/`, `/rss.xml`, `/sitemap.xml`, e os equivalentes sob
   `/en`. Um só arquivo de rota atende os dois idiomas, via parâmetro rest `[...lang]`
   que fica vazio no português.

   **Post sem tradução não vira 404.** A URL traduzida é gerada mesmo assim, com uma
   página que explica a ausência e leva ao original — 404 trataria como erro do
   visitante algo que é só conteúdo ainda não traduzido.

   **A data é validada em dois lugares.** Ela existe no caminho do arquivo e no
   frontmatter, então pode divergir. Divergiu, o build quebra: a URL diria uma data e a
   página diria outra.

   **Tema de destaque de sintaxe próprio.** Medi os cinco temas claros mais usados do
   Shiki — `github-light`, `light-plus`, `min-light`, `vitesse-light` e
   `catppuccin-latte` — contra o nosso fundo, e **todos reprovam em 4.5:1** em pelo
   menos dois tokens. O melhor deles chega a 3.68 no pior caso, e mesmo sobre branco
   puro passa raspando (4.57). Temas de sintaxe são desenhados para parecerem bonitos,
   não para atingirem contraste AA. O tema em `src/lib/design/code-theme.ts` sai da
   nossa paleta e é verificado pelo mesmo teste de contraste do resto do design system.
6. ✅ **3D** — infraestrutura pronta; **falta o arquivo do modelo**.

   O fallback SVG está sempre no HTML e é o que todo mundo recebe primeiro. O `<canvas>`
   só aparece se o modelo carregar de verdade. Sem o `.glb`, o site funciona
   normalmente e ninguém vê erro — ver `public/models/README.md`.

   As decisões estão em módulos testados (`should-render-3d.ts`,
   `animation-controller.ts`); só a cola com o three.js fica sem spec, declarada em
   `ignore_files` da regra de spec-pair.

   **O que o carregamento respeita:** `prefers-reduced-motion`, ausência de WebGL,
   `saveData`, tela abaixo de 360px, saída do viewport e aba oculta.

   **Custo medido:** 2,3 KB de script de entrada — que contém a decisão e mais nada — e
   584 KB (145,6 KB em gzip) de three.js, buscados só depois de a decisão passar e de o
   elemento estar à vista.

   **Draco ficou de fora.** O `DRACOLoader` arrastava **817 KB** de decoder para o build
   mesmo com o caminho apontando para um CDN — e o CDN contradizia a decisão de não fazer
   requisição a terceiros. Se o modelo vier comprimido, o decoder entra auto-hospedado,
   como escolha explícita.
7. **Fechamento** — auditoria de acessibilidade, Lighthouse, SEO, metadados sociais.

---

## 12. Questões em aberto

**Resta uma: qual modelo 3D** (seção 3.4). Não bloqueia nada até a fase 6.

Tudo o mais está decidido — nome, e-mail, empresas e períodos, autorização para citar
clientes, enquadramento de senioridade, Sistema S via Bugaboo, Amar.Elo/Thera, Super
Gattai, tipografia A, sem modo escuro, sem foto, sem CV em PDF, sem analytics,
dependências sem duplicação, repositório e descrição.

<details>
<summary>Histórico das questões já resolvidas</summary>

Registro do que foi perguntado e como ficou, para não se repetir a discussão:

1. **Senioridade.** "Mais de 4 anos como Tech Lead" não batia com o LinkedIn (~2 anos e
   9 meses com o título). **Resolvido:** usar "mais de 6 anos liderando times e projetos",
   contando desde a gestão de projetos na Container (2019) e a fundação da TGD.

2. **Sistema S.** Não aparecia em nenhuma experiência do LinkedIn. **Resolvido:** foram
   projetos entregues pela **Bugaboo Studio**.

3. **Sobreposição Amar.Elo × Nosso Lar.** **Resolvido:** a Amar.Elo era empresa do Nosso
   Lar Hospital e hoje se chama **Thera**. Viram uma entrada só na trajetória.

4. **"Melhor Jogo do Ceará 2020".** **Resolvido:** o jogo é o **Super Gattai**, da The
   Guardian Dog Studio. Saiu da Play Store, então entra como conquista sem link.

5. **"15 anos programando, 7 profissionais".** **Parcialmente resolvido:** adotado
   "quase 8 anos de experiência profissional" (desde a Container, ago/2018) e "programando
   desde ~2011". Se algum dos dois estiver errado, é só avisar antes da fase 3.

6. **CosMonkeys e TGD na trajetória.** **Resolvido por padrão:** ambos ficam, como no
   LinkedIn. Consolidar em uma linha só de empreendedorismo continua possível depois.

7. **Tipografia.** **Resolvida:** combinação A, "Prancheta". A página de specimen deixa
   de ser necessária para decidir e vira só verificação visual.

8. **Foto na home.** **Resolvida:** não terá foto.

9. **Analytics.** **Resolvida:** nenhum rastreamento. Nada de cookies, nada de banner de
   consentimento.

10. **`marked`, RSS e sitemap.** **Resolvida:** sem duplicar dependências — Markdown,
    Shiki e validação de frontmatter vêm do Astro; RSS e sitemap são código nosso.

</details>

---

## 13. Decisões registradas

| Data | Decisão | Motivo |
|---|---|---|
| 30/07/2026 | Astro em vez de SSG próprio | Velocidade de entrega e pipeline de conteúdo pronto, aceitando ~200 deps transitivas e cobertura parcial do archwarden |
| 30/07/2026 | Vitest + ecossistema Vite | Escolha sua; casa com Astro sem configuração extra |
| 30/07/2026 | Biome + `tsc --noEmit` no CI | Pedido seu; Biome é o par recomendado pelo próprio archwarden |
| 30/07/2026 | three.js sob demanda, com fallback | 3D real, sem custo no carregamento inicial e sem quebrar acessibilidade |
| 30/07/2026 | Issue archwarden#13 aberta | `.astro` invisível para regras baseadas em facts |
| 30/07/2026 | Sem modo escuro | Estética de papel envelhecido é clara por natureza |
| 30/07/2026 | Sem CV em PDF | Decisão sua |
| 30/07/2026 | Repo `HenriqueArtur/site`, descrição `📐 \| My personal site and blog — henriqueartur.com` | Segue seu padrão `<emoji> \| <descrição>` |
| 30/07/2026 | `marked` dispensado; Shiki e frontmatter validado vêm do Astro | Instalar seria duplicar. Aprovado |
| 30/07/2026 | RSS e sitemap com código próprio | ~60 linhas testáveis contra dois pacotes. Aprovado |
| 30/07/2026 | Tipografia A "Prancheta": Zilla Slab + Source Serif 4 + IBM Plex Mono | Escolha sua; vintage por vocabulário industrial e sustenta texto longo |
| 30/07/2026 | Sem foto na home | Decisão sua |
| 30/07/2026 | Sem analytics | Nenhum rastreamento, sem cookies e sem banner de consentimento |
| 30/07/2026 | "Mais de 6 anos liderando times e projetos" | Verificável contra o LinkedIn, ao contrário de "4 anos como Tech Lead" |
| 30/07/2026 | Sistema S atribuído à Bugaboo Studio | Confirmado por você |
| 30/07/2026 | Nosso Lar e Amar.Elo (hoje Thera) em uma entrada só | Mesma empresa; explica a sobreposição de datas |
| 30/07/2026 | Super Gattai listado como conquista, sem link | Fora da Play Store |
| 30/07/2026 | bun como gerenciador de pacotes | Pedido seu; npm descartado |
| 30/07/2026 | Versões exatas sempre, travadas em `bunfig.toml` | Convenção sua; evita divergência entre package.json e lockfile |
| 30/07/2026 | Node 24 fixado em `.mise.toml` | Astro 7 exige >=22.12; o global (22.11) fazia o instalador cair silenciosamente no Astro 5 com CVEs |
| 30/07/2026 | husky: pre-commit roda checks, pre-push roda checks + testes | Pedido seu |
| 30/07/2026 | `any` proibido no Biome (erro) | Pedido seu |
| 30/07/2026 | Restrição do `three` fica no Biome | archwarden v0 não expressa proibição de pacote; issue #14 aberta |
| 30/07/2026 | Telemetria do Astro desligada | Coerência com "sem rastreamento" |
| 30/07/2026 | Tokens de design em TS, CSS gerado a partir deles | Elimina a chance de a paleta testada divergir da paleta renderizada |
| 30/07/2026 | Contraste WCAG verificado por teste, não por inspeção | Acessibilidade vira gate de build em vez de boa intenção |
| 30/07/2026 | Token `lineStrong` criado | `line` reprovou em 3:1; faltava uma borda que carrega significado |
| 30/07/2026 | Fontes: Zilla 400/700, Source Serif variável, Plex Mono 400 | Menos pesos, menos arquivos na rede |
| 30/07/2026 | `.astro`: `noUnusedVariables` e `noUnusedImports` desligados | Biome não lê o template, então acusa falso positivo em tudo que é usado só na marcação |
| 31/07/2026 | Tema de sintaxe próprio em vez de tema pronto do Shiki | Os cinco temas claros mais usados reprovam em contraste AA sobre fundo com tom |
| 31/07/2026 | URL traduzida existe mesmo sem tradução | 404 trataria como erro do visitante algo que é só conteúdo ainda não escrito |
| 31/07/2026 | Data validada entre caminho e frontmatter | As duas podem divergir; divergindo, URL e página se contradizem |
| 31/07/2026 | Uma rota por forma, com `[...lang]`, servindo os dois idiomas | Metade dos arquivos de rota, sem duplicar lógica de listagem |
