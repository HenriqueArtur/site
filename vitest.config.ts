import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ambiente Node de propósito: os módulos sob src/lib e src/scripts recebem
    // suas dependências por parâmetro em vez de alcançar o DOM global, então
    // não é preciso jsdom nem happy-dom para testar comportamento.
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
