# A Virada — Black Friday · Taynã Gauche · variação B

Briefing técnico levantado a partir da página que está no ar. Tudo aqui foi extraído da
página real, nada foi inventado. Os itens marcados com **[CONFIRMAR]** dependem de você.

---

## 1. Qual é a página de origem

A URL que você me passou — `https://taynagaucheoficial.com.br/a-virada-black-friday-v2/` —
**não existe mais**. Ela responde `301` e joga o visitante na home:

```
HTTP/2 301
x-redirect-by: WordPress
location: https://taynagaucheoficial.com.br/
```

A query string é preservada no redirecionamento (`?utm_source=...&fbclid=...` continua na
URL da home), então um clique de anúncio apontado para esse endereço **cai na home, sem
formulário, e a conversão não acontece**. [CONFIRMAR] qual URL está no destino dos anúncios.

Páginas irmãs que existem hoje (todas respondem 200):

| Slug | Peso do HTML | Título |
|---|---|---|
| `/a-virada-black-friday/` | 64 KB | A Virada – Black Friday |
| `/a-virada-black-friday-2/` | 67 KB | A Virada – Black Friday 2 |
| `/a-virada-black-friday-v2-otimizada/` | 144 KB | A Virada Black Friday V2 (otimizada) |
| `/a-virada-black-friday-obrigado/` | 59 KB | A Virada Black Friday – Obrigado |

Usei a **`-v2-otimizada`** como referência: é a mais recente e o nome bate com o "v2" da
URL que você mandou. [CONFIRMAR] se é essa mesma.

---

## 2. Stack e peso atual

WordPress 7.1.4 + Elementor 4.3.5 + Elementor Pro 3.35 + tema Hello + WP Rocket.

| Medida | Valor |
|---|---|
| Altura da página | **13.922 px** |
| Requisições | **~72** (50 tags `<script>`, 27 folhas de estilo) |
| Peso total (cache frio, comprimido) | **~1,9 MB** |
| Só imagens | ~1,1 MB |
| Só CSS/JS/fontes/pixels | ~780 KB |

Os maiores arquivos, em ordem:

| Peso | Arquivo | Precisa? |
|---|---|---|
| 170 KB | `flags@2x.png` (intl-tel-input) | **Não** — sprite com a bandeira de todos os países |
| 158 KB | `gtm.js` | Sim |
| 112 KB | `fbevents.js` | Sim |
| 53 KB | `utils.js` (intl-tel-input) | **Não** |
| 30 KB | `jquery.min.js` + migrate | **Não** |
| 26 KB | `clarity.js` | Sim |
| 25 KB | `DarkerGrotesque-Regular.woff2` | **Não** nesta página (ela usa Sora) |
| ~45 KB | Elementor frontend + pro + chunks | **Não** |
| ~60 KB | 17 folhas de estilo do WP/Elementor/Font Awesome | **Não** |

Só o seletor de país do telefone (`intl-tel-input` + sprite de bandeiras + utils, vindos do
`cdnjs.cloudflare.com`) custa **~240 KB e um domínio terceiro a mais**, para um formulário
que atende Brasil.

---

## 3. Rastreamento (tudo precisa ser replicado)

| Ferramenta | ID |
|---|---|
| Google Tag Manager | `GTM-WK2Q47FH` |
| Google Analytics 4 | `G-7WD6VMPBMG` (carregado pelo GTM) |
| Google Ads | `AW-11359818073` (carregado pelo GTM) |
| Meta Pixel | `600753022465300` (carregado pelo GTM, template tmSimo) |
| Microsoft Clarity | `tbfq7szvdw` |
| VK Digital Pixel | `mREEgUoDuAnwLiOmsPtW` — `https://cf.vkdigital.com.br/pixel.js` |
| Contêiner first-party | `https://track.taynagaucheoficial.com.br/tag/TC-R12J2SI4.js` [CONFIRMAR] qual ferramenta é |

**Possível erro de configuração no GTM:** além da tag correta, a página dispara
`googletagmanager.com/gtag/destination?id=AW-AW-11359818073` e um
`google.com/ccm/collect?tid=AW-AW-11359818073` — com o prefixo `AW-` duplicado. Parece um
ID digitado como `AW-11359818073` num campo que já acrescenta `AW-`. Vale conferir no GTM.

Na página só dispara `PageView`. O evento de conversão (Lead) não está no HTML de nenhuma
das duas páginas — se existe, está dentro do GTM. [CONFIRMAR] como o Lead é disparado hoje.

---

## 4. Formulário (ActiveCampaign)

Envio direto por POST, sem JavaScript de API:

```
action: https://taynagauche.activehosted.com/proc.php
method: POST
```

Campos ocultos fixos:

| Campo | Valor |
|---|---|
| `u` | `47` |
| `f` | `47` |
| `s` | *(vazio)* |
| `c` | `0` |
| `m` | `0` |
| `act` | `sub` |
| `v` | `2` |
| `or` | `d96f29b3dd7c109efb5da9e30662d997` |

Campos preenchidos pelo visitante e pela URL:

| `name` | Conteúdo |
|---|---|
| `email` | e-mail digitado |
| `phone` | telefone em formato E.164 (`+5511912345678`), montado via JS |
| `field[9]` | `utm_source` |
| `field[12]` | `utm_medium` |
| `field[16]` | `utm_campaign` |
| `field[11]` | `utm_term` |
| `field[13]` | `utm_content` |
| `field[17]` | URL completa da página |
| `field[122]` | `vk_source` |
| `field[123]` | `vk_ad_id` |

A página **não pede o nome** — só e-mail e WhatsApp.

### Problemas encontrados no formulário

1. **O mesmo formulário aparece duas vezes na página, com `id="_form_89_"` repetido.**
   IDs duplicados são inválidos em HTML: `getElementById` sempre devolve o primeiro. O
   código atual contorna isso com dois scripts separados (um usa `getElementById`, o outro
   usa `querySelectorAll('form._form_89')[1]`), mas os campos ocultos `full_phone`,
   `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` e `utm_url`
   também estão duplicados, com o mesmo `id`.
2. **Existe um terceiro formulário na página, do Elementor** (`post_id=3774`, botão
   "INSCREVER-SE AGORA", título "Prencha o Formulário Para Garantir Sua Vaga" — com o erro
   de digitação). É um popup do Elementor que também carrega na página de obrigado. Ele
   **não envia para o ActiveCampaign**: posta para o `admin-ajax.php` do WordPress.
   [CONFIRMAR] se esse popup é usado; se não, é peso morto e risco de lead perdido.
3. O `utils.js` do intl-tel-input é carregado do `cdnjs.cloudflare.com` em tempo de
   execução. Se o CDN demorar, `iti.getNumber()` ainda funciona, mas sem validação.

---

## 5. Página de obrigado

`/a-virada-black-friday-obrigado/` — "SEU ACESSO AO GRUPO VIP AINDA NÃO FOI LIBERADO! 83%",
uma pesquisa de qualificação e o botão "QUERO ENTRAR NO GRUPO VIP" para o WhatsApp
("Você será redirecionado para o WhatsApp em 10 minutos...").

[CONFIRMAR] se a variação B usa essa mesma página de obrigado (o redirecionamento depois do
POST é definido no painel do ActiveCampaign, no formulário 89, não no HTML).

---

## 6. Identidade visual (extraída do CSS da página)

### Cores

| Token | Hex | Onde |
|---|---|---|
| Fundo | `#000000` | página |
| Superfície | `#121212` | seções alternadas |
| Roxo | `#6F21FF` | logo, selo "Nesta oferta", brilho dos cards |
| Roxo claro | `#9D3CFF` | destaques do título |
| Roxo extra | `#A83FFF` | variação |
| Roxo escuro | `#0F0720` | fundos de apoio |
| Rosa | `#FF0055` | tarja "A MAIOR BLACK FRIDAY DA MINHA VIDA!", "REVELAÇÃO OFICIAL" |
| Âmbar | `#FFBF26` | preços riscados, "ACESSO VITALÍCIO!" |
| Cinza | `#909090` | texto secundário |
| Verde (apoio) | `#6FCA00` · `#0BA162` | detalhes |

### Botão principal (CTA)

```css
background:
  linear-gradient(rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 50%),
  linear-gradient(135deg, #86FFB0 0%, #22C55E 55%, #0E8F47 100%);
color: #03210F;
font-weight: 800;
border-radius: 10px;
box-shadow:
  0 6px 16px -6px rgba(0,0,0,.6),
  inset 0 1px 0 rgba(255,255,255,.7),
  inset 0 -2px 6px rgba(0,70,30,.3);
```

### Campos do formulário

```css
background: rgba(255,255,255,.05);
border: 1px solid rgba(255,255,255,.14);
border-radius: 10px;
color: #fff;
font-size: 16px;   /* 16px evita o zoom automático do iOS */
padding: 0 16px;
```

### Tipografia

**Sora** (400, 500, 600, 700, 800) — Google Fonts.
A página também baixa Darker Grotesque e as famílias Roboto + Roboto Slab inteiras (100 a
900, com itálicos) por conta do padrão do Elementor, sem usar nenhuma delas.

---

## 7. Estrutura e copy

A copy completa está preservada em `_originais/v1-referencia.html`. Ordem das seções:

1. **Tarja** — "A MAIOR BLACK FRIDAY DA MINHA VIDA!"
2. **Hero** — logo A VIRADA · título "Um Combo Vitalício Com **Todos Meus Cursos Online**
   Para Colocar **Comissões Em Dólar No Seu Bolso** – Ainda Em 2026" · subtítulo ·
   formulário (e-mail + WhatsApp + CTA) · "REVELAÇÃO OFICIAL 11 de novembro | Ao Vivo às 20h"
3. **Foto da Taynã** com tarja amarela "Black friday"
4. **"Todos os cursos que já criei em 5 anos para ganhar em Dólar agora pode ser seu…"** ·
   "Por um valor RI-DI-CU-LA-MEN-TE baixo!" · mockup · selo "ACESSO VITALÍCIO!"
5. **"Veja Tudo Que Você Vai Ter Acesso Com a Black Friday Dólar Vitalício"** — 11 cards
6. **"Se você já comprou outros cursos e não deu certo, leia isso"** — 4 blocos
7. **"+ De 35 Mil Alunos..."** — 8 prints de depoimento + CTA
8. **"Se Prepare!"** — segundo formulário
9. **Quem é Taynã Gauche** — bio + foto
10. **Rodapé** — CNPJ, endereço, Política de Privacidade, Termos de Uso

### Os 11 produtos

| # | Produto | Preço riscado | Imagem |
|---|---|---|---|
| 1 | Formação Afiliado Avançado | R$ 1.297 | `prod-01-faa.webp` |
| 2 | Método Lucrando Em Dólar | R$ 197 | `prod-02-metodo-lucrando.webp` |
| 3 | Desafio Primeira Venda em 7 Dias | R$ 997 | `prod-03-desafio-7dias.webp` |
| 4 | Kit Fast Dólar | R$ 67 | `prod-04-kit-fast-dolar.webp` |
| 5 | Máquina de Dólar IA | R$ 67 | `prod-05-maquina-dolar-ia.webp` |
| 6 | Workshop Produto Campeão Na Gringa | R$ 997 | `prod-06-produto-campeao.webp` |
| 7 | Nos Bastidores: 10 Mentorias | R$ 2.997 | `prod-07-bastidores.webp` |
| 8 | Como Levantar Caixa Rápido | R$ 497 | `prod-08-levantar-caixa.webp` |
| 9 | Coleção de Ebooks | R$ 197 | `prod-09-colecao-ebooks.webp` |
| 10 | Workshop de Plataformas Ocultas | R$ 497 | `prod-10-plataformas-ocultas.webp` |
| 11 | Workshop Primeira Venda em Dólar | R$ 297 | `prod-11-primeira-venda.webp` |

### Erros de texto na página atual

- "Nos Bastidores: 10 Mentorias Que Todo Afiliado Deveria **ver**" — minúscula no meio do título
- "Máquina de Dólar IA ... usando inteligência **artificia**" — palavra cortada, sem ponto final
- "Workshop Produto Campeão Na Gringa — R$ 997 por 12 meses de **acesso**" — sem ponto final (os outros têm)
- "**Prencha** o Formulário Para Garantir Sua Vaga" — no popup do Elementor
- A linha "Nesta oferta de Black Friday você tem ACESSO VITALÍCIO!" aparece **duas vezes
  seguidas** entre a Coleção de Ebooks e o Workshop de Plataformas Ocultas

[CONFIRMAR] se corrijo esses erros na variação B. Como o teste é de design e velocidade,
corrigir muda uma variável a mais — mas "artificia" e "Prencha" são erros visíveis.

### Sem `<h1>`

A página não tem nenhuma tag `<h1>` — o título principal é um `<h2>`.

---

## 8. Arquivos já baixados

- `_originais/` — imagens originais, fonte, e cópia do HTML das duas páginas de referência
- `site/assets/img/` — as mesmas imagens, renomeadas por função (1,3 MB, a otimizar)
- `site/assets/fonts/` — `DarkerGrotesque-Regular.woff2`

---

## 9. O que falta definir

1. Qual página é a referência correta e qual URL está nos anúncios
2. Subdomínio no cPanel para a variação B e dados da hospedagem
3. Nome do repositório no GitHub
4. Se o `track.taynagaucheoficial.com.br` deve continuar na variação B
5. Como o evento de Lead é disparado hoje
6. Se o popup do Elementor tem alguma função
7. Se corrijo os erros de texto
8. Redirecionamento pós-cadastro (configurado no ActiveCampaign, formulário 89)
