/* =========================================================
   v4 — Onda 2: especialidade × procedimento e carga por arquivo
   ========================================================= */
const MSG = {
  H01:'Nenhuma especialidade ativa foi localizada para o código ou a descrição informados.',
  H02:'Não foi possível consultar a tabela de especialidades no momento. Tente novamente mais tarde.',
  H03:'Selecione uma especialidade da lista. Não é permitido informar especialidade em texto livre.',
  DUP:'Esta especialidade já foi incluída na lista.',
  A01:'Relacione ao menos uma especialidade ao procedimento para concluir a análise de inclusão de código TUSS.',
  B01:'Preencha ao menos uma das abas (Atributos ou Especialidade) para concluir a solicitação.',
  C01:'Todas as abas com informações devem ser tratadas antes da conclusão.'
};
const ACAO_ESP = { ASSOCIACAO:'Associação', DESASSOCIACAO:'Desassociação' };
const ORIGEM_ESP = { SOLICITACAO:'Solicitação', ANALISE:'Análise' };
const normTx = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const acaoTag = a => `<span class="acao-esp ${a==='ASSOCIACAO'?'as':'ds'}">${ACAO_ESP[a]}</span>`;
const tagOnda = h => `<span class="tag-onda">Onda 2 · ${h}</span>`;
let destacarEsp = null;

/* ---------- HU-H: lista suspensa de especialidade (componente reutilizável) ---------- */
function ctxEsp(ctx){
  const [t, n, i] = ctx.split(':');
  if(t==='inc'){ const d = find(n); return { excluir:[], incluidos:(d.especialidades||[]).map(e=>e.cod), add:c=>espIncAdd(d,c) }; }
  if(t==='sol'){ return { excluir:espRelacionadas(altForm.cod.codigo), incluidos:altForm.espAssoc, add:c=>espSolAdd(c) }; }
  if(t==='ana'){ const d = find(n); return { excluir:espRelacionadas(d.codigo), incluidos:d.especialidades.filter(e=>e.acao==='ASSOCIACAO').map(e=>e.cod), add:c=>espAnaAdd(d,c) }; }
  if(t==='sub'){ const d = find(n); return { excluir:espRelacionadas(d.codigo), incluidos:d.especialidades.filter(e=>e.acao==='ASSOCIACAO').map(e=>e.cod), add:c=>espSubstituir(d,Number(i),c[0]), single:true }; }
}
function espPicker(id, ctx, semTodas){
  return `<div class="esp-pick">
    <div class="esp-pick-row">
      <div class="esp-in"><input type="text" id="epi-${id}" autocomplete="off" placeholder="Pesquisar especialidade por código ou descrição…"
        onfocus="espFiltrar('${id}','${ctx}')" oninput="espFiltrar('${id}','${ctx}')" onkeydown="espKey(event,'${id}','${ctx}')"
        onblur="setTimeout(()=>{const x=document.getElementById('epd-${id}'); if(x) x.hidden=true;},180)">
        <div class="esp-drop" id="epd-${id}" hidden></div></div>
      ${semTodas?'':`<button class="btn btn-outline btn-sm" onclick="espTodas('${ctx}')">Selecionar todas as ativas</button>`}
    </div>
    <div class="hint">Somente especialidades ativas da tabela de referência, em ordem alfabética · pesquisa por código ou descrição (sem grupo/subgrupo).</div>
  </div>`;
}
function espDisponiveis(ctx, q){
  const c = ctxEsp(ctx); const nq = normTx(q).trim();
  return ESP_ATIVAS().filter(e=>!c.excluir.includes(e.cod))
    .filter(e=>!nq || e.cod.includes(nq) || normTx(e.desc).includes(nq))
    .map(e=>({ ...e, ja:c.incluidos.includes(e.cod) }));
}
function espFiltrar(id, ctx){
  const box = document.getElementById('epd-'+id); const q = document.getElementById('epi-'+id).value;
  box.hidden = false;
  if(state.espIndisp){ box.innerHTML = `<div class="esp-msg err">${MSG.H02}</div>`; return; }
  const l = espDisponiveis(ctx, q);
  if(!l.length){ box.innerHTML = `<div class="esp-msg">${MSG.H01}</div>`; return; }
  box.innerHTML = l.map(e=>`<div class="esp-opt ${e.ja?'ja':''}" onmousedown="event.preventDefault();espSel('${id}','${ctx}','${e.cod}')">
    <span class="mono">${e.cod}</span><span>${esc(e.desc)}</span>${e.ja?'<em>já incluída</em>':''}</div>`).join('');
}
function espKey(ev, id, ctx){
  if(ev.key==='Escape'){ document.getElementById('epd-'+id).hidden = true; return; }
  if(ev.key!=='Enter') return;
  ev.preventDefault();
  if(state.espIndisp){ toast('Tabela indisponível', MSG.H02, 'red'); return; }
  const l = espDisponiveis(ctx, ev.target.value).filter(e=>!e.ja);
  const exato = l.find(e=>e.cod===ev.target.value.trim());
  if(exato || l.length===1) return espSel(id, ctx, (exato||l[0]).cod);
  toast('Seleção inválida', MSG.H03, 'red');
}
function espSel(id, ctx, cod){
  const c = ctxEsp(ctx);
  if(c.incluidos.includes(cod)){ toast('Especialidade duplicada', MSG.DUP, 'red'); return; }
  c.add([cod]);
}
function espTodas(ctx){
  if(state.espIndisp){ toast('Tabela indisponível', MSG.H02, 'red'); return; }
  const c = ctxEsp(ctx);
  const cods = ESP_ATIVAS().map(e=>e.cod).filter(x=>!c.excluir.includes(x) && !c.incluidos.includes(x));
  if(!cods.length){ toast('Nada a incluir','Todas as especialidades ativas já estão relacionadas ou incluídas.','info'); return; }
  c.add(cods);
  toast('Especialidades incluídas', cods.length+' especialidade(s) ativa(s) incluída(s)'+(c.excluir.length?' — as '+c.excluir.length+' já relacionadas ao procedimento foram desconsideradas.':'.'),'info');
}
function espHistHtml(h){
  if(!h.esp || !h.esp.length) return '';
  return `<div class="tl-esp">${h.esp.map(e=>`<div class="diff">Especialidade <strong>${esc(espNome(e.cod))}</strong> · ${acaoTag(e.acao)}${e.parecer?' · '+sitBadge(e.parecer):''}${e.de?` <span class="muted">(substitui ${esc(espNome(e.de))})</span>`:''}</div>`).join('')}</div>`;
}
function espToggleIndisp(){ state.espIndisp = !state.espIndisp; save(); render();
  toast('Simulação', state.espIndisp?'Consulta à tabela de especialidades indisponível.':'Consulta à tabela de especialidades restabelecida.','info'); }

/* ---------- HU-A: especialidades na análise de inclusão ---------- */
function cardEspInclusao(d){
  if(state.role==='solicitante') return '';
  const l = d.especialidades || (d.especialidades = []);
  const pode = ehResponsavel(d);
  const hl = destacarEsp===d.numero && !l.length;
  return `<div class="card ${hl?'card-hl':''}" id="card-esp">
    <div class="card-head"><h2>Especialidades relacionadas ao procedimento (${l.length})</h2>${tagOnda('HU-A')}</div>
    <div class="card-body">
      ${pode?espPicker('inc','inc:'+d.numero):''}
      ${l.length?`<div class="esp-list"><table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Tipo de ação</th>${pode?'<th class="right"><button class="btn btn-ghost btn-sm" onclick="espIncLimpar(\''+d.numero+'\')">Excluir todas</button></th>':''}</tr></thead>
        <tbody>${l.map(e=>`<tr><td class="mono">${e.cod}</td><td>${esc(espDef(e.cod).desc)}</td><td>${acaoTag(e.acao)}</td>
        ${pode?`<td class="right"><button class="btn btn-ghost btn-sm" onclick="espIncDel('${d.numero}','${e.cod}')">Excluir</button></td>`:''}</tr>`).join('')}</tbody></table></div>`
      :`<div class="sel-empty">${pode?'Nenhuma especialidade relacionada. Pesquise e selecione na lista acima.':'Nenhuma especialidade relacionada.'}</div>`}
      ${hl?`<div class="err-inline" style="margin-top:10px">${MSG.A01}</div>`:''}
      <p class="hint" style="margin:10px 0 0">${d.tipoCodigo==='TUSS'?'Obrigatório ao menos uma especialidade para concluir a inclusão de código TUSS.':'THSM: obrigatoriedade de especialidade a esclarecer <span class="tag-open">PA02</span> — no protótipo não é exigida.'}
        Justificativas: use a Observação da conclusão e os anexos existentes (sem campo específico). A lista é mantida ao sair e voltar para a análise.</p>
    </div></div>`;
}
function espIncAdd(d, cods){
  cods.forEach(c=>d.especialidades.push({ cod:c, acao:'ASSOCIACAO', origem:'ANALISE' }));
  d.atualizacao = new Date().toISOString(); destacarEsp = null;
  save(); if(cods.length===1) toast('Especialidade incluída', espNome(cods[0]),'info'); render();
}
function espIncDel(n, cod){
  const d = find(n); if(!ehResponsavel(d)) return;
  d.especialidades = d.especialidades.filter(e=>e.cod!==cod); save(); toast('Especialidade excluída', espNome(cod)+' retirada da lista.','info'); render();
}
function espIncLimpar(n){
  confirmar('Excluir todas','Deseja retirar todas as especialidades da lista?','Sim, excluir', ()=>{ const d = find(n); d.especialidades = []; save(); closeModal(); render(); });
}
function espBloqueioInclusao(d){
  if(d.tipoCodigo!=='TUSS' || (d.especialidades||[]).length) return false;
  destacarEsp = d.numero; render();
  const c = document.getElementById('card-esp'); if(c) c.scrollIntoView({behavior:'smooth', block:'center'});
  toast('Conclusão bloqueada', MSG.A01, 'red'); return true;
}

/* ---------- HU-B: aba Especialidade na solicitação de alteração ---------- */
function abasAltHtml(){
  const f = altForm; const ne = f.espAssoc.length + f.espDesassoc.length;
  return `<div class="tabs">
    <div class="tab ${f.aba!=='esp'?'on':''}" onclick="setAbaAlt('atr')">Atributos <span class="tab-n" id="cnt-itens">${f.itens.length}</span></div>
    <div class="tab ${f.aba==='esp'?'on':''}" onclick="setAbaAlt('esp')">Especialidade <span class="tab-n">${ne}</span></div>
    <div class="tabs-fill">${tagOnda('HU-B')}</div></div>`;
}
function setAbaAlt(a){ altForm.aba = a; render(); }
function espSolHtml(){
  const f = altForm; if(!f.cod) return '';
  const rel = espRelacionadas(f.cod.codigo);
  return `<div class="card-body">
    <div class="esp-sec"><h3>1. Especialidades já relacionadas ao procedimento (${rel.length})</h3>
      <p class="hint" style="margin-top:0">Marque as que devem ser desassociadas. As não marcadas são mantidas, sem necessidade de ação de “manter”.</p>
      ${rel.length?`<table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th style="width:150px">Desassociar</th></tr></thead><tbody>
      ${rel.map(c=>{ const on = f.espDesassoc.includes(c); return `<tr class="${on?'row-ds':''}"><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td>
        <td><label class="chk"><input type="checkbox" ${on?'checked':''} onchange="espSolToggle('${c}')"> ${on?acaoTag('DESASSOCIACAO'):'Manter'}</label></td></tr>`; }).join('')}
      </tbody></table>`:'<div class="sel-empty">O procedimento não possui especialidades relacionadas.</div>'}
      ${rel.length && f.espDesassoc.length===rel.length?'<div class="hint">Todas as especialidades marcadas para desassociação <span class="tag-open">PA02 — a esclarecer se é permitido</span></div>':''}
    </div>
    <div class="esp-sec"><h3>2. Incluir especialidades adicionais (${f.espAssoc.length})</h3>
      ${espPicker('sol','sol')}
      <p class="hint" style="margin-top:0">A lista não apresenta as especialidades já relacionadas ao procedimento. Itens incluídos podem ser excluídos até o envio.</p>
      ${f.espAssoc.length?`<div class="esp-list"><table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Tipo de ação</th><th class="right"><button class="btn btn-ghost btn-sm" onclick="altForm.espAssoc=[];render()">Excluir todas</button></th></tr></thead><tbody>
      ${f.espAssoc.map(c=>`<tr><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td><td>${acaoTag('ASSOCIACAO')}</td>
        <td class="right"><button class="btn btn-ghost btn-sm" onclick="espSolDel('${c}')">Excluir</button></td></tr>`).join('')}</tbody></table></div>`
      :'<div class="sel-empty">Nenhuma especialidade incluída.</div>'}
    </div>
    <p class="hint" style="margin-bottom:0">Justificativa e anexos: use a Justificativa Geral e os anexos existentes (sem campo específico para especialidade).</p>
  </div>`;
}
function espSolToggle(c){ const l = altForm.espDesassoc; const i = l.indexOf(c); i>=0 ? l.splice(i,1) : l.push(c); render(); }
function espSolAdd(cods){ altForm.espAssoc.push(...cods); if(cods.length===1) toast('Especialidade incluída', espNome(cods[0])+' · Associação','info'); render(); }
function espSolDel(c){ altForm.espAssoc = altForm.espAssoc.filter(x=>x!==c); toast('Especialidade excluída', espNome(c)+' retirada da solicitação.','info'); render(); }
function espResumoTabela(itens){
  if(!itens.length) return '';
  return `<table style="margin:0 0 16px"><thead><tr><th>Especialidade</th><th>Tipo de ação</th></tr></thead><tbody>
    ${itens.map(e=>`<tr><td>${esc(espNome(e.cod))}</td><td>${acaoTag(e.acao)}</td></tr>`).join('')}</tbody></table>`;
}
const espItensForm = () => altForm.espAssoc.map(c=>({cod:c, acao:'ASSOCIACAO'})).concat(altForm.espDesassoc.map(c=>({cod:c, acao:'DESASSOCIACAO'})));

/* ---------- HU-C: análise de alteração em abas ---------- */
const abaAna = {};
function cardAbasAnalise(d, gt){
  const e = d.especialidades || (d.especialidades = []);
  const aba = abaAna[d.numero] || (d.atributos.length ? 'atr' : 'esp');
  const pend = { atr:d.atributos.filter(x=>x.decisao==='PENDENTE').length, esp:e.filter(x=>x.origem==='SOLICITACAO' && x.parecer==='PENDENTE').length };
  const cont = { a:d.atributos.filter(x=>x.decisao==='APROVADO').length, r:d.atributos.filter(x=>x.decisao==='RECUSADO').length };
  const tab = (id, t, n, p) => `<div class="tab ${aba===id?'on':''}" onclick="abaAna['${d.numero}']='${id}';render()">${t} <span class="tab-n">${n}</span>${p?`<span class="tab-p" title="Itens pendentes">${p} pend.</span>`:''}</div>`;
  return `<div class="card" id="card-abas">
    <div class="tabs">${tab('atr','Atributos',d.atributos.length,pend.atr)}${tab('esp','Especialidade',e.length,pend.esp)}<div class="tabs-fill">${tagOnda('HU-C')}</div></div>
    ${aba==='atr'
      ? (d.atributos.length ? `<div class="tab-sub muted">${cont.a} aprovado(s) · ${cont.r} recusado(s) · ${pend.atr} pendente(s)</div>${tabelaAtributos(d, gt?'gt':'sol')}`
                            : '<div class="card-body"><div class="sel-empty">Nenhuma alteração de atributo nesta solicitação.</div></div>')
      : espAnaliseHtml(d, gt)}
  </div>`;
}
function espAnaliseHtml(d, gt){
  const pode = gt && ehResponsavel(d);
  const rel = espRelacionadas(d.codigo);
  const e = d.especialidades;
  const hl = destacarPend===d.numero;
  const situ = c => { const m = e.find(x=>x.cod===c && x.acao==='DESASSOCIACAO'); return m ? acaoTag('DESASSOCIACAO')+` <span class="muted" style="font-size:11px">${ORIGEM_ESP[m.origem]}</span>` : '<span class="muted">Mantida</span>'; };
  return `<div class="card-body">
    <div class="esp-sec"><h3>Especialidades já relacionadas ao procedimento (${rel.length})</h3>
      ${rel.length?`<table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Situação</th>${pode?'<th></th>':''}</tr></thead><tbody>
      ${rel.map(c=>`<tr><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td><td>${situ(c)}</td>
        ${pode?`<td class="right">${e.some(x=>x.cod===c)?'':`<button class="btn btn-ghost btn-sm" onclick="espAnaDesassociar('${d.numero}','${c}')">Desassociar</button>`}</td>`:''}</tr>`).join('')}</tbody></table>`
      :'<div class="sel-empty">O procedimento não possui especialidades relacionadas.</div>'}
    </div>
    <div class="esp-sec"><h3>Manutenções de especialidade (${e.length})</h3>
      ${e.length?`<div style="overflow-x:auto"><table class="atr-tbl"><thead><tr><th>Especialidade</th><th>Tipo de ação</th><th>Origem</th><th>Parecer</th>${pode?'<th class="right">Análise</th>':''}</tr></thead><tbody>
      ${e.map((x,i)=>`<tr class="${hl&&x.parecer==='PENDENTE'?'pend-hl':''}">
        <td><strong>${esc(espNome(x.cod))}</strong>${x.de?`<div class="muted" style="font-size:11px">alterada na análise — solicitado: ${esc(espNome(x.de))}</div>`:''}</td>
        <td>${acaoTag(x.acao)}</td><td>${ORIGEM_ESP[x.origem]}</td>
        <td>${sitBadge(x.parecer||'APROVADO')}${x.por?`<div class="muted" style="font-size:11px;margin-top:2px">${esc(x.por)} · ${dt(x.decEm)}</div>`:''}</td>
        ${pode?`<td class="right" style="white-space:nowrap">${x.origem==='SOLICITACAO'
          ? `<button class="btn-dec ok ${x.parecer==='APROVADO'?'on':''}" title="Aprovar" onclick="espParecer('${d.numero}',${i},'APROVADO')">✓</button>
             <button class="btn-dec no ${x.parecer==='RECUSADO'?'on':''}" title="Reprovar" onclick="espParecer('${d.numero}',${i},'RECUSADO')">✕</button>
             ${x.acao==='ASSOCIACAO'?`<button class="btn btn-ghost btn-sm" onclick="espAlterar('${d.numero}',${i})">Alterar</button>`:''}`
          : `<button class="btn btn-ghost btn-sm" onclick="espAnaDel('${d.numero}',${i})">Excluir</button>`}</td>`:''}
      </tr>`).join('')}</tbody></table></div>`:'<div class="sel-empty">Nenhuma manutenção de especialidade nesta solicitação.</div>'}
      ${hl&&e.some(x=>x.parecer==='PENDENTE')?`<div class="err-inline" style="margin-top:10px">${MSG.C01} Há especialidades pendentes de parecer.</div>`:''}
    </div>
    ${pode?`<div class="esp-sec"><h3>Incluir especialidade não solicitada</h3>${espPicker('ana','ana:'+d.numero)}
      <p class="hint" style="margin:0">Incluídas pelo analista ficam com origem “Análise” e podem ser excluídas até a finalização. Justificativa: Observação da conclusão e anexos existentes.</p></div>`:''}
  </div>`;
}
function espHist(d, acao, itens, nota){
  d.historico.push({ em:new Date().toISOString(), quem:me().nome, area:me().area, acao, de:'ANALISE', para:'ANALISE', esp:itens, nota });
  d.atualizacao = new Date().toISOString();
}
function espParecer(n, i, p){
  const d = find(n); if(!ehResponsavel(d)) return; const x = d.especialidades[i];
  if(x.parecer===p){ toast('Sem alteração','O parecer já está registrado.','info'); return; }
  const ant = x.parecer; x.parecer = p; x.por = me().nome; x.decEm = new Date().toISOString();
  espHist(d, (ant==='PENDENTE'?'Parecer da especialidade: ':'Parecer alterado: ')+SIT[p].label, [{cod:x.cod, acao:x.acao, parecer:p}]);
  audit('Parecer de especialidade', n, x.cod+' '+ACAO_ESP[x.acao]+': '+SIT[p].label);
  if(destacarPend===n && !pendentesAlt(d)) destacarPend = null;
  save(); toast('Parecer registrado', espNome(x.cod)+' · '+SIT[p].label); render();
}
function espAlterar(n, i){
  const d = find(n); const x = d.especialidades[i];
  modal('Alterar especialidade solicitada', `<dl class="dl" style="margin-bottom:12px"><dt>Solicitado</dt><dd>${esc(espNome(x.cod))} · ${acaoTag(x.acao)}</dd></dl>
    <div class="field" style="margin:0"><label>Nova especialidade <span class="req">*</span></label>${espPicker('sub','sub:'+n+':'+i,true)}</div>
    <p class="hint" style="margin-bottom:0">A alteração fica registrada no histórico (solicitado → definido na análise) com parecer Aprovado.</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>`);
}
function espSubstituir(d, i, cod){
  const x = d.especialidades[i]; const de = x.de || x.cod;
  x.de = de; x.cod = cod; x.parecer = 'APROVADO'; x.por = me().nome; x.decEm = new Date().toISOString();
  espHist(d, 'Manutenção de especialidade alterada', [{cod, acao:x.acao, parecer:'APROVADO', de}]);
  audit('Alteração de especialidade', d.numero, de+' → '+cod);
  save(); closeModal(); toast('Especialidade alterada', espNome(de)+' → '+espNome(cod)); render();
}
function espAnaAdd(d, cods){
  const agora = new Date().toISOString();
  cods.forEach(c=>d.especialidades.push({ cod:c, acao:'ASSOCIACAO', origem:'ANALISE', parecer:'APROVADO', por:me().nome, decEm:agora }));
  espHist(d, cods.length>1?'Especialidades incluídas na análise (seleção total)':'Especialidade incluída na análise', cods.map(c=>({cod:c, acao:'ASSOCIACAO'})));
  save(); if(cods.length===1) toast('Especialidade incluída', espNome(cods[0])+' · origem Análise','info'); render();
}
function espAnaDesassociar(n, c){
  const d = find(n); if(!ehResponsavel(d)) return;
  d.especialidades.push({ cod:c, acao:'DESASSOCIACAO', origem:'ANALISE', parecer:'APROVADO', por:me().nome, decEm:new Date().toISOString() });
  espHist(d, 'Especialidade desassociada na análise', [{cod:c, acao:'DESASSOCIACAO'}]);
  save(); toast('Desassociação registrada', espNome(c)+' · origem Análise','info'); render();
}
function espAnaDel(n, i){
  const d = find(n); if(!ehResponsavel(d)) return; const x = d.especialidades[i];
  d.especialidades.splice(i,1);
  espHist(d, 'Manutenção de especialidade excluída na análise', [{cod:x.cod, acao:x.acao}]);
  save(); toast('Item excluído', espNome(x.cod)+' retirada da análise.','info'); render();
}
const pendentesAlt = d => d.atributos.some(x=>x.decisao==='PENDENTE') || (d.especialidades||[]).some(x=>(x.origem==='SOLICITACAO' && x.parecer==='PENDENTE') || (typeof espFaltaJust==='function' && espFaltaJust(x)));

/* ---------- HU-E/F/G: indicadores para consulta extração ---------- */
function espIndicador(d){
  const l = d.especialidades||[];
  if(tipoId(d)==='criacao') return l.length ? 'S' : '—';
  return l.length ? 'S' : 'N';
}
const atrAlterados = d => (d.atributos||[]).map(a=>a.nome);

/* =========================================================
   Carga de solicitações por arquivo (Onda 2)
   ========================================================= */
let cargaRes = null;
const hashTx = s => { let h = 5381; for(let i=0;i<s.length;i++) h = ((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(16); };
const TIPO_LBL = { criacao:'Inclusão', alteracao:'Alteração', exclusao:'Exclusão' };

function viewCarga(){
  if(state.role!=='analista') return `<div class="card"><div class="empty"><strong>Acesso não autorizado.</strong><br>
    <span class="muted">A carga de solicitações por arquivo está disponível somente para o perfil Analista de Gestão de Tabelas.</span></div></div>`;
  const hist = state.cargas || [];
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › Carga de solicitações</div>
  <div class="page-head"><div><h1>Carga de solicitações por arquivo ${tagOnda('Processamento de arquivo')}</h1>
    <p class="page-sub">Envio de inclusões, alterações e exclusões de procedimento em lote. Uma aba por tipo de solicitação; carga total — ou todo o arquivo é processado, ou nada é processado.</p></div></div>
  ${cargaResultadoHtml()}
  <div class="split">
    <div>
      <div class="card"><div class="card-head"><h2>Enviar arquivo</h2></div><div class="card-body">
        <label class="dropzone" style="display:block">
          <input type="file" accept=".xlsx" hidden onchange="cargaUpload(this)">
          Clique para selecionar o arquivo <strong>.xlsx</strong> (até ${PARAM_CARGA.tamMaxMB} MB)</label>
        <p class="hint">Mínimo de <strong>${PARAM_CARGA.minLinhas} linhas</strong> somando todas as abas (parametrizável). Abaixo disso, utilize o formulário de solicitação.
          Padrão de nomenclatura do arquivo: <span class="tag-open">a definir</span></p>
        <h3 style="margin:16px 0 8px">Arquivos de exemplo</h3>
        <table><thead><tr><th>Cenário</th><th class="right">Ações</th></tr></thead><tbody>
          ${[['modelo','Modelo vazio (layout com as 3 abas)'],['valido','Válido — 12 linhas nas 3 abas'],['critica','Com críticas — campos inválidos e item inexistente'],['minimo','Abaixo do mínimo — 6 linhas']].map(([k,t])=>`<tr><td>${t}</td>
            <td class="right" style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="cargaBaixarExemplo('${k}')">Baixar</button>
            ${k!=='modelo'?`<button class="btn btn-outline btn-sm" onclick="cargaProcessarExemplo('${k}')">Enviar este arquivo</button>`:''}</td></tr>`).join('')}
        </tbody></table>
        <p class="hint" style="margin-bottom:0">Você pode baixar um exemplo, editar no Excel e enviar pelo campo acima. Reenviar um arquivo já processado é bloqueado (envio duplicado).</p>
      </div></div>
    </div>
    <div>
      <div class="card"><div class="card-head"><h2>Layout de entrada</h2></div><div class="card-body">
        ${Object.entries(ABAS_CARGA).map(([aba,c])=>`<div style="margin-bottom:10px"><strong>Aba “${aba}”</strong> <span class="muted">— ${c.rotulo}</span>
          <div class="muted" style="font-size:12px;line-height:1.6">${c.cols.join(' · ')}</div></div>`).join('')}
        <p class="hint" style="margin:0">Campos e regras equivalentes aos formulários manuais. Alteração: uma linha por código + atributo; as linhas do mesmo código geram uma única solicitação. Pacotes (capa e exclusão) ficam para a onda de Pacotes.
          Especialidade não é carregada por arquivo <span class="tag-open">a confirmar</span></p>
      </div></div>
    </div>
  </div>
  <div class="card"><div class="card-head"><h2>Histórico de processamentos (${hist.length})</h2><span class="muted" style="font-size:12px">somente processamentos concluídos · arquivo armazenado no FileNet P8</span></div>
    ${hist.length?`<div style="overflow-x:auto"><table><thead><tr><th>ID</th><th>Arquivo</th><th>Enviado em</th><th>Usuário</th><th>Linhas por tipo</th><th>Solicitações geradas</th><th>Documento P8</th><th></th></tr></thead><tbody>
    ${hist.map(h=>`<tr><td class="mono">${h.id}</td><td>${esc(h.arquivo)}</td><td>${dt(h.em)}</td><td>${esc(h.quem)}</td>
      <td style="font-size:12px">${Object.entries(h.linhasPorTipo).filter(([,v])=>v).map(([k,v])=>TIPO_LBL[k]+': '+v).join('<br>')}<div class="muted">Total: ${h.linhas}</div></td>
      <td style="font-size:12px">${h.solicitacoes} — ${h.demandas.map(n=>`<span class="num-link" onclick="go('#/demanda?n=${n}')">${n.slice(-6)}</span>`).join(', ')}</td>
      <td class="mono" style="font-size:12px">${h.p8}</td>
      <td class="right"><button class="btn btn-ghost btn-sm" onclick="cargaBaixarHist('${h.id}')">Baixar</button></td></tr>`).join('')}
    </tbody></table></div>`:'<div class="empty">Nenhum processamento realizado.</div>'}
  </div>`;
}
function cargaResultadoHtml(){
  const r = cargaRes; if(!r) return '';
  if(r.tipo==='ok') return `<div class="callout ok"><div class="ct">Processamento concluído — ${esc(r.arquivo)}</div>
    <p>${r.linhas} linha(s) processada(s) e ${r.demandas.length} solicitação(ões) gerada(s) na fila de análise com entrada “Carga”. Arquivo armazenado no P8 (${r.p8}).</p>
    <table style="margin-top:10px;background:#fff"><thead><tr><th>Tipo de solicitação</th><th>Linhas</th><th>Solicitações</th></tr></thead><tbody>
    ${Object.keys(TIPO_LBL).map(k=>`<tr><td>${TIPO_LBL[k]}</td><td>${r.linhasPorTipo[k]}</td><td>${r.porTipo[k]}</td></tr>`).join('')}</tbody></table>
    <p style="margin-top:10px">Solicitações: ${r.demandas.map(n=>`<span class="num-link" onclick="go('#/demanda?n=${n}')">${n}</span>`).join(', ')}</p></div>`;
  const cab = t => `<div class="callout"><div class="ct">${t} — ${esc(r.arquivo)}</div>`;
  if(r.tipo==='duplicado') return cab('Envio duplicado')+`<p>Este arquivo já foi processado em ${dt(r.prev.em)} por ${esc(r.prev.quem)} (${r.prev.id}). Nenhuma solicitação foi gerada.</p></div>`;
  if(r.tipo==='minimo') return cab('Quantidade abaixo do mínimo')+`<p>O arquivo possui ${r.linhas} linha(s) de solicitação. O processamento por arquivo exige no mínimo ${PARAM_CARGA.minLinhas} linhas, considerando todas as abas. Para quantidades menores, utilize o formulário de solicitação. Nenhuma solicitação foi gerada.</p></div>`;
  if(r.tipo==='erro') return cab('Arquivo inválido')+`<p>${esc(r.msg)}</p></div>`;
  return cab('Arquivo com críticas — nada foi processado')+`<p>Foram identificadas ${r.criticas.length} crítica(s). Corrija os itens abaixo e reenvie o arquivo completo (não há carga parcial). Este envio não fica registrado no histórico.</p>
    <div style="max-height:320px;overflow:auto;margin-top:10px"><table style="background:#fff"><thead><tr><th>Aba</th><th>Linha</th><th>Campo</th><th>Crítica identificada</th></tr></thead><tbody>
    ${r.criticas.map(c=>`<tr><td>${esc(c.aba)}</td><td>${c.linha}</td><td>${esc(c.campo)}</td><td>${esc(c.msg)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- arquivos de exemplo ---------- */
function linhasExemplo(k){
  const inc = (n,tc,cod,desc,valor,ab,aut,loc,vig,esp,just) => [tc,cod,desc,valor,ab,aut,loc,vig,esp,just];
  const S = { Inclusao:[], Alteracao:[], Exclusao:[] };
  if(k==='modelo') return S;
  S.Inclusao = [
    inc(1,'TUSS','20104227','Sessão de reabilitação vestibular','185,00','Rede','Não','','01/12/2026','','Novo código publicado pela ANS.'),
    inc(2,'TUSS','20104235','Avaliação de equilíbrio por posturografia','240,00','Ambos','Sim','Central','01/12/2026','','Novo código publicado pela ANS.'),
    inc(3,'TUSS','40901769','Elastografia hepática transitória','310,00','Rede','Sim','Sala de Hospitais','01/12/2026','40901130','Incorporação ao rol.'),
    inc(4,'THSM','','Kit de sutura mecânica linear 60 mm','1.240,00','Reembolso','Não','','15/12/2026','','Material homologado.')
  ];
  S.Alteracao = [
    ['30101012','Valor de Rede','260,00','Reajuste negociado com a rede.'],
    ['30101012','Day Clinic','S',''],
    ['30101012','Divulga Internet','S',''],
    ['41001010','Valor de Reembolso','350,00','Atualização da tabela de reembolso.'],
    ['41001010','Idade Inicial','2',''],
    ['70012345','Valor de Rede','7.600,00','Nova cotação do fornecedor.']
  ];
  S.Exclusao = [ ['31009336','01/01/2027','Procedimento absorvido por pacote cirúrgico aprovado.'], ['90099999','01/01/2027','Código descontinuado.'] ];
  if(k==='valido'){ S.Exclusao = S.Exclusao.slice(0,1); S.Inclusao.push(inc(5,'TUSS','20104243','Teste de impulso cefálico por vídeo','150,00','Rede','Não','','01/12/2026','','Novo código publicado pela ANS.')); }
  if(k==='critica'){
    S.Inclusao[1][6] = ''; S.Inclusao[2][3] = 'abc'; S.Inclusao[3][7] = '31/02/2026';
    S.Alteracao[1][2] = 'X'; S.Alteracao.push(['41001010','Especialidade','Neurologia','']);
  }
  if(k==='minimo'){ S.Inclusao = S.Inclusao.slice(0,2); S.Alteracao = S.Alteracao.slice(0,3); S.Exclusao = S.Exclusao.slice(0,1); }
  return S;
}
function wbDeLinhas(S){
  const wb = XLSX.utils.book_new();
  Object.entries(ABAS_CARGA).forEach(([aba,c])=>{
    const ws = XLSX.utils.aoa_to_sheet([c.cols, ...(S[aba]||[])]);
    ws['!cols'] = c.cols.map(h=>({ wch:Math.max(14, h.length+4) }));
    XLSX.utils.book_append_sheet(wb, ws, aba);
  });
  return wb;
}
const NOME_EX = { modelo:'SINT_carga_modelo.xlsx', valido:'SINT_carga_exemplo_valido.xlsx', critica:'SINT_carga_exemplo_criticas.xlsx', minimo:'SINT_carga_exemplo_abaixo_minimo.xlsx' };
function cargaBaixarExemplo(k){ XLSX.writeFile(wbDeLinhas(linhasExemplo(k)), NOME_EX[k]); }
function cargaProcessarExemplo(k){ processarCarga(NOME_EX[k], wbDeLinhas(linhasExemplo(k))); }
function cargaBaixarHist(id){
  const h = state.cargas.find(x=>x.id===id);
  if(h.exemplo){ XLSX.writeFile(wbDeLinhas(h.exemplo==='seed'?linhasSeed():linhasExemplo(h.exemplo)), h.arquivo); }
  else { XLSX.writeFile(wbDeLinhas(h.linhasArq), h.arquivo); }
  toast('Download do P8', h.arquivo+' ('+h.p8+')','info');
}
function linhasSeed(){
  return { Inclusao:[['TUSS','20104200','Sessão de terapia ocupacional em grupo','95,00','Rede','Não','','15/11/2026','','Carga consolidada de novos procedimentos de reabilitação.'],
    ['TUSS','20104219','Avaliação fonoaudiológica para disfagia','160,00','Rede','Não','','15/11/2026','','Carga consolidada de novos procedimentos de reabilitação.']],
    Alteracao:[['31009336','Valor de Rede','3.400,00','Revisão de parâmetros do procedimento (carga).'],['31009336','Day Clinic','S',''],['31009336','Idade Inicial','12',''],
      ['31009336','Carência','180',''],['31009336','Bilateralidade','S',''],['31009336','Divulga','S',''],['31009336','Divulga Internet','S','']],
    Exclusao:[['70012345','01/12/2026','Código substituído na revisão do rol (carga).']] };
}

/* ---------- processamento ---------- */
function cargaUpload(inp){
  const f = inp.files[0]; inp.value = '';
  if(!f) return;
  if(!/\.xlsx$/i.test(f.name)){ cargaRes = { tipo:'erro', arquivo:f.name, msg:'Formato não suportado. Envie um arquivo .xlsx no layout de carga.' }; render(); return; }
  if(f.size > PARAM_CARGA.tamMaxMB*1024*1024){ cargaRes = { tipo:'erro', arquivo:f.name, msg:'O arquivo excede o tamanho máximo de '+PARAM_CARGA.tamMaxMB+' MB.' }; render(); return; }
  const rd = new FileReader();
  rd.onload = e => { try{ processarCarga(f.name, XLSX.read(new Uint8Array(e.target.result), { type:'array', cellDates:true })); }
    catch(err){ cargaRes = { tipo:'erro', arquivo:f.name, msg:'Não foi possível ler o arquivo. Verifique se é um .xlsx válido.' }; render(); } };
  rd.readAsArrayBuffer(f);
}
const cel = v => v instanceof Date ? v.toLocaleDateString('pt-BR') : String(v??'').trim();
function dataBR(s){
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s); if(!m) return null;
  const d = new Date(+m[3], +m[2]-1, +m[1]); if(d.getDate()!==+m[1] || d.getMonth()!==+m[2]-1) return null;
  return m[3]+'-'+m[2]+'-'+m[1];
}
function processarCarga(nome, wb){
  const S = {}; const crit = []; const C = (aba,linha,campo,msg) => crit.push({aba,linha,campo,msg});
  wb.SheetNames.forEach(sn=>{
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header:1, defval:'', raw:false, dateNF:'dd/mm/yyyy' }).map(r=>r.map(cel));
    const def = ABAS_CARGA[sn];
    const dados = rows.slice(1).map((r,i)=>({ r, linha:i+2 })).filter(x=>x.r.some(v=>v!==''));
    if(!def){ if(dados.length) C(sn,'—','Aba','Aba não prevista no layout (use Inclusao, Alteracao ou Exclusao).'); return; }
    const cab = (rows[0]||[]).slice(0, def.cols.length);
    if(def.cols.some((c,i)=>normTx(cab[i])!==normTx(c))){ C(sn,1,'Cabeçalho','Layout inválido. Colunas esperadas: '+def.cols.join(', ')+'.'); return; }
    S[sn] = dados;
  });
  const conteudo = JSON.stringify(Object.entries(S).map(([k,v])=>[k, v.map(x=>x.r)]));
  const hash = hashTx(conteudo);
  const prev = (state.cargas||[]).find(h=>h.arquivo.toLowerCase()===nome.toLowerCase() || h.hash===hash);
  if(prev){ cargaRes = { tipo:'duplicado', arquivo:nome, prev }; audit('Carga de arquivo rejeitada', nome, 'Envio duplicado'); save(); render(); return; }
  const total = Object.values(S).reduce((s,v)=>s+v.length,0);
  if(!crit.length && total < PARAM_CARGA.minLinhas){ cargaRes = { tipo:'minimo', arquivo:nome, linhas:total }; render(); return; }

  const novas = [];
  /* Inclusão */
  const codsInc = {};
  (S.Inclusao||[]).forEach(({r,linha})=>{
    const [tc,cod,desc,valor,ab,aut,loc,vig,espelho,just] = r; const A = 'Inclusao';
    if(!['TUSS','THSM'].includes(tc.toUpperCase())) C(A,linha,'Tipo do código','Informe TUSS ou THSM.');
    if(tc.toUpperCase()==='TUSS' && !/^\d+$/.test(cod)) C(A,linha,'Código','Código TUSS obrigatório, somente números.');
    if(tc.toUpperCase()==='TUSS' && cod && codsInc[cod]) C(A,linha,'Código','Código repetido no arquivo (linha '+codsInc[cod]+').');
    if(tc.toUpperCase()==='TUSS' && BASE_SSCF[cod]) C(A,linha,'Código','Código já existente na base; utilize a aba Alteracao.');
    codsInc[cod] = codsInc[cod] || linha;
    if(!desc) C(A,linha,'Descrição','Campo obrigatório.');
    const v = parseValor(valor); if(isNaN(v) || v<0) C(A,linha,'Valor','Valor inválido. Use o padrão 1.234,56.');
    if(!['Rede','Reembolso','Ambos'].includes(ab)) C(A,linha,'Abrangência','Informe Rede, Reembolso ou Ambos.');
    if(aut && !['Sim','Não'].includes(aut)) C(A,linha,'Autorização','Informe Sim ou Não.');
    if(aut==='Sim' && !['Central','Sala de Hospitais'].includes(loc)) C(A,linha,'Local de Autorização','Obrigatório quando Autorização = Sim (Central ou Sala de Hospitais).');
    const dv = dataBR(vig); if(!dv) C(A,linha,'Data de vigência','Data inválida. Use dd/mm/aaaa.');
    if(espelho && !/^\d+$/.test(espelho)) C(A,linha,'Código espelho','Somente números.');
    if(!just) C(A,linha,'Justificativa','Campo obrigatório.');
    novas.push({ t:'criacao', tc:tc.toUpperCase(), cod, desc, valor:v, ab, aut, loc:aut==='Sim'?loc:'', vig:dv, espelho, just });
  });
  /* Alteração — agrupada por código */
  const grupos = {};
  (S.Alteracao||[]).forEach(({r,linha})=>{
    const [cod,nomeAtr,para,just] = r; const A = 'Alteracao';
    if(!BASE_SSCF[cod]){ C(A,linha,'Código','Código inexistente na base SSCF.'); return; }
    const g = grupos[cod] || (grupos[cod] = { cod, itens:[], just:'', linha });
    if(just && !g.just) g.just = just;
    if(nomeAtr==='Especialidade'){ C(A,linha,'Atributo','Especialidade não é atributo De/Para; é tratada na aba Especialidade do formulário.'); return; }
    if(!atrDef(nomeAtr)){ C(A,linha,'Atributo','Atributo inexistente na lista de atributos.'); return; }
    if(g.itens.some(x=>x.nome===nomeAtr)){ C(A,linha,'Atributo','Atributo repetido para o mesmo código.'); return; }
    const de = valorAtual(cod, nomeAtr); const err = validarPara({ nome:nomeAtr, de, para });
    if(err) C(A,linha,'Para',err);
    g.itens.push({ nome:nomeAtr, de, para, decisao:'PENDENTE' });
  });
  Object.values(grupos).forEach(g=>{
    if(!g.just) C('Alteracao',g.linha,'Justificativa Geral','Informe a Justificativa Geral em ao menos uma linha do código '+g.cod+'.');
    const loc = g.itens.find(x=>x.nome==='Local de Autorização'); const aut = g.itens.find(x=>x.nome==='Autorização');
    if(loc && (aut?aut.para:valorAtual(g.cod,'Autorização'))!=='Sim') C('Alteracao',g.linha,'Local de Autorização','Local de Autorização exige Autorização = Sim.');
    if(g.itens.length) novas.push({ t:'alteracao', ...g });
  });
  /* Exclusão */
  (S.Exclusao||[]).forEach(({r,linha})=>{
    const [cod,data,just] = r; const A = 'Exclusao';
    if(!BASE_SSCF[cod]) C(A,linha,'Código','Exclusão de item inexistente: código não localizado na base SSCF.');
    else if(demandaAtivaExclusao(cod)) C(A,linha,'Código','Já existe solicitação de exclusão em andamento para o código ('+demandaAtivaExclusao(cod).numero+').');
    const dx = dataBR(data); if(!dx) C(A,linha,'Data da exclusão','Data inválida. Use dd/mm/aaaa.');
    if(!just) C(A,linha,'Justificativa','Campo obrigatório.');
    novas.push({ t:'exclusao', cod, data:dx, just });
  });
  if(!crit.length && total < PARAM_CARGA.minLinhas){ cargaRes = { tipo:'minimo', arquivo:nome, linhas:total }; render(); return; }
  if(crit.length){ cargaRes = { tipo:'critica', arquivo:nome, criticas:crit }; audit('Carga de arquivo com críticas', nome, crit.length+' crítica(s) · nada processado'); save(); render(); return; }

  const agora = new Date().toISOString(); const nums = [];
  const base = () => { state.seq += 1; const numero = 'WF-2026-'+String(state.seq).padStart(6,'0'); nums.push(numero);
    return { numero, solicitante:me().nome, area:me().area, abertura:agora, atualizacao:agora, status:'AGUARDANDO', responsavel:'—', origem:'Carga', arquivoCarga:nome,
      slaHoras:24, anexos:[], historico:[{em:agora, quem:me().nome, area:me().area, acao:'Abertura da demanda por carga de arquivo', de:'—', para:'AGUARDANDO', nota:'Arquivo '+nome}] }; };
  novas.forEach(n=>{
    let d;
    if(n.t==='criacao') d = { ...base(), tipo:'Criação de Código', tipoCodigo:n.tc, codigo:n.cod, descricao:n.desc, valor:n.valor, abrangencia:n.ab, autorizacao:n.aut, local:n.loc,
      vigencia:n.vig, codigoEspelho:n.espelho, codigoCadastrado:'', justificativa:n.just, especialidades:[] };
    else if(n.t==='alteracao') d = { ...base(), tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:BASE_SSCF[n.cod].tipo, codigo:n.cod, descricao:BASE_SSCF[n.cod].descricao,
      justificativa:n.just, atributos:n.itens, especialidades:[] };
    else d = { ...base(), tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', tipoCodigo:BASE_SSCF[n.cod].tipo, codigo:n.cod, descricao:BASE_SSCF[n.cod].descricao,
      dataExclusao:n.data, justificativa:n.just };
    state.demandas.unshift(d);
  });
  const cnt = t => novas.filter(n=>n.t===t).length;
  const lin = { criacao:(S.Inclusao||[]).length, alteracao:(S.Alteracao||[]).length, exclusao:(S.Exclusao||[]).length };
  state.cargas = state.cargas || [];
  const id = 'CG-'+String(state.cargas.length+1).padStart(4,'0');
  const p8 = 'P8-DOC-2026-10-'+String(731+state.cargas.length).padStart(6,'0');
  const linhasArq = Object.fromEntries(Object.entries(S).map(([k,v])=>[k, v.map(x=>x.r)]));
  const h = { id, arquivo:nome, em:agora, quem:me().nome, linhas:total, linhasPorTipo:lin, porTipo:{ criacao:cnt('criacao'), alteracao:cnt('alteracao'), exclusao:cnt('exclusao') },
    solicitacoes:nums.length, demandas:nums, p8, hash, linhasArq };
  state.cargas.unshift(h);
  notify('Entrada na fila', 'Gestão de Tabelas', nums[0], nums.length+' solicitação(ões) recebida(s) por carga de arquivo.');
  audit('Carga de arquivo processada', nome, total+' linha(s) · '+nums.length+' solicitação(ões) · '+p8);
  cargaRes = { tipo:'ok', arquivo:nome, ...h };
  save(); render(); window.scrollTo(0,0);
}

/* ---------- apoio às telas existentes ---------- */
const entradaTag = d => `<span class="ent ${d.origem==='Carga'?'carga':''}">${esc(d.origem||'Manual')}</span>`;
function espConclusaoTabela(d){
  const e = d.especialidades||[]; if(!e.length) return '';
  return `<table style="margin-bottom:14px"><thead><tr><th>Especialidade</th><th>Tipo de ação</th><th>Origem</th><th>Parecer</th></tr></thead><tbody>
    ${e.map(x=>`<tr><td>${esc(espNome(x.cod))}</td><td>${acaoTag(x.acao)}</td><td>${ORIGEM_ESP[x.origem]}</td><td>${sitBadge(x.parecer||'APROVADO')}</td></tr>`).join('')}</tbody></table>`;
}
function filtroAtrHtml(){
  if(filtros.tipoSol!=='alteracao') return `<p class="hint" style="margin:10px 0 0">Filtro por atributo alterado: disponível quando o Tipo de solicitação for “Alteração de Atributos”. ${tagOnda('HU-F')}</p>`;
  const sel = filtros.atributos || (filtros.atributos = []);
  return `<div class="field" style="margin-top:12px;margin-bottom:0"><label>Atributos alterados ${tagOnda('HU-F')} <span class="muted" style="font-weight:400">— retorna as solicitações que contêm qualquer um dos atributos selecionados (critério OU), junto com o período informado</span></label>
    <div class="atr-box"><div class="atr-tools"><input type="text" placeholder="Filtrar atributos…" oninput="filtrarListaAtrF(this.value)">
      <span class="muted" style="font-size:12px;white-space:nowrap">${sel.length} selecionado(s)</span>${sel.length?`<button class="btn btn-ghost btn-sm" onclick="filtros.atributos=[];render()">Limpar</button>`:''}</div>
    <div class="atr-list" id="atrf-list">${ATRIBUTOS.map(a=>`<label class="atr-opt" data-n="${esc(normTx(a.nome))}"><input type="checkbox" ${sel.includes(a.nome)?'checked':''} onchange="toggleFiltroAtr('${esc(a.nome)}')"><span>${esc(a.nome)}</span></label>`).join('')}</div></div>
    <div class="hint">“Especialidade” como opção do filtro <span class="tag-open">PA01 — a confirmar</span></div></div>`;
}
function filtrarListaAtrF(q){ const n = normTx(q); document.querySelectorAll('#atrf-list .atr-opt').forEach(l=>l.style.display = l.dataset.n.includes(n) ? '' : 'none'); }
function toggleFiltroAtr(nome){ const l = filtros.atributos = filtros.atributos||[]; const i = l.indexOf(nome); i>=0 ? l.splice(i,1) : l.push(nome); render(); }
function homeOnda2(){
  const L = n => `<span class="num-link" onclick="go('#/demanda?n=${n}')">${n}</span>`;
  return `<div class="card">
    <div class="card-head"><h2>Novo nesta versão — Onda 2</h2><span class="tag-onda">Especificação v0.4 · direcionadores 29/10</span></div>
    <div class="card-body"><div class="grid-2">
      <div><h3>Especialidade × procedimento</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
        · <strong>HU-A</strong> (Carlos): ${L('WF-2026-000142')} inclusão TUSS sem especialidade — concluir fica bloqueado até relacionar ao menos uma. ${L('WF-2026-000139')} THSM (obrigatoriedade a esclarecer). Renata: ${L('WF-2026-000137')}.<br>
        · <strong>HU-B</strong> (Solicitante): Nova solicitação › Alteração (código 40101010) › aba <em>Especialidade</em>: desassociar as relacionadas e incluir novas; basta preencher uma das abas.<br>
        · <strong>HU-C</strong> (Carlos): ${L('WF-2026-000143')} com as duas abas — aprovar ✓, reprovar ✕, alterar e incluir especialidade não solicitada. ${L('WF-2026-000144')} só com a aba Especialidade (aguardando atribuição).<br>
        · <strong>HU-D</strong>: histórico com código, descrição e tipo de ação — ${L('WF-2026-000145')} concluída.<br>
        · <strong>HU-E/F/G</strong>: Consulta e extração com colunas Especialidade (S/N) e Atributos alterados, filtro por atributo e exportação .xlsx ampliada.</p></div>
      <div><h3>Carga de solicitações por arquivo</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
        · Perfil <strong>Analista</strong> › menu <em>Carga de solicitações</em> (o Solicitante não tem acesso).<br>
        · Arquivos de exemplo: válido, com críticas (aba, linha e crítica em tela) e abaixo do mínimo de ${PARAM_CARGA.minLinhas} linhas.<br>
        · Carga total: com qualquer crítica nada é processado. Reenvio do mesmo arquivo é bloqueado.<br>
        · Coluna <em>Entrada</em> (Manual/Carga) na fila; histórico só dos processamentos concluídos, com download do arquivo armazenado no P8.<br>
        · Exemplos já carregados: ${['146','147','149','148'].map(n=>L('WF-2026-000'+n)).join(', ')}.</p>
        <p style="margin:12px 0 0"><button class="btn btn-ghost btn-sm" onclick="espToggleIndisp()">${state.espIndisp?'Restabelecer':'Simular indisponibilidade da'} tabela de especialidades</button></p></div>
    </div></div></div>`;
}
