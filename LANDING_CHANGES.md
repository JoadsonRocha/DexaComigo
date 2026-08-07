Resumo das alterações na Landing Page

O que foi alterado:

- `pages/Home.tsx`
  - Adicionado `aria` e `id` para acessibilidade (`role="banner"`, `id="featured-services"`, `aria-labelledby`).
  - Campo de busca recebeu `label` oculto (`sr-only`), `id="home-search"` e `aria-label`.
  - Imagem hero marcada com `loading="lazy"` e `aria-hidden="true"`.
  - `ServiceCard` na seção de destaque agora recebe a prop `compact`.

- `components/UI.tsx`
  - `ServiceCard` agora aceita `compact?: boolean`.
  - Quando `compact=true`, o container da imagem usa `h-44 md:h-56` em vez de `aspect-video`.

- `pages/Search.tsx`, `pages/CategoryPage.tsx`, `pages/Ads.tsx`, `pages/PublicProfile.tsx`
  - Todas as chamadas de `ServiceCard` em grids passaram a usar `compact` para uniformizar a altura dos cards.

- `index.html`
  - Meta tags Open Graph e Twitter adicionadas, `theme-color`, `canonical` e link "Pular para o conteúdo".

- `App.tsx`
  - `main` recebeu `id="main-content"` (alvo do skip link).

Como testar localmente:

1. Instalar dependências e rodar o dev-server:

```bash
npm install
npm run dev
```

2. Abrir o site no navegador (padrão `http://localhost:3000`):
   - Verificar hero: imagem lazy-load, texto legível e botão de busca funcional.
   - Na seção "Serviços em destaque": os cards devem estar mais compactos (altura reduzida).
   - Em páginas de lista (`/search`, `/categoria/:id`), perfis (`/profissional/:id`) e `/dashboard/ads`, os cards também estarão no modo compacto.
   - Teste o link "Pular para o conteúdo" (pressione Tab na página e ative o link).

Ajustes finos:

- Altura dos cards: alterar `h-44 md:h-56` em `components/UI.tsx` para `h-40 md:h-52` ou outro valor conforme preferência.
- Caso prefira aplicar compact apenas na landing, podemos reverter as mudanças nas outras páginas.

Próximos passos recomendados (opcional):

- Rodar `npm run build` para gerar `dist` e verificar strings embutidas.
- Executar Lighthouse (Chrome DevTools) para checar acessibilidade/SEO.
- Ajustar contraste/gradiente da hero se necessário.

Se quiser, faço qualquer um destes próximos passos agora: ajustar altura dos cards, criar `.env.example`, rodar `npm run build` e gerar relatório Lighthouse.
