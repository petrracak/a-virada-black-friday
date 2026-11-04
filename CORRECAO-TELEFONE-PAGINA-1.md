# Lead sem telefone na página que está no ar

Correção para `taynagaucheoficial.com.br` (a página atual, no WordPress/Elementor).
Não tem nada a ver com a variação B — lá o problema é outro e já foi resolvido.

---

## O que está acontecendo

A página usa a biblioteca `intl-tel-input` para o seletor de país. O número que vai
para o ActiveCampaign é montado por esta linha, no envio do formulário:

```js
hiddenPhone.value = iti.getNumber();
```

`getNumber()` só funciona depois que o arquivo `utils.js` da biblioteca carrega. Esse
arquivo vem de fora, do `cdnjs.cloudflare.com`, e carrega **de forma assíncrona** —
quer dizer, a página já está utilizável antes dele chegar.

Testei o comportamento direto na versão 17.0.8, a mesma que a página usa:

| | `getNumber()` | `isValidNumber()` |
|---|---|---|
| **Antes** do `utils.js` carregar | `""` (string vazia) | `null` |
| **Depois** do `utils.js` carregar | `"+5511987654321"` | `true` |

Ou seja: quem preenche e envia **antes do `utils.js` chegar** manda o campo `phone`
vazio. O lead entra no ActiveCampaign com e-mail e sem telefone.

Isso acontece com mais frequência do que parece:

- conexão lenta no celular, que é de onde vem a maior parte do tráfego;
- bloqueador de anúncio ou extensão que barra o `cdnjs.cloudflare.com`;
- rede corporativa ou operadora que bloqueia CDN;
- a pessoa que digita rápido e envia nos primeiros segundos.

E não existe rede de proteção: o campo em que a pessoa digita se chama
`phone_display`, que o ActiveCampaign ignora. O único campo que ele lê é o
`<input type="hidden" name="phone">`, que **só** o JavaScript preenche. Se o
JavaScript falhar por qualquer motivo, o telefone não chega.

---

## Atenção com o segundo código que a Taynã mandou

```js
if (!iti.isValidNumber()) {
  erro.textContent = "Confira se preencheu seu número corretamente…";
  return; // não envia
}
```

**Não coloque isso sozinho.** `isValidNumber()` também depende do `utils.js`, e antes
dele carregar devolve `null`. Como `!null` é verdadeiro, essa linha bloquearia o envio
de **todo mundo** naquela janela de tempo. O problema deixaria de ser "lead sem
telefone" e passaria a ser "nenhum lead". A validação precisa de uma trava que só a
execute quando a biblioteca estiver pronta — é o que está no código abaixo.

---

## A correção

Na página, existem **dois** blocos iguais com esse `addEventListener("submit", …)` —
um para o formulário do topo e outro para o da seção "Se Prepare!". Troque **os dois**.

### Está assim

```js
form.addEventListener("submit", function (e) {
    const digits = input.value.replace(/\D/g, '');

    if (digits.length !== 10 && digits.length !== 11) {
      e.preventDefault();
      alert("Informe um WhatsApp válido com DDD (10 ou 11 dígitos).");
      input.focus();
      return false;
    }

    hiddenPhone.value = iti.getNumber();
  });
```

### Troque por

```js
form.addEventListener("submit", function (e) {
    const digits = input.value.replace(/\D/g, '');

    if (digits.length !== 10 && digits.length !== 11) {
      e.preventDefault();
      alert("Informe um WhatsApp válido com DDD (10 ou 11 dígitos).");
      input.focus();
      return false;
    }

    // A validação do intl-tel-input só roda se o utils.js já tiver carregado.
    // Sem essa trava, ela barraria todo mundo nos primeiros segundos da página.
    if (window.intlTelInputUtils && !iti.isValidNumber()) {
      e.preventDefault();
      alert("Confira se preencheu seu número corretamente e se escolheu o país certo.");
      input.focus();
      return false;
    }

    // getNumber() volta vazio enquanto o utils.js não carrega. O fallback monta
    // o número na mão com o DDI do país escolhido, que não depende do utils.js.
    const ddi = (iti.getSelectedCountryData() || {}).dialCode || "55";
    const numero = iti.getNumber() || ("+" + ddi + digits);

    // Última barreira: nunca enviar o campo vazio.
    if (numero.replace(/\D/g, '').length < 11) {
      e.preventDefault();
      alert("Não consegui montar seu número. Confira o DDD e tente de novo.");
      input.focus();
      return false;
    }

    hiddenPhone.value = numero;
  });
```

---

## A correção que resolve de vez

O remendo acima tapa o buraco do `utils.js`, mas o telefone continua dependendo de o
JavaScript rodar. Se der qualquer erro de script na página, o lead volta a entrar sem
número.

Para acabar com isso, o campo que a pessoa preenche precisa ser o mesmo que o
ActiveCampaign lê:

1. No HTML do formulário, apague o campo oculto:
   ```html
   <input type="hidden" id="full_phone" name="phone">
   ```
2. No campo visível, troque `name="phone_display"` por `name="phone"`:
   ```html
   <input type="tel" id="phone" name="phone" placeholder="Seu WhatsApp (DDD + número)" required>
   ```
3. No JavaScript, em vez de `hiddenPhone.value = numero;`, use:
   ```js
   input.value = numero;
   ```

Assim o pior cenário possível passa a ser um número em formato feio
(`(11) 98765-4321` em vez de `+5511987654321`) — que dá para corrigir depois. Hoje o
pior cenário é campo vazio, que não dá.

É exatamente o que está feito na variação B.

---

## O seletor de país está barrando Portugal e Angola

Testei o formulário que está no ar, com o envio travado para não criar lead de
verdade. O seletor existe e tem todos os países, mas a validação não acompanha:

| País escolhido | Digitado | Vira no campo | Chega no AC |
|---|---|---|---|
| Brasil, 11 dígitos | `11987654321` | (11) 98765-4321 | ✅ `+5511987654321` |
| **Portugal**, 9 dígitos | `912345678` | (91) 2345-678 | ❌ **bloqueado** |
| **Angola**, 9 dígitos | `954646524` | (95) 4646-524 | ❌ **bloqueado** |
| Estados Unidos, 10 dígitos | `2125550147` | (21) 2555-0147 | ✅ `+12125550147` |

Duas coisas acontecem:

1. A trava de "10 ou 11 dígitos" é o formato brasileiro e roda **depois** da escolha
   do país. Portugal e Angola têm 9 dígitos, então a pessoa escolhe o país, digita o
   número certo e recebe um alerta dizendo que o WhatsApp é inválido. Os Estados
   Unidos passam por coincidência, porque também têm 10 dígitos. Portugal está na
   lista de `preferredCountries` da própria configuração — alguém quis atender
   Portugal, e é justamente quem não consegue se cadastrar.
2. A máscara brasileira é aplicada a todos os países. O número de Angola aparece na
   tela como "(95) 4646-524", o que faz a pessoa achar que digitou errado.

Isso é diferente do lead sem telefone: aqui a pessoa **não vira lead nenhum**, some
sem deixar rastro.

Para corrigir, a trava de 10/11 precisa valer só quando o país for o Brasil:

```js
const iso = iti.getSelectedCountryData().iso2;
const digits = input.value.replace(/\D/g, '');

const curto = iso === 'br' ? (digits.length !== 10 && digits.length !== 11)
                           : (digits.length < 6);
if (curto) {
  e.preventDefault();
  alert(iso === 'br'
    ? "Informe um WhatsApp válido com DDD (10 ou 11 dígitos)."
    : "Confira seu WhatsApp e o país escolhido.");
  input.focus();
  return false;
}
```

E a máscara brasileira (`formatBR`) só deve rodar quando `iso === 'br'`.

---

## Outra coisa que vale conferir

A regra atual só aceita **10 ou 11 dígitos**, que é o formato brasileiro. O número que
a Taynã usou de exemplo, `+244954646524`, é de Angola e tem 9 dígitos — ele seria
barrado pela primeira trava, antes mesmo de chegar no `getNumber()`.

Na variação B isso já está resolvido: o seletor tem os mesmos 243 países, mas a
validação é rígida só no Brasil e permissiva no resto, e a máscara brasileira só roda
quando o Brasil está escolhido. Custou 4,3 KB em vez dos 240 KB do `intl-tel-input` —
dos quais 170 KB são um sprite com a bandeira de todos os países do mundo.
