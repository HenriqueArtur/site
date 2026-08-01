# Fontes de origem

Os três TTF daqui são **insumo de build**, não conteúdo do site — eles nunca são
servidos ao navegador. O que o visitante baixa são os `.woff2` em `public/fonts/`.

Existem porque as imagens de compartilhamento são geradas com a tipografia real
do site, e um leitor de contornos precisa do TrueType: o formato woff2 guarda as
tabelas comprimidas e transformadas, e não dá para ler os glifos dele
diretamente. Ver `tools/ttf-text.mjs`.

São commitados em vez de baixados no build porque o build roda em CI, onde o
cache nasce vazio — baixar do GitHub a cada execução tornaria a publicação
dependente de rede e sujeita a limite de requisição.

| arquivo | origem | licença |
|---|---|---|
| `ZillaSlab-Regular.ttf` | [google/fonts](https://github.com/google/fonts/tree/main/ofl/zillaslab) | SIL OFL 1.1 |
| `ZillaSlab-Bold.ttf` | idem | SIL OFL 1.1 |
| `IBMPlexMono-Regular.ttf` | [google/fonts](https://github.com/google/fonts/tree/main/ofl/ibmplexmono) | SIL OFL 1.1 |

O texto completo da licença está em `public/fonts/LICENSE.md`.
