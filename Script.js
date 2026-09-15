let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
transacoes.forEach(function (t) {
  t.data = new Date(t.data);
});

let indiceEmEdicao = null;

const form = document.getElementById('formulario');
const listaHistorico = document.getElementById('historico');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');
const filtroMes = document.getElementById('filtroMes');
const botaoLimparFiltro = document.getElementById('botaoLimparFiltro');
const inputData = document.getElementById('dataLancamento');

form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const categoria= document.getElementById('categoria').value;
  const data = new Date(inputData.value + 'T00:00:00');

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
    transacoes.push({ tipo, descricao, valor, categoria, data: data });
  } else {
    transacoes[indiceEmEdicao].tipo = tipo;
    transacoes[indiceEmEdicao].descricao = descricao;
    transacoes[indiceEmEdicao].valor = valor;
    transacoes[indiceEmEdicao].categoria = categoria;
    transacoes[iniceEmEdicao].data = data;

    indiceEmEdicao = null;
    botaoSalvar.textContent = 'Adicionar';
  }

  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  renderizarTudo();
  if(indiceEmEdicao !==null) {
    sairDoModoEdicao();
  } else{
  form.reset();
  definirDataDeHoje();
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

  const ano = t.data.getFullYear();
  const mes = String(t.data.getMonth() + 1).padStart(2, '0');
  const dia = String(t.data.getDate()).padStart(2, '0');
  inputData.value = ano + '-' + mes + '-' + dia;

  botaoSalvar.textContent = 'Salvar edição';
  botaoCancelar.style.display ='block';
  document.getElementById('descricao').focus();
}
function chaveMes(data){
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2 ,'0');
  return ano + '-' + mes;
}

function renderizarTudo() {
  let saldo = 0, entradas = 0, despesas = 0;
  listaHistorico.innerHTML = '';

  const mesSelecionado = filtroMes.value; // ex: "2026-09", ou "" se não escolheu nenhum

  const transacoesComIndice = transacoes.map(function (t, indice) {
    return { t: t, indice: indice };
  });

  const transacoesFiltradas = transacoesComIndice.filter(function (item) {
    if (!mesSelecionado) return true;
    return chaveMes(item.t.data) === mesSelecionado;
  });

  if (transacoesFiltradas.length === 0) {
    listaHistorico.innerHTML = '<li>Nenhuma movimentação.</li>';
  }

  transacoesFiltradas.forEach(function (item) {
    const t = item.t;
    const indice = item.indice;

    if (t.tipo === 'entrada') {
      entradas += t.valor;
      saldo += t.valor;
    } else {
      despesas += t.valor;
      saldo -= t.valor;
    }

    const elementoItem = document.createElement('li');
    const sinal = t.tipo === 'entrada' ? '+ ' : '- ';
    const dataFormatada = t.data.toLocaleDateString('pt-br', { day: '2-digit', month: 'short' });

    const texto = document.createElement('span');
    texto.textContent = dataFormatada + ' [' + t.categoria + '] ' + t.descricao + ': ' + sinal + formatarMoeda(t.valor);

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

    elementoItem.appendChild(texto);
    elementoItem.appendChild(botaoEditar);
    elementoItem.appendChild(botaoExcluir);
    listaHistorico.prepend(elementoItem);
  });

  document.getElementById('saldo').textContent = formatarMoeda(saldo);
  document.getElementById('entradas').textContent = formatarMoeda(entradas);
  document.getElementById('despesas').textContent = formatarMoeda(despesas);
  }

filtroMes.addEventListener('change', renderizarTudo);

botaoLimparFiltro.addEventListener('click', function (){
  filtroMes.value = '';
  renderizarTudo();
});

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
    definirDataDeHoje();

  }
  botaoCancelar.addEventListener('click', sairDoModoEdicao);
  function definirDataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear()
    const mes =  String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    inputData.value = ano + '-' + mes + '-' + dia;
  }

  definirDataDeHoje();

renderizarTudo();