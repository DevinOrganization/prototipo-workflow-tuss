/* =========================================================
   Versão 6: ajustes da Especificação Onda 2 v0.6 (03/11/26)
   Pontos pendentes de definição destacados em vermelho
   ========================================================= */
const pend = (ref, txt) => `<div class="pend-def"><strong>Pendente de definição · ${ref}</strong> — ${txt}</div>`;
const pendTag = ref => `<span class="pend-tag">${ref} · a definir</span>`;
const MSGREF = { H01:'HU-H MSG01', H02:'HU-H MSG02', DUP:'HU-A MSG02 / HU-B MSG03 / HU-C MSG02', A01:'HU-A MSG01', B01:'HU-B MSG01', C01:'HU-C MSG01' };
const provTx = k => `Texto provisório: ${MSGREF[k]} sem texto definido na especificação`;
const msgHtml = k => `${MSG[k]}<span class="msg-prov">${provTx(k)}</span>`;

function toast(title, body, kind){
  const el = document.createElement('div');
  el.className = 'toast ' + (kind||'');
  const k = Object.keys(MSGREF).find(x=>String(body||'').includes(MSG[x]));
  el.innerHTML = `<div class="tt">${esc(title)}</div><div class="tb">${esc(body)}</div>${k?`<div class="msg-prov">${provTx(k)}</div>`:''}`;
  $('#toastWrap').appendChild(el);
  setTimeout(()=>el.remove(), k?7000:5200);
}

/* ---------- HU-H ---------- */
function espPicker(id, ctx, semTodas){
  return `<div class="esp-pick">
    <div class="esp-pick-row">
      <div class="esp-in"><input type="text" id="epi-${id}" autocomplete="off" placeholder="Pesquisar especialidade por código ou descrição…"
        onfocus="espFiltrar('${id}','${ctx}')" oninput="espFiltrar('${id}','${ctx}')" onkeydown="espKey(event,'${id}','${ctx}')"
        onblur="setTimeout(()=>{const x=document.getElementById('epd-${id}'); if(x) x.hidden=true;},180)">
        <div class="esp-drop" id="epd-${id}" hidden></div></div>
      ${semTodas?'':`<button class="btn btn-outline btn-sm" onclick="espTodas('${ctx}')">Selecionar todas as ativas</button>`}
    </div>
    <div class="hint">Somente especialidades ativas da tabela de referência, em ordem alfabética · pesquisa por código ou descrição (sem grupo/subgrupo).
      ${pendTag('HU-H PA01 fonte/serviço')} ${pendTag('HU-H PA02 indicador ativo/inativo')}</div>
  </div>`;
}
function espFiltrar(id, ctx){
  const box = document.getElementById('epd-'+id); const q = document.getElementById('epi-'+id).value;
  box.hidden = false;
  if(state.espIndisp){ box.innerHTML = `<div class="esp-msg err">${msgHtml('H02')}</div>`; return; }
  const l = espDisponiveis(ctx, q);
  if(!l.length){ box.innerHTML = `<div class="esp-msg">${msgHtml('H01')}</div>`; return; }
  box.innerHTML = l.map(e=>`<div class="esp-opt ${e.ja?'ja':''}" onmousedown="event.preventDefault();espSel('${id}','${ctx}','${e.cod}')">
    <span class="mono">${e.cod}</span><span>${esc(e.desc)}</span>${e.ja?'<em>já incluída</em>':''}</div>`).join('');
}

/* ---------- HU-A ---------- */
function cardEspInclusao(d){
  if(state.role==='solicitante') return '';
  const l = d.especialidades || (d.especialidades = []);
  const pode = ehResponsavel(d);
  const hl = destacarEsp===d.numero && !l.length;
  return `<div class="card ${hl?'card-hl':''}" id="card-esp">
    <div class="card-head"><h2>Especialidades relacionadas ao procedimento (${l.length})</h2>${tagOnda('HU-A')}</div>
    <div class="card-body">
      ${pend('HU-A PA01','posição da seleção de especialidade no formulário de análise de inclusão (tela de referência anexada ao Jira). Posição exibida aqui é hipótese.')}
      ${pode?espPicker('inc','inc:'+d.numero):''}
      ${l.length?`<div class="esp-list"><table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Tipo de ação</th>${pode?'<th class="right"><button class="btn btn-ghost btn-sm" onclick="espIncLimpar(\''+d.numero+'\')">Excluir todas</button></th>':''}</tr></thead>
        <tbody>${l.map(e=>`<tr><td class="mono">${e.cod}</td><td>${esc(espDef(e.cod).desc)}</td><td>${acaoTag(e.acao)}</td>
        ${pode?`<td class="right"><button class="btn btn-ghost btn-sm" onclick="espIncDel('${d.numero}','${e.cod}')">Excluir</button></td>`:''}</tr>`).join('')}</tbody></table></div>`
      :`<div class="sel-empty">${pode?'Nenhuma especialidade relacionada. Pesquise e selecione na lista acima.':'Nenhuma especialidade relacionada.'}</div>`}
      ${hl?`<div class="err-inline" style="margin-top:10px">${msgHtml('A01')}</div>`:''}
      <p class="hint" style="margin:10px 0 0">${d.tipoCodigo==='TUSS'?'Obrigatório ao menos uma especialidade para concluir a inclusão de código TUSS.':'THSM: no protótipo a especialidade não é exigida.'}
        Justificativas: use a Observação da conclusão e os anexos existentes (sem campo específico). A lista é mantida ao sair e voltar para a análise.</p>
      ${d.tipoCodigo!=='TUSS'?pend('HU-A PA02','não foi informado se a obrigatoriedade de ao menos uma especialidade se aplica também à inclusão de código THSM.'):''}
      ${state.role==='gestor'?pend('HU-A PA03','o gestor atua junto com o analista na análise de inclusão; não foi confirmado se terá os mesmos recursos do analista.'):''}
      ${pend('HU-A PA04','não foi informado o papel do “robô” citado na reunião na efetivação do relacionamento.')}
    </div></div>`;
}

/* ---------- HU-B ---------- */
function abasAltHtml(){
  const f = altForm; const ne = f.espAssoc.length + f.espDesassoc.length;
  return `<div class="tabs">
    <div class="tab ${f.aba!=='esp'?'on':''}" onclick="setAbaAlt('atr')">Atributos ${f.itens.length?'<span class="tab-dot" title="Aba com manutenção"></span>':''}<span id="cnt-itens" hidden>${f.itens.length}</span></div>
    <div class="tab ${f.aba==='esp'?'on':''}" onclick="setAbaAlt('esp')">Especialidade ${ne?'<span class="tab-dot" title="Aba com manutenção"></span>':''}</div>
    <div class="tabs-fill">${tagOnda('HU-B')}</div></div>
    <div style="padding:0 14px">${pend('HU-B PA06','indicação visual de aba com manutenção (o contador da v4 não é requisito; o ponto vermelho é hipótese).')}
    ${pend('HU-B PA01 / PA03','validação técnica das abas no Pega e da nova regra de conclusão (João); posição das abas e das sessões no formulário.')}</div>`;
}
function espSolHtml(){
  const f = altForm; if(!f.cod) return '';
  const rel = espRelacionadas(f.cod.codigo);
  return `<div class="card-body">
    <div class="esp-sec"><h3>1. Especialidades já relacionadas ao procedimento (${rel.length})</h3>
      <p class="hint" style="margin-top:0">Use “✕” para desassociar. As demais são mantidas, sem necessidade de ação de “manter”.</p>
      ${rel.length?`<table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th style="width:170px">Situação</th><th class="right" style="width:110px">Desassociar</th></tr></thead><tbody>
      ${rel.map(c=>{ const on = f.espDesassoc.includes(c); return `<tr class="${on?'row-ds':''}"><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td>
        <td>${on?acaoTag('DESASSOCIACAO'):'<span class="muted">Relacionada</span>'}</td>
        <td class="right">${on?`<button class="btn btn-ghost btn-sm" onclick="espSolToggle('${c}')">Desfazer</button>`:`<button class="btn-dec no" title="Desassociar" onclick="espSolToggle('${c}')">✕</button>`}</td></tr>`; }).join('')}
      </tbody></table>`:'<div class="sel-empty">O procedimento não possui especialidades relacionadas.</div>'}
      ${pend('HU-B PA07','componente para desassociar não definido (sugestão de “✕” em vez da marcação “manter” da v4; exibido aqui como hipótese).')}
      ${rel.length && f.espDesassoc.length===rel.length?pend('HU-B PA02','todas as especialidades foram marcadas para desassociação: não foi informado se é permitido desassociar todas as especialidades do procedimento.'):''}
    </div>
    <div class="esp-sec"><h3>2. Incluir especialidades adicionais (${f.espAssoc.length})</h3>
      ${espPicker('sol','sol')}
      <p class="hint" style="margin-top:0">A lista não apresenta as especialidades já relacionadas ao procedimento. Itens incluídos podem ser excluídos até o envio.</p>
      ${f.espAssoc.length?`<div class="esp-list"><table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Tipo de ação</th><th class="right"><button class="btn btn-ghost btn-sm" onclick="altForm.espAssoc=[];render()">Excluir todas</button></th></tr></thead><tbody>
      ${f.espAssoc.map(c=>`<tr><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td><td>${acaoTag('ASSOCIACAO')}</td>
        <td class="right"><button class="btn btn-ghost btn-sm" onclick="espSolDel('${c}')">Excluir</button></td></tr>`).join('')}</tbody></table></div>`
      :'<div class="sel-empty">Nenhuma especialidade incluída.</div>'}
    </div>
    ${pend('HU-B PA04','nomenclatura oficial para “associação” / “desassociação” não informada.')}
    ${state.role==='gestor'?pend('HU-B PA05','participação do gestor de gestão de tabelas nesta funcionalidade não definida.'):''}
    <p class="hint" style="margin-bottom:0">Justificativa e anexos: use a Justificativa Geral (campo de observação) e os anexos existentes (sem campo específico para especialidade).</p>
  </div>`;
}

/* ---------- HU-C ---------- */
const espFaltaJust = x => (x.parecer==='RECUSADO' && !x.justRecusa) || (x.origem==='ANALISE' && !x.just);
function cardAbasAnalise(d, gt){
  const e = d.especialidades || (d.especialidades = []);
  const aba = abaAna[d.numero] || (d.atributos.length ? 'atr' : 'esp');
  const pend_ = { atr:d.atributos.filter(x=>x.decisao==='PENDENTE').length, esp:e.filter(x=>(x.origem==='SOLICITACAO' && x.parecer==='PENDENTE') || espFaltaJust(x)).length };
  const cont = { a:d.atributos.filter(x=>x.decisao==='APROVADO').length, r:d.atributos.filter(x=>x.decisao==='RECUSADO').length };
  const tab = (id, t, n, p) => `<div class="tab ${aba===id?'on':''}" onclick="abaAna['${d.numero}']='${id}';render()">${t} ${n?'<span class="tab-dot" title="Aba com informações"></span>':''}${p?`<span class="tab-p" title="Itens pendentes">${p} pend.</span>`:''}</div>`;
  return `<div class="card" id="card-abas">
    <div class="tabs">${tab('atr','Atributos',d.atributos.length,pend_.atr)}${tab('esp','Especialidade',e.length,pend_.esp)}<div class="tabs-fill">${tagOnda('HU-C')}</div></div>
    <div style="padding:0 14px">${pend('HU-C PA04','indicação visual de aba com manutenção na análise não confirmada (ponto vermelho é hipótese).')}</div>
    ${aba==='atr'
      ? (d.atributos.length ? `<div class="tab-sub muted">${cont.a} aprovado(s) · ${cont.r} recusado(s) · ${pend_.atr} pendente(s)</div>${tabelaAtributos(d, gt?'gt':'sol')}`
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
  const justCell = (x,i) => {
    if(x.parecer==='RECUSADO') return x.justRecusa ? `<span style="font-size:12px">${esc(x.justRecusa)}</span>` : '<span class="err-inline" style="margin:0">Justificativa obrigatória</span>';
    if(x.origem==='ANALISE') return pode ? `<input type="text" class="just-in ${!x.just?'err':''}" value="${esc(x.just||'')}" placeholder="Justificativa obrigatória" onchange="espJust('${d.numero}',${i},this.value)">` : `<span style="font-size:12px">${esc(x.just||'—')}</span>`;
    return '<span class="muted">—</span>';
  };
  return `<div class="card-body">
    <div class="esp-sec"><h3>Especialidades já relacionadas ao procedimento (${rel.length})</h3>
      ${rel.length?`<table><thead><tr><th style="width:70px">Código</th><th>Descrição</th><th>Situação</th>${pode?'<th></th>':''}</tr></thead><tbody>
      ${rel.map(c=>`<tr><td class="mono">${c}</td><td>${esc(espDef(c).desc)}</td><td>${situ(c)}</td>
        ${pode?`<td class="right">${e.some(x=>x.cod===c)?'':`<button class="btn btn-ghost btn-sm" onclick="espAnaDesassociar('${d.numero}','${c}')">Desassociar</button>`}</td>`:''}</tr>`).join('')}</tbody></table>`
      :'<div class="sel-empty">O procedimento não possui especialidades relacionadas.</div>'}
      ${pode?pend('HU-C PA01','desassociar na análise especialidade existente não solicitada está em validação com a equipe do Renan (exige justificativa na linha, se confirmado).'):''}
    </div>
    <div class="esp-sec"><h3>Manutenções de especialidade (${e.length})</h3>
      ${e.length?`<div style="overflow-x:auto"><table class="atr-tbl"><thead><tr><th>Especialidade</th><th>Tipo de ação</th><th>Origem ${pendTag('HU-C PA02')}</th><th>Parecer</th><th>Justificativa</th>${pode?'<th class="right">Análise</th>':''}</tr></thead><tbody>
      ${e.map((x,i)=>`<tr class="${hl&&(x.parecer==='PENDENTE'||espFaltaJust(x))?'pend-hl':''}">
        <td><strong>${esc(espNome(x.cod))}</strong>${x.de?`<div class="muted" style="font-size:11px">alterada na análise — solicitado: ${esc(espNome(x.de))}</div>`:''}</td>
        <td>${acaoTag(x.acao)}</td><td>${ORIGEM_ESP[x.origem]}</td>
        <td>${sitBadge(x.parecer||'APROVADO')}${x.por?`<div class="muted" style="font-size:11px;margin-top:2px">${esc(x.por)} · ${dt(x.decEm)}</div>`:''}</td>
        <td style="min-width:180px">${justCell(x,i)}</td>
        ${pode?`<td class="right" style="white-space:nowrap">${x.origem==='SOLICITACAO'
          ? `<button class="btn-dec ok ${x.parecer==='APROVADO'?'on':''}" title="Aprovar" onclick="espParecer('${d.numero}',${i},'APROVADO')">✓</button>
             <button class="btn-dec no ${x.parecer==='RECUSADO'?'on':''}" title="Reprovar" onclick="espParecer('${d.numero}',${i},'RECUSADO')">✕</button>
             ${x.acao==='ASSOCIACAO'?`<button class="btn btn-ghost btn-sm" onclick="espAlterar('${d.numero}',${i})">Alterar</button>`:''}`
          : `<button class="btn btn-ghost btn-sm" onclick="espAnaDel('${d.numero}',${i})">Excluir</button>`}</td>`:''}
      </tr>`).join('')}</tbody></table></div>`:'<div class="sel-empty">Nenhuma manutenção de especialidade nesta solicitação.</div>'}
      ${hl&&e.some(x=>x.parecer==='PENDENTE'||espFaltaJust(x))?`<div class="err-inline" style="margin-top:10px">${msgHtml('C01')} Há especialidades pendentes de parecer ou de justificativa.</div>`:''}
      ${pend('HU-C PA01','em 03/11 o Renan indicou aprovar/reprovar por especialidade solicitada (adotado). A ação “Alterar” a manutenção solicitada está em validação com a equipe do Renan.')}
      ${pend('HU-C PA02','coluna de origem (solicitação/análise) explicada em 03/11; aguarda confirmação do Renan com a equipe.')}
      ${state.role==='gestor'?pend('HU-C PA03','participação do gestor de gestão de tabelas nesta funcionalidade não definida.'):''}
    </div>
    ${pode?`<div class="esp-sec"><h3>Incluir especialidade não solicitada</h3>
      ${pend('HU-C PA01','incluir especialidade não solicitada e selecionar todas na análise estão em validação com a equipe do Renan (C03).')}
      ${espPicker('ana','ana:'+d.numero)}
      <p class="hint" style="margin:0">Incluídas pelo analista ficam com origem “Análise”, exigem justificativa na linha e podem ser excluídas até a finalização.</p></div>`:''}
  </div>`;
}
function espParecer(n, i, p){
  const d = find(n); if(!ehResponsavel(d)) return; const x = d.especialidades[i];
  if(x.parecer===p){ toast('Sem alteração','O parecer já está registrado.','info'); return; }
  if(p==='RECUSADO'){
    modal('Reprovar especialidade — '+esc(espNome(x.cod)), `
      <dl class="dl" style="margin-bottom:14px"><dt>Tipo de ação</dt><dd>${acaoTag(x.acao)}</dd><dt>Origem</dt><dd>${ORIGEM_ESP[x.origem]}</dd></dl>
      <div class="field" id="f-erec" style="margin:0"><label>Justificativa da reprovação <span class="req">*</span></label>
        <textarea id="i-erec" placeholder="Explique o motivo da reprovação"></textarea>
        <div class="err-msg">Informe a justificativa para reprovar a especialidade.</div></div>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="espConfirmRecusa('${n}',${i})">Confirmar reprovação</button>`);
    return;
  }
  espRegistrarParecer(d, i, p, '');
}
function espConfirmRecusa(n, i){
  const t = document.getElementById('i-erec').value.trim();
  if(!t){ document.getElementById('f-erec').classList.add('error'); toast('Reprovação bloqueada','Informe a justificativa para reprovar a especialidade.','red'); return; }
  closeModal(); espRegistrarParecer(find(n), i, 'RECUSADO', t);
}
function espRegistrarParecer(d, i, p, just){
  const x = d.especialidades[i]; const ant = x.parecer;
  x.parecer = p; x.justRecusa = p==='RECUSADO' ? just : ''; x.por = me().nome; x.decEm = new Date().toISOString();
  espHist(d, (ant==='PENDENTE'?'Parecer da especialidade: ':'Parecer alterado: ')+SIT[p].label, [{cod:x.cod, acao:x.acao, parecer:p}], just||undefined);
  audit('Parecer de especialidade', d.numero, x.cod+' '+ACAO_ESP[x.acao]+': '+SIT[p].label);
  if(destacarPend===d.numero && !pendentesAlt(d)) destacarPend = null;
  save(); toast('Parecer registrado', espNome(x.cod)+' · '+SIT[p].label); render();
}
function espJust(n, i, v){
  const d = find(n); if(!ehResponsavel(d)) return; const x = d.especialidades[i];
  x.just = v.trim(); d.atualizacao = new Date().toISOString();
  if(x.just) audit('Justificativa de especialidade', n, x.cod+': '+x.just.slice(0,60));
  if(destacarPend===n && !pendentesAlt(d)) destacarPend = null;
  save(); render();
}

/* ---------- HU-D ---------- */
function espHistHtml(h){
  if(!h.esp || !h.esp.length) return '';
  return `<div class="tl-esp">${h.esp.map(e=>`<div class="diff">Especialidade <strong>${esc(espNome(e.cod))}</strong> · De: <span class="muted">(vazio)</span> · ${acaoTag(e.acao)}${e.parecer?' · '+sitBadge(e.parecer):''}${e.de?` <span class="muted">(substitui ${esc(espNome(e.de))})</span>`:''}</div>`).join('')}
    ${pend('HU-D PA01 / PA02','formato de exibição da especialidade e do tipo de ação no histórico; se deve distinguir manutenção do solicitante × análise.')}</div>`;
}

/* ---------- HU-E / HU-F / HU-G ---------- */
function pendConsulta(){
  return `<div class="card-body" style="padding-top:0">
    ${pend('HU-E PA01','conteúdo da coluna “Especialidade” para solicitações de inclusão de procedimento (traço ou “S”). A Versão 6 exibe “—” sem especialidade e “S” com especialidade.')}
    ${pend('HU-E PA02','visualização em tela com muitos atributos: João sugeriu não exibir; Marcia e Renan mantêm a exibição. Confirmar o formato.')}
    ${podeExportar()?pend('HU-G PA01','resultado do teste do tamanho máximo da célula do Excel (Arthur) e tratamento caso o limite seja excedido.'):''}
  </div>`;
}
function filtroAtrHtml(){
  const espF = `<div class="field" style="margin-top:12px;margin-bottom:0;max-width:320px"><label>Especialidade (S/N) ${tagOnda('HU-F')}</label>
    <select onchange="setFiltro('esp',this.value)"><option value="">Todas</option>
      <option value="S" ${filtros.esp==='S'?'selected':''}>S: com manutenção de especialidade</option>
      <option value="N" ${filtros.esp==='N'?'selected':''}>N: sem manutenção de especialidade</option></select>
    <div class="hint">Indicação S/N, sem filtro por especialidade específica.</div></div>
    ${pend('HU-F PA01 / RN05','inclusão do filtro “Especialidade” S/N não confirmada (proposta do Renan, restaurada na v0.6). “Especialidade” não consta mais da lista de atributos.')}`;
  if(filtros.tipoSol!=='alteracao') return `${espF}<p class="hint" style="margin:10px 0 0">Filtro por atributo alterado: disponível quando o Tipo de solicitação for “Alteração de Atributos”. ${tagOnda('HU-F')}</p>`;
  const sel = filtros.atributos || (filtros.atributos = []);
  return `${espF}<div class="field" style="margin-top:12px;margin-bottom:0"><label>Atributos alterados ${tagOnda('HU-F')} <span class="muted" style="font-weight:400">: retorna as solicitações que contêm qualquer um dos atributos selecionados (critério OU), junto com o período informado</span></label>
    <div class="atr-box"><div class="atr-tools"><input type="text" placeholder="Filtrar atributos…" oninput="filtrarListaAtrF(this.value)">
      <span class="muted" style="font-size:12px;white-space:nowrap">${sel.length} selecionado(s)</span>${sel.length?`<button class="btn btn-ghost btn-sm" onclick="filtros.atributos=[];render()">Limpar</button>`:''}</div>
    <div class="atr-list" id="atrf-list">${ATRIBUTOS.map(a=>`<label class="atr-opt" data-n="${esc(normTx(a.nome))}"><input type="checkbox" ${sel.includes(a.nome)?'checked':''} onchange="toggleFiltroAtr('${esc(a.nome)}')"><span>${esc(a.nome)}</span></label>`).join('')}</div></div></div>`;
}
function gerarExportacao(rows, linhas){
  const cab = ['Protocolo','Tipo de solicitação','Código','Tipo do código','Descrição completa','Solicitante','Área','Status','Responsável atual','Abertura','Última atualização','Encerramento',
    'Atributo','De','Para','Situação do atributo','Justificativa da recusa','Decidido por','Data da decisão','Data da exclusão solicitada','Data efetiva da exclusão','Justificativa de rejeição','Justificativa da solicitação','SLA'];
  const cabX = cab.concat(['Tipo de entrada','Especialidade','Atributos alterados']);
  let estouro = 0;
  const dados = linhas.map(l=>{ let at = atrAlterados(l.d).join('; ');
    if(at.length > 32767){ estouro++; at = at.slice(0, 32767); }
    return [...l, l.d.origem||'Manual', espIndicador(l.d), at]; });
  const ws = XLSX.utils.aoa_to_sheet([cabX, ...dados]);
  ws['!cols'] = cabX.map(h=>({ wch:Math.min(48, Math.max(12, h.length+2)) }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Extracao');
  const stamp = new Date().toISOString().slice(0,16).replace(/[-:T]/g,'');
  XLSX.writeFile(wb, `WorkFlow_TUSS_THSM_Demandas_${stamp}.xlsx`);
  const fil = Object.entries(filtros).filter(([,v])=>v && (!Array.isArray(v) || v.length)).map(([k,v])=>k+'='+v).join(', ') || 'sem filtros';
  audit('Exportação de dados','Consulta', `${me().perfil} · ${rows.length} demanda(s) · ${linhas.length} linha(s) · filtros: ${fil}`);
  save();
  toast('Exportação concluída','Exportação concluída com sucesso. '+linhas.length+' linha(s): ao final do layout, coluna “Especialidade” (S/N) e coluna única de atributos alterados separados por “;”.','info');
  if(estouro) toast('Limite da célula do Excel', estouro+' linha(s) excederam 32.767 caracteres e foram truncadas. Tratamento a definir (HU-G PA01).','red');
}

/* ---------- Home ---------- */
const PENDENCIAS_V06 = [
  ['Geral', ['Épico (Jira) de todas as histórias: a preencher.', 'Recorte do escopo da SP4 somente na planning de 09/11, conforme estimativas (PG02).']],
  ['HU-H · Tabela de especialidades', ['PA01: sistema de origem (GPRS, SSCF ou planilha), serviço, parâmetros e campos retornados.', 'PA02: existência do indicador de situação ativa/inativa.', 'MSG01 (pesquisa sem resultado) e MSG02 (indisponibilidade): texto não informado.']],
  ['HU-A · Análise de inclusão', ['PA01: posição da seleção de especialidade no formulário.', 'PA02: obrigatoriedade de especialidade também para THSM.', 'PA03: recursos do gestor na análise de inclusão.', 'PA04: papel do “robô” na efetivação do relacionamento.', 'MSG01 e MSG02: texto não informado.']],
  ['HU-B · Solicitação de alteração', ['PA01: validação técnica das abas e da nova regra de conclusão no Pega (João).', 'PA02: permitir desassociar todas as especialidades.', 'PA03: posição das abas e das sessões.', 'PA04: nomenclatura oficial de associação/desassociação.', 'PA05: participação do gestor.', 'PA06: indicação visual de aba com manutenção (contador não é requisito).', 'PA07: componente de desassociação (sugestão “✕”).', 'MSG01, MSG02 e MSG03: texto não informado.']],
  ['HU-C · Análise de alteração', ['PA01: alterar a manutenção, incluir não solicitadas, desassociar e selecionar todas na análise (em validação, Renan).', 'PA02: coluna de origem (solicitação/análise).', 'PA03: participação do gestor.', 'PA04: indicação visual de aba com manutenção.', 'MSG01 e MSG02: texto não informado.']],
  ['HU-D · Consulta de histórico', ['PA01: formato de exibição da especialidade e do tipo de ação.', 'PA02: distinguir manutenção do solicitante × análise.']],
  ['HU-E · Consulta extração', ['PA01: conteúdo da coluna “Especialidade” na inclusão (traço ou “S”).', 'PA02: visualização com muitos atributos.']],
  ['HU-F · Filtro por atributo', ['PA01 / RN05: filtro “Especialidade” S/N a confirmar.']],
  ['HU-G · Layout da extração', ['PA01: teste do tamanho máximo da célula do Excel e tratamento do excesso.']]
];
function homeOnda2(){
  const L = n => `<span class="num-link" onclick="go('#/demanda?n=${n}')">${n}</span>`;
  return `<div class="card">
    <div class="card-head"><h2>Versão 6 · Especificação Onda 2 v0.6 (03/11/26): mudanças em relação à Versão 5</h2><span class="tag-onda">base: Versão 5</span></div>
    <div class="card-body">
      <div class="pend-def" style="margin-top:0"><strong>Legenda:</strong> mensagens em vermelho indicam pontos com <strong>pendência de definição</strong> documentada na especificação v0.6 e precisam de refinamento complementar com a PO. O comportamento exibido nesses pontos é hipótese de trabalho.</div>
      <div class="grid-2">
      <div><h3>Ajustes da v0.6</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
        · <strong>HU-B</strong> (Solicitante › Nova solicitação › Alteração, código 40101010): abas sem contador (indicador visual a definir) e desassociação com “✕”.<br>
        · <strong>HU-C</strong> (Carlos): ${L('WF-2026-000143')}: reprovar especialidade exige justificativa na linha; inclusão/desassociação na análise exige justificativa; conclusão bloqueada sem justificativa.<br>
        · <strong>HU-D</strong>: histórico com “De” vazio, código, descrição e tipo de ação: ${L('WF-2026-000145')}.<br>
        · <strong>HU-E/F</strong>: Consulta com filtro “Especialidade” S/N (a confirmar) e filtro por atributo (critério OU).<br>
        · <strong>HU-G</strong>: exportação com coluna “Especialidade” S/N e coluna única de atributos alterados separados por “;”, sem lista de especialidades.<br>
        · <strong>HU-A</strong> (Carlos): ${L('WF-2026-000142')} TUSS · ${L('WF-2026-000139')} THSM.</p>
        <p style="margin:12px 0 0"><button class="btn btn-ghost btn-sm" onclick="espToggleIndisp()">${state.espIndisp?'Restabelecer':'Simular indisponibilidade da'} tabela de especialidades</button></p></div>
      <div><h3>Carga de solicitações por arquivo (sem alteração na v0.6)</h3><p class="muted" style="font-size:12px;line-height:1.7;margin:0">
        · Perfil <strong>Analista</strong> › menu <em>Carga de solicitações</em>.<br>
        · Exemplos já carregados: ${['146','147','149','148'].map(n=>L('WF-2026-000'+n)).join(', ')}.</p></div>
      </div></div></div>
  <div class="card">
    <div class="card-head"><h2>Pontos pendentes de definição: Especificação v0.6</h2><span class="pend-tag">refinamento complementar</span></div>
    <div class="card-body"><div class="pend-grid">${PENDENCIAS_V06.map(([t,l])=>`<div class="pend-box"><h3>${t}</h3><ul>${l.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></div>
  </div>`;
}
