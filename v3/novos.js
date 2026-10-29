/* Protótipo v3 — Alteração de Atributos e Exclusão de Código TUSS/THSM */

const tipoId = d => d.tipoSol || 'criacao';
const TIPO_CURTO = { criacao:'Criação de Código', alteracao:'Alteração de Atributos', exclusao:'Exclusão de Código' };
const FMT_ALT = ['PDF','DOCX','XLSX','MSG','JPEG','PNG'];
const FMT_EXC = ['PDF','DOCX','XLSX','MSG'];
const SIT = {
  PENDENTE:{ label:'Pendente', cls:'b-aguardando' },
  APROVADO:{ label:'Aprovado', cls:'b-concluida' },
  RECUSADO:{ label:'Recusado', cls:'b-resposta' }
};
const sitBadge = s => `<span class="badge ${SIT[s].cls}">${SIT[s].label}</span>`;
const atrDef = nome => ATRIBUTOS.find(a=>a.nome===nome);
const atrIdx = nome => ATRIBUTOS.findIndex(a=>a.nome===nome);
const ativa = d => !['CONCLUIDA','REJEITADA'].includes(d.status);
let destacarPend = null;

/* ---------- SSCF simulado ---------- */
function consultarSSCF(cod){ return BASE_SSCF[cod] ? { codigo:cod, ...BASE_SSCF[cod] } : null; }
function valorAtual(cod, nome){
  const b = BASE_SSCF[cod]; if(!b) return null;
  if(Object.prototype.hasOwnProperty.call(b.atr, nome)) return b.atr[nome];
  const a = atrDef(nome);
  if(nome==='Código') return cod;
  if(nome==='Descrição Completa') return b.descricao;
  if(nome==='Descrição Resumida') return b.descricao.slice(0,40);
  if(nome==='Local de Autorização' && b.atr['Autorização']!=='Sim') return '—';
  if(a.t==='simnao') return 'Não';
  if(a.t==='dominio') return a.opcoes[0];
  if(a.t==='moeda') return '0,00';
  if(a.t==='decimal') return (a.min||0).toFixed(a.casas).replace('.',',');
  if(a.t==='numero') return '0';
  return '—';
}

/* ---------- validação do campo Para (matriz de regras) ---------- */
function numPtBR(v, casas){
  const re = new RegExp('^(\\d{1,3}(\\.\\d{3})+|\\d+)(,\\d{1,'+casas+'})?$');
  return re.test(v) ? Number(v.replace(/\./g,'').replace(',','.')) : NaN;
}
function validarPara(item){
  const a = atrDef(item.nome); const v = (item.para||'').trim();
  if(!v) return 'Preencha o valor desejado no campo Para.';
  if(a.t==='simnao' && !['Sim','Não'].includes(v)) return 'O valor informado não atende às regras do atributo selecionado.';
  if(a.t==='dominio' && !a.opcoes.includes(v)) return 'Valor fora do domínio parametrizado. Selecione uma opção válida.';
  if(a.t==='numero' && (!/^\d+$/.test(v) || Number(v)>a.max)) return 'O valor informado não atende às regras do atributo selecionado.';
  if(a.t==='moeda' || a.t==='decimal'){
    const n = numPtBR(v, a.casas);
    if(isNaN(n) || n < a.min) return `O valor informado não atende às regras do atributo selecionado: número ≥ ${String(a.min).replace('.',',')}, com até ${a.casas} casas decimais (padrão pt-BR).`;
    const nd = numPtBR(String(item.de||''), 6);
    if(!isNaN(nd) && nd===n) return 'O valor desejado deve ser diferente do valor atual.';
  }
  if(a.t==='texto' && v.length>a.max) return 'O valor informado não atende às regras do atributo selecionado.';
  if(v===String(item.de)) return 'O valor desejado deve ser diferente do valor atual.';
  return '';
}
function regraHint(a){
  const fonte = a.matriz ? ' · Matriz de Preenchimento' : '';
  if(a.t==='simnao') return 'Domínio: Sim / Não';
  if(a.t==='dominio') return 'Lista controlada: '+a.opcoes.join(' / ')+fonte;
  if(a.t==='numero') return 'Numérico, até '+a.max.toLocaleString('pt-BR');
  if(a.t==='moeda') return 'Monetário pt-BR ≥ 0,01, até 2 casas (ex.: 1.480,50)'+fonte;
  if(a.t==='decimal') return `Numérico ≥ ${String(a.min).replace('.',',')}, até ${a.casas} casas decimais (pt-BR)`+fonte;
  return 'Texto, até '+a.max+' caracteres';
}
function inputPara(a, id, val, onch){
  const oc = onch ? `onchange="${onch}"` : '';
  if(a.t==='simnao' || a.t==='dominio'){
    const o = a.t==='simnao' ? ['Sim','Não'] : a.opcoes;
    return `<select id="${id}" ${oc}><option value="">Selecione…</option>${o.map(x=>`<option ${val===x?'selected':''}>${x}</option>`).join('')}</select>`;
  }
  if(a.t==='numero') return `<input type="text" inputmode="numeric" id="${id}" value="${esc(val||'')}" oninput="this.value=this.value.replace(/\\D/g,'')" ${oc}>`;
  if(a.t==='moeda') return `<input type="text" id="${id}" value="${esc(val||'')}" placeholder="0,00" oninput="this.value=this.value.replace(/[^\\d.,]/g,'')" ${oc}>`;
  if(a.t==='decimal') return `<input type="text" inputmode="decimal" id="${id}" value="${esc(val||'')}" placeholder="${(a.min||0).toFixed(a.casas).replace('.',',')}" oninput="this.value=this.value.replace(/[^\\d,]/g,'')" ${oc}>`;
  return `<input type="text" id="${id}" maxlength="${a.max}" value="${esc(val||'')}" ${oc}>`;
}

/* ---------- anexos (formulários e etapas) ---------- */
function anexoPicker(fmts, onAdd){
  return `<div class="anx-pick">
    <select id="anx-fmt">${fmts.map(f=>`<option>${f}</option>`).join('')}<option value="EXE">EXE (simular formato inválido)</option></select>
    <button type="button" class="btn btn-outline btn-sm" onclick="${onAdd}">Anexar arquivo</button>
  </div>
  <div class="hint">Formatos permitidos: ${fmts.join(', ')}. Sem limite de quantidade. Arquivos simulados no protótipo.</div>`;
}
function novoArquivo(fmts){
  const f = document.getElementById('anx-fmt').value;
  if(!fmts.includes(f)){ toast('Formato inválido','Formato de arquivo não permitido.','red'); return null; }
  const ext = {JPEG:'jpg'}[f] || f.toLowerCase();
  return { nome:`documento_${Math.floor(Math.random()*900+100)}.${ext}`, tam:(Math.floor(Math.random()*400)+40)+' KB', autor:me().nome, em:dt(new Date().toISOString()), pend:true };
}
function anexoRowEd(a, delCall){
  return `<div class="attach"><div class="ico">${esc((a.nome.split('.').pop()||'').toUpperCase().slice(0,4))}</div>
    <div style="flex:1"><div>${esc(a.nome)}</div><div class="meta">${esc(a.tam)} · ${esc(a.autor)} · ${esc(a.em)}${a.pend?' · <strong>incluído nesta etapa</strong>':''}</div></div>
    ${delCall?`<button class="btn btn-ghost btn-sm" onclick="${delCall}">Excluir</button>`:''}</div>`;
}
let formAnexos = [];
function addAnexoForm(tipo){
  const a = novoArquivo(tipo==='exclusao'?FMT_EXC:FMT_ALT); if(!a) return;
  formAnexos.push(a); renderFormAnexos(); toast('Anexo incluído', a.nome+' será vinculado à demanda no envio.','info');
}
function delAnexoForm(i){ formAnexos.splice(i,1); renderFormAnexos(); }
function renderFormAnexos(){
  const el = document.getElementById('anexos-list'); if(!el) return;
  el.innerHTML = formAnexos.map((a,i)=>anexoRowEd(a, `delAnexoForm(${i})`)).join('');
}
function addAnexoDemanda(n, listId){
  const d = find(n);
  const a = novoArquivo(tipoId(d)==='exclusao'?FMT_EXC:FMT_ALT); if(!a) return;
  d.anexos.push(a); save();
  toast('Anexo incluído', a.nome+' — pode ser excluído até a efetivação da ação.','info');
  const el = document.getElementById(listId); if(el) el.innerHTML = anexosEtapa(d); else render();
}
function delAnexoDemanda(n, i, listId){
  const d = find(n); const a = d.anexos[i];
  if(!a || !a.pend || a.autor!==me().nome){ toast('Ação não permitida','Somente o autor pode excluir o anexo antes de efetivar a ação.','red'); return; }
  d.anexos.splice(i,1); save(); toast('Anexo excluído', a.nome,'info');
  const el = document.getElementById(listId); if(el) el.innerHTML = anexosEtapa(d); else render();
}
function anexosEtapa(d, listId){
  listId = listId || 'anx-etapa';
  const l = d.anexos.map((a,i)=>({a,i})).filter(x=>x.a.pend && x.a.autor===me().nome);
  return l.length ? l.map(x=>anexoRowEd(x.a, `delAnexoDemanda('${d.numero}',${x.i},'${listId}')`)).join('') : '<p class="muted" style="font-size:12px;margin:6px 0 0">Nenhum anexo incluído nesta etapa.</p>';
}
function fixarAnexos(d){ (d.anexos||[]).forEach(a=>{ if(a.pend && a.autor===me().nome) delete a.pend; }); }
function blocoAnexoModal(d){
  return `<div class="field"><label>Anexo (opcional)</label>
    ${anexoPicker(tipoId(d)==='exclusao'?FMT_EXC:FMT_ALT, `addAnexoDemanda('${d.numero}','anx-modal')`)}
    <div id="anx-modal" style="margin-top:8px">${anexosEtapa(d,'anx-modal')}</div></div>`;
}

/* ---------- confirmação genérica ---------- */
let __onYes = null;
function confirmar(titulo, msg, rotulo, fn, cls){
  __onYes = fn;
  modal(titulo, `<p style="margin:0">${msg}</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Não</button>
     <button class="btn ${cls||'btn-primary'}" id="btnSim" onclick="if(!this.disabled){this.disabled=true;__onYes();}">${rotulo||'Sim, confirmar'}</button>`);
}

/* =========================================================
   Formulário — Alteração de Atributos
   ========================================================= */
let altForm = { codigoRaw:'', cod:null, itens:[], just:'' };
function resetAltForm(){ altForm = { codigoRaw:'', cod:null, itens:[], just:'', filtro:'' }; formAnexos = []; }

function viewFormAlteracao(){
  const f = altForm;
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › <span onclick="go('#/nova?t=alteracao')">Nova solicitação</span> › Alteração de Atributos</div>
  <div class="page-head"><div>
    <h1>Alteração de Atributos TUSS/THSM</h1>
    <p class="page-sub">Um único código por solicitação. Selecione um ou mais atributos; cada item incluído gera uma linha De/Para na lista de itens selecionados.</p>
  </div></div>
  ${stepper()}
  <div class="split">
    <div>
      <div class="card">
        <div class="card-head"><h2>1. Código</h2></div>
        <div class="card-body">
          <div class="field" id="f-acod">
            <label>Código <span class="req">*</span></label>
            <div class="inline-row">
              <input type="text" inputmode="numeric" id="i-acod" placeholder="Somente números" value="${esc(f.codigoRaw)}" ${f.cod?'disabled':''}
                oninput="this.value=this.value.replace(/\\D/g,'')" onkeydown="if(event.key==='Enter')validarCodigoAlt()">
              ${f.cod?`<button class="btn btn-ghost" onclick="trocarCodigoAlt()">Trocar código</button>`:`<button class="btn btn-outline" onclick="validarCodigoAlt()">Validar no SSCF</button>`}
            </div>
            <div class="hint">Códigos de teste: 40101010, 41001010, 30101012, 70012345, 90012345 · qualquer outro simula “não localizado”.</div>
            <div class="err-msg" id="e-acod">O código informado não foi localizado. Verifique o código e tente novamente.</div>
          </div>
          ${f.cod?`<div class="callout ok" style="margin-bottom:0"><div class="ct">Código localizado</div>
            <dl class="dl"><dt>Código</dt><dd class="mono">${esc(f.cod.codigo)}</dd><dt>Tipo do código</dt><dd>${f.cod.tipo} <span class="muted">(somente leitura)</span></dd>
            <dt>Descrição completa</dt><dd>${esc(f.cod.descricao)} <span class="muted">(somente leitura)</span></dd></dl></div>
            <p class="hint" style="margin-bottom:0">Não há ação para incluir um segundo código nesta solicitação.</p>`:''}
        </div>
      </div>

      <div class="card" style="${f.cod?'':'opacity:.55;pointer-events:none'}">
        <div class="card-head"><h2>2. Atributos e De/Para</h2><span class="muted" style="font-size:12px" id="cnt-itens">${f.itens.length} atributo(s) selecionado(s)</span></div>
        <div class="card-body">
          <div class="field" id="f-aatr">
            <label>Selecionar atributos <span class="req">*</span> <span class="muted" style="font-weight:400">— marque um ou mais e clique em Incluir</span></label>
            <div class="atr-box">
              <div class="atr-tools">
                <input type="text" id="i-afil" placeholder="Filtrar atributos…" value="${esc(f.filtro||'')}" oninput="altForm.filtro=this.value;renderAtrList()">
                <button class="btn btn-ghost btn-sm" onclick="marcarTodosVisiveis()">Marcar visíveis</button>
                <button class="btn btn-ghost btn-sm" onclick="desmarcarAtr()">Limpar marcação</button>
              </div>
              <div class="atr-list" id="atr-list">${atrListHtml()}</div>
              <div class="atr-foot">
                <span class="muted" style="font-size:12px" id="cnt-marc">0 marcado(s)</span>
                <button class="btn btn-outline" onclick="addAtributo()">Incluir selecionados</button>
              </div>
            </div>
            <div class="hint">Lista de domínio controlada e parametrizável. Cada atributo pode ser incluído uma única vez por código.</div>
            <div class="err-msg">Selecione ao menos um atributo para continuar.</div>
          </div>
          <div id="blocos">${blocosAlt()}</div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" onclick="go('#/nova?t=alteracao')">Voltar</button>
          <button class="btn btn-primary" onclick="validarAlteracao()">Concluir</button>
        </div>
      </div>
      <p class="hint" style="margin-top:-6px">A Justificativa Geral é solicitada na confirmação do envio, ao clicar em <strong>Concluir</strong>.</p>
    </div>
    <div>${cardIdentificacao()}
      <div class="card"><div class="card-head"><h2>Regras condicionais</h2></div><div class="card-body">
        <p class="muted" style="font-size:12px;line-height:1.6;margin:0">
          · Autorização → Sim: Local de Autorização é incluído e passa a ser obrigatório (Central ou Sala de Hospitais).<br>
          · Autorização → Não: Local de Autorização é desmarcado, conforme o legado.<br>
          · Descrição Resumida e Descrição Completa são independentes.<br>
          · Preenchimento do campo Para conforme a <span class="num-link" onclick="verMatriz()">Matriz de Regras de Preenchimento</span>, validado ao sair do campo.
        </p></div></div>
    </div>
  </div>`;
}
function verMatriz(){
  const l = ATRIBUTOS.filter(a=>a.matriz);
  modal('Matriz de Regras de Preenchimento dos Atributos', `
    <p class="hint" style="margin-top:0">Domínios parametrizados — atualizáveis sem alteração de código-fonte. Valores fora do domínio são bloqueados no preenchimento.</p>
    <div style="max-height:420px;overflow:auto"><table><thead><tr><th>Atributo</th><th>Tipo de campo</th><th>Domínio / regra</th></tr></thead><tbody>
    ${l.map(a=>`<tr><td>${esc(a.nome)}</td><td>${a.t==='dominio'?'Lista controlada':a.t==='moeda'?'Valor monetário':'Numérico decimal'}</td>
      <td>${a.t==='dominio'?esc(a.opcoes.join(', ')):`≥ ${String(a.min).replace('.',',')}, até ${a.casas} casas decimais`}</td></tr>`).join('')}
    </tbody></table></div>`, `<button class="btn btn-primary" onclick="closeModal()">Fechar</button>`);
}
function stepper(){
  return `<div class="stepper">
    <div class="step done"><span class="n">✓</span> Tipo de solicitação</div>
    <div class="step on"><span class="n">2</span> Preenchimento</div>
    <div class="step"><span class="n">3</span> Confirmação</div></div>`;
}
function cardIdentificacao(){
  return `<div class="card">
    <div class="card-head"><h2>Identificação automática</h2></div>
    <div class="card-body"><dl class="dl">
      <dt>Solicitante</dt><dd>${esc(me().nome)}</dd><dt>Matrícula</dt><dd class="mono">${esc(me().matricula)}</dd>
      <dt>E-mail</dt><dd>${esc(me().email)}</dd><dt>Área</dt><dd>${esc(me().area)}</dd>
      <dt>Data/hora</dt><dd>${dt(new Date().toISOString())}</dd></dl>
      <p class="hint" style="margin-top:12px">Dados capturados da autenticação corporativa, não editáveis. O protocolo só é gerado ao Concluir.</p>
    </div></div>`;
}
function atrListHtml(){
  const f = altForm; const q = (f.filtro||'').toLowerCase();
  const l = ATRIBUTOS.map((a,i)=>({a,i})).filter(x=>!q || x.a.nome.toLowerCase().includes(q));
  if(!l.length) return '<p class="muted" style="font-size:12px;margin:6px">Nenhum atributo encontrado.</p>';
  return l.map(({a,i})=>{
    const ja = f.itens.some(x=>x.nome===a.nome);
    return `<label class="atr-opt ${ja?'ja':''}"><input type="checkbox" value="${i}" ${ja?'checked disabled':''} onchange="contaMarcados()">
      <span>${esc(a.nome)}</span>${ja?'<em>incluído</em>':''}</label>`;
  }).join('');
}
function renderAtrList(){ const el=document.getElementById('atr-list'); if(el){ el.innerHTML=atrListHtml(); contaMarcados(); } }
function marcados(){ return [...document.querySelectorAll('#atr-list input[type=checkbox]:checked:not(:disabled)')].map(c=>Number(c.value)); }
function contaMarcados(){ const el=document.getElementById('cnt-marc'); if(el) el.textContent = marcados().length+' marcado(s)'; }
function marcarTodosVisiveis(){ document.querySelectorAll('#atr-list input[type=checkbox]:not(:disabled)').forEach(c=>c.checked=true); contaMarcados(); }
function desmarcarAtr(){ document.querySelectorAll('#atr-list input[type=checkbox]:not(:disabled)').forEach(c=>c.checked=false); contaMarcados(); }

function blocosAlt(){
  const f = altForm;
  if(!f.itens.length) return '<div class="sel-empty">Nenhum atributo incluído. Marque os atributos acima e clique em <strong>Incluir selecionados</strong>.</div>';
  const autSim = (f.itens.find(x=>x.nome==='Autorização')||{}).para==='Sim';
  return `<div class="sel-head"><h3>Itens selecionados (${f.itens.length})</h3>
      <span class="muted" style="font-size:12px">Informe o valor desejado (Para) de cada item. Use Excluir para retirar um item antes do envio.</span></div>
    <div style="overflow-x:auto"><table class="sel-tbl"><thead><tr><th style="width:34px">#</th><th>Atributo</th><th>De (valor atual no SSCF)</th><th>Para <span class="req">*</span></th><th style="width:90px"></th></tr></thead><tbody>
    ${f.itens.map((it,i)=>{
      const a = atrDef(it.nome);
      const indisp = it.de===null;
      const obrigLocal = it.nome==='Local de Autorização' && autSim;
      const msg = indisp ? 'Não foi possível recuperar o valor atual do atributo. Tente novamente.' : it.err;
      return `<tr class="${msg?'row-err':''}" id="blk-${i}">
        <td class="muted">${i+1}</td>
        <td><strong>${esc(it.nome)}</strong>
          ${it.auto?'<div><span class="tag-open" style="background:#E7F1FA;color:#0B5FA5;border-color:#B9D4EE">incluído pela regra condicional</span></div>':''}
          <div class="muted" style="font-size:11px">${regraHint(a)}</div></td>
        <td><input type="text" value="${indisp?'':esc(it.de)}" disabled placeholder="${indisp?'Valor indisponível':''}"></td>
        <td>${inputPara(a, 'p-'+i, it.para, `setPara(${i},this.value)`)}
          <div class="err-inline" id="err-${i}" style="${msg?'':'display:none'}">${esc(msg||'')}</div>
          ${obrigLocal?'<div class="hint">Obrigatório porque Autorização foi alterada para Sim.</div>':''}
          ${it.nome==='Autorização'&&it.para==='Não'?'<div class="hint">Local de Autorização será desmarcado no sistema legado.</div>':''}</td>
        <td class="right"><button class="btn btn-ghost btn-sm" onclick="remAtributo(${i})">Excluir</button></td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
}
function renderBlocos(){
  document.getElementById('blocos').innerHTML = blocosAlt();
  const c = document.getElementById('cnt-itens'); if(c) c.textContent = altForm.itens.length+' atributo(s) selecionado(s)';
  renderAtrList();
}
function validarCodigoAlt(){
  const v = document.getElementById('i-acod').value.trim();
  altForm.codigoRaw = v;
  const box = document.getElementById('f-acod');
  if(!/^\d+$/.test(v)){ box.classList.add('error'); document.getElementById('e-acod').textContent='Informe o código — somente números.'; return; }
  const c = consultarSSCF(v);
  if(!c){ box.classList.add('error'); document.getElementById('e-acod').textContent='O código informado não foi localizado. Verifique o código e tente novamente.';
    toast('Código não localizado','O código informado não foi localizado. Verifique o código e tente novamente.','red'); return; }
  altForm.cod = c;
  toast('Código localizado', 'Código localizado com sucesso: '+c.codigo+' - '+c.descricao);
  render();
}
function trocarCodigoAlt(){
  if(altForm.itens.length && !window.confirm('Ao trocar o código, os atributos selecionados serão descartados. Continuar?')) return;
  altForm.cod=null; altForm.itens=[]; render();
}
function addAtributo(){
  const sel = marcados();
  if(!sel.length){ toast('Selecione um atributo','Marque ao menos um atributo para incluir.','red'); return; }
  const nomes = sel.map(i=>ATRIBUTOS[i].nome);
  const ord = nomes.filter(n=>n!=='Local de Autorização').concat(nomes.filter(n=>n==='Local de Autorização'));
  const antes = altForm.itens.length;
  ord.forEach(n=>incluirAtributo(n, false, true));
  renderBlocos();
  const inc = altForm.itens.length - antes;
  if(inc) toast('Atributos incluídos', inc+' atributo(s) incluído(s) na lista de itens selecionados.','info');
}
function incluirAtributo(nome, auto, lote){
  const f = altForm;
  if(f.itens.some(x=>x.nome===nome)){ if(!auto) toast('Atributo repetido','Este atributo já foi selecionado para o código informado.','red'); return; }
  if(nome==='Local de Autorização' && !auto){
    const aut = f.itens.find(x=>x.nome==='Autorização');
    if(!aut && valorAtual(f.cod.codigo,'Autorização')!=='Sim'){ toast('Combinação inválida','Local de Autorização só pode ser alterado quando Autorização for Sim. Inclua também o atributo Autorização.','red'); return; }
  }
  f.itens.push({ nome, de:valorAtual(f.cod.codigo, nome), para:'', auto:!!auto });
  document.getElementById('f-aatr').classList.remove('error');
  if(!lote) renderBlocos();
}
function remAtributo(i){
  const it = altForm.itens[i];
  if(it.nome==='Local de Autorização' && (altForm.itens.find(x=>x.nome==='Autorização')||{}).para==='Sim'){
    toast('Campo relacionado obrigatório','Local de Autorização é obrigatório enquanto Autorização estiver como Sim. Exclua ou altere Autorização primeiro.','red'); return;
  }
  altForm.itens.splice(i,1);
  if(it.nome==='Autorização'){ const li = altForm.itens.findIndex(x=>x.nome==='Local de Autorização' && x.auto); if(li>=0) altForm.itens.splice(li,1); }
  renderBlocos(); toast('Item excluído', it.nome+' foi retirado da solicitação.','info');
}
function setPara(i, v){
  const f = altForm; const it = f.itens[i]; it.para = v;
  if(it.nome==='Autorização'){
    const li = f.itens.findIndex(x=>x.nome==='Local de Autorização');
    it.err = validarPara(it);
    if(v==='Sim' && li<0){ incluirAtributo('Local de Autorização', true); toast('Regra condicional','Local de Autorização incluído e obrigatório para Autorização = Sim.','info'); return; }
    if(v==='Não' && li>=0){ f.itens.splice(li,1); toast('Regra condicional','Local de Autorização desmarcado, conforme regra do legado.','info'); }
    renderBlocos(); return;
  }
  it.err = it.de===null ? 'Não foi possível recuperar o valor atual do atributo. Tente novamente.' : validarPara(it);
  const row = document.getElementById('blk-'+i), e = document.getElementById('err-'+i);
  if(row) row.classList.toggle('row-err', !!it.err);
  if(e){ e.textContent = it.err; e.style.display = it.err ? '' : 'none'; }
}
function validarAlteracao(){
  const f = altForm; let ok = true;
  if(!f.cod){ document.getElementById('f-acod').classList.add('error'); toast('Envio bloqueado','Informe e valide o código.','red'); return; }
  document.getElementById('f-aatr').classList.toggle('error', !f.itens.length);
  if(!f.itens.length) ok=false;
  f.itens.forEach(it=>{
    it.err = it.de===null ? 'Não foi possível recuperar o valor atual do atributo. Tente novamente.' : validarPara(it);
    if(it.err) ok=false;
  });
  const aut = f.itens.find(x=>x.nome==='Autorização');
  const loc = f.itens.find(x=>x.nome==='Local de Autorização');
  if(aut && aut.para==='Sim' && loc && !loc.para){ loc.err='Preencha Local de Autorização para concluir a alteração de Autorização.'; ok=false; }
  if(loc && !loc.err && (aut ? aut.para : valorAtual(f.cod.codigo,'Autorização'))!=='Sim'){ loc.err='A combinação informada não é permitida: Local de Autorização exige Autorização = Sim.'; ok=false; }
  renderBlocos();
  if(!ok){ toast('Envio bloqueado','Existem campos obrigatórios pendentes ou inválidos.','red'); return; }
  modal('Confirmar envio', `
    <p style="margin-top:0">Deseja enviar a solicitação com as informações apresentadas?</p>
    <dl class="dl"><dt>Tipo</dt><dd>Alteração de Atributos</dd><dt>Código</dt><dd class="mono">${esc(f.cod.codigo)} · ${f.cod.tipo}</dd>
    <dt>Descrição</dt><dd>${esc(f.cod.descricao)}</dd></dl>
    <table style="margin:12px 0 16px"><thead><tr><th>Atributo</th><th>De</th><th>Para</th></tr></thead><tbody>
    ${f.itens.map(it=>`<tr><td>${esc(it.nome)}</td><td class="muted">${esc(it.de)}</td><td><strong>${esc(it.para)}</strong></td></tr>`).join('')}</tbody></table>
    ${blocoJustEvid('alteracao', f.just, 'Explique a necessidade da alteração')}
    <p class="hint" style="margin-bottom:0">Após a confirmação o protocolo é gerado e o código e os valores ficam bloqueados para o solicitante.</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Voltar e revisar</button>
     <button class="btn btn-primary" id="btnConfirmar" onclick="confirmarEnvio('alteracao')">Confirmar envio</button>`);
}
function blocoJustEvid(tipo, just, ph){
  return `<div class="field" id="f-mjust">
      <label>Justificativa Geral <span class="req">*</span></label>
      <textarea id="i-mjust" maxlength="1000" placeholder="${ph}" oninput="${tipo==='alteracao'?'altForm':'excForm'}.just=this.value;contaChars('i-mjust','c-mjust',1000);if(this.value.trim())document.getElementById('f-mjust').classList.remove('error')">${esc(just||'')}</textarea>
      <div class="hint">Única por demanda · até 1.000 caracteres — <span id="c-mjust">${(just||'').length}</span>/1000.</div>
      <div class="err-msg">Preencha a Justificativa Geral para confirmar o envio.</div>
    </div>
    ${tipo==='alteracao'?'':`<div class="field"><label>Evidências (anexos${tipo==='exclusao'?' — opcional':''})</label>
      ${anexoPicker(tipo==='exclusao'?FMT_EXC:FMT_ALT, `addAnexoForm('${tipo}')`)}
      <div id="anexos-list" style="margin-top:10px">${formAnexos.map((a,i)=>anexoRowEd(a,`delAnexoForm(${i})`)).join('')}</div>
    </div>`}`;
}
function confirmarEnvio(tipo){
  const f = tipo==='alteracao' ? altForm : excForm;
  f.just = (document.getElementById('i-mjust').value||'').trim();
  document.getElementById('f-mjust').classList.toggle('error', !f.just);
  if(!f.just){ toast('Envio bloqueado','Preencha a Justificativa Geral para confirmar o envio.','red'); document.getElementById('i-mjust').focus(); return; }
  criarNova(tipo);
}

/* =========================================================
   Formulário — Exclusão de Código
   ========================================================= */
let excForm = { codigoRaw:'', cod:null, just:'', data:'' };
function resetExcForm(){ excForm = { codigoRaw:'', cod:null, just:'', data:'' }; formAnexos = []; }
function demandaAtivaExclusao(cod){ return state.demandas.find(d=>tipoId(d)==='exclusao' && d.codigo===cod && ativa(d)); }

function viewFormExclusao(){
  const f = excForm;
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › <span onclick="go('#/nova?t=exclusao')">Nova solicitação</span> › Exclusão de Código</div>
  <div class="page-head"><div>
    <h1>Exclusão de Código TUSS/THSM</h1>
    <p class="page-sub">Formulário simplificado: código e data da exclusão. Justificativa Geral e evidências são solicitadas ao Concluir.</p>
  </div></div>
  ${stepper()}
  <div class="split">
    <div class="card">
      <div class="card-head"><h2>Dados da exclusão</h2></div>
      <div class="card-body">
        <div class="field" id="f-ecod">
          <label>Código <span class="req">*</span></label>
          <div class="inline-row">
            <input type="text" inputmode="numeric" id="i-ecod" placeholder="Somente números" value="${esc(f.codigoRaw)}" ${f.cod?'disabled':''}
              oninput="this.value=this.value.replace(/\\D/g,'')" onkeydown="if(event.key==='Enter')validarCodigoExc()">
            ${f.cod?`<button class="btn btn-ghost" onclick="excForm.cod=null;render()">Trocar código</button>`:`<button class="btn btn-outline" onclick="validarCodigoExc()">Validar no SSCF</button>`}
          </div>
          <div class="hint">Códigos de teste: 41001010, 31009336 (exclusão anterior rejeitada — permite nova), 40304361 (já possui exclusão ativa) · outro número simula “não localizado”.</div>
          <div class="err-msg" id="e-ecod"></div>
        </div>
        ${f.cod?`<div class="grid-2">
          <div class="field"><label>Tipo do código</label><input type="text" value="${f.cod.tipo}" disabled></div>
          <div class="field"><label>Descrição completa</label><input type="text" value="${esc(f.cod.descricao)}" disabled></div></div>`:''}
        <div class="field" id="f-edata" style="max-width:260px">
          <label>Data da exclusão <span class="req">*</span></label>
          <input type="date" id="i-edata" value="${esc(f.data)}" onchange="excForm.data=this.value">
          <div class="hint">Atual, futura ou retroativa. <span class="tag-open">limite retroativo a definir</span></div>
          <div class="err-msg">Informe uma data de exclusão válida.</div>
        </div>
        <p class="hint" style="margin-bottom:0">Justificativa Geral e evidências (anexos) são solicitadas ao clicar em <strong>Concluir</strong>.</p>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="go('#/nova?t=exclusao')">Voltar</button>
        <button class="btn btn-primary" onclick="validarExclusao()">Concluir</button>
      </div>
    </div>
    <div>${cardIdentificacao()}</div>
  </div>`;
}
function validarCodigoExc(){
  const v = document.getElementById('i-ecod').value.trim(); excForm.codigoRaw = v;
  const box = document.getElementById('f-ecod'); const e = document.getElementById('e-ecod');
  if(!/^\d+$/.test(v)){ box.classList.add('error'); e.textContent='Informe o código — somente números.'; return; }
  const c = consultarSSCF(v) || (v==='10101063'?null:null);
  if(!c){ box.classList.add('error'); e.textContent='O código informado não foi localizado. Verifique o código e tente novamente.';
    toast('Código não localizado','O código informado não foi localizado. Verifique o código e tente novamente.','red'); return; }
  const dup = demandaAtivaExclusao(v);
  if(dup){ box.classList.add('error'); e.innerHTML=`Já existe uma solicitação ativa de exclusão para este código. Protocolo: <span class="num-link" onclick="go('#/demanda?n=${dup.numero}')">${dup.numero}</span>.`;
    toast('Solicitação duplicada','Já existe uma solicitação ativa de exclusão para este código. Protocolo: '+dup.numero+'.','red'); return; }
  excForm.cod = c;
  toast('Código localizado','Código localizado com sucesso: '+c.codigo+' - '+c.descricao);
  render();
}
function dataValida(el){
  if(!el.value || el.validity.badInput) return false;
  const y = Number(el.value.slice(0,4)); return y>=1900 && y<=2100;
}
function validarExclusao(){
  const f = excForm; let ok = true;
  if(!f.cod){ document.getElementById('f-ecod').classList.add('error'); document.getElementById('e-ecod').textContent='Informe e valide o código.'; ok=false; }
  const de = document.getElementById('i-edata'); f.data = de.value;
  const dok = dataValida(de);
  document.getElementById('f-edata').classList.toggle('error', !dok); if(!dok) ok=false;
  if(!ok){ toast('Envio bloqueado', dok?'Preencha todos os campos obrigatórios para continuar.':'Informe uma data de exclusão válida.','red'); return; }
  const dup = demandaAtivaExclusao(f.cod.codigo);
  if(dup){ toast('Solicitação duplicada','Já existe uma solicitação ativa de exclusão para este código. Protocolo: '+dup.numero+'.','red'); return; }
  const hoje = new Date().toISOString().slice(0,10);
  modal('Confirmar envio', `
    <p style="margin-top:0">Deseja enviar a solicitação de exclusão para análise?</p>
    <dl class="dl"><dt>Código</dt><dd class="mono">${esc(f.cod.codigo)} · ${f.cod.tipo}</dd><dt>Descrição</dt><dd>${esc(f.cod.descricao)}</dd>
    <dt>Data da exclusão</dt><dd>${d10(f.data)} ${f.data<hoje?'<span class="badge b-resposta">retroativa</span>':f.data>hoje?'<span class="badge b-aguardando">futura</span>':''}</dd>
    </dl>
    <div style="margin-top:16px">${blocoJustEvid('exclusao', f.just, 'Explique a necessidade da exclusão')}</div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Voltar e revisar</button>
     <button class="btn btn-primary" id="btnConfirmar" onclick="confirmarEnvio('exclusao')">Enviar para análise</button>`);
}

/* ---------- criação da demanda (alteração / exclusão) ---------- */
function criarNova(tipo){
  const b = document.getElementById('btnConfirmar');
  if(b.disabled) return;
  b.disabled = true; b.textContent = 'Enviando…';
  state.seq += 1;
  const numero = 'WF-2026-' + String(state.seq).padStart(6,'0');
  const agora = new Date().toISOString();
  const f = tipo==='alteracao' ? altForm : excForm;
  const base = {
    numero, tipo: tipo==='alteracao'?'Alteração de Atributos':'Exclusão de Código TUSS/THSM', tipoSol:tipo,
    tipoCodigo:f.cod.tipo, codigo:f.cod.codigo, descricao:f.cod.descricao, justificativa:f.just,
    solicitante:me().nome, area:me().area, abertura:agora, atualizacao:agora,
    status:'AGUARDANDO', responsavel:'—', origem:'Manual', slaHoras:24,
    anexos: formAnexos.map(a=>{ const c={...a}; delete c.pend; return c; }),
    historico:[{em:agora, quem:me().nome, area:me().area, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'}]
  };
  if(tipo==='alteracao') base.atributos = f.itens.map(it=>({ nome:it.nome, de:it.de, para:it.para.trim(), decisao:'PENDENTE', auto:it.auto }));
  else base.dataExclusao = f.data;
  state.demandas.unshift(base);
  audit('Criação de demanda', numero, base.tipo);
  tipo==='alteracao' ? resetAltForm() : resetExcForm();
  save(); closeModal();
  if(tipo==='alteracao') toast('Solicitação enviada','Solicitação enviada com sucesso. Protocolo: '+numero+'.');
  else toast('Demanda '+numero+' criada','Status: Aguardando Análise. Encaminhada à fila da Gestão de Tabelas.');
  go('#/demanda?n='+numero);
}

/* =========================================================
   Detalhe — Alteração / Exclusão
   ========================================================= */
function historicoHtml(d){
  return `<ul class="timeline">${d.historico.map(h=>`<li>
    <div class="tl-when">${dt(h.em)}</div>
    <div class="tl-what">${esc(h.acao)}</div>
    <div class="tl-who">${esc(h.quem)} · ${esc(h.area)} · ${h.de==='—'?'':STATUS[h.de]?.label+' → '}${STATUS[h.para]?.label||''}</div>
    ${h.nota?`<div class="tl-note">${esc(h.nota)}</div>`:''}
    ${h.det?`<div class="tl-det">${h.det.map(([k,v])=>`<div><span>${esc(k)}</span>${esc(v)}</div>`).join('')}</div>`:''}
    ${(h.diffs||[]).map(x=>`<div class="diff">${esc(x.campo)}: <span class="old">${esc(x.de)}</span> → <span class="new">${esc(x.para)}</span></div>`).join('')}
  </li>`).join('')}</ul>`;
}
function tabelaAtributos(d, modo){
  const pode = modo==='gt' && ehResponsavel(d);
  const hl = destacarPend===d.numero;
  return `<div style="overflow-x:auto"><table class="atr-tbl">
    <thead><tr><th>Atributo</th><th>De <span class="muted">(bloqueado)</span></th><th>Para</th><th>Situação</th>${pode?'<th class="right">Análise</th>':''}</tr></thead>
    <tbody>${d.atributos.map((a,i)=>`<tr class="${hl&&a.decisao==='PENDENTE'?'pend-hl':''}">
      <td><strong>${esc(a.nome)}</strong></td>
      <td class="muted">${esc(a.de)}</td>
      <td><strong>${esc(a.para)}</strong>${pode?` <button class="btn btn-ghost btn-sm" style="margin-left:6px" onclick="editarPara('${d.numero}',${i})">Editar</button>`:''}</td>
      <td>${sitBadge(a.decisao)}${a.decisao==='RECUSADO'&&a.justRecusa?`<div class="muted" style="font-size:11px;margin-top:4px;max-width:280px">Justificativa: ${esc(a.justRecusa)}</div>`:''}
        ${a.por?`<div class="muted" style="font-size:11px;margin-top:2px">${esc(a.por)} · ${dt(a.decEm)}</div>`:''}</td>
      ${pode?`<td class="right" style="white-space:nowrap">
        <button class="btn-dec ok ${a.decisao==='APROVADO'?'on':''}" title="Aprovar" onclick="aprovarAtr('${d.numero}',${i})">✓</button>
        <button class="btn-dec no ${a.decisao==='RECUSADO'?'on':''}" title="Recusar" onclick="recusarAtr('${d.numero}',${i})">✕</button></td>`:''}
    </tr>`).join('')}</tbody></table></div>
    ${hl?`<div class="err-inline" style="margin:10px 18px 14px">Atributos pendentes destacados — avalie todos antes de concluir ou rejeitar.</div>`:''}`;
}
function viewDemandaNova(d){
  const gt = podeAtuarGT();
  const resp = ehResponsavel(d);
  const alt = tipoId(d)==='alteracao';
  const ro = !resp ? '<span class="muted" style="font-size:12px">somente leitura</span>' : '';
  const cont = alt ? { a:d.atributos.filter(x=>x.decisao==='APROVADO').length, r:d.atributos.filter(x=>x.decisao==='RECUSADO').length, p:d.atributos.filter(x=>x.decisao==='PENDENTE').length } : null;
  return `
  <div class="breadcrumb"><span onclick="go('#/home')">Início</span> › <span onclick="go('${state.role==='solicitante'?'#/minhas':'#/fila'}')">Demandas</span> › ${d.numero}</div>
  <div class="page-head">
    <div><h1>${d.numero} <span style="font-size:14px">${badge(d.status)}</span></h1>
      <p class="page-sub">${esc(d.tipo)} · ${d.tipoCodigo} · origem ${d.origem} · aberta em ${dt(d.abertura)}</p></div>
    <div class="btn-row">${acoesNova(d)}</div>
  </div>
  ${d.devolutiva && ['RESPOSTA','REVISAO'].includes(d.status) ? `
    <div class="callout"><div class="ct">Ajustes solicitados pela Gestão de Tabelas</div>
      <p>${esc(d.devolutiva.texto)}</p>
      <p class="muted" style="font-size:12px;margin-top:8px">${esc(d.devolutiva.quem)} · ${esc(d.devolutiva.area)} · ${dt(d.devolutiva.em)}</p></div>`:''}
  ${d.status==='CONCLUIDA'?`<div class="callout ok"><div class="ct">Demanda concluída</div><p>${alt?`${cont.a} atributo(s) aprovado(s) e ${cont.r} recusado(s), resultado individual preservado.`:`Exclusão realizada em ${d10(d.dataEfetiva)}.`} Registro somente para consulta; ajustes posteriores exigem novo protocolo.</p></div>`:''}
  ${d.status==='REJEITADA'?`<div class="callout"><div class="ct">Demanda rejeitada</div><p>${esc((d.historico.slice(-1)[0]||{}).nota||'')}</p></div>`:''}
  <div class="split">
    <div>
      <div class="card">
        <div class="card-head"><h2>Dados da solicitação</h2>${ro}</div>
        <div class="card-body"><dl class="dl">
          <dt>Tipo de solicitação</dt><dd>${esc(d.tipo)}</dd>
          <dt>Código</dt><dd class="mono">${esc(d.codigo)} <span class="lock" title="Este campo não pode ser alterado.">🔒</span></dd>
          <dt>Tipo do código</dt><dd>${d.tipoCodigo}</dd>
          <dt>Descrição completa</dt><dd>${esc(d.descricao)}</dd>
          <dt>Justificativa</dt><dd>${esc(d.justificativa)}</dd>
          ${!alt?`<dt>Data da exclusão</dt><dd>${d10(d.dataExclusao)}${resp?` <button class="btn btn-outline btn-sm" style="margin-left:8px" onclick="editarDataExc('${d.numero}')">Editar</button>`:''}</dd>
          ${d.dataEfetiva?`<dt>Data efetiva</dt><dd><strong>${d10(d.dataEfetiva)}</strong></dd>`:''}`:''}
        </dl>
        ${resp?`<p class="hint" style="margin:12px 0 0">Código, tipo e descrição permanecem bloqueados. Se o código estiver incorreto, rejeite a demanda e solicite nova abertura.</p>`:''}</div>
      </div>
      ${alt?`<div class="card">
        <div class="card-head"><h2>Atributos solicitados (${d.atributos.length})</h2>
          <span class="muted" style="font-size:12px">${cont.a} aprovado(s) · ${cont.r} recusado(s) · ${cont.p} pendente(s)</span></div>
        ${tabelaAtributos(d, gt?'gt':'sol')}
      </div>`:''}
      <div class="card">
        <div class="card-head"><h2>Anexos (${(d.anexos||[]).length})</h2>
          ${resp?`<span class="muted" style="font-size:12px">Anexos desta etapa podem ser excluídos até a efetivação da ação</span>`:''}</div>
        <div class="card-body">
          ${(d.anexos||[]).length ? d.anexos.map((a,i)=>anexoRowEd(a, a.pend&&a.autor===me().nome?`delAnexoDemanda('${d.numero}',${i})`:'')).join('') : '<p class="muted" style="margin:0">Nenhum anexo vinculado.</p>'}
          ${resp?`<div style="margin-top:12px">${anexoPicker(tipoId(d)==='exclusao'?FMT_EXC:FMT_ALT, `addAnexoDemanda('${d.numero}')`)}</div>`:''}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Histórico e auditoria</h2><span class="muted" style="font-size:12px">ordem cronológica · imutável</span></div>
        <div class="card-body">${historicoHtml(d)}</div>
      </div>
    </div>
    <div>
      <div class="card"><div class="card-head"><h2>Situação</h2></div><div class="card-body"><dl class="dl">
        <dt>Status</dt><dd>${badge(d.status)}</dd><dt>Responsável</dt><dd>${esc(d.responsavel)}</dd>
        <dt>Solicitante</dt><dd>${esc(d.solicitante)}</dd><dt>Área</dt><dd>${esc(d.area)}</dd>
        <dt>Abertura</dt><dd>${dt(d.abertura)}</dd><dt>Última atualização</dt><dd>${dt(d.atualizacao)}</dd>
        ${d.conclusao?`<dt>Encerramento</dt><dd>${dt(d.conclusao)}</dd>`:''}
      </dl></div></div>
      <div class="card"><div class="card-head"><h2>Ciclos de retorno</h2></div><div class="card-body">
        <p class="muted" style="margin:0;font-size:12px">Retornos: <strong>${d.historico.filter(h=>h.acao.includes('Retorno')).length}</strong> ·
        Reenvios: <strong>${d.historico.filter(h=>h.acao.includes('Reenvio')).length}</strong><br>Protocolo mantido em todos os ciclos.</p></div></div>
      ${alt?`<div class="card"><div class="card-head"><h2>Pontos em aberto</h2></div><div class="card-body">
        <p class="muted" style="font-size:12px;line-height:1.6;margin:0">
        · Editar o Para de um atributo já decidido volta a situação para Pendente <span class="tag-open">hipótese</span><br>
        · Matriz oficial de domínio, máscara e tamanho por atributo <span class="tag-open">a definir</span></p></div></div>`:''}
    </div>
  </div>`;
}
function acoesNova(d){
  if(!ativa(d)) return `<button class="btn btn-ghost" onclick="go('#/consulta')">Voltar à consulta</button>`;
  const alt = tipoId(d)==='alteracao';
  const nota = t => `<span class="muted" style="font-size:12px;max-width:320px;text-align:right">${t}</span>`;
  if(podeAtuarGT()){
    const gestor = state.role==='gestor';
    if(d.status==='AGUARDANDO')
      return `<button class="btn btn-primary" onclick="assumirNova('${d.numero}')">Atribuir para mim</button>
              ${gestor?`<button class="btn btn-outline" onclick="reatribuir('${d.numero}')">Atribuir</button>`:''}`;
    const btnReat = gestor && d.status==='ANALISE' ? `<button class="btn btn-outline" onclick="reatribuir('${d.numero}')">Reatribuir</button>` : '';
    if(ehResponsavel(d))
      return `<button class="btn btn-warn" onclick="retornarNova('${d.numero}')">Retornar ao solicitante</button>
              <button class="btn btn-ok" onclick="concluirNova('${d.numero}')">Concluir ${alt?'alteração':'exclusão'}</button>
              <button class="btn btn-outline" onclick="rejeitarNova('${d.numero}')">Rejeitar ${alt?'alteração':'exclusão'}</button>${btnReat}`;
    if(d.status==='ANALISE')
      return gestor ? nota('Visão de revisão — dados somente leitura.')+btnReat
                    : nota('Somente leitura — demanda sob responsabilidade de '+esc(d.responsavel)+'.');
    return nota('Somente leitura — aguardando ação do solicitante.');
  }
  if(state.role==='solicitante' && d.solicitante===me().nome){
    if(d.status==='RESPOSTA') return `<button class="btn btn-primary" onclick="iniciarRevisao('${d.numero}')">Responder devolutiva</button>`;
    if(d.status==='REVISAO') return `<button class="btn btn-primary" onclick="go('#/revisao?n=${d.numero}')">Continuar resposta</button>`;
    return nota('Formulário bloqueado após o envio.');
  }
  return '';
}

/* ---------- assumir ---------- */
function assumirNova(n){
  confirmar('Atribuir para mim', 'Deseja assumir esta demanda?', 'Assumir', ()=>{
    const d = find(n);
    if(d.status!=='AGUARDANDO' || (d.responsavel && d.responsavel!=='—')){
      closeModal(); toast('Ação bloqueada','Esta demanda já possui responsável: '+d.responsavel+'.','red'); render(); return;
    }
    const agora = new Date().toISOString();
    d.status='ANALISE'; d.responsavel=me().nome; d.atualizacao=agora; d.slaHoras=16;
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'});
    audit('Atribuição', n, 'Responsável: '+me().nome);
    save(); closeModal(); toast('Demanda atribuída','A demanda foi atribuída a você.'); render();
  });
}

/* ---------- decisões por atributo ---------- */
function registrarDecisao(d, i, decisao, just){
  const a = d.atributos[i]; const agora = new Date().toISOString();
  const anterior = a.decisao;
  a.decisao = decisao; a.justRecusa = decisao==='RECUSADO'?just:''; a.por = me().nome; a.decEm = agora;
  const det = [['Código',d.codigo],['Atributo',a.nome],['De',a.de],['Para',a.para],['Resultado',SIT[decisao].label]];
  if(decisao==='RECUSADO') det.push(['Justificativa',just]);
  if(anterior!=='PENDENTE') det.unshift(['Decisão anterior',SIT[anterior].label]);
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:(anterior==='PENDENTE'?'Decisão do atributo: ':'Decisão alterada: ')+SIT[decisao].label, de:'ANALISE', para:'ANALISE', det});
  d.atualizacao = agora;
  audit('Decisão de atributo', d.numero, a.nome+': '+SIT[decisao].label);
  if(destacarPend===d.numero && !d.atributos.some(x=>x.decisao==='PENDENTE')) destacarPend=null;
  save(); toast('Decisão registrada','A decisão do atributo foi registrada com sucesso.'); render();
}
function aprovarAtr(n,i){
  const d = find(n); if(!ehResponsavel(d)) return;
  if(d.atributos[i].decisao==='APROVADO'){ toast('Sem alteração','O atributo já está aprovado.','info'); return; }
  registrarDecisao(d,i,'APROVADO');
}
function recusarAtr(n,i){
  const d = find(n); if(!ehResponsavel(d)) return; const a = d.atributos[i];
  modal('Recusar atributo — '+esc(a.nome), `
    <dl class="dl" style="margin-bottom:14px"><dt>Código</dt><dd class="mono">${esc(d.codigo)}</dd><dt>De</dt><dd>${esc(a.de)}</dd><dt>Para</dt><dd>${esc(a.para)}</dd>
    ${a.decisao!=='PENDENTE'?`<dt>Decisão atual</dt><dd>${sitBadge(a.decisao)}</dd>`:''}</dl>
    <div class="field" id="f-rec" style="margin:0"><label>Justificativa da recusa <span class="req">*</span></label>
      <textarea id="i-rec" placeholder="Explique o motivo da recusa"></textarea>
      <div class="err-msg">Informe a justificativa para recusar o atributo.</div></div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="confirmRecusa('${n}',${i})">Confirmar recusa</button>`);
}
function confirmRecusa(n,i){
  const t = document.getElementById('i-rec').value.trim();
  if(!t){ document.getElementById('f-rec').classList.add('error'); toast('Recusa bloqueada','Informe a justificativa para recusar o atributo.','red'); return; }
  closeModal(); registrarDecisao(find(n), i, 'RECUSADO', t);
}
function editarPara(n,i){
  const d = find(n); if(!ehResponsavel(d)) return; const a = d.atributos[i]; const def = atrDef(a.nome);
  modal('Editar valor Para — '+esc(a.nome), `
    <div class="grid-2"><div class="field"><label>De (bloqueado)</label><input type="text" value="${esc(a.de)}" disabled></div>
    <div class="field" id="f-epara"><label>Para <span class="req">*</span></label>${inputPara(def,'i-epara',a.para)}
      <div class="err-msg" id="e-epara"></div></div></div>
    <p class="hint" style="margin:0">${regraHint(def)}. A edição registra campo, valor anterior, valor novo, usuário e data/hora.
    ${a.decisao!=='PENDENTE'?' A decisão atual ('+SIT[a.decisao].label+') volta para Pendente.':''}</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="salvarPara('${n}',${i})">Salvar</button>`);
}
function salvarPara(n,i){
  const d = find(n); const a = d.atributos[i]; const novo = document.getElementById('i-epara').value.trim();
  let err = validarPara({ nome:a.nome, de:a.de, para:novo });
  if(!err && novo===a.para) err = 'Nenhuma alteração realizada.';
  if(!err && a.nome==='Autorização' && novo==='Não' && d.atributos.some(x=>x.nome==='Local de Autorização'))
    err = 'A combinação informada não é permitida. Revise os atributos selecionados.';
  if(err){ document.getElementById('f-epara').classList.add('error'); document.getElementById('e-epara').textContent=err; return; }
  const agora = new Date().toISOString();
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Edição do campo Para', de:'ANALISE', para:'ANALISE',
    diffs:[{campo:a.nome+' (Para)', de:a.para, para:novo}]});
  a.para = novo;
  if(a.decisao!=='PENDENTE'){ a.decisao='PENDENTE'; a.justRecusa=''; a.por=''; }
  d.atualizacao = agora; audit('Edição de campo', n, a.nome+' (Para)');
  save(); closeModal(); toast('Alterações salvas','As alterações foram registradas com sucesso.'); render();
}
function editarDataExc(n){
  const d = find(n); if(!ehResponsavel(d)) return;
  modal('Editar data da exclusão — '+n, `
    <div class="field" id="f-edx" style="max-width:260px"><label>Data da exclusão <span class="req">*</span></label>
      <input type="date" id="i-edx" value="${esc(d.dataExclusao)}"><div class="err-msg">A data informada não é operacionalmente válida para a exclusão.</div></div>
    <p class="hint" style="margin:0">Código, tipo e descrição não podem ser alterados. A edição é registrada no histórico (De → Para).</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="salvarDataExc('${n}')">Salvar</button>`);
}
function salvarDataExc(n){
  const d = find(n); const el = document.getElementById('i-edx');
  if(!dataValida(el)){ document.getElementById('f-edx').classList.add('error'); return; }
  if(el.value===d.dataExclusao){ closeModal(); return; }
  const agora = new Date().toISOString();
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Edição da data da exclusão', de:'ANALISE', para:'ANALISE',
    diffs:[{campo:'Data da exclusão', de:d10(d.dataExclusao), para:d10(el.value)}]});
  d.dataExclusao = el.value; d.atualizacao = agora; audit('Edição de campo', n, 'Data da exclusão');
  save(); closeModal(); toast('Alterações salvas','As alterações foram registradas com sucesso.'); render();
}

/* ---------- retornar / concluir / rejeitar ---------- */
function bloqueioPendentes(d, acao){
  if(tipoId(d)!=='alteracao' || !d.atributos.some(x=>x.decisao==='PENDENTE')) return false;
  destacarPend = d.numero; render();
  toast('Ação bloqueada','Todos os atributos do código devem ser avaliados antes da '+acao+' da demanda.','red');
  return true;
}
function retornarNova(n){
  const d = find(n);
  modal('Retornar ao solicitante — '+n, `
    ${tipoId(d)==='alteracao'&&d.atributos.some(x=>x.decisao==='PENDENTE')?`<div class="callout info"><div class="ct">Retorno parcial</div>
      <p>As decisões já registradas serão preservadas e os atributos não avaliados permanecerão Pendentes.</p></div>`:''}
    <div class="field" id="f-ret"><label>Motivo da devolutiva <span class="req">*</span></label>
      <textarea id="i-ret" placeholder="Detalhe os esclarecimentos ou complementos necessários"></textarea>
      <div class="err-msg">Informe o motivo da devolutiva para continuar.</div></div>
    ${blocoAnexoModal(d)}`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-warn" onclick="preRetorno('${n}')">Retornar</button>`);
}
function preRetorno(n){
  const txt = document.getElementById('i-ret').value.trim();
  if(!txt){ document.getElementById('f-ret').classList.add('error'); toast('Ação bloqueada','Informe o motivo da devolutiva para continuar.','red'); return; }
  confirmar('Confirmar devolutiva','Deseja retornar a demanda ao Solicitante?','Sim, retornar', ()=>{
    const d = find(n); const agora = new Date().toISOString();
    fixarAnexos(d);
    d.status='RESPOSTA'; d.responsavel=d.solicitante; d.atualizacao=agora; d.slaHoras=48;
    d.devolutiva={texto:txt, quem:me().nome, area:me().area, em:agora};
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Retorno ao solicitante', de:'ANALISE', para:'RESPOSTA', nota:txt});
    audit('Retorno ao solicitante', n, txt.slice(0,80)); destacarPend=null;
    save(); closeModal(); toast('Devolutiva enviada','A demanda foi encaminhada ao Solicitante e está aguardando resposta.'); render();
  }, 'btn-warn');
}
function concluirNova(n){
  const d = find(n); const alt = tipoId(d)==='alteracao';
  if(bloqueioPendentes(d,'conclusão')) return;
  modal((alt?'Concluir alteração — ':'Concluir exclusão — ')+n, `
    ${alt?`<table style="margin-bottom:14px"><thead><tr><th>Atributo</th><th>Para</th><th>Resultado</th></tr></thead><tbody>
      ${d.atributos.map(a=>`<tr><td>${esc(a.nome)}</td><td>${esc(a.para)}</td><td>${sitBadge(a.decisao)}</td></tr>`).join('')}</tbody></table>`
    :`<div class="field" id="f-def" style="max-width:260px"><label>Data efetiva da exclusão <span class="req">*</span></label>
      <input type="date" id="i-def" value="${esc(d.dataExclusao)}"><div class="hint">Data solicitada: ${d10(d.dataExclusao)}</div>
      <div class="err-msg">Informe a data efetiva da exclusão.</div></div>`}
    <div class="field" id="f-cobs"><label>Observação de conclusão ${alt?'(opcional)':'<span class="req">*</span>'}</label>
      <textarea id="i-cobs" placeholder="Registre a execução realizada"></textarea><div class="err-msg">A observação de conclusão é obrigatória.</div></div>
    ${blocoAnexoModal(d)}`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-ok" onclick="preConclusao('${n}')">Concluir</button>`);
}
function preConclusao(n){
  const d = find(n); const alt = tipoId(d)==='alteracao';
  const obs = document.getElementById('i-cobs').value.trim(); let def = '';
  if(!alt){
    const el = document.getElementById('i-def'); def = el.value;
    const okd = dataValida(el); document.getElementById('f-def').classList.toggle('error', !okd);
    document.getElementById('f-cobs').classList.toggle('error', !obs);
    if(!okd || !obs){ toast('Conclusão bloqueada', !okd?'Informe a data efetiva da exclusão.':'A observação de conclusão é obrigatória.','red'); return; }
  }
  confirmar('Confirmar conclusão', alt?'Confirma a conclusão da alteração?':'Confirma a conclusão da exclusão?', 'Sim, concluir', ()=>{
    const agora = new Date().toISOString();
    fixarAnexos(d);
    d.status='CONCLUIDA'; d.atualizacao=agora; d.conclusao=agora; d.responsavel=me().nome;
    let det;
    if(alt) det = [['Código',d.codigo],['Atributos aprovados',d.atributos.filter(a=>a.decisao==='APROVADO').map(a=>a.nome).join(', ')||'—'],
                   ['Atributos recusados',d.atributos.filter(a=>a.decisao==='RECUSADO').map(a=>a.nome).join(', ')||'—']];
    else { d.dataEfetiva = def; det = [['Código',d.codigo],['Data solicitada',d10(d.dataExclusao)],['Data efetiva',d10(def)],['Anexos',String(d.anexos.length)]]; }
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:alt?'Alteração concluída':'Exclusão concluída', de:'ANALISE', para:'CONCLUIDA', nota:obs, det});
    audit('Conclusão de demanda', n, d.tipo);
    save(); closeModal(); toast('Conclusão realizada', alt?'A alteração foi concluída com sucesso.':'A exclusão foi concluída com sucesso.'); render();
  }, 'btn-ok');
}
function rejeitarNova(n){
  const d = find(n); const alt = tipoId(d)==='alteracao';
  if(bloqueioPendentes(d,'rejeição')) return;
  modal((alt?'Rejeitar alteração — ':'Rejeitar exclusão — ')+n, `
    <div class="field" id="f-rej"><label>Justificativa da rejeição <span class="req">*</span></label>
      <textarea id="i-rej" placeholder="Informe o motivo da rejeição"></textarea><div class="err-msg">Informe a justificativa da rejeição.</div></div>
    ${blocoAnexoModal(d)}
    <p class="muted" style="font-size:12px;margin:0">A demanda ficará somente para consulta; nova solicitação poderá ser aberta para o mesmo código.</p>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="preRejeicao('${n}')">Rejeitar</button>`);
}
function preRejeicao(n){
  const d = find(n); const alt = tipoId(d)==='alteracao';
  const txt = document.getElementById('i-rej').value.trim();
  if(!txt){ document.getElementById('f-rej').classList.add('error'); toast('Rejeição bloqueada','Informe a justificativa da rejeição.','red'); return; }
  confirmar('Confirmar rejeição', alt?'Confirma a rejeição da demanda?':'Confirma a rejeição da solicitação de exclusão?', 'Sim, rejeitar', ()=>{
    const agora = new Date().toISOString();
    fixarAnexos(d);
    d.status='REJEITADA'; d.atualizacao=agora; d.conclusao=agora; d.responsavel=me().nome;
    d.historico.push({em:agora, quem:me().nome, area:me().area, acao:alt?'Alteração rejeitada':'Exclusão rejeitada', de:'ANALISE', para:'REJEITADA', nota:txt});
    audit('Rejeição de demanda', n, txt.slice(0,80));
    save(); closeModal(); toast('Rejeição realizada','A demanda foi rejeitada e encerrada.','red'); render();
  });
}

/* =========================================================
   Resposta à devolutiva (Solicitante) — formulário bloqueado
   ========================================================= */
function viewRevisaoNova(d){
  const alt = tipoId(d)==='alteracao';
  return `
  <div class="breadcrumb"><span onclick="go('#/minhas')">Minhas demandas</span> › ${d.numero} › Resposta à devolutiva</div>
  <div class="page-head"><div><h1>Resposta à devolutiva ${d.numero}</h1>
    <p class="page-sub">${esc(d.tipo)} · o formulário original permanece bloqueado; registre a resposta e, se necessário, novos anexos.</p></div></div>
  <div class="callout"><div class="ct">Ajustes solicitados</div><p>${esc(d.devolutiva?.texto||'—')}</p>
    <p class="muted" style="font-size:12px;margin-top:8px">${esc(d.devolutiva?.quem||'')} · ${esc(d.devolutiva?.area||'')} · ${dt(d.devolutiva?.em)}</p></div>
  <div class="split">
    <div>
      <div class="card"><div class="card-head"><h2>Formulário enviado</h2><span class="muted" style="font-size:12px">somente leitura</span></div>
        <div class="card-body"><dl class="dl">
          <dt>Código</dt><dd class="mono">${esc(d.codigo)} · ${d.tipoCodigo}</dd><dt>Descrição completa</dt><dd>${esc(d.descricao)}</dd>
          <dt>Justificativa</dt><dd>${esc(d.justificativa)}</dd>${!alt?`<dt>Data da exclusão</dt><dd>${d10(d.dataExclusao)}</dd>`:''}</dl></div></div>
      ${alt?`<div class="card"><div class="card-head"><h2>Situação dos atributos</h2><span class="muted" style="font-size:12px">decisões da Gestão de Tabelas · não editáveis</span></div>
        ${tabelaAtributos(d,'sol')}</div>`:''}
      <div class="card">
        <div class="card-head"><h2>Sua resposta</h2></div>
        <div class="card-body">
          <div class="field" id="f-resp"><label>Resposta aos Ajustes <span class="req">*</span></label>
            <textarea id="r-resp" placeholder="Descreva os esclarecimentos ou complementos"></textarea>
            <div class="err-msg">Preencha o campo Resposta aos Ajustes para reenviar a demanda.</div></div>
          <div class="field" style="margin-bottom:0"><label>Novos anexos</label>
            ${anexoPicker(alt?FMT_ALT:FMT_EXC, `addAnexoDemanda('${d.numero}','anx-etapa')`)}
            <div id="anx-etapa" style="margin-top:8px">${anexosEtapa(d)}</div></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" onclick="go('#/demanda?n=${d.numero}')">Voltar</button>
          <button class="btn btn-primary" onclick="reenviarNova('${d.numero}')">Concluir reenvio</button>
        </div>
      </div>
    </div>
    <div><div class="card"><div class="card-head"><h2>Histórico</h2></div><div class="card-body">${historicoHtml(d)}</div></div></div>
  </div>`;
}
function reenviarNova(n){
  const d = find(n); const resp = document.getElementById('r-resp').value.trim();
  if(!resp){ document.getElementById('f-resp').classList.add('error'); toast('Reenvio bloqueado','Preencha o campo Resposta aos Ajustes para reenviar a demanda.','red'); return; }
  const agora = new Date().toISOString();
  const novos = d.anexos.filter(a=>a.pend && a.autor===me().nome).length;
  fixarAnexos(d);
  d.status='AGUARDANDO'; d.responsavel='—'; d.atualizacao=agora; d.slaHoras=24; d.devolutiva=null;
  d.historico.push({em:agora, quem:me().nome, area:me().area, acao:'Reenvio após devolutiva', de:'REVISAO', para:'AGUARDANDO', nota:resp,
    det: novos?[['Novos anexos',String(novos)]]:undefined});
  audit('Reenvio de demanda', n, 'Resposta aos ajustes');
  save(); toast('Demanda reenviada','Protocolo mantido. Decisões preservadas. Status: Aguardando Análise.');
  go('#/demanda?n='+n);
}
