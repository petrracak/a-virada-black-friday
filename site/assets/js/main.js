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

  /* ── 3. WhatsApp ───────────────────────────────────────────── */

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
    var telefone = form.querySelector('[data-telefone]');
    var telefoneFinal = form.querySelector('[data-telefone-final]');
    var email = form.querySelector('input[type="email"]');
    var botao = form.querySelector('button[type="submit"]');

    if (telefone) {
      telefone.addEventListener('input', function () {
        telefone.value = formatarBR(telefone.value);
        if (telefone.getAttribute('aria-invalid') === 'true') avisar(form, '', telefone);
      });
    }

    form.addEventListener('submit', function (evento) {
      var digitos = telefone ? telefone.value.replace(/\D/g, '') : '';

      if (email && !email.checkValidity()) {
        evento.preventDefault();
        avisar(form, 'Confira o e-mail digitado.', email);
        return;
      }
      if (digitos.length !== 10 && digitos.length !== 11) {
        evento.preventDefault();
        avisar(form, 'Informe seu WhatsApp com DDD — 10 ou 11 números.', telefone);
        return;
      }

      avisar(form, '');
      if (telefoneFinal) telefoneFinal.value = '+55' + digitos;
      if (botao) botao.setAttribute('data-enviando', '');

      // fica disponível no GTM caso você queira disparar o Lead já no envio
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lead_formulario', formulario: 'virada_black_friday_b' });
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
