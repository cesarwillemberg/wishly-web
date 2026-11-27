# Wishly Web

Site do Wishly em Next.js. O app de Android e iOS continua em Flutter ([wishly-mobile](https://github.com/cesarwillemberg/wishly-mobile)). A API continua o FastAPI no Render ([wishly-core-api](https://github.com/cesarwillemberg/wishly-core-api)), sem rota nova.

Esta versão cobre a base (tema, entrar, criar conta, sessão) e as listas: criar, renomear, excluir, abrir o detalhe, adicionar e editar itens, marcar comprado, filtrar e reordenar no modo Manual. Compartilhar, reservas e a conta completa entram nas etapas seguintes.

## Requisitos

- Node.js 20.9 ou mais novo
- npm

## Rodar localmente

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra http://localhost:3000. A primeira chamada ao Render no plano gratuito pode levar cerca de um minuto enquanto o serviço acorda. A tela de entrar avisa isso e, se passar de 70 segundos, pede para tentar de novo.

`localhost` e `127.0.0.1` em qualquer porta já entram no regex de CORS do backend. O login deste site não depende disso: o browser fala só com o Next.js, e o servidor coloca o `Authorization: Bearer`.

## Variável de ambiente

| Nome           | Onde                  | Valor                                                           |
| -------------- | --------------------- | --------------------------------------------------------------- |
| `API_BASE_URL` | `.env.local` e Vercel | `https://lista-desejos-backend.onrender.com` (sem barra no fim) |

Não use o prefixo `NEXT_PUBLIC_`. A URL fica no servidor.

## Scripts

```bash
npm run dev            # desenvolvimento
npm run build          # produção
npm run start          # servir o build
npm run lint           # ESLint
npm run format         # Prettier
npm test               # rotas hash e leitura da conta
npm run api:generate   # regera lib/api/schema.d.ts a partir de openapi/wishly.json
```

O spec em `openapi/wishly.json` é uma cópia de `https://lista-desejos-backend.onrender.com/openapi.json`. As respostas de autenticação não estão tipadas nesse spec (o FastAPI devolve `{}`). O cliente gerado cobre os caminhos e os corpos; `lib/api/parse.ts` lê o JSON real (`token` e `user`).

## Deploy na Vercel (Hobby)

1. Importe este repositório na Vercel. O framework é Next.js. Deixe os comandos de build e o diretório padrão.
2. Em Settings → Environment Variables, defina `API_BASE_URL` com a URL acima, para Production e Preview.
3. Faça o deploy. O plano Hobby serve o App Router com os Route Handlers.

Não é preciso `output: 'export'`. O site precisa do servidor para o cookie httpOnly.

### CORS no Render

O browser desta versão não chama o Render. Mesmo assim, a origem da Vercel precisa entrar em `CORS_ORIGINS` antes de qualquer chamada direta do browser (o site Flutter em paralelo, e o cutover). O backend monta a lista em `app/main.py` do wishly-core-api:

- `CORS_ORIGINS` é uma lista separada por vírgula. Cada origem é cortada e perde a barra do fim. Se a variável não existir, o padrão é `https://cesarwillemberg.github.io`.
- `https://cesarwillemberg.github.io` é sempre incluída de novo, mesmo se você não repetir.
- Além da lista, este regex já é aceito, sem variável:

```text
https?://(localhost|127\.0\.0\.1)(:\d+)?|chrome-extension://[\w-]+|moz-extension://[\w-]+
```

`*.vercel.app` não entra nesse regex, e `allow_origins` não aceita curinga. Inclua a origem exata, sem barra no fim:

```text
CORS_ORIGINS=https://SEU-PROJETO.vercel.app,https://cesarwillemberg.github.io
```

Cada preview (`https://wishly-web-git-….vercel.app`) também é uma origem diferente. Acrescente a que for usar no browser, ou use um domínio fixo. Métodos e cabeçalhos já estão em `*`.

Não mude `PUBLIC_SHORT_BASE`. Ele continua `https://lista-desejos-backend.onrender.com`, porque os links curtos `/s/` e `/c/` e os deep links do app apontam para lá.

`PUBLIC_WEB_BASE` hoje cai em `https://cesarwillemberg.github.io/wishly-mobile` quando não está definida. Os HTML de `/s/{code}` e `/c/{code}` redirecionam para `PUBLIC_WEB_BASE/#/l/…` e `#/c/…`. Este site lê esse hash e abre o caminho equivalente, então os links antigos funcionam mesmo antes de trocar a variável. Na hora de trocar o site canônico, defina `PUBLIC_WEB_BASE` com a origem da Vercel, sem barra no fim.

O limite de login no Render é 20 tentativas por minuto por IP visto pelo FastAPI (`WISHLY_AUTH_RATE`). Com o BFF, esse IP é o da Vercel, não o de cada visitante.

## Rotas

| Caminho                     | Quem entra | Hash antigo do Flutter       |
| --------------------------- | ---------- | ---------------------------- |
| `/entrar`                   | público    | —                            |
| `/`                         | conta      | `#/`                         |
| `/configuracoes`            | conta      | `#/configuracoes`            |
| `/list/{id}`                | conta      | `#/list/{id}`                |
| `/compartilhar?url=&title=` | conta      | `#/compartilhar?url=&title=` |
| `/l/{token}`                | público    | `#/l/{token}`                |
| `/c/{code}`                 | conta      | `#/c/{code}`                 |

O hash não chega ao servidor. Um script no layout troca `#/…` pelo caminho antes da página assentar. Links `/s/` e `/c/` do Render que ainda mandam para `#/l/` e `#/c/` caem na rota certa.

A sessão é o cookie httpOnly `wishly_session` (`Secure` em HTTPS, `SameSite=Lax`, 30 dias). O JavaScript da página não vê o JWT. Trocar a senha no backend invalida o token pelo `token_version`; a próxima página pede para entrar de novo.

O tema fica no navegador, na chave `wishly_theme` (`system`, `light` ou `dark`), a mesma do app Flutter.
