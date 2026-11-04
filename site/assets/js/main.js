/* ═══════════════════════════════════════════════════════════════
   A VIRADA · BLACK FRIDAY — variação B

   1. parâmetros da URL → campos ocultos do ActiveCampaign
   2. parâmetros da URL → links da página
   3. WhatsApp: máscara, validação e telefone em formato +55…
   4. prateleira dos cursos (arrastar, setas, progresso, "Ler tudo")
   5. luz que segue o ponteiro
   6. revelações na rolagem, contador da soma e barra fixa

   Sem bibliotecas externas.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var formularios = document.querySelectorAll('[data-form]');
  var animacaoLigada = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Parâmetros da URL → campos ocultos ─────────────────── */

  formularios.forEach(function (form) {
    form.querySelectorAll('[data-param]').forEach(function (campo) {
      var valor = params.get(campo.dataset.param);
      if (valor) campo.value = valor;
    });
    var campoUrl = form.querySelector('[data-url-da-pagina]');
    if (campoUrl) campoUrl.value = window.location.href;
  });

  /* ── 2. Parâmetros da URL → links da página ────────────────── */

  if (params.toString()) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      if (link.getAttribute('href').charAt(0) === '#') return;
      try {
        var url = new URL(link.href, window.location.href);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        params.forEach(function (valor, chave) { url.searchParams.set(chave, valor); });
        link.href = url.toString();
      } catch (e) { /* não é URL: deixa como está */ }
    });
  }

  /* ── 3. WhatsApp: país, máscara e validação ────────────────── */

  // Os seis países mais prováveis já vêm no HTML; o resto entra aqui.
  // Gerado a partir de intl-tel-input 17.0.8 (iso2 + DDI) com os nomes em
  // português do próprio navegador (Intl.DisplayNames). Formato: iso,ddi,nome
  var PAISES =
    'af,93,Afeganistão|za,27,África do Sul|al,355,Albânia|de,49,Alemanha|ad,376,Andorra|' +
    'ai,1,Anguila|ag,1,Antígua e Barbuda|sa,966,Arábia Saudita|dz,213,Argélia|' +
    'ar,54,Argentina|am,374,Armênia|aw,297,Aruba|au,61,Austrália|at,43,Áustria|' +
    'az,994,Azerbaijão|bs,1,Bahamas|bd,880,Bangladesh|bb,1,Barbados|bh,973,Barein|' +
    'be,32,Bélgica|bz,501,Belize|bj,229,Benin|bm,1,Bermudas|by,375,Bielorrússia|' +
    'bo,591,Bolívia|ba,387,Bósnia e Herzegovina|bw,267,Botsuana|bn,673,Brunei|' +
    'bg,359,Bulgária|bf,226,Burquina Faso|bi,257,Burundi|bt,975,Butão|cm,237,Camarões|' +
    'kh,855,Camboja|ca,1,Canadá|qa,974,Catar|kz,7,Cazaquistão|td,235,Chade|cl,56,Chile|' +
    'cn,86,China|cy,357,Chipre|va,39,Cidade do Vaticano|co,57,Colômbia|km,269,Comores|' +
    'cd,243,Congo - Kinshasa|kp,850,Coreia do Norte|kr,82,Coreia do Sul|' +
    'ci,225,Costa do Marfim|cr,506,Costa Rica|hr,385,Croácia|cu,53,Cuba|cw,599,Curaçao|' +
    'dk,45,Dinamarca|dj,253,Djibuti|dm,1,Dominica|eg,20,Egito|sv,503,El Salvador|' +
    'ae,971,Emirados Árabes Unidos|ec,593,Equador|er,291,Eritreia|sk,421,Eslováquia|' +
    'si,386,Eslovênia|es,34,Espanha|sz,268,Essuatíni|ee,372,Estônia|et,251,Etiópia|' +
    'fj,679,Fiji|ph,63,Filipinas|fi,358,Finlândia|fr,33,França|ga,241,Gabão|gm,220,Gâmbia|' +
    'gh,233,Gana|ge,995,Geórgia|gi,350,Gibraltar|gd,1,Granada|gr,30,Grécia|' +
    'gl,299,Groenlândia|gp,590,Guadalupe|gu,1,Guam|gt,502,Guatemala|gg,44,Guernsey|' +
    'gy,592,Guiana|gf,594,Guiana Francesa|gn,224,Guiné|gq,240,Guiné Equatorial|' +
    'gw,245,Guiné-Bissau|ht,509,Haiti|hn,504,Honduras|hk,852,Hong Kong, RAE da China|' +
    'hu,36,Hungria|ye,967,Iêmen|cx,61,Ilha Christmas|im,44,Ilha de Man|nf,672,Ilha Norfolk|' +
    'ax,358,Ilhas Aland|ky,1,Ilhas Cayman|cc,61,Ilhas Cocos (Keeling)|ck,682,Ilhas Cook|' +
    'fo,298,Ilhas Faroé|fk,500,Ilhas Malvinas|mp,1,Ilhas Marianas do Norte|' +
    'mh,692,Ilhas Marshall|sb,677,Ilhas Salomão|tc,1,Ilhas Turcas e Caicos|' +
    'vi,1,Ilhas Virgens Americanas|vg,1,Ilhas Virgens Britânicas|in,91,Índia|id,62,Indonésia|' +
    'ir,98,Irã|iq,964,Iraque|ie,353,Irlanda|is,354,Islândia|il,972,Israel|it,39,Itália|' +
    'jm,1,Jamaica|jp,81,Japão|je,44,Jersey|jo,962,Jordânia|xk,383,Kosovo|kw,965,Kuwait|' +
    'la,856,Laos|ls,266,Lesoto|lv,371,Letônia|lb,961,Líbano|lr,231,Libéria|ly,218,Líbia|' +
    'li,423,Liechtenstein|lt,370,Lituânia|lu,352,Luxemburgo|mo,853,Macau, RAE da China|' +
    'mk,389,Macedônia do Norte|mg,261,Madagascar|my,60,Malásia|mw,265,Malaui|mv,960,Maldivas|' +
    'ml,223,Mali|mt,356,Malta|ma,212,Marrocos|mq,596,Martinica|mu,230,Maurício|' +
    'mr,222,Mauritânia|yt,262,Mayotte|mx,52,México|mm,95,Mianmar (Birmânia)|' +
    'fm,691,Micronésia|md,373,Moldávia|mc,377,Mônaco|mn,976,Mongólia|me,382,Montenegro|' +
    'ms,1,Montserrat|na,264,Namíbia|nr,674,Nauru|np,977,Nepal|ni,505,Nicarágua|ne,227,Níger|' +
    'ng,234,Nigéria|nu,683,Niue|no,47,Noruega|nc,687,Nova Caledônia|nz,64,Nova Zelândia|' +
    'om,968,Omã|nl,31,Países Baixos|bq,599,Países Baixos Caribenhos|pw,680,Palau|' +
    'pa,507,Panamá|pg,675,Papua-Nova Guiné|pk,92,Paquistão|py,595,Paraguai|pe,51,Peru|' +
    'pf,689,Polinésia Francesa|pl,48,Polônia|pr,1,Porto Rico|ke,254,Quênia|' +
    'kg,996,Quirguistão|ki,686,Quiribati|gb,44,Reino Unido|cf,236,República Centro-Africana|' +
    'cg,242,República do Congo|do,1,República Dominicana|re,262,Reunião|ro,40,Romênia|' +
    'rw,250,Ruanda|ru,7,Rússia|eh,212,Saara Ocidental|ws,685,Samoa|as,1,Samoa Americana|' +
    'sm,378,San Marino|sh,290,Santa Helena|lc,1,Santa Lúcia|bl,590,São Bartolomeu|' +
    'kn,1,São Cristóvão e Névis|mf,590,São Martinho|pm,508,São Pedro e Miquelão|' +
    'st,239,São Tomé e Príncipe|vc,1,São Vicente e Granadinas|sc,248,Seicheles|' +
    'sn,221,Senegal|sl,232,Serra Leoa|rs,381,Sérvia|sg,65,Singapura|sx,1,Sint Maarten|' +
    'sy,963,Síria|so,252,Somália|lk,94,Sri Lanka|sd,249,Sudão|ss,211,Sudão do Sul|' +
    'se,46,Suécia|ch,41,Suíça|sr,597,Suriname|sj,47,Svalbard e Jan Mayen|tj,992,Tadjiquistão|' +
    'th,66,Tailândia|tw,886,Taiwan|tz,255,Tanzânia|cz,420,Tchéquia|' +
    'io,246,Território Britânico do Oceano Índico|ps,970,Territórios palestinos|' +
    'tl,670,Timor-Leste|tg,228,Togo|tk,690,Tokelau|to,676,Tonga|tt,1,Trinidad e Tobago|' +
    'tn,216,Tunísia|tm,993,Turcomenistão|tr,90,Turquia|tv,688,Tuvalu|ua,380,Ucrânia|' +
    'ug,256,Uganda|uy,598,Uruguai|uz,998,Uzbequistão|vu,678,Vanuatu|ve,58,Venezuela|' +
    'vn,84,Vietnã|wf,681,Wallis e Futuna|zm,260,Zâmbia|zw,263,Zimbábue';

  function bandeiraDe(iso) {
    return iso.toUpperCase().replace(/./g, function (letra) {
      return String.fromCodePoint(0x1F1E6 + letra.charCodeAt(0) - 65);
    });
  }

  function completarPaises(select) {
    if (!select || select.dataset.completo) return;
    var grupo = document.createElement('optgroup');
    grupo.label = 'Todos os países';
    grupo.innerHTML = PAISES.split('|').map(function (linha) {
      var p = linha.split(',');
      return '<option value="' + p[1] + '" data-iso="' + p[0] + '">' +
             p[2] + ' +' + p[1] + '</option>';
    }).join('');
    select.appendChild(grupo);
    select.dataset.completo = '1';
  }

  // Máscara só para o Brasil, que é de onde vem quase todo o tráfego.
  // Para os outros países fica só o número, sem formatar: um formato errado
  // confunde quem digita e já custou lead na página antiga.
  function formatarBR(valor) {
    var d = valor.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2)  return d ? '(' + d : '';
    if (d.length <= 6)  return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function avisar(form, mensagem, campo) {
    var aviso = form.querySelector('[data-erro]');
    if (aviso) {
      aviso.textContent = mensagem;
      aviso.hidden = !mensagem;
    }
    if (campo) {
      campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
      if (mensagem) campo.focus();
    }
  }

  formularios.forEach(function (form) {
    // O campo que a pessoa preenche é o mesmo que vai para o ActiveCampaign
    // (name="phone"). Assim, se este arquivo não carregar, o número digitado
    // chega mesmo assim — sem o DDI, mas chega. O JS só normaliza.
    var telefone = form.querySelector('[data-telefone]');
    var email = form.querySelector('input[type="email"]');
    var botao = form.querySelector('button[type="submit"]');
    var pais = form.querySelector('[data-pais]');
    var bandeira = form.querySelector('[data-bandeira]');
    var codigo = form.querySelector('[data-codigo]');
    var rotulo = telefone && form.querySelector('label[for="' + telefone.id + '"]');

    // A validação do navegador fica ligada no HTML e só é desligada aqui,
    // onde temos as mensagens próprias. Sem JS ela continua barrando campo
    // vazio, que é a causa de lead sem telefone.
    form.noValidate = true;

    completarPaises(pais);

    function isoAtual() {
      var op = pais && pais.options[pais.selectedIndex];
      return (op && op.dataset.iso) || 'br';
    }
    function ddiAtual() { return (pais && pais.value) || '55'; }

    function aplicarMascara() {
      if (!telefone) return;
      telefone.value = isoAtual() === 'br'
        ? formatarBR(telefone.value)
        : telefone.value.replace(/\D/g, '').slice(0, 15);
    }

    if (pais) {
      pais.addEventListener('change', function () {
        var iso = isoAtual();
        if (bandeira) bandeira.textContent = bandeiraDe(iso);
        if (codigo) codigo.textContent = '+' + ddiAtual();
        if (rotulo) rotulo.textContent = iso === 'br' ? 'Seu WhatsApp com DDD' : 'Seu WhatsApp';
        if (telefone) {
          telefone.inputMode = 'numeric';
          aplicarMascara();
        }
        avisar(form, '');
      });
    }

    if (telefone) {
      telefone.addEventListener('input', function () {
        aplicarMascara();
        if (telefone.getAttribute('aria-invalid') === 'true') avisar(form, '', telefone);
      });
    }

    form.addEventListener('submit', function (evento) {
      var iso = isoAtual();
      var ddi = ddiAtual();
      var digitos = telefone ? telefone.value.replace(/\D/g, '') : '';

      if (email && !email.checkValidity()) {
        evento.preventDefault();
        avisar(form, 'Confira o e-mail digitado.', email);
        return;
      }

      // Rígido no Brasil, onde dá para ter certeza do formato. Nos outros
      // países, só a faixa que o padrão internacional permite — barrar um
      // número estrangeiro válido custa um lead que nunca mais volta.
      var curto = iso === 'br' ? (digitos.length !== 10 && digitos.length !== 11)
                               : (digitos.length < 6);
      if (curto) {
        evento.preventDefault();
        avisar(form, iso === 'br'
          ? 'Confira seu WhatsApp: precisa do DDD e de 10 ou 11 números.'
          : 'Confira seu WhatsApp e o país escolhido.', telefone);
        return;
      }
      if ((ddi + digitos).length > 15) {
        evento.preventDefault();
        avisar(form, 'Esse número tem dígitos demais. Confira o país escolhido.', telefone);
        return;
      }

      avisar(form, '');
      telefone.value = '+' + ddi + digitos;   // formato que o ActiveCampaign espera
      if (botao) botao.setAttribute('data-enviando', '');

      // fica disponível no GTM caso você queira disparar o Lead já no envio
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'lead_formulario',
        formulario: 'virada_black_friday_b',
        pais: iso
      });
    });
  });

  /* ── 4. Prateleira dos cursos ──────────────────────────────── */

  var trilho = document.querySelector('[data-trilho]');

  if (trilho) {
    var cartoes = trilho.querySelectorAll('.curso');
    var contador = document.querySelector('[data-atual]');
    var progresso = document.querySelector('[data-progresso]');
    var setas = document.querySelectorAll('[data-seta]');
    var passo = 0;

    function medirPasso() {
      if (cartoes.length < 2) { passo = trilho.clientWidth; return; }
      passo = cartoes[1].offsetLeft - cartoes[0].offsetLeft;
    }

    function atualizarPrateleira() {
      var rolagem = trilho.scrollLeft;
      var maximo = trilho.scrollWidth - trilho.clientWidth;

      if (progresso) {
        var visivel = trilho.clientWidth / trilho.scrollWidth;
        var andado = maximo > 0 ? rolagem / maximo : 0;
        progresso.style.width = Math.max(10, visivel * 100) + '%';
        progresso.style.transform = 'translateX(' + (andado * (100 / Math.max(visivel, .0001) - 100)) + '%)';
      }

      if (contador && passo > 0) {
        var indice = Math.min(cartoes.length, Math.round(rolagem / passo) + 1);
        contador.textContent = indice;
      }

      setas.forEach(function (seta) {
        var direcao = Number(seta.dataset.seta);
        seta.disabled = direcao < 0 ? rolagem < 4 : rolagem >= maximo - 4;
      });
    }

    setas.forEach(function (seta) {
      seta.addEventListener('click', function () {
        trilho.scrollBy({ left: Number(seta.dataset.seta) * passo, behavior: 'smooth' });
      });
    });

    trilho.addEventListener('scroll', function () {
      window.requestAnimationFrame(atualizarPrateleira);
    }, { passive: true });

    window.addEventListener('resize', function () { medirPasso(); atualizarPrateleira(); });

    medirPasso();
    atualizarPrateleira();

    // "Ler tudo": abre a descrição completa dentro do cartão
    var recolhiveis = [];

    trilho.querySelectorAll('[data-mais]').forEach(function (botao) {
      var cartao = botao.closest('.curso');
      var texto = cartao && cartao.querySelector('[data-texto]');
      if (!texto) return;
      recolhiveis.push({ botao: botao, cartao: cartao, texto: texto });

      botao.addEventListener('click', function () {
        var abrindo = !cartao.classList.contains('aberto');
        cartao.classList.toggle('aberto', abrindo);
        botao.setAttribute('aria-expanded', String(abrindo));
        botao.textContent = abrindo ? 'Ver menos' : 'Ler tudo';
      });
    });

    // Descrição curta cabe inteira e não precisa de botão. A medida só
    // vale depois que a fonte carrega, senão a altura muda embaixo da gente.
    function conferirBotoes() {
      recolhiveis.forEach(function (item) {
        if (item.cartao.classList.contains('aberto')) return;
        item.botao.hidden = item.texto.scrollHeight <= item.texto.clientHeight + 2;
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(conferirBotoes);
    window.addEventListener('load', function () { medirPasso(); conferirBotoes(); atualizarPrateleira(); });
  }

  /* ── 5. Luz que segue o ponteiro ───────────────────────────── */

  if (animacaoLigada && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-luz]').forEach(function (area) {
      area.addEventListener('pointermove', function (evento) {
        var caixa = area.getBoundingClientRect();
        area.style.setProperty('--mx', ((evento.clientX - caixa.left) / caixa.width * 100) + '%');
        area.style.setProperty('--my', ((evento.clientY - caixa.top) / caixa.height * 100) + '%');
      }, { passive: true });
    });
  }

  /* ── 6. Revelações, contador e barra fixa ──────────────────── */

  document.querySelectorAll('[data-grade], [data-trilho]').forEach(function (grade) {
    grade.querySelectorAll('[data-cartao]').forEach(function (cartao, i) {
      cartao.style.setProperty('--atraso', Math.min(i, 5) * 0.07 + 's');
    });
  });

  var aRevelar = Array.prototype.slice.call(
    document.querySelectorAll('[data-revela], [data-cartao], [data-carimbo], [data-soma]')
  );

  function revelar(elemento) {
    elemento.classList.add('visivel', 'revelado');
    if (elemento.hasAttribute('data-soma')) contar(elemento);
  }

  function contar(bloco) {
    var alvo = bloco.querySelector('[data-contador]');
    if (!alvo || alvo.dataset.contado) return;
    alvo.dataset.contado = '1';

    var total = Number(alvo.dataset.contador);
    if (!total || !animacaoLigada) return;

    var inicio = null;
    var duracao = 1200;

    function passoContagem(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min(1, (agora - inicio) / duracao);
      var suave = 1 - Math.pow(1 - t, 3);
      alvo.textContent = Math.round(total * suave).toLocaleString('pt-BR');
      if (t < 1) requestAnimationFrame(passoContagem);
    }
    requestAnimationFrame(passoContagem);
  }

  var barra = document.querySelector('[data-barra]');
  var cartoesForm = document.querySelectorAll('.cartao-form');
  var rodape = document.querySelector('.rodape');
  var pendente = false;

  // Uma única passada por rolagem: revela o que entrou na tela e decide se
  // a barra aparece. Medir na mão em vez de usar IntersectionObserver
  // garante que nada fica invisível numa rolagem rápida.
  function aoRolar() {
    pendente = false;
    var altura = window.innerHeight;
    var gatilho = altura * 0.92;

    for (var i = aRevelar.length - 1; i >= 0; i--) {
      if (aRevelar[i].getBoundingClientRect().top < gatilho) {
        revelar(aRevelar[i]);
        aRevelar.splice(i, 1);
      }
    }

    if (barra && cartoesForm.length) {
      var passouDoTopo = cartoesForm[0].getBoundingClientRect().bottom < 0;
      var algumNaTela = Array.prototype.some.call(cartoesForm, function (cartao) {
        var caixa = cartao.getBoundingClientRect();
        return caixa.top < altura && caixa.bottom > 0;
      });
      var rodapeNaTela = rodape ? rodape.getBoundingClientRect().top < altura : false;
      barra.hidden = !passouDoTopo || algumNaTela || rodapeNaTela;
    }
  }

  function agendar() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(aoRolar);
  }

  if (!animacaoLigada) {
    aRevelar.slice().forEach(revelar);
    aRevelar.length = 0;
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  window.addEventListener('load', agendar);
  aoRolar();
})();
