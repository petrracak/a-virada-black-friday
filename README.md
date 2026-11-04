# A Virada · Black Friday — variação B

Página de captação da Taynã Gauche para a Black Friday de 11 de novembro de 2026.
Segunda variação da página que está no ar em `taynagaucheoficial.com.br`, para rodar no
mesmo tráfego. **Mesma copy, mesmas imagens, mesmas cores e mesma fonte** — o que muda é
o desenho da página e a velocidade.

HTML, CSS e JavaScript puros. **Não tem build**: a pasta `site/` é a página inteira e vai
para o cPanel exatamente como está.

---

## Ver localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:5530. O `npm install` serve só para o `sharp`, usado no
tratamento das imagens — a página não depende de nada.

---

## Peso

| | Página atual | Variação B |
|---|---|---|
| Peso total | ~1,9 MB | **553 KB** |
| Peso da primeira tela | ~1 MB | **110 KB** |
| Requisições ao servidor | ~72 | **8 na primeira tela**, 30 no total |
| Folhas de estilo | 27 | **1** |
| Altura da página (celular) | 13.922 px | **6.768 px** |

Saíram WordPress, Elementor, Elementor Pro, jQuery, jQuery Migrate, Font Awesome,
WP Rocket, as famílias Roboto e Roboto Slab inteiras, a fonte Darker Grotesque e a
biblioteca `intl-tel-input` — essa última sozinha custava **240 KB**, dos quais 170 KB
eram um sprite com a bandeira de todos os países do mundo, num formulário que atende só
o Brasil. No lugar dela, um `+55` fixo com a bandeira em SVG inline.

A fonte Sora passou a ser servida da própria hospedagem, num único arquivo variável de
24 KB, em vez de duas conexões ao Google Fonts.

Ficaram iguais: **todo o rastreamento** e **o formulário do ActiveCampaign**, campo por
campo.

---

## O desenho

### A ordem das dobras

1. Abertura · 2. O combo · **3. Os depoimentos** · 4. Os 11 cursos · 5. Se você já
comprou outros cursos · 6. Se Prepare! · 7. A mentora · 8. Rodapé.

A prova social subiu para a terceira dobra: quem chega vê a promessa, vê o que é o
combo e já encontra gente mostrando resultado, antes de olhar a lista de produtos.

### A fita do topo

A faixa vermelha virou uma **fita em movimento**, com as listras diagonais da fita de
isolamento que já aparece na arte da Taynã e três avisos girando sem parar: a maior
Black Friday da minha vida · acesso vitalício a tudo · 11 de novembro, 20h. Ela pausa
quando o ponteiro passa por cima.

### Abertura

A Taynã aparece na primeira dobra, integrada à composição: no celular é uma faixa de
largura total entre o título e o formulário, no desktop é a coluna inteira da direita.
Atrás de tudo, uma **aurora** de três manchas roxas e rosas que deriva devagar.

O formulário virou um **cartão de vidro** com um anel de luz roxa na borda, desfoque no
fundo e **rótulos flutuantes** — o texto do campo sobe e fica roxo quando a pessoa
digita, em vez de sumir como acontece com placeholder. O campo ganha um halo roxo ao
receber foco. O botão tem um brilho que varre da esquerda para a direita no hover.

### Os 11 cursos

Era uma grade de duas colunas no celular, que apertava demais as capas. Virou uma
**prateleira que se arrasta de lado**: um cartão grande por vez no celular, com o
seguinte espiando na borda, e três e meio no desktop. Cada cartão tem a capa inteira do
curso, o nome, o preço riscado em âmbar, a linha do acesso vitalício e a descrição
recolhida em três linhas com um botão "Ler tudo".

Embaixo da prateleira há um contador ("1 de 11"), uma barra de progresso e duas setas.
O cartão de "Nos Bastidores" tem o anel em âmbar e a etiqueta "o mais caro da lista".

Isso é o que derrubou a altura da página de 8.960 px para 6.768 px no celular, sem
esconder uma palavra: toda a copy continua no HTML.

### Luz e movimento

- **Luz que segue o ponteiro** na abertura, nos depoimentos, no "Se Prepare!" e em cada
  cartão de curso — um foco roxo que acompanha o mouse.
- **Hover**: cartão de curso sobe, a capa dá um zoom lento e o anel de luz acende; os
  prints de depoimento sobem e ganham borda roxa; o botão recebe o brilho varrendo.
- **Entrada**: o cartão do formulário e a linha do evento sobem ao carregar. Logo,
  título, foto e subtítulo **não** são animados — animar a opacidade deles atrasaria o
  LCP em quase um segundo.
- **Na rolagem**: títulos e cartões sobem em cascata; os preços nascem riscados e o
  traço ganha cor quando o bloco aparece; o `R$ 8.107` conta de zero até o valor; o
  carimbo "Acesso vitalício!" entra com um giro curto.

`prefers-reduced-motion` desliga tudo. Sem JavaScript, nada fica escondido, as
descrições aparecem inteiras e a prateleira continua rolando no dedo.

## Correções feitas

| O quê | Como estava | Como ficou |
|---|---|---|
| Título principal | nenhum `<h1>` na página | `<h1>` de verdade |
| Máquina de Dólar IA | "usando inteligência **artificia**" | "inteligência artificial." |
| Nos Bastidores | "Que Todo Afiliado Deveria **ver**" | "Deveria **Ver**" |
| Workshop Produto Campeão | "por 12 meses de acesso" | "…de acesso." (igual aos outros) |
| Entre Coleção de Ebooks e Plataformas Ocultas | a linha "Nesta oferta… ACESSO VITALÍCIO!" aparecia duas vezes seguidas | uma vez por produto |
| Travessão do título | "- Ainda Em 2026" (hífen) | "– Ainda Em 2026" |
| Popup do Elementor | formulário "INSCREVER-SE AGORA" que postava para o `admin-ajax.php` do WordPress, não para o ActiveCampaign | removido |
| IDs duplicados | dois formulários com `id="_form_89_"` e campos ocultos repetindo os mesmos IDs | sem IDs duplicados; os dois formulários usam o mesmo código |
| Campo de telefone | sem rótulo acessível | rótulo para leitor de tela e `inputmode="numeric"` |
| Erro de validação | `alert()` do navegador | mensagem dentro do formulário |

### O único texto novo

No fim da grade de cursos:

> **11 produtos que hoje custam ~~R$ 8.107~~ por 12 meses de acesso.**
> Na Black Friday, tudo com **ACESSO VITALÍCIO**

`R$ 8.107` é a soma dos 11 preços que já estavam na página
(1.297 + 197 + 997 + 67 + 67 + 997 + 2.997 + 497 + 197 + 497 + 297). Nenhum número foi
inventado, mas é a única frase que não vem da página atual — para tirar, apague o bloco
`<div class="soma">` do `index.html`.

---

## Onde mexer

| O quê | Onde |
|---|---|
| Qualquer texto | `site/index.html` — as seções estão numeradas em comentários |
| Os avisos que correm na fita do topo | `index.html`, `<div class="fita__trilho">` — repita o mesmo texto nos **dois** `fita__grupo`, senão a volta fica desigual |
| Um curso da prateleira | `index.html`, o `<li class="curso">` correspondente |
| Destacar outro curso | mova a classe `curso--joia` e a etiqueta `<span class="curso__joia">` |
| A linha da soma | `index.html`, `<div class="soma">` (o número vive em `data-contador`) |
| Cores e fontes | `site/assets/css/style.css`, bloco `:root` no topo |
| Botão (CTA) | `style.css`, variáveis `--cta-de`, `--cta-meio`, `--cta-ate`, `--cta-tinta` |
| Velocidade da fita | `style.css`, `@keyframes corre` e `animation: corre 42s` |
| Intensidade da luz do ponteiro | `style.css`, regra `[data-luz]::before` |
| Largura dos cartões da prateleira | `style.css`, `.curso { flex: 0 0 … }` |
| Quantas linhas da descrição aparecem | `style.css`, `.js .curso__texto { max-height }` |
| Data do evento | `index.html` — aparece na fita, na abertura, no "Se Prepare!" e na barra fixa |
| Máscara e validação do telefone | `site/assets/js/main.js`, item 3 |
| Prateleira (setas, progresso, contador) | `main.js`, item 4 |

Depois de editar o CSS ou o JS, aumente o `?v=` no `index.html` (`style.css?v=6` → `?v=7`)
para o navegador não servir a versão antiga. Ao trocar uma imagem, mude também o nome do
arquivo.

---

## Imagens

Os arquivos originais, baixados da página no ar, ficam em `_originais/` e não são
alterados. A pasta `site/assets/img/` é gerada a partir deles:

```bash
npm run imagens
```

O script redimensiona cada imagem para o tamanho em que ela realmente aparece e regrava
em WebP: **1,2 MB → 502 KB**, sem mudança visível. A foto da abertura
(`heroi-tayna.webp`) é um recorte vertical da arte do palco, centrado na Taynã — as
coordenadas do recorte estão no próprio script. Para trocar uma imagem, substitua o
arquivo em `_originais/` e rode o comando de novo.

`_originais/` também guarda `v1-referencia.html` e `v1-obrigado-referencia.html`, cópias
do HTML das páginas que estão no ar, para consulta.

---

## Rastreamento

Os mesmos IDs da página atual, todos no `<head>` do `index.html`:

| Ferramenta | ID |
|---|---|
| Google Tag Manager | `GTM-WK2Q47FH` |
| Microsoft Clarity | `tbfq7szvdw` |
| VK Digital Pixel | `mREEgUoDuAnwLiOmsPtW` |
| Contêiner first-party | `track.taynagaucheoficial.com.br/tag/TC-R12J2SI4.js` |

GA4 (`G-7WD6VMPBMG`), Google Ads (`AW-11359818073`) e Meta Pixel (`600753022465300`)
continuam entrando pelo GTM, como hoje.

No envio do formulário a página empurra para o `dataLayer`:

```js
{ event: 'lead_formulario', formulario: 'virada_black_friday_b' }
```

Nada dispara sozinho com isso — é um gancho, caso você queira marcar o Lead já no envio
em vez de só na página de obrigado.

---

## Formulário

Os dois formulários (abertura e "Se Prepare!") postam direto para o ActiveCampaign, sem
JavaScript de API:

```
POST https://taynagauche.activehosted.com/proc.php
lista u=47 · formulário f=47 · or=d96f29b3dd7c109efb5da9e30662d997
```

| Campo enviado | Conteúdo |
|---|---|
| `email` | e-mail digitado |
| `phone` | o próprio campo que a pessoa preenche, normalizado para `+DDI` + número no envio |
| `field[9]` · `[12]` · `[16]` · `[11]` · `[13]` | utm_source, medium, campaign, term, content |
| `field[17]` | URL completa da página, com a query string |
| `field[122]` · `[123]` | vk_source, vk_ad_id |

Os parâmetros da URL também são repassados para os links externos da página.

### Seletor de país

O campo de WhatsApp tem um seletor com **243 países**. Os seis mais prováveis
(Brasil, Portugal, Estados Unidos, Angola, Moçambique, Cabo Verde) estão no HTML; os
outros 237 são inseridos pelo `main.js` a partir de uma tabela compacta — assim o
HTML não carrega 22 KB de `<option>` duas vezes. As bandeiras são calculadas a partir
do código do país, não escritas no arquivo.

É um `<select>` nativo, transparente, por cima do bloco que mostra a bandeira e o DDI.
Nativo porque no celular ele abre a roleta do sistema e funciona com teclado e leitor
de tela sem código extra. **Custo: 4,3 KB.** O `intl-tel-input` da página 1 custa
~240 KB para fazer a mesma coisa.

A validação é **rígida no Brasil** (10 ou 11 dígitos, com a máscara de sempre) e
**permissiva nos outros países** (de 6 dígitos até o limite de 15 do padrão
internacional). O motivo é concreto: na página 1 a regra brasileira de 10/11 dígitos
roda para todos os países, e Portugal e Angola — que têm 9 — são barrados. Errar para
o lado rígido custa um lead que não volta.

A máscara `(11) 98765-4321` também só é aplicada no Brasil. Na página 1 ela é aplicada
a todo mundo, e um número de Angola aparece na tela como "(95) 4646-524".

Sem JavaScript o seletor mostra só os seis países e a escolha não é enviada (o
`<select>` não tem `name`, de propósito, para não mandar campo desconhecido ao
ActiveCampaign). O número digitado chega assim mesmo, sem o DDI.

### Por que não existe campo oculto de telefone

O campo que a pessoa preenche é o mesmo que o ActiveCampaign lê (`name="phone"`), e o
`novalidate` do formulário é ligado pelo JavaScript em tempo de execução, não no HTML.
Os dois detalhes existem pelo mesmo motivo: se o `main.js` não carregar, o navegador
continua barrando campo vazio e o número digitado chega assim mesmo.

Na página que está no ar é o contrário — quem vai para o ActiveCampaign é um campo
oculto que só o JavaScript preenche, e é daí que vêm os leads sem telefone. O
diagnóstico e a correção estão em [CORRECAO-TELEFONE-PAGINA-1.md](CORRECAO-TELEFONE-PAGINA-1.md).

**O redirecionamento depois do cadastro é definido no painel do ActiveCampaign**, no
formulário 89 — não está no HTML. Ele vale para as duas variações ao mesmo tempo.

---

## Ainda falta definir

1. Subdomínio no cPanel para esta variação e os dados da hospedagem
2. Nome do repositório no GitHub
3. Conferir no GTM a tag com o ID duplicado `AW-AW-11359818073` (a correta,
   `AW-11359818073`, também dispara — mas essa segunda não)
4. Confirmar se o contêiner `track.taynagaucheoficial.com.br` deve continuar aqui
5. Como o evento de Lead é disparado hoje, para decidir o que fazer com o `dataLayer`

O levantamento completo da página atual está em [BRIEFING.md](BRIEFING.md).
