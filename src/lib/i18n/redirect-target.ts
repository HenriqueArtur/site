/**
 * Decide para onde mandar o visitante, ou null para deixá-lo onde está.
 *
 * ATENÇÃO: esta função é serializada com `toString()` e injetada como script
 * inline no `<head>` (ver Base.astro), para rodar antes da primeira pintura e
 * não causar piscada de idioma. Por isso ela precisa ser **autocontida**: nada
 * de import, nada de constante de fora, nada de sintaxe que dependa de bundler.
 *
 * A alternativa seria manter uma segunda cópia da regra escrita à mão dentro do
 * script inline, que é exatamente o tipo de duplicação que sai de sincronia sem
 * ninguém perceber. Aqui, o que roda no navegador é o mesmo código que os testes
 * verificam.
 */
export function redirectTarget(
  pathname: string,
  languages: readonly string[],
  saved: string | null,
): string | null {
  const inEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const bare = inEnglish ? pathname.slice(3) || '/' : pathname;

  const toEnglish = `/en${bare}`;
  const toPortuguese = bare;

  if (saved === 'en') return inEnglish ? null : toEnglish;
  if (saved === 'pt-BR') return inEnglish ? toPortuguese : null;

  // Sem escolha salva, quem já está numa URL em inglês fica: chegou por link
  // direto, e trocar o idioma debaixo dele seria sequestrar a navegação.
  if (inEnglish) return null;

  // Sem sinal nenhum do navegador, não se adivinha: fica no padrão do site.
  if (languages.length === 0) return null;

  for (const language of languages) {
    if (language.toLowerCase().startsWith('pt')) return null;
  }

  return toEnglish;
}
