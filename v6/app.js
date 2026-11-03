/* Protótipo navegável — WorkFlow TUSS/THSM */

const STORE_KEY = 'wf-tuss-proto-v6-onda2-esp06-1';
let state = load();

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { role:null, demandas:JSON.parse(JSON.stringify(SEED)), seq:149, cargas:JSON.parse(JSON.stringify(HIST_CARGA_SEED)), espIndisp:false, notificacoes:JSON.parse(JSON.stringify(NOTIFICACOES_SEED)), auditoria:[], draft:null, route:'#/perfil' };
}
function save(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){} }
function reset(){ const r = state.role, u = state.user; localStorage.removeItem(STORE_KEY); state = load(); state.role = r; state.user = u; go(r==='consulta'?'#/consulta':'#/home'); toast('Protótipo reiniciado','Dados de demonstração restaurados.','info'); }

const me = () => USERS[state.user] || USERS[state.role] || USERS.solicitante;

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brl = v => (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dt = s => { if(!s) return '—'; const d=new Date(s); return d.toLocaleDateString('pt-BR')+' '+d.toTimeString().slice(0,5); };
const d10 = s => s ? new Date(s+(s.length===10?'T00:00:00':'')).toLocaleDateString('pt-BR') : '—';
const badge = st => `<span class="badge ${STATUS[st].cls}">${STATUS[st].label}</span>`;
const find = n => state.demandas.find(d=>d.numero===n);

function slaCell(d){
  if(['CONCLUIDA','REJEITADA'].includes(d.status)) return '<span class="muted">—</span>';
  const h = d.slaHoras ?? 0;
  if(h < 0) return `<span class="sla sla-late">Atrasado ${Math.abs(h)}h</span>`;
  if(h <= 12) return `<span class="sla sla-risk">${h}h restantes</span>`;
  return `<span class="sla sla-ok">${h}h restantes</span>`;
}

function toast(title, body, kind){
  const el = document.createElement('div');
  el.className = 'toast ' + (kind||'');
  el.innerHTML = `<div class="tt">${esc(title)}</div><div class="tb">${esc(body)}</div>`;
  $('#toastWrap').appendChild(el);
  setTimeout(()=>el.remove(), 5200);
}

function modal(title, body, foot){
  $('#modal').innerHTML = `<div class="modal-head">${title}</div><div class="modal-body">${body}</div><div class="modal-foot">${foot}</div>`;
  $('#modalBackdrop').hidden = false;
}
function closeModal(){ $('#modalBackdrop').hidden = true; }

function audit(acao, alvo, detalhe){
  state.auditoria.unshift({ em:new Date().toISOString(), quem:me().nome, perfil:me().perfil, acao, alvo:alvo||'—', detalhe:detalhe||'' });
}
function notify(evento, para, demanda, texto){
  state.notificacoes.unshift({ evento, para, demanda, em:dt(new Date().toISOString()), texto });
}

/* ---------- visibilidade por perfil ---------- */
function visiveis(){
  const r = state.role;
  if(r==='solicitante') return state.demandas.filter(d=>d.solicitante===me().nome);
  return state.demandas.slice();
}
const podeExportar = () => ['gestor','analista'].includes(state.role);
const podeAtuarGT  = () => ['analista','gestor'].includes(state.role);
const ehResponsavel = d => podeAtuarGT() && d.status==='ANALISE' && d.responsavel===me().nome;

/* ---------- navegação ---------- */
const NAV = {
  solicitante:[
    {g:'Solicitações'},
    {r:'#/home', t:'Página inicial'},
    {r:'#/nova', t:'Nova solicitação'},
    {r:'#/minhas', t:'Minhas demandas', count:()=>visiveis().filter(d=>!['CONCLUIDA','REJEITADA'].includes(d.status)).length},
    {g:'Acompanhamento'},
    {r:'#/consulta', t:'Consulta e extração'},
    {r:'#/notificacoes', t:'Notificações'}
  ],
  analista:[
    {g:'Gestão de Tabelas'},
    {r:'#/home', t:'Página inicial'},
    {r:'#/fila', t:'Fila da área', count:()=>state.demandas.filter(d=>d.status==='AGUARDANDO').length},
    {r:'#/minhastarefas', t:'Minhas atribuições', count:()=>state.demandas.filter(d=>d.status==='ANALISE'&&d.responsavel===me().nome).length},
    {r:'#/carga', t:'Carga de solicitações'},
    {g:'Acompanhamento'},
    {r:'#/consulta', t:'Consulta e extração'},
    {r:'#/notificacoes', t:'Notificações'},
    {r:'#/auditoria', t:'Trilha de auditoria'}
  ],
  gestor:[
    {g:'Gestão de Tabelas'},
    {r:'#/home', t:'Página inicial'},
    {r:'#/fila', t:'Fila da área', count:()=>state.demandas.filter(d=>d.status==='AGUARDANDO').length},
    {r:'#/minhastarefas', t:'Minhas atribuições', count:()=>state.demandas.filter(d=>d.status==='ANALISE'&&d.responsavel===me().nome).length},
    {g:'Acompanhamento'},
    {r:'#/consulta', t:'Consulta e extração'},
    {r:'#/notificacoes', t:'Notificações'},
    {r:'#/auditoria', t:'Trilha de auditoria'}
  ],
  consulta:[
    {g:'Acompanhamento'},
    {r:'#/home', t:'Página inicial'},
    {r:'#/consulta', t:'Consulta e extração'},
    {r:'#/auditoria', t:'Trilha de auditoria'}
  ]
};

function renderNav(){
  const items = NAV[state.role];
  const cur = state.route.split('?')[0];
  $('#sidenav').innerHTML = items.map(i=>{
    if(i.g) return `<div class="nav-group-title">${i.g}</div>`;
    const n = i.count ? i.count() : 0;
    return `<div class="nav-item ${cur===i.r?'active':''}" onclick="go('${i.r}')">
      <span>${i.t}</span>${i.count && n ? `<span class="nav-count">${n}</span>`:''}</div>`;
  }).join('') + `<div class="nav-group-title">Protótipo</div>
    <div class="nav-item" onclick="reset()"><span class="muted">Reiniciar dados</span></div>`;
}

function go(route){ state.route = route; save(); render(); window.scrollTo(0,0); }

/* ---------- render principal ---------- */
function render(){
  const [path, qs] = state.route.split('?');
  const q = Object.fromEntries(new URLSearchParams(qs||''));
  const v = $('#view');

  const gate = !state.role || path==='#/perfil';
  document.body.classList.toggle('gate', gate);
  if(gate){
    $('#sidenav').innerHTML = '';
    v.innerHTML = viewPerfil();
    return;
  }

  $('#userChip').textContent = me().ini;
  $('#roleCurrent').innerHTML = `<strong>${esc(me().nome)}</strong>${esc(me().perfil)}`;
  renderNav();
  switch(path){
    case '#/home': v.innerHTML = viewHome(); break;
    case '#/nova': v.innerHTML = viewNova(q); break;
    case '#/form': v.innerHTML = q.t==='alteracao' ? viewFormAlteracao() : q.t==='exclusao' ? viewFormExclusao() : viewForm(q); break;
    case '#/minhas': v.innerHTML = viewLista('Minhas demandas','Demandas abertas pelo seu usuário.', visiveis()); break;
    case '#/fila': v.innerHTML = viewFila(); break;
    case '#/minhastarefas': v.innerHTML = viewLista('Minhas atribuições','Demandas em análise sob sua responsabilidade.', state.demandas.filter(d=>d.status==='ANALISE'&&d.responsavel===me().nome)); break;
    case '#/demanda': { const dd = find(q.n); v.innerHTML = dd && tipoId(dd)!=='criacao' && (state.role!=='solicitante' || dd.solicitante===me().nome) ? viewDemandaNova(dd) : viewDemanda(q.n); break; }
    case '#/revisao': { const dr = find(q.n); v.innerHTML = dr && tipoId(dr)!=='criacao' ? viewRevisaoNova(dr) : viewRevisao(q.n); break; }
    case '#/consulta': v.innerHTML = viewConsulta(); break;
    case '#/carga': v.innerHTML = viewCarga(); break;
    case '#/notificacoes': v.innerHTML = viewNotificacoes(); break;
    case '#/auditoria': v.innerHTML = viewAuditoria(); break;
    default: v.innerHTML = viewHome();
  }
}

/* =========================================================
   HOME
   ========================================================= */
function viewHome(){
  const mine = visiveis();
  const k = {
    total: mine.length,
    fila: state.demandas.filter(d=>d.status==='AGUARDANDO').length,
    analise: state.demandas.filter(d=>d.status==='ANALISE').length,
    resposta: mine.filter(d=>['RESPOSTA','REVISAO'].includes(d.status)).length,
    finalizadas: mine.filter(d=>['CONCLUIDA','REJEITADA'].includes(d.status)).length
  };
  const solic = state.role==='solicitante';
  const cards = solic
    ? [['Minhas demandas',k.total,'#/minhas'],['Aguardando minha resposta',k.resposta,'#/minhas'],['Em tratamento na GT',mine.filter(d=>['AGUARDANDO','ANALISE'].includes(d.status)).length,'#/minhas'],['Encerradas',k.finalizadas,'#/consulta']]
    : [['Na fila da área',k.fila,'#/fila'],['Em análise',k.analise,'#/minhastarefas'],['Aguardando solicitante',state.demandas.filter(d=>['RESPOSTA','REVISAO'].includes(d.status)).length,'#/consulta'],['Encerradas',state.demandas.filter(d=>['CONCLUIDA','REJEITADA'].includes(d.status)).length,'#/consulta']];

  const pend = solic ? mine.filter(d=>['RESPOSTA','REVISAO'].includes(d.status)) : state.demandas.filter(d=>d.status==='AGUARDANDO');

  return `
  <div class="page-head">
    <div><h1>Olá, ${esc(me().nome.split(' ')[0])}</h1>
    <p class="page-sub">${esc(me().perfil)} · ${esc(me().area)} · matrícula ${esc(me().matricula)}</p></div>
    ${solic?`<button class="btn btn-primary" onclick="go('#/nova')">Nova solicitação</button>`:''}
  </div>

  <div class="grid-4">
    ${cards.map(([l,v,r])=>`<div class="kpi red" onclick="go('${r}')"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('')}
  </div>

  <div class="card" style="margin-top:18px">
    <div class="card-head"><h2>${solic?'Pendências com você':'Demandas aguardando atribuição'}</h2>
      <button class="btn btn-outline btn-sm" onclick="go('${solic?'#/minhas':'#/fila'}')">Ver todas</button></div>
    ${pend.length? tabela(pend) : `<div class="empty">Nenhuma pendência no momento.</div>`}
  </div>

  ${homeOnda2()}

  <div class="card">
    <div class="card-head"><h2>Versão anterior (v3) — Alteração de Atributos e Exclusão de Código</h2><span class="tag-open" style="background:#E7F1FA;color:#0B5FA5;border-color:#B9D4EE">Backlog Sprint 3</span></div>
    <div class="card-body">
      <div class="grid-2">
        <div><h3>Alteração de Atributos</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
          · <strong>Solicitante</strong>: Nova solicitação › Alteração de Atributos (código 40101010; Autorização → Sim aciona a regra condicional).<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000140')">WF-2026-000140</span> aguardando atribuição.<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000138')">WF-2026-000138</span> com Carlos Lima: aprovar ✓ / recusar ✕ por atributo; concluir bloqueado com pendência.<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000136')">WF-2026-000136</span> aguardando resposta da Ana Ribeiro (decisões preservadas).<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000126')">WF-2026-000126</span> concluída (aprovado + recusado).</p></div>
        <div><h3>Exclusão de Código</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
          · <strong>Solicitante</strong>: Nova solicitação › Exclusão de Código (40304361 bloqueia por duplicidade; 31009336 permite, pois a anterior foi rejeitada).<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000135')">WF-2026-000135</span> aguardando atribuição.<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000134')">WF-2026-000134</span> com Renata Alves: editar data, retornar, concluir com data efetiva.<br>
          · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000131')">WF-2026-000131</span> rejeitada · <span class="num-link" onclick="go('#/demanda?n=WF-2026-000124')">WF-2026-000124</span> concluída.</p></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h2>Como este protótipo funciona</h2></div>
    <div class="card-body">
      <p class="muted" style="margin-top:0;line-height:1.6">
        Troque o <strong>perfil</strong> no topo da tela para percorrer o fluxo completo: abra a demanda como
        <em>Solicitante</em>, atribua e devolva como <em>Analista de Gestão de Tabelas</em>, responda a devolutiva
        como <em>Solicitante</em> e conclua ou rejeite novamente como <em>Analista</em>.
        Os dados ficam apenas no navegador — use “Reiniciar dados” para voltar ao estado inicial.
      </p>
      <p class="muted" style="line-height:1.6">
        Os pontos marcados com <span class="tag-open">decisão pendente</span> indicam regras que ainda não estão
        fechadas no refinamento e foram representadas aqui com uma hipótese de trabalho.
      </p>
    </div>
  </div>`;
}

/* =========================================================
   EPIC 2 — seleção de tipo
   ========================================================= */
function viewNova(q){
  const sel = q.t || 'criacao';
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › Nova solicitação</div>
  <div class="page-head"><div>
    <h1>Nova solicitação</h1>
    <p class="page-sub">Selecione o tipo de solicitação. Nenhum protocolo é gerado nesta etapa.</p>
  </div></div>

  <div class="stepper">
    <div class="step on"><span class="n">1</span> Tipo de solicitação</div>
    <div class="step"><span class="n">2</span> Preenchimento</div>
    <div class="step"><span class="n">3</span> Confirmação</div>
  </div>

  <div class="card"><div class="card-body">
    <div class="grid-3">
      ${TIPOS_SOLICITACAO.map(t=>`
        <div class="type-card ${t.ativo?'':'disabled'} ${sel===t.id?'selected':''}"
             onclick="${t.ativo?`selTipo('${t.id}')`:`tipoIndisponivel('${esc(t.nome)}')`}">
          ${t.ativo?'':'<span class="soon">Em breve</span>'}
          <div class="t">${esc(t.nome)}</div>
          <div class="d">${esc(t.desc)}</div>
        </div>`).join('')}
    </div>
    <p class="muted" style="font-size:12px;margin-bottom:0">
      Opções fora do MVP são exibidas como “Em breve”. <span class="tag-open">decisão pendente #1 — exibir ou ocultar</span>
    </p>
  </div>
  <div class="form-actions">
    <button class="btn btn-ghost" onclick="go('#/home')">Cancelar</button>
    <button class="btn btn-primary" ${sel?'':'disabled'} onclick="go('#/form?t=${sel}')">Continuar</button>
  </div></div>`;
}
function selTipo(id){ if(id==='alteracao') resetAltForm(); if(id==='exclusao') resetExcForm(); go('#/nova?t='+id); }

/* =========================================================
   Seleção de perfil (entrada do protótipo)
   ========================================================= */
const PERFIS_GATE = [
  { id:'solicitante', role:'solicitante', o:'Abre solicitações, acompanha o andamento e responde às devolutivas da Gestão de Tabelas.' },
  { id:'analista',    role:'analista', o:'Trata a fila da área: atribui para si, devolve para ajustes, conclui ou rejeita o cadastro.' },
  { id:'analista2',   role:'analista', o:'Segundo analista da área, para simular cases sob responsabilidade de outro analista.' },
  { id:'gestor',      role:'gestor', o:'Revisa as demandas da área (somente leitura) e atribui ou reatribui o responsável.' },
  { id:'consulta',    role:'consulta', o:'Somente consulta e extração de dados, sem ações sobre as demandas.' }
];
function viewPerfil(){
  return `
  <div class="gate-wrap">
    <div class="page-head"><div>
      <h1>Selecione o perfil de acesso</h1>
      <p class="page-sub">Protótipo navegável do WorkFlow de solicitações TUSS/THSM. Escolha um perfil para entrar; depois use <strong>Trocar perfil</strong> no topo da tela para voltar a esta seleção.</p>
    </div></div>
    <div class="grid-2">
      ${PERFIS_GATE.map(p=>{
        const u = USERS[p.id];
        return `<div class="type-card ${(state.user||state.role)===p.id?'selected':''}" onclick="entrarComo('${p.id}')">
          <div class="t">${esc(u.perfil)}</div>
          <div class="d">${esc(u.nome)} · ${esc(u.area)} · matrícula ${esc(u.matricula)}</div>
          <div class="who">${esc(p.o)}</div>
        </div>`;
      }).join('')}
    </div>
    <p class="muted" style="font-size:12px;margin-top:18px">Dados simulados e mantidos apenas no seu navegador. No sistema real o perfil vem da autenticação corporativa.</p>
  </div>`;
}
function entrarComo(id){
  const p = PERFIS_GATE.find(x=>x.id===id);
  state.user = id; state.role = p.role; save();
  toast('Perfil selecionado', me().nome+' — '+me().perfil, 'info');
  go(state.role==='consulta' ? '#/consulta' : '#/home');
}
function tipoIndisponivel(nome){
  toast('Tipo indisponível no MVP', nome+' não está habilitado nesta versão do WorkFlow.', 'red');
}

/* =========================================================
   EPIC 3.1 — formulário
   ========================================================= */
function viewForm(q){
  const d = state.draft || {};
  tipoCodigoSel = d.tipoCodigo || tipoCodigoSel;
  opts = { abrangencia: d.abrangencia||opts.abrangencia, autorizacao: d.autorizacao||opts.autorizacao, local: d.local||opts.local };
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › <span onclick="go('#/nova?t=criacao')">Nova solicitação</span> › Criação de código</div>
  <div class="page-head"><div>
    <h1>Criação de Código TUSS/THSM</h1>
    <p class="page-sub">Os dados de identificação são capturados automaticamente da autenticação corporativa.</p>
  </div></div>

  <div class="stepper">
    <div class="step done"><span class="n">✓</span> Tipo de solicitação</div>
    <div class="step on"><span class="n">2</span> Preenchimento</div>
    <div class="step"><span class="n">3</span> Confirmação</div>
  </div>

  <div class="split">
    <div>
      <div class="card">
        <div class="card-head"><h2>Dados da solicitação</h2></div>
        <div class="card-body">
          <div class="field" id="f-tipoCodigo">
            <label>Tipo do código <span class="req">*</span></label>
            <div class="radio-row">
              <div class="radio-pill ${d.tipoCodigo==='TUSS'?'on':''}" onclick="setTipoCodigo('TUSS')">TUSS</div>
              <div class="radio-pill ${d.tipoCodigo==='THSM'?'on':''}" onclick="setTipoCodigo('THSM')">THSM</div>
            </div>
            <div class="err-msg">Selecione TUSS ou THSM.</div>
          </div>

          <div class="field" id="f-codigo" style="display:${d.tipoCodigo==='TUSS'?'block':'none'}">
            <label>Código <span class="req">*</span></label>
            <input type="text" inputmode="numeric" id="i-codigo" placeholder="Somente números" value="${esc(d.codigo||'')}">
            <div class="hint">Exibido apenas quando o tipo do código for TUSS.</div>
            <div class="err-msg">Informe o código — somente números.</div>
          </div>

          <div class="field" id="f-descricao">
            <label>Descrição <span class="req">*</span></label>
            <textarea id="i-descricao" maxlength="250" oninput="contaChars('i-descricao','c-descricao',250)" placeholder="Descreva o procedimento, material ou item a ser criado">${esc(d.descricao||'')}</textarea>
            <div class="hint">Até 250 caracteres — <span id="c-descricao">${(d.descricao||'').length}</span>/250. Não é aceito apenas espaços.</div>
            <div class="err-msg">Descrição obrigatória — não é aceito apenas espaços.</div>
          </div>

          <div class="grid-2">
            <div class="field" id="f-valor">
              <label>Valor <span class="req">*</span></label>
              <input type="text" id="i-valor" placeholder="0,00" value="${esc(d.valor||'')}">
              <div class="hint">Formato monetário pt-BR, maior ou igual a zero. <span class="tag-open">casas decimais a definir</span></div>
              <div class="err-msg">Informe um valor monetário válido (ex.: 1.480,50).</div>
              <div class="field sub" id="f-abrangencia" style="margin:12px 0 0">
                <label>Rede / Reembolso / Ambos <span class="req">*</span></label>
                <div class="radio-row">
                  ${['Rede','Reembolso','Ambos'].map(o=>`<div class="radio-pill ${d.abrangencia===o?'on':''}" onclick="setOpt('abrangencia','${o}')">${o}</div>`).join('')}
                </div>
                <div class="hint">Subcampo do Valor.</div>
                <div class="err-msg">Selecione Rede, Reembolso ou Ambos.</div>
              </div>
            </div>
            <div class="field" id="f-vigencia">
              <label>Data de vigência <span class="req">*</span></label>
              <input type="date" id="i-vigencia" value="${esc(d.vigencia||'')}">
              <div class="hint">Data retroativa é permitida.</div>
              <div class="err-msg">Informe a data de vigência.</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field" id="f-autorizacao">
              <label>Autorização</label>
              <div class="radio-row">
                ${['Sim','Não'].map(o=>`<div class="radio-pill ${d.autorizacao===o?'on':''}" onclick="setOpt('autorizacao','${o}')">${o}</div>`).join('')}
              </div>
              <div class="hint">Campo opcional. Se “Sim”, habilita o campo Local.</div>
            </div>
            <div class="field" id="f-local" style="display:${d.autorizacao==='Sim'?'block':'none'}">
              <label>Local <span class="req">*</span></label>
              <div class="radio-row">
                ${['Central','Sala de Hospitais'].map(o=>`<div class="radio-pill ${d.local===o?'on':''}" onclick="setOpt('local','${o}')">${o}</div>`).join('')}
              </div>
              <div class="hint">Habilitado apenas quando Autorização = Sim.</div>
              <div class="err-msg">Selecione Central ou Sala de Hospitais.</div>
            </div>
          </div>

          <div class="field" id="f-justificativa">
            <label>Justificativa da criação <span class="req">*</span></label>
            <textarea id="i-justificativa" placeholder="Explique a necessidade da criação do código">${esc(d.justificativa||'')}</textarea>
            <div class="err-msg">Justificativa obrigatória.</div>
          </div>

          <div class="field" id="f-espelho">
            <label>Código espelho</label>
            <input type="text" inputmode="numeric" id="i-espelho" placeholder="Somente números — opcional, pode ser preenchido pela Gestão de Tabelas" value="${esc(d.codigoEspelho||'')}">
            <div class="hint">Campo numérico opcional; não impede o envio. Validação contra o SSCF <span class="tag-open">decisão pendente</span></div>
            <div class="err-msg">O código espelho deve conter somente números.</div>
          </div>

          <div class="field">
            <label>Anexos</label>
            <div class="dropzone" onclick="addAnexo()">Clique para anexar arquivo (simulado no protótipo)</div>
            <div class="hint">Qualquer formato e sem limite de quantidade.</div>
            <div id="anexos-list" style="margin-top:10px">${(d.anexos||[]).map(a=>attachRow(a)).join('')}</div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" onclick="go('#/nova?t=criacao')">Voltar</button>
          <button class="btn btn-outline" onclick="salvarRascunho()">Salvar rascunho</button>
          <button class="btn btn-primary" onclick="validarEConfirmar()">Concluir</button>
        </div>
      </div>
    </div>

    <div>
      <div class="card">
        <div class="card-head"><h2>Identificação automática</h2></div>
        <div class="card-body">
          <dl class="dl">
            <dt>Solicitante</dt><dd>${esc(me().nome)}</dd>
            <dt>Matrícula</dt><dd class="mono">${esc(me().matricula)}</dd>
            <dt>E-mail</dt><dd>${esc(me().email)}</dd>
            <dt>Área</dt><dd>${esc(me().area)}</dd>
            <dt>Origem</dt><dd>Manual</dd>
            <dt>Data/hora</dt><dd>${dt(new Date().toISOString())}</dd>
          </dl>
          <p class="hint" style="margin-top:12px">Dados não editáveis pelo solicitante (RN2.13).</p>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Pontos em aberto nesta tela</h2></div>
        <div class="card-body">
          <p class="muted" style="font-size:12px;line-height:1.6;margin:0">
            · Salvamento de rascunho existe? <span class="tag-open">#2</span><br>
            · Máscara e casas decimais do Valor <span class="tag-open">#5</span><br>
            · Validação de Código e Código espelho no SSCF <span class="tag-open">RN3.9</span><br>
            · Comportamento se a área do usuário não for identificada <span class="tag-open">#3</span>
          </p>
        </div>
      </div>
    </div>
  </div>`;
}

let tipoCodigoSel = null;
let opts = { abrangencia:null, autorizacao:null, local:null };
function setTipoCodigo(v){
  tipoCodigoSel = v;
  document.querySelectorAll('#f-tipoCodigo .radio-pill').forEach(p=>p.classList.toggle('on', p.textContent.trim()===v));
  document.getElementById('f-tipoCodigo').classList.remove('error');
  const fc = document.getElementById('f-codigo');
  fc.style.display = v==='TUSS' ? 'block' : 'none';
  if(v!=='TUSS'){ document.getElementById('i-codigo').value=''; fc.classList.remove('error'); }
}
function setOpt(grupo, v){
  opts[grupo] = v;
  const box = document.getElementById('f-'+grupo);
  box.querySelectorAll('.radio-pill').forEach(p=>p.classList.toggle('on', p.textContent.trim()===v));
  box.classList.remove('error');
  if(grupo==='autorizacao'){
    const fl = document.getElementById('f-local');
    fl.style.display = v==='Sim' ? 'block' : 'none';
    if(v!=='Sim'){ opts.local=null; fl.classList.remove('error'); fl.querySelectorAll('.radio-pill').forEach(p=>p.classList.remove('on')); }
  }
}
function contaChars(inputId, contadorId, max){
  const el = document.getElementById(inputId);
  if(el.value.length>max) el.value = el.value.slice(0,max);
  document.getElementById(contadorId).textContent = el.value.length;
}
function attachRow(a){
  return `<div class="attach"><div class="ico">${esc((a.nome.split('.').pop()||'').toUpperCase().slice(0,4))}</div>
    <div><div>${esc(a.nome)}</div><div class="meta">${esc(a.tam)} · ${esc(a.autor)} · ${esc(a.em)}</div></div></div>`;
}
let anexosTmp = [];
function addAnexo(){
  const n = anexosTmp.length+1;
  const a = { nome:`documento_${n}.pdf`, tam:(120*n)+' KB', autor:me().nome, em:dt(new Date().toISOString()) };
  anexosTmp.push(a);
  document.getElementById('anexos-list').insertAdjacentHTML('beforeend', attachRow(a));
  toast('Anexo incluído', a.nome+' vinculado à demanda.','info');
}
function coleta(){
  return {
    tipoCodigo: tipoCodigoSel,
    codigo: (document.getElementById('i-codigo').value||'').trim(),
    abrangencia: opts.abrangencia,
    autorizacao: opts.autorizacao,
    local: opts.autorizacao==='Sim' ? opts.local : '',
    descricao: (document.getElementById('i-descricao').value||'').trim(),
    valorRaw: (document.getElementById('i-valor').value||'').trim(),
    vigencia: document.getElementById('i-vigencia').value,
    justificativa: (document.getElementById('i-justificativa').value||'').trim(),
    codigoEspelho: (document.getElementById('i-espelho').value||'').trim(),
    anexos: anexosTmp.slice()
  };
}
function parseValor(s){
  if(s==='') return NaN;
  if(!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(s)) return NaN;
  return parseFloat(s.replace(/\./g,'').replace(',','.'));
}
function validarEConfirmar(){
  const f = coleta();
  let ok = true;
  const mark = (id,bad)=>{ document.getElementById(id).classList.toggle('error', bad); if(bad) ok=false; };
  mark('f-tipoCodigo', !f.tipoCodigo);
  mark('f-codigo', f.tipoCodigo==='TUSS' && !/^\d+$/.test(f.codigo));
  mark('f-descricao', !f.descricao);
  mark('f-abrangencia', !f.abrangencia);
  mark('f-local', f.autorizacao==='Sim' && !f.local);
  mark('f-justificativa', !f.justificativa);
  mark('f-vigencia', !f.vigencia);
  mark('f-espelho', !!f.codigoEspelho && !/^\d+$/.test(f.codigoEspelho));
  const v = parseValor(f.valorRaw);
  mark('f-valor', isNaN(v) || v < 0);
  if(!ok){ toast('Envio bloqueado','Existem campos obrigatórios pendentes ou inválidos.','red'); return; }

  modal('Confirmar envio da solicitação', `
    <p style="margin-top:0">Confira os dados antes do envio definitivo. Após a confirmação os campos ficam
    bloqueados para edição até uma eventual devolutiva.</p>
    <dl class="dl">
      <dt>Tipo do código</dt><dd>${esc(f.tipoCodigo)}</dd>
      ${f.tipoCodigo==='TUSS'?`<dt>Código</dt><dd class="mono">${esc(f.codigo)}</dd>`:''}
      <dt>Descrição</dt><dd>${esc(f.descricao)}</dd>
      <dt>Valor</dt><dd>${brl(v)} · ${esc(f.abrangencia)}</dd>
      <dt>Autorização</dt><dd>${f.autorizacao?esc(f.autorizacao):'<span class="muted">não informado</span>'}${f.local?' — '+esc(f.local):''}</dd>
      <dt>Vigência</dt><dd>${d10(f.vigencia)}</dd>
      <dt>Código espelho</dt><dd>${f.codigoEspelho?esc(f.codigoEspelho):'<span class="muted">não informado</span>'}</dd>
      <dt>Anexos</dt><dd>${f.anexos.length||0}</dd>
      <dt>Solicitante</dt><dd>${esc(me().nome)} — ${esc(me().area)}</dd>
    </dl>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Voltar e revisar</button>
     <button class="btn btn-primary" id="btnConfirmar" onclick="criarDemanda()">Confirmar envio</button>`);
  window.__form = { ...f, valor:v };
}
function criarDemanda(){
  const b = document.getElementById('btnConfirmar');
  if(b.disabled) return;           // RN2.9 — duplo acionamento não gera duplicidade
  b.disabled = true; b.textContent = 'Enviando…';
  const f = window.__form;
  state.seq += 1;
  const numero = 'WF-2026-' + String(state.seq).padStart(6,'0');
  const agora = new Date().toISOString();
  state.demandas.unshift({
    numero, tipo:'Criação de Código', tipoCodigo:f.tipoCodigo, codigo:f.codigo, descricao:f.descricao, valor:f.valor,
    abrangencia:f.abrangencia, autorizacao:f.autorizacao||'', local:f.local||'',
    justificativa:f.justificativa, vigencia:f.vigencia, codigoEspelho:f.codigoEspelho, codigoCadastrado:'',
    solicitante:me().nome, area:me().area, abertura:agora, atualizacao:agora,
    status:'AGUARDANDO', responsavel:'—', origem:'Manual', slaHoras:24, anexos:f.anexos,
    historico:[{em:agora, quem:me().nome, area:me().area, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'}]
  });
  state.draft = null; anexosTmp = []; tipoCodigoSel = null; opts = { abrangencia:null, autorizacao:null, local:null };
  audit('Criação de demanda', numero, 'Origem Manual');
  notify('Abertura', me().nome, numero, 'Demanda registrada com sucesso.');
  notify('Entrada na fila', 'Gestão de Tabelas', numero, 'Nova demanda '+f.tipoCodigo+' aguardando análise.');
  save(); closeModal();
  toast('Demanda '+numero+' criada', 'Status: Aguardando Análise. Encaminhada à fila da Gestão de Tabelas.');
  go('#/demanda?n='+numero);
}
function salvarRascunho(){
  const f = coleta();
  state.draft = { ...f, valor:f.valorRaw, anexos:f.anexos };
  save();
  toast('Rascunho salvo','Nenhum protocolo foi gerado. Comportamento sujeito à decisão pendente #2.','info');
}

/* =========================================================
   Listas / fila
   ========================================================= */
function tabela(rows, opts){
  opts = opts||{};
  if(!rows.length) return `<div class="empty">Nenhuma demanda encontrada para os critérios informados.</div>`;
  return `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th>Número</th><th>Tipo de solicitação</th><th>Entrada</th><th>Código</th><th>Tipo do código</th><th>Descrição</th><th>Atributos</th>
      <th>Solicitante / Área</th><th>Abertura</th><th>Status</th><th>Responsável</th><th>SLA</th>${opts.extracao?'<th>Especialidade</th><th>Atributos alterados</th>':''}<th></th>
    </tr></thead><tbody>
    ${rows.map(d=>`<tr>
      <td><span class="num-link" onclick="go('#/demanda?n=${d.numero}')">${d.numero}</span></td>
      <td><span class="tipo-sol t-${tipoId(d)}">${TIPO_CURTO[tipoId(d)]}</span></td>
      <td>${entradaTag(d)}</td>
      <td class="mono">${esc(d.codigo||'—')}</td>
      <td>${d.tipoCodigo}</td>
      <td>${esc(d.descricao.length>52?d.descricao.slice(0,52)+'…':d.descricao)}</td>
      <td>${d.atributos?d.atributos.length:'—'}</td>
      <td>${esc(d.solicitante)}<div class="muted" style="font-size:11px">${esc(d.area)}</div></td>
      <td>${dt(d.abertura)}</td>
      <td>${badge(d.status)}</td>
      <td>${esc(d.responsavel)}</td>
      <td>${slaCell(d)}</td>
      ${opts.extracao?`<td style="text-align:center"><strong>${espIndicador(d)}</strong></td><td style="min-width:200px;font-size:12px">${esc(atrAlterados(d).join(', '))||'—'}</td>`:''}
      <td class="right">${acaoRapida(d)}</td>
    </tr>`).join('')}
    </tbody></table></div>`;
}
function acaoRapida(d){
  if(state.role==='solicitante' && d.status==='RESPOSTA' && d.solicitante===me().nome) return `<button class="btn btn-primary btn-sm" onclick="iniciarRevisao('${d.numero}')">Tratar devolutiva</button>`;
  return `<button class="btn btn-ghost btn-sm" onclick="go('#/demanda?n=${d.numero}')">Detalhar</button>`;
}

function viewLista(titulo, sub, rows){
  return `
  <div class="page-head"><div><h1>${titulo}</h1><p class="page-sub">${sub}</p></div>
  ${state.role==='solicitante'?`<button class="btn btn-primary" onclick="go('#/nova')">Nova solicitação</button>`:''}</div>
  <div class="card">${tabela(rows)}</div>`;
}

function viewFila(){
  const fila = state.demandas.filter(d=>d.status==='AGUARDANDO')
    .sort((a,b)=> new Date(a.abertura)-new Date(b.abertura));
  const outras = state.demandas.filter(d=>['ANALISE','RESPOSTA','REVISAO'].includes(d.status));
  return `
  <div class="page-head"><div><h1>Fila da Gestão de Tabelas</h1>
    <p class="page-sub">Ordenação padrão: demandas mais antigas primeiro (RN3.12).</p></div></div>
  <div class="card">
    <div class="card-head"><h2>Aguardando atribuição (${fila.length})</h2></div>
    ${tabela(fila)}
  </div>
  <div class="card">
    <div class="card-head"><h2>Em tratamento na área (${outras.length})</h2></div>
    ${tabela(outras)}
  </div>`;
}

function atribuir(n){
  const d = find(n);
  if(!podeAtuarGT()){ toast('Ação não permitida','Somente perfis da Gestão de Tabelas podem atribuir demandas.','red'); return; }
  if(d.status!=='AGUARDANDO'){ toast('Ação indisponível','A demanda não está aguardando atribuição.','red'); return; }
  const agora = new Date().toISOString();
  d.status='ANALISE'; d.responsavel=me().nome; d.atualizacao=agora; d.slaHoras=16;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'});
  audit('Atribuição', n, 'Responsável: '+me().nome);
  save();
  toast('Demanda atribuída','Você é o responsável por '+n+'. Status: Em Análise.');
  go('#/demanda?n='+n);
}

function reatribuir(n){
  const d = find(n);
  if(state.role!=='gestor'){ toast('Ação não permitida','Somente o Gestor pode atribuir ou reatribuir para outro responsável.','red'); return; }
  const opts = ['Carlos Lima','Marta Souza','Renata Alves'].filter(x=>x!==d.responsavel).map(x=>`<option>${x}</option>`).join('');
  const acao = d.status==='AGUARDANDO'?'Atribuir':'Reatribuir';
  modal(acao+' demanda '+n, `
    <p style="margin-top:0" class="muted">Disponível apenas para o perfil Gestor. Ação registrada no histórico (RN3.13).</p>
    ${d.status!=='AGUARDANDO'?`<p class="muted" style="font-size:12px">Responsável atual: <strong>${esc(d.responsavel)}</strong></p>`:''}
    <div class="field"><label>${d.status==='AGUARDANDO'?'Responsável':'Novo responsável'}</label><select id="i-resp"><option value="">Selecione…</option>${opts}</select></div>
    ${d.status!=='AGUARDANDO'?`<div class="callout info" style="margin-bottom:0"><div class="ct">Ponto em aberto</div>
      <p>O refinamento não define se é possível devolver a demanda para a fila (desatribuir) nem o status resultante.</p></div>`:''}`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="confirmarReatribuicao('${n}')">${acao}</button>`);
}
function confirmarReatribuicao(n){
  const d = find(n); const novo = document.getElementById('i-resp').value;
  if(!novo){ toast('Selecione o responsável','Escolha um analista para continuar.','red'); return; }
  const agora = new Date().toISOString();
  if(d.status==='AGUARDANDO'){
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Demanda atribuída pelo Gestor', de:'AGUARDANDO', para:'ANALISE', nota:'Responsável: '+novo});
    d.status='ANALISE'; d.slaHoras=16;
    audit('Atribuição', n, 'Responsável: '+novo);
  } else {
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Reatribuição de responsável', de:d.status, para:d.status, nota:'De '+d.responsavel+' para '+novo});
    audit('Reatribuição', n, 'Novo responsável: '+novo);
  }
  d.responsavel = novo; d.atualizacao = agora;
  save(); closeModal(); toast('Responsável definido','Responsável atual: '+novo); render();
}

/* =========================================================
   Detalhe da demanda
   ========================================================= */
function viewDemanda(n){
  const d = find(n);
  if(!d) return `<div class="empty">Demanda não encontrada.</div>`;
  const podeVer = state.role!=='solicitante' || d.solicitante===me().nome;
  if(!podeVer) return `<div class="card"><div class="empty">
    <strong>Acesso não autorizado.</strong><br><span class="muted">O perfil Solicitante visualiza apenas as demandas abertas pelo próprio usuário (RN10.1).</span>
    </div></div>`;
  const encerrada = ['CONCLUIDA','REJEITADA'].includes(d.status);

  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › <span onclick="go('${state.role==='solicitante'?'#/minhas':'#/fila'}')">Demandas</span> › ${d.numero}</div>
  <div class="page-head">
    <div><h1>${d.numero} <span style="font-size:14px">${badge(d.status)}</span></h1>
      <p class="page-sub">${d.tipo} · ${d.tipoCodigo} · origem ${d.origem} · aberta em ${dt(d.abertura)}</p></div>
    <div class="btn-row">${acoesDemanda(d)}</div>
  </div>

  ${d.devolutiva && ['RESPOSTA','REVISAO'].includes(d.status) ? `
    <div class="callout"><div class="ct">Ajustes solicitados pela Gestão de Tabelas</div>
      <p>${esc(d.devolutiva.texto)}</p>
      <p class="muted" style="font-size:12px;margin-top:8px">${esc(d.devolutiva.quem)} · ${esc(d.devolutiva.area)} · ${dt(d.devolutiva.em)}</p>
    </div>`:''}

  ${d.status==='CONCLUIDA'?`<div class="callout ok"><div class="ct">Demanda concluída</div>
      <p>Cadastro realizado${d.codigoCadastrado?` — código <strong>${esc(d.codigoCadastrado)}</strong>`:''}. Registro bloqueado para edição (RG02).</p></div>`:''}
  ${d.status==='REJEITADA'?`<div class="callout"><div class="ct">Demanda rejeitada</div>
      <p>${esc((d.historico.slice(-1)[0]||{}).nota||'Justificativa registrada no histórico.')}</p></div>`:''}

  <div class="split">
    <div>
      <div class="card">
        <div class="card-head"><h2>Dados da solicitação</h2>${encerrada||(podeAtuarGT()&&!ehResponsavel(d))?'<span class="muted" style="font-size:12px">somente leitura</span>':''}</div>
        <div class="card-body">
          <dl class="dl">
            <dt>Tipo do código</dt><dd>${d.tipoCodigo}</dd>
            ${d.codigo?`<dt>Código</dt><dd class="mono">${esc(d.codigo)}</dd>`:''}
            <dt>Descrição</dt><dd>${esc(d.descricao)}</dd>
            <dt>Valor</dt><dd>${brl(d.valor)}${d.abrangencia?' · '+esc(d.abrangencia):''}</dd>
            <dt>Autorização</dt><dd>${d.autorizacao?esc(d.autorizacao):'<span class="muted">não informado</span>'}${d.local?' — '+esc(d.local):''}</dd>
            <dt>Data de vigência</dt><dd>${d10(d.vigencia)}</dd>
            ${d.arquivoCarga?`<dt>Arquivo de carga</dt><dd>${esc(d.arquivoCarga)}</dd>`:''}
            <dt>Justificativa</dt><dd>${esc(d.justificativa)}</dd>
            <dt>Código espelho</dt><dd>${d.codigoEspelho?esc(d.codigoEspelho):'<span class="muted">não informado</span>'}
              ${ehResponsavel(d) ? `<button class="btn btn-outline btn-sm" style="margin-left:8px" onclick="editarEspelho('${d.numero}')">Editar</button>`:''}</dd>
            ${d.codigoCadastrado?`<dt>Código cadastrado</dt><dd><strong>${esc(d.codigoCadastrado)}</strong></dd>`:''}
          </dl>
        </div>
      </div>

      ${cardEspInclusao(d)}

      <div class="card">
        <div class="card-head"><h2>Anexos (${(d.anexos||[]).length})</h2></div>
        <div class="card-body">
          ${(d.anexos||[]).length? d.anexos.map(attachRow).join('') : '<p class="muted" style="margin:0">Nenhum anexo vinculado.</p>'}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Histórico e auditoria</h2><span class="muted" style="font-size:12px">ordem cronológica · imutável</span></div>
        <div class="card-body">
          <ul class="timeline">
            ${d.historico.map(h=>`<li>
              <div class="tl-when">${dt(h.em)}</div>
              <div class="tl-what">${esc(h.acao)}</div>
              <div class="tl-who">${esc(h.quem)} · ${esc(h.area)} · ${h.de==='—'?'':STATUS[h.de]?.label+' → '}${STATUS[h.para]?.label||''}</div>
              ${h.nota?`<div class="tl-note">${esc(h.nota)}</div>`:''}
              ${(h.diffs||[]).map(x=>`<div class="diff">${esc(x.campo)}: <span class="old">${esc(x.de)}</span> → <span class="new">${esc(x.para)}</span></div>`).join('')}
              ${espHistHtml(h)}
            </li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div class="card">
        <div class="card-head"><h2>Situação</h2></div>
        <div class="card-body">
          <dl class="dl">
            <dt>Status</dt><dd>${badge(d.status)}</dd>
            <dt>Responsável</dt><dd>${esc(d.responsavel)}</dd>
            <dt>Solicitante</dt><dd>${esc(d.solicitante)}</dd>
            <dt>Área</dt><dd>${esc(d.area)}</dd>
            <dt>Abertura</dt><dd>${dt(d.abertura)}</dd>
            <dt>Última atualização</dt><dd>${dt(d.atualizacao)}</dd>
            ${d.conclusao?`<dt>Encerramento</dt><dd>${dt(d.conclusao)}</dd>`:''}
            <dt>SLA</dt><dd>${slaCell(d)} <span class="tag-open">#7</span></dd>
          </dl>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Ciclos de retorno</h2></div>
        <div class="card-body">
          <p class="muted" style="margin:0;font-size:12px">
            Retornos registrados: <strong>${d.historico.filter(h=>h.acao.includes('Retorno')).length}</strong> ·
            Reenvios: <strong>${d.historico.filter(h=>h.acao.includes('Reenvio')).length}</strong><br>
            O protocolo é mantido em todos os ciclos (RG03).
          </p>
        </div>
      </div>
    </div>
  </div>`;
}

function acoesDemanda(d){
  const encerrada = ['CONCLUIDA','REJEITADA'].includes(d.status);
  if(encerrada) return `<button class="btn btn-ghost" onclick="go('#/consulta')">Voltar à consulta</button>`;
  if(podeAtuarGT()){
    const gestor = state.role==='gestor';
    const nota = t => `<span class="muted" style="font-size:12px;max-width:320px;text-align:right">${t}</span>`;
    if(d.status==='AGUARDANDO')
      return `<button class="btn btn-primary" onclick="atribuir('${d.numero}')">Atribuir para mim</button>
              ${gestor?`<button class="btn btn-outline" onclick="reatribuir('${d.numero}')">Atribuir</button>`:''}`;
    const btnReatribuir = gestor && d.status==='ANALISE' ? `<button class="btn btn-outline" onclick="reatribuir('${d.numero}')">Reatribuir</button>` : '';
    if(ehResponsavel(d))
      return `<button class="btn btn-warn" onclick="acaoRetornar('${d.numero}')">Retornar ao solicitante</button>
              <button class="btn btn-ok" onclick="acaoConcluir('${d.numero}')">Concluir cadastro</button>
              <button class="btn btn-outline" onclick="acaoRejeitar('${d.numero}')">Rejeitar cadastro</button>${btnReatribuir}`;
    if(d.status==='ANALISE')
      return gestor ? nota('Visão de revisão — dados somente leitura.')+btnReatribuir
                    : nota('Somente leitura — demanda sob responsabilidade de '+esc(d.responsavel)+'.');
    return nota('Somente leitura — aguardando ação do solicitante.');
  }
  if(state.role==='solicitante' && d.solicitante===me().nome){
    if(d.status==='RESPOSTA') return `<button class="btn btn-primary" onclick="iniciarRevisao('${d.numero}')">Tratar devolutiva</button>`;
    if(d.status==='REVISAO') return `<button class="btn btn-primary" onclick="go('#/revisao?n=${d.numero}')">Continuar revisão</button>`;
    return `<span class="muted" style="font-size:12px">Campos bloqueados até eventual devolutiva (RN3.6).</span>`;
  }
  return '';
}

function editarEspelho(n){
  const d = find(n);
  modal('Código espelho — '+n, `
    <div class="field"><label>Código espelho</label>
      <input type="text" id="i-esp2" value="${esc(d.codigoEspelho||'')}" placeholder="Ex.: TUSS-201010"></div>
    <p class="muted" style="font-size:12px;margin:0">A Gestão de Tabelas pode incluir ou alterar este campo (RN3.16).</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="salvarEspelho('${n}')">Salvar</button>`);
}
function salvarEspelho(n){
  const d = find(n); const novo = document.getElementById('i-esp2').value.trim();
  const agora = new Date().toISOString();
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Edição do código espelho', de:d.status, para:d.status,
    diffs:[{campo:'Código espelho', de:d.codigoEspelho||'(vazio)', para:novo||'(vazio)'}]});
  d.codigoEspelho = novo; d.atualizacao = agora;
  audit('Edição de campo', n, 'Código espelho');
  save(); closeModal(); toast('Código espelho atualizado','Alteração registrada no histórico.'); render();
}

/* ---------- EPIC 3.3 — decisões da GT ---------- */
function acaoRetornar(n){
  modal('Retornar ao solicitante — '+n, `
    <div class="field" id="f-ret"><label>Ajustes solicitados <span class="req">*</span></label>
      <textarea id="i-ret" placeholder="Detalhe o que o solicitante precisa corrigir ou complementar"></textarea>
      <div class="err-msg">O detalhamento dos ajustes é obrigatório (RN3.18).</div></div>
    <div class="field"><label>Anexo (opcional)</label>
      <div class="dropzone" onclick="toast('Anexo incluído','Arquivo simulado vinculado à devolutiva.','info')">Clique para anexar</div></div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-warn" onclick="confirmRetorno('${n}')">Confirmar retorno</button>`);
}
function confirmRetorno(n){
  const txt = document.getElementById('i-ret').value.trim();
  if(!txt){ document.getElementById('f-ret').classList.add('error'); toast('Ação bloqueada','Informe o detalhamento dos ajustes.','red'); return; }
  const d = find(n); const agora = new Date().toISOString();
  d.status='RESPOSTA'; d.responsavel=d.solicitante; d.atualizacao=agora; d.slaHoras=48;
  d.devolutiva={texto:txt, quem:me().nome, area:me().area, em:agora};
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Retorno ao solicitante', de:'ANALISE', para:'RESPOSTA', nota:txt});
  audit('Retorno ao solicitante', n, txt.slice(0,80));
  notify('Retorno', d.solicitante, n, 'Ajustes solicitados pela Gestão de Tabelas.');
  save(); closeModal(); toast('Demanda retornada','Solicitante notificado. Status: Aguardando Resposta do Solicitante.'); render();
}

function acaoConcluir(n){
  if(espBloqueioInclusao(find(n))) return;
  modal('Concluir cadastro — '+n, `
    <div class="callout info"><div class="ct">Confirmação explícita (RN3.19)</div>
      <p>Declare que o cadastro do código foi efetivamente realizado na tabela vigente.</p></div>
    <div class="field" id="f-conc">
      <label><input type="checkbox" id="i-conf" style="width:auto;margin-right:8px"> Confirmo que o cadastro foi realizado <span class="req">*</span></label>
      <div class="err-msg">É necessário confirmar a realização do cadastro.</div>
    </div>
    <div class="field"><label>Código cadastrado <span class="tag-open">campo sugerido — não previsto no refinamento</span></label>
      <input type="text" id="i-cod" placeholder="Ex.: TUSS-4.01.03.35-9"></div>
    <div class="field"><label>Observação (opcional)</label><textarea id="i-obs" placeholder="Observações da conclusão"></textarea></div>
    <div class="field"><label>Evidência (opcional) <span class="tag-open">#6</span></label>
      <div class="dropzone" onclick="toast('Evidência anexada','Arquivo simulado vinculado à conclusão.','info')">Clique para anexar evidência</div></div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-ok" onclick="confirmConclusao('${n}')">Concluir cadastro</button>`);
}
function confirmConclusao(n){
  if(!document.getElementById('i-conf').checked){
    document.getElementById('f-conc').classList.add('error');
    toast('Ação bloqueada','Confirme explicitamente a realização do cadastro.','red'); return;
  }
  const d = find(n); const agora = new Date().toISOString();
  const cod = document.getElementById('i-cod').value.trim();
  const obs = document.getElementById('i-obs').value.trim();
  d.status='CONCLUIDA'; d.atualizacao=agora; d.conclusao=agora; d.responsavel=me().nome; d.codigoCadastrado=cod;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Cadastro concluído', de:'ANALISE', para:'CONCLUIDA',
    nota:(cod?('Código '+cod+' cadastrado. '):'')+obs, esp:(d.especialidades||[]).map(e=>({cod:e.cod, acao:e.acao}))});
  audit('Conclusão de demanda', n, cod);
  notify('Conclusão', d.solicitante, n, 'Cadastro realizado.'+(cod?(' Código '+cod+'.'):''));
  save(); closeModal(); toast('Demanda concluída','Registro bloqueado para edição e disponível para consulta.'); render();
}

function acaoRejeitar(n){
  modal('Rejeitar cadastro — '+n, `
    <div class="field" id="f-rej"><label>Justificativa da rejeição <span class="req">*</span></label>
      <textarea id="i-rej" placeholder="Informe o motivo da rejeição"></textarea>
      <div class="err-msg">A justificativa é obrigatória (RN3.18).</div></div>
    <p class="muted" style="font-size:12px;margin:0">A demanda será encerrada sem cadastro e não poderá ser alterada (RG02).</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="confirmRejeicao('${n}')">Rejeitar cadastro</button>`);
}
function confirmRejeicao(n){
  const txt = document.getElementById('i-rej').value.trim();
  if(!txt){ document.getElementById('f-rej').classList.add('error'); toast('Ação bloqueada','Informe a justificativa da rejeição.','red'); return; }
  const d = find(n); const agora = new Date().toISOString();
  d.status='REJEITADA'; d.atualizacao=agora; d.conclusao=agora; d.responsavel=me().nome;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Cadastro rejeitado', de:'ANALISE', para:'REJEITADA', nota:txt});
  audit('Rejeição de demanda', n, txt.slice(0,80));
  notify('Rejeição', d.solicitante, n, txt.slice(0,90));
  save(); closeModal(); toast('Demanda rejeitada','Solicitante notificado com a justificativa.','red'); render();
}

/* =========================================================
   EPIC 3.4 — devolutiva / reenvio
   ========================================================= */
function iniciarRevisao(n){
  const d = find(n);
  if(d.status!=='RESPOSTA'){ go('#/revisao?n='+n); return; }
  const agora = new Date().toISOString();
  d.status='REVISAO'; d.atualizacao=agora;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Início da revisão pelo solicitante', de:'RESPOSTA', para:'REVISAO'});
  audit('Início de revisão', n, '');
  save();
  toast('Revisão iniciada','Status: Em Revisão pelo Solicitante. Campos liberados para edição.','info');
  go('#/revisao?n='+n);
}

function viewRevisao(n){
  const d = find(n);
  if(!d) return `<div class="empty">Demanda não encontrada.</div>`;
  return `
  <div class="breadcrumb"><span onclick="go('#/minhas')">Minhas demandas</span> › ${d.numero} › Revisão</div>
  <div class="page-head"><div><h1>Revisão da demanda ${d.numero}</h1>
    <p class="page-sub">Mesmo protocolo, histórico preservado. Múltiplos ciclos de retorno são permitidos (RN3.30).</p></div></div>

  <div class="callout"><div class="ct">Ajustes solicitados</div>
    <p>${esc(d.devolutiva?.texto||'—')}</p>
    <p class="muted" style="font-size:12px;margin-top:8px">${esc(d.devolutiva?.quem||'')} · ${esc(d.devolutiva?.area||'')} · ${dt(d.devolutiva?.em)}</p></div>

  <div class="split">
    <div class="card">
      <div class="card-head"><h2>Campos da solicitação</h2></div>
      <div class="card-body">
        <div class="callout info" style="margin-bottom:18px"><div class="ct">Conflito no refinamento</div>
          <p>RN3.23 diz que os demais campos <strong>não</strong> podem ser alterados; RN3.26 diz que o solicitante
          <strong>pode</strong> editar os campos originais. O protótipo adota a hipótese <em>edição liberada</em>.</p></div>

        <div class="grid-2">
          <div class="field"><label>Tipo do código</label>
            <select id="r-tipo"><option ${d.tipoCodigo==='TUSS'?'selected':''}>TUSS</option><option ${d.tipoCodigo==='THSM'?'selected':''}>THSM</option></select></div>
          <div class="field"><label>Valor</label>
            <input type="text" id="r-valor" value="${(d.valor||0).toFixed(2).replace('.',',')}"></div>
        </div>
        <div class="field"><label>Descrição</label><textarea id="r-desc">${esc(d.descricao)}</textarea></div>
        <div class="field"><label>Justificativa</label><textarea id="r-just">${esc(d.justificativa)}</textarea></div>
        <div class="field"><label>Data de vigência</label><input type="date" id="r-vig" value="${esc(d.vigencia)}"></div>

        <div class="field" id="f-resp"><label>Resposta aos ajustes <span class="req">*</span></label>
          <textarea id="r-resp" placeholder="Descreva o que foi corrigido ou complementado"></textarea>
          <div class="err-msg">Campo obrigatório para o reenvio (RN3.27).</div></div>

        <div class="field"><label>Novos anexos</label>
          <div class="dropzone" onclick="toast('Anexo incluído','Arquivo simulado vinculado ao reenvio.','info')">Clique para anexar</div></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="go('#/demanda?n=${d.numero}')">Voltar</button>
        <button class="btn btn-primary" onclick="reenviar('${d.numero}')">Reenviar demanda</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Valores atuais</h2></div>
      <div class="card-body"><dl class="dl">
        <dt>Tipo</dt><dd>${d.tipoCodigo}</dd>
        <dt>Valor</dt><dd>${brl(d.valor)}</dd>
        <dt>Vigência</dt><dd>${d10(d.vigencia)}</dd>
        <dt>Retornos</dt><dd>${d.historico.filter(h=>h.acao.includes('Retorno')).length}</dd>
      </dl>
      <p class="hint" style="margin-top:12px">Ao reenviar, o histórico registra campo, valor anterior, valor novo, usuário e data/hora (CA3.10).</p></div>
    </div>
  </div>`;
}

function reenviar(n){
  const d = find(n);
  const resp = document.getElementById('r-resp').value.trim();
  if(!resp){ document.getElementById('f-resp').classList.add('error'); toast('Reenvio bloqueado','Preencha a Resposta aos Ajustes.','red'); return; }
  const novo = {
    tipoCodigo: document.getElementById('r-tipo').value,
    descricao: document.getElementById('r-desc').value.trim(),
    justificativa: document.getElementById('r-just').value.trim(),
    vigencia: document.getElementById('r-vig').value,
    valor: parseValor(document.getElementById('r-valor').value.trim())
  };
  if(isNaN(novo.valor)){ toast('Valor inválido','Informe um valor monetário válido.','red'); return; }

  const diffs = [];
  if(novo.tipoCodigo!==d.tipoCodigo) diffs.push({campo:'Tipo do código', de:d.tipoCodigo, para:novo.tipoCodigo});
  if(novo.descricao!==d.descricao)   diffs.push({campo:'Descrição', de:d.descricao, para:novo.descricao});
  if(novo.justificativa!==d.justificativa) diffs.push({campo:'Justificativa', de:d.justificativa, para:novo.justificativa});
  if(novo.vigencia!==d.vigencia)     diffs.push({campo:'Data de vigência', de:d10(d.vigencia), para:d10(novo.vigencia)});
  if(novo.valor!==d.valor)           diffs.push({campo:'Valor', de:brl(d.valor), para:brl(novo.valor)});

  const agora = new Date().toISOString();
  Object.assign(d, novo);
  d.status='AGUARDANDO'; d.responsavel='—'; d.atualizacao=agora; d.slaHoras=24; d.devolutiva=null;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Reenvio após ajustes', de:'REVISAO', para:'AGUARDANDO', nota:resp, diffs});
  audit('Reenvio de demanda', n, diffs.length+' campo(s) alterado(s)');
  notify('Reenvio', 'Gestão de Tabelas', n, 'Solicitante respondeu aos ajustes.');
  save();
  toast('Demanda reenviada','Protocolo mantido. Status: Aguardando Análise. Campos novamente bloqueados.');
  go('#/demanda?n='+n);
}

/* =========================================================
   EPIC 10 — consulta e extração
   ========================================================= */
let filtros = { numero:'', tipoSol:'', codigo:'', tipoCodigo:'', status:'', solicitante:'', area:'', responsavel:'', de:'', ate:'', descricao:'', entrada:'', atributos:[], esp:'' };

function viewConsulta(){
  const rows = aplicarFiltros();
  const areas = [...new Set(state.demandas.map(d=>d.area))];
  const solis = [...new Set(state.demandas.map(d=>d.solicitante))];
  const resps = [...new Set(state.demandas.map(d=>d.responsavel))];
  return `
  <div class="page-head"><div><h1>Consulta e acompanhamento</h1>
    <p class="page-sub">Escopo de consulta conforme perfil: ${esc(me().perfil)}. Dashboard analítico está fora do MVP.</p></div>
    <div class="btn-row">
      <button class="btn btn-outline" onclick="limparFiltros()">Limpar filtros</button>
      ${podeExportar()?`<button class="btn btn-primary" onclick="exportar()">Exportar .xlsx</button>`:''}
    </div>
  </div>

  ${!podeExportar()?`<div class="callout info"><div class="ct">Permissão de extração</div>
    <p>A exportação está disponível somente para Analista e Gestor de Gestão de Tabelas; para o perfil ${esc(me().perfil)} o botão Exportar não é exibido.</p></div>`:''}

  <div class="card">
    <div class="card-head"><h2>Filtros</h2></div>
    <div class="card-body">
      <div class="filters">
        <div class="field"><label>Número da demanda</label><input type="text" id="fl-numero" value="${esc(filtros.numero)}" placeholder="Correspondência exata" oninput="setFiltro('numero',this.value)"></div>
        <div class="field"><label>Tipo de solicitação</label><select onchange="setFiltro('tipoSol',this.value)">
          <option value="">Todos</option>${Object.entries(TIPO_CURTO).map(([k,v])=>`<option value="${k}" ${filtros.tipoSol===k?'selected':''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label>Tipo de entrada</label><select onchange="setFiltro('entrada',this.value)">
          <option value="">Todas</option>${['Manual','Carga'].map(o=>`<option ${filtros.entrada===o?'selected':''}>${o}</option>`).join('')}</select></div>
        <div class="field"><label>Código</label><input type="text" inputmode="numeric" value="${esc(filtros.codigo)}" placeholder="Ex.: 40101010 (Enter)" oninput="this.value=this.value.replace(/\\D/g,'')" onchange="setFiltro('codigo',this.value)"></div>
        <div class="field"><label>Tipo do código</label><select id="fl-tc" onchange="setFiltro('tipoCodigo',this.value)">
          <option value="">Todos</option><option ${filtros.tipoCodigo==='TUSS'?'selected':''}>TUSS</option><option ${filtros.tipoCodigo==='THSM'?'selected':''}>THSM</option></select></div>
        <div class="field"><label>Status</label><select onchange="setFiltro('status',this.value)">
          <option value="">Todos</option>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${filtros.status===k?'selected':''}>${v.label}</option>`).join('')}</select></div>
        <div class="field"><label>Solicitante</label><select onchange="setFiltro('solicitante',this.value)">
          <option value="">Todos</option>${solis.map(s=>`<option ${filtros.solicitante===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label>Área solicitante</label><select onchange="setFiltro('area',this.value)">
          <option value="">Todas</option>${areas.map(s=>`<option ${filtros.area===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label>Responsável atual</label><select onchange="setFiltro('responsavel',this.value)">
          <option value="">Todos</option>${resps.map(s=>`<option ${filtros.responsavel===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label>Data inicial</label><input type="date" value="${esc(filtros.de)}" onchange="setFiltro('de',this.value)"></div>
        <div class="field"><label>Data final</label><input type="date" value="${esc(filtros.ate)}" onchange="setFiltro('ate',this.value)"></div>
      </div>
      ${filtroAtrHtml()}
      <div class="field" style="margin-top:12px;margin-bottom:0"><label>Descrição contém</label>
        <input type="text" value="${esc(filtros.descricao)}" oninput="setFiltro('descricao',this.value)" placeholder="Texto livre"></div>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h2>Resultados (${rows.length})</h2>
      <span class="muted" style="font-size:12px">Ordenação: mais recentes primeiro (RN10.4) · colunas Especialidade (S/N) e Atributos alterados ao final ${tagOnda('HU-E')} ${pendTag("HU-E PA01/PA02")}</span></div>
    ${tabela(rows,{extracao:true})}${pendConsulta()}
  </div>`;
}
function setFiltro(k,v){ filtros[k]=v; if(k==='tipoSol' && v!=='alteracao') filtros.atributos=[]; render(); }
function limparFiltros(){ filtros={numero:'',tipoSol:'',codigo:'',tipoCodigo:'',status:'',solicitante:'',area:'',responsavel:'',de:'',ate:'',descricao:'', entrada:'', atributos:[], esp:''}; render(); }
function aplicarFiltros(){
  return visiveis().filter(d=>{
    if(filtros.numero && d.numero!==filtros.numero.trim()) return false;
    if(filtros.tipoSol && tipoId(d)!==filtros.tipoSol) return false;
    if(filtros.codigo && !String(d.codigo||'').includes(filtros.codigo.trim())) return false;
    if(filtros.tipoCodigo && d.tipoCodigo!==filtros.tipoCodigo) return false;
    if(filtros.status && d.status!==filtros.status) return false;
    if(filtros.solicitante && d.solicitante!==filtros.solicitante) return false;
    if(filtros.area && d.area!==filtros.area) return false;
    if(filtros.responsavel && d.responsavel!==filtros.responsavel) return false;
    if(filtros.descricao && !d.descricao.toLowerCase().includes(filtros.descricao.toLowerCase())) return false;
    if(filtros.de && new Date(d.abertura) < new Date(filtros.de+'T00:00:00')) return false;
    if(filtros.ate && new Date(d.abertura) > new Date(filtros.ate+'T23:59:59')) return false;
    if(filtros.entrada && (d.origem||'Manual')!==filtros.entrada) return false;
    if(filtros.esp && espIndicador(d)!==filtros.esp) return false;
    if(filtros.tipoSol==='alteracao' && (filtros.atributos||[]).length && !(d.atributos||[]).some(a=>filtros.atributos.includes(a.nome))) return false;
    return true;
  }).sort((a,b)=> new Date(b.abertura)-new Date(a.abertura));
}

function exportar(){
  if(!podeExportar()){ toast('Ação não permitida','Seu perfil não possui permissão para exportar dados.','red'); return; }
  const rows = aplicarFiltros();
  if(!rows.length){ toast('Sem registros','Não há registros disponíveis para exportação.','red'); return; }
  const linhas = linhasExportacao(rows);
  confirmar('Exportar dados',
    `O arquivo será gerado com todos os registros encontrados conforme os filtros aplicados (${rows.length} demanda(s), ${linhas.length} linha(s) — alterações geram uma linha por Código + Atributo). Deseja continuar?`,
    'Exportar', ()=>{ closeModal(); gerarExportacao(rows, linhas); });
}
function linhasExportacao(rows){
  const out = [];
  rows.forEach(d=>{
    const ini = out.length;
    const base = [d.numero, d.tipo, d.codigo||'', d.tipoCodigo, d.descricao, d.solicitante, d.area, STATUS[d.status].label, d.responsavel,
      dt(d.abertura), dt(d.atualizacao), dt(d.conclusao)];
    const rej = d.status==='REJEITADA' ? ((d.historico.slice(-1)[0]||{}).nota||'') : '';
    const sla = ['CONCLUIDA','REJEITADA'].includes(d.status)?'':(d.slaHoras+'h');
    const exc = tipoId(d)==='exclusao' ? [d10(d.dataExclusao), d.dataEfetiva?d10(d.dataEfetiva):''] : ['',''];
    if(d.atributos && d.atributos.length)
      d.atributos.forEach(a=> out.push([...base, a.nome, a.de, a.para, SIT[a.decisao].label, a.justRecusa||'', a.por||'', a.decEm?dt(a.decEm):'', ...exc, rej, d.justificativa||'', sla]));
    else out.push([...base, '', '', '', '', '', '', '', ...exc, rej, d.justificativa||'', sla]);
    for(let k=ini;k<out.length;k++) out[k].d = d;
  });
  return out;
}
function gerarExportacao(rows, linhas){
  const cab = ['Protocolo','Tipo de solicitação','Código','Tipo do código','Descrição completa','Solicitante','Área','Status','Responsável atual','Abertura','Última atualização','Encerramento',
    'Atributo','De','Para','Situação do atributo','Justificativa da recusa','Decidido por','Data da decisão','Data da exclusão solicitada','Data efetiva da exclusão','Justificativa de rejeição','Justificativa da solicitação','SLA'];
  const maxA = Math.max(0, ...linhas.map(l=>atrAlterados(l.d).length));
  const maxE = Math.max(0, ...linhas.map(l=>(l.d.especialidades||[]).length));
  const cabX = cab.concat(['Tipo de entrada','Especialidade (S/N)'],
    Array.from({length:maxA},(_,i)=>'Atributo alterado '+(i+1)), Array.from({length:maxE},(_,i)=>'Especialidade trabalhada '+(i+1)));
  if(cabX.length > 16384){ toast('Limite do Excel','A extração excede o limite de colunas do Excel. Refine os filtros (tratamento a esclarecer — PA01 HU-G).','red'); return; }
  const dados = linhas.map(l=>{ const d = l.d; const at = atrAlterados(d);
    const es = (d.especialidades||[]).map(e=>espNome(e.cod)+' · '+ACAO_ESP[e.acao]+(tipoId(d)==='alteracao'&&e.parecer?' · '+SIT[e.parecer].label:''));
    return [...l, d.origem||'Manual', espIndicador(d), ...at, ...Array(maxA-at.length).fill(''), ...es, ...Array(maxE-es.length).fill('')]; });
  const ws = XLSX.utils.aoa_to_sheet([cabX, ...dados]);
  ws['!cols'] = cabX.map(h=>({ wch:Math.min(48, Math.max(12, h.length+2)) }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Extracao');
  const stamp = new Date().toISOString().slice(0,16).replace(/[-:T]/g,'');
  XLSX.writeFile(wb, `WorkFlow_TUSS_THSM_Demandas_${stamp}.xlsx`);
  const fil = Object.entries(filtros).filter(([,v])=>v).map(([k,v])=>k+'='+v).join(', ') || 'sem filtros';
  audit('Exportação de dados','Consulta', `${me().perfil} · ${rows.length} demanda(s) · ${linhas.length} linha(s) · filtros: ${fil}`);
  save();
  toast('Exportação concluída','Exportação concluída com sucesso. '+linhas.length+' linha(s) no arquivo .xlsx, com colunas de atributos e especialidades ao final do layout.','info');
}

/* =========================================================
   Notificações e auditoria
   ========================================================= */
function viewNotificacoes(){
  const alvo = state.role==='solicitante' ? me().nome : 'Gestão de Tabelas';
  const list = state.notificacoes.filter(n=> n.para===alvo || (state.role!=='solicitante' && n.para==='Gestão de Tabelas'));
  return `
  <div class="page-head"><div><h1>Notificações</h1>
    <p class="page-sub">Eventos do fluxo com protocolo e link para a demanda (Story 3.5).</p></div></div>
  <div class="card"><div class="card-body">
    ${list.length? list.map(n=>`<div class="notif-row">
      <div class="ni">${esc(n.evento[0])}</div>
      <div style="flex:1">
        <div><strong>${esc(n.evento)}</strong> · <span class="num-link" onclick="go('#/demanda?n=${n.demanda}')">${esc(n.demanda)}</span></div>
        <div class="muted" style="font-size:12px">${esc(n.texto)}</div>
        <div class="muted" style="font-size:11px;margin-top:2px">${esc(n.em)} · destinatário: ${esc(n.para)}</div>
      </div></div>`).join('') : '<p class="muted" style="margin:0">Nenhuma notificação para este perfil.</p>'}
  </div></div>
  <div class="card"><div class="card-head"><h2>Ponto em aberto</h2></div><div class="card-body">
    <p class="muted" style="margin:0;font-size:12px;line-height:1.6">
      O refinamento não prevê notificação para a Gestão de Tabelas na conclusão/rejeição, nem alertas de SLA
      estourado ou demanda parada. <span class="tag-open">a definir</span></p></div></div>`;
}

function viewAuditoria(){
  return `
  <div class="page-head"><div><h1>Trilha de auditoria</h1>
    <p class="page-sub">Registro imutável de criação, atribuição, edição, devolutiva, reenvio, conclusão, rejeição e exportação (item 7.2).</p></div></div>
  <div class="card">
    ${state.auditoria.length? `<div style="overflow-x:auto"><table>
      <thead><tr><th>Data/hora</th><th>Usuário</th><th>Perfil</th><th>Ação</th><th>Demanda</th><th>Detalhe</th></tr></thead>
      <tbody>${state.auditoria.map(a=>`<tr>
        <td>${dt(a.em)}</td><td>${esc(a.quem)}</td><td>${esc(a.perfil)}</td>
        <td>${esc(a.acao)}</td><td class="mono">${esc(a.alvo)}</td><td class="muted">${esc(a.detalhe)}</td></tr>`).join('')}
      </tbody></table></div>`
    : `<div class="empty">Nenhum evento registrado nesta sessão. Execute ações no protótipo para popular a trilha.</div>`}
  </div>`;
}

/* ---------- bootstrap ---------- */
$('#modalBackdrop').addEventListener('click', e=>{ if(e.target.id==='modalBackdrop') closeModal(); });
render();
