/* =========================================================
   Rumo ao Pro – Rotina de treinos de um atleta de futsal (AV1 + AV2)
   Dados em arrays durante a execução (sem backend).
   ========================================================= */
 
// ---------- DADOS ----------
// cat = cor pastel de fundo; borda = tom mais forte da mesma família
const categorias = {
  'Técnica':      { cat: 'var(--ceu)',      borda: '#6fa8dc' },
  'Finalização':  { cat: 'var(--pessego)',  borda: '#e8946a' },
  'Tática':       { cat: 'var(--lilas)',    borda: '#9a85c9' },
  'Físico':       { cat: 'var(--menta)',    borda: '#5fb08a' },
  'Recuperação':  { cat: 'var(--manteiga)', borda: '#d4b73f' }
};
const exercicios = [
  { id: 1,  nome: 'Domínio e passe em duplas',     cat: 'Técnica',     nivel: 'Iniciante',     min: 20, desc: 'Passes curtos com a parte interna do pé, dominando de primeira.' },
  { id: 2,  nome: 'Condução em slalom com cones',  cat: 'Técnica',     nivel: 'Intermediário', min: 15, desc: 'Controle da bola em espaço curto, usando as duas pernas.' },
  { id: 3,  nome: 'Drible e mudança de direção',   cat: 'Técnica',     nivel: 'Avançado',      min: 20, desc: 'Fintas, corte e arrancada para vencer o marcador no 1x1.' },
  { id: 4,  nome: 'Finalização de primeira',       cat: 'Finalização', nivel: 'Intermediário', min: 20, desc: 'Chute rápido após o passe, sem dominar a bola.' },
  { id: 5,  nome: 'Chute colocado e de trivela',   cat: 'Finalização', nivel: 'Avançado',      min: 15, desc: 'Precisão no canto do gol com a parte interna e externa do pé.' },
  { id: 6,  nome: 'Marcação e cobertura',          cat: 'Tática',      nivel: 'Intermediário', min: 25, desc: 'Posicionamento na defesa e ajuda ao companheiro.' },
  { id: 7,  nome: 'Jogadas ensaiadas de bola parada', cat: 'Tática',   nivel: 'Avançado',      min: 20, desc: 'Escanteios, laterais e faltas com movimentos combinados.' },
  { id: 8,  nome: 'Rotação no 3-1 e no 4-0',       cat: 'Tática',      nivel: 'Avançado',      min: 30, desc: 'Troca de posições e linhas de passe em quadra reduzida.' },
  { id: 9,  nome: 'Tiros de velocidade (sprints)', cat: 'Físico',      nivel: 'Intermediário', min: 15, desc: 'Arrancadas curtas de 10 a 20 m com pausa entre as séries.' },
  { id: 10, nome: 'Treino intervalado de resistência', cat: 'Físico',  nivel: 'Avançado',      min: 30, desc: 'Alterna esforço forte e leve para aguentar os 40 min de jogo.' },
  { id: 11, nome: 'Força de pernas e core',        cat: 'Físico',      nivel: 'Intermediário', min: 30, desc: 'Agachamento, afundo e prancha para ganhar potência e equilíbrio.' },
  { id: 12, nome: 'Alongamento e mobilidade',      cat: 'Recuperação', nivel: 'Iniciante',     min: 15, desc: 'Solta quadril, posterior e panturrilha após o treino.' }
];
const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const turnos = ['Manhã', 'Tarde', 'Noite'];
 
let rotina = [
  { id: 1, exercicioId: 1, dia: 'Segunda', turno: 'Manhã', minutos: 20, intensidade: 'Leve', feita: true },
  { id: 2, exercicioId: 9, dia: 'Quarta',  turno: 'Tarde', minutos: 15, intensidade: 'Intensa', feita: false },
  { id: 3, exercicioId: 6, dia: 'Sexta',   turno: 'Noite', minutos: 25, intensidade: 'Moderada', feita: false }
];
let proximoId = 4;
let categoriaAtiva = 'Todas';
let metaSemanal = 420;
 
// ---------- AUXILIARES ----------
const $ = (id) => document.getElementById(id);
const form = $('formRotina');
const campos = ['exercicio', 'dia', 'turno', 'minutos', 'intensidade'];
function buscarExercicio(id) { return exercicios.find(e => e.id === id); }
function escapar(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function estiloCat(nome) { return `--cat:${categorias[nome].cat};--borda:${categorias[nome].borda}`; }
 
function mostrarToast(msg, tipo = 'success') {
  const cores = { success: 'var(--menta)', danger: 'var(--pessego)', warning: 'var(--manteiga)', info: 'var(--ceu)' };
  const el = $('toastPro');
  el.className = 'toast align-items-center border-0';
  el.style.background = cores[tipo]; el.style.color = '#1f3347';
  $('toastTexto').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2800 }).show();
}
 
// ---------- VALIDAÇÃO ----------
function validarDados(d) {
  const erros = {};
  if (!d.exercicio) erros.exercicio = true;
  if (!d.dia) erros.dia = true;
  if (!d.turno) erros.turno = true;
  const m = Number(d.minutos);
  if (!d.minutos || !Number.isInteger(m) || m < 5 || m > 120) erros.minutos = true;
  if (!d.intensidade) erros.intensidade = true;
  // regra extra: o mesmo exercício não se repete no mesmo dia
  if (!erros.exercicio && !erros.dia &&
      rotina.some(r => r.exercicioId === Number(d.exercicio) && r.dia === d.dia)) {
    erros.dia = true;
    $('erroDia').textContent = 'Exercício já está neste dia.';
  } else {
    $('erroDia').textContent = 'Escolha um dia.';
  }
  return erros;
}
function mostrarErros(erros) {
  campos.forEach(c => $(c).classList.toggle('is-invalid', Boolean(erros[c])));
}
 
// ---------- AÇÕES ----------
function adicionarSessao(d) {
  rotina.push({ id: proximoId++, exercicioId: Number(d.exercicio), dia: d.dia, turno: d.turno,
                minutos: Number(d.minutos), intensidade: d.intensidade, feita: false });
}
function alternarFeita(id) {
  const s = rotina.find(r => r.id === id);
  s.feita = !s.feita;
  mostrarToast(s.feita ? 'Treino concluído. Bom trabalho!' : 'Treino reaberto.');
}
function removerSessao(id) {
  rotina = rotina.filter(r => r.id !== id);
  mostrarToast('Treino removido.', 'danger');
}
function definirMeta(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 60 || n > 1500) return false;
  metaSemanal = n;
  return true;
}
 
// ---------- RENDERIZAÇÃO ----------
function renderizarFiltros() {
  const nomes = ['Todas', ...Object.keys(categorias)];
  $('filtrosCategoria').innerHTML = nomes.map(n =>
    `<button type="button" class="btn btn-outline-secondary ${n === categoriaAtiva ? 'active' : ''}" data-cat="${n}">${n}</button>`).join('');
}
function renderizarCatalogo() {
  const lista = exercicios.filter(e => categoriaAtiva === 'Todas' || e.cat === categoriaAtiva);
  $('listaExercicios').innerHTML = lista.map(e => `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card ex" style="${estiloCat(e.cat)}">
        <div class="card-body d-flex flex-column">
          <div class="mb-2"><span class="badge badge-cat">${e.cat}</span> <span class="badge badge-nivel">${e.nivel}</span></div>
          <h3 class="h4">${e.nome}</h3>
          <p class="text-secondary flex-grow-1">${e.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small>${e.min} min sugeridos</small>
            <button class="btn btn-sm btn-pro" data-add="${e.id}">Adicionar à rotina</button>
          </div>
        </div>
      </div>
    </div>`).join('');
}
function renderizarFormulario() {
  $('exercicio').innerHTML = '<option value="">Selecione...</option>' +
    exercicios.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
  $('dia').innerHTML = '<option value="">Selecione...</option>' + dias.map(d => `<option>${d}</option>`).join('');
}
function renderizarSemana() {
  $('gradeSemana').innerHTML = dias.map(dia => {
    const sessoes = rotina.filter(r => r.dia === dia)
      .sort((a, b) => turnos.indexOf(a.turno) - turnos.indexOf(b.turno));
    const html = sessoes.map(s => {
      const e = buscarExercicio(s.exercicioId);
      return `<div class="sessao ${s.feita ? 'feita' : ''}" style="${estiloCat(e.cat)}">
        <div class="nome fw-semibold">${escapar(e.nome)}</div>
        <div class="mb-1"><small>${s.turno} · ${s.minutos} min</small> <span class="badge int-${s.intensidade}">${s.intensidade}</span></div>
        <button class="btn btn-sm btn-ok py-0" data-acao="feita" data-id="${s.id}">${s.feita ? 'Reabrir' : 'Concluir'}</button>
        <button class="btn btn-sm btn-outline-danger py-0" data-acao="remover" data-id="${s.id}">Remover</button>
      </div>`;
    }).join('') || '<span class="small text-secondary">Dia de descanso</span>';
    return `<div class="col"><div class="dia"><h3>${dia}</h3>${html}</div></div>`;
  }).join('');
}
function atualizarIndicadores() {
  const feitas = rotina.filter(r => r.feita);
  const minFeitos = feitas.reduce((s, r) => s + r.minutos, 0);
  const pct = Math.min(100, Math.round(minFeitos / metaSemanal * 100));
  $('indSessoes').textContent = rotina.length;
  $('indMinutos').textContent = rotina.reduce((s, r) => s + r.minutos, 0);
  $('indFeitas').textContent = feitas.length;
  $('barraProgresso').style.width = pct + '%';
  $('textoProgresso').textContent = pct + '%';
  $('textoMeta').textContent = `${minFeitos} de ${metaSemanal} min da meta semanal`;
}
function renderizarRotina() { renderizarSemana(); atualizarIndicadores(); }
 
// ---------- EVENTOS ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(campos.map(c => [c, $(c).value]));
  const erros = validarDados(dados);
  mostrarErros(erros);
  if (Object.keys(erros).length) { mostrarToast('Corrija os campos destacados.', 'danger'); return; }
  adicionarSessao(dados);
  form.reset();
  renderizarRotina();
  mostrarToast('Treino adicionado à rotina!');
});
campos.forEach(c => $(c).addEventListener('input', () => $(c).classList.remove('is-invalid')));
 
// Meta semanal (formulário com validação)
$('formMeta').addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = definirMeta($('meta').value);
  $('meta').classList.toggle('is-invalid', !ok);
  if (!ok) { mostrarToast('Meta inválida.', 'danger'); return; }
  atualizarIndicadores();
  mostrarToast(`Meta definida: ${metaSemanal} minutos por semana.`);
});
 
// Filtro por categoria
$('filtrosCategoria').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-cat]');
  if (!b) return;
  categoriaAtiva = b.dataset.cat;
  renderizarFiltros();
  renderizarCatalogo();
});
 
// Botão do catálogo: preenche o formulário e leva o usuário até ele
$('listaExercicios').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-add]');
  if (!b) return;
  const ex = buscarExercicio(Number(b.dataset.add));
  $('exercicio').value = ex.id;
  $('minutos').value = ex.min;
  $('montar').scrollIntoView();
  $('dia').focus();
  mostrarToast(`“${ex.nome}” selecionado. Escolha dia, turno e intensidade.`, 'info');
});
 
// Concluir / remover (delegação de eventos)
$('gradeSemana').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-acao]');
  if (!b) return;
  const id = Number(b.dataset.id);
  if (b.dataset.acao === 'feita') alternarFeita(id);
  if (b.dataset.acao === 'remover') removerSessao(id);
  renderizarRotina();
});
 
$('btnLimpar').addEventListener('click', () => {
  if (rotina.length === 0) { mostrarToast('A rotina já está vazia.', 'warning'); return; }
  if (confirm('Remover todos os treinos da rotina?')) {
    rotina = [];
    renderizarRotina();
    mostrarToast('Rotina limpa.', 'danger');
  }
});
 
// Tema claro/escuro
$('btnTema').addEventListener('click', () => {
  const h = document.documentElement;
  const escuro = h.getAttribute('data-bs-theme') === 'dark';
  h.setAttribute('data-bs-theme', escuro ? 'light' : 'dark');
  $('btnTema').textContent = escuro ? 'Modo escuro' : 'Modo claro';
});
 
// Início
renderizarFiltros();
renderizarCatalogo();
renderizarFormulario();
renderizarRotina();