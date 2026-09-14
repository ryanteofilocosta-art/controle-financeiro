let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
transacoes.forEach(function (t) {
  t.data = new Date(t.data);
});

let indiceEmEdicao = null;

const form = document.getElementById('formulario');
const listaHistorico = document.getElementById('historico');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');

form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const categoria= document.getElementById('categoria').value;

  if (!descricao) {
    mostrarErro('Escreva uma descrição.');
    return;
  }

  if (!valor || valor <= 0) {
    mostrarErro('O valor precisa ser maior que zero.');
    return;
  }

  document.getElementById('mensagemErro').style.display = 'none';

  if (indiceEmEdicao === null) {
    transacoes.push({ tipo, descricao, valor, categoria, data: new Date() });
  } else {
    transacoes[indiceEmEdicao].tipo = tipo;
    transacoes[indiceEmEdicao].descricao = descricao;
    transacoes[indiceEmEdicao].valor = valor;
    transacoes[indiceEmEdicao].categoria = categoria;
    indiceEmEdicao = null;
    botaoSalvar.textContent = 'Adicionar';
  }

  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  renderizarTudo();
  if(indiceEmEdicao !==null) {
    sairDoModoEDicao();
  } else{
  form.reset();
  }
});

function mostrarErro(texto) {
  const mensagemErro = document.getElementById('mensagemErro');
  mensagemErro.textContent = texto;
  mensagemErro.style.display = 'block';
}

function editarTransacao(indice) {
  const t = transacoes[indice];
  indiceEmEdicao = indice;

  document.querySelector('input[value="' + t.tipo + '"]').checked = true;
  document.getElementById('descricao').value = t.descricao;
  document.getElementById('valor').value = t.valor;
  document.getElementById('categoria').value = t.categoria;

  botaoSalvar.textContent = 'Salvar edição';
  botaoCancelar.style.display ='block';
  document.getElementById('descricao').focus();
}

function renderizarTudo() {
  let saldo = 0, entradas = 0, despesas = 0;
  listaHistorico.innerHTML = '';

  if (transacoes.length === 0) {
    listaHistorico.innerHTML = '<li>Nenhuma movimentação.</li>';
  }

  transacoes.forEach(function (t, indice) {
    if (t.tipo === 'entrada') {
      entradas += t.valor;
      saldo += t.valor;
    } else {
      despesas += t.valor;
      saldo -= t.valor;
    }

    const item = document.createElement('li');
    const sinal = t.tipo === 'entrada' ? '+ ' : '- ';
    const dataFormatada = t.data.toLocaleDateString('pt-br', { day: '2-digit', month: 'short' });

    const texto = document.createElement('span');
    texto.textContent = dataFormatada + '[' + t.categoria + ']' + t.descricao + ': ' + sinal + formatarMoeda(t.valor);

      
    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = '✎';
    botaoEditar.addEventListener('click', function () {
      editarTransacao(indice);
    });

    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = '×';
    botaoExcluir.addEventListener('click', function () {
      excluirTransacao(indice);
    });

    item.appendChild(texto);
    item.appendChild(botaoEditar);
    item.appendChild(botaoExcluir);
    listaHistorico.prepend(item);
  });


  document.getElementById('saldo').textContent = formatarMoeda(saldo);
  document.getElementById('entradas').textContent = formatarMoeda(entradas);
  document.getElementById('despesas').textContent = formatarMoeda(despesas);
}

function excluirTransacao(indice) {
  transacoes.splice(indice, 1);
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  renderizarTudo();
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}
  function sairDoModoEdicao() {
    indiceEmEdicao = null;
    botaoSalvar.textContent = 'Adicionar';
    botaoCancelar.style.display = 'none';
    form.reset();
  }
  botaoCancelar.addEventListener('click', sairDoModoEdicao);

renderizarTudo();