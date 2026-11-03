/* =========================================================
   v4 — Onda 2: Especialidade × Procedimento e Carga de arquivo
   ========================================================= */

/* HU-H — Tabela de referência de especialidades (amostra; base real ≈ 200 itens, fonte a esclarecer) */
const ESPECIALIDADES = [
  ['001','Acupuntura'],['002','Alergia e imunologia'],['003','Anestesiologia'],['004','Angiologia'],['005','Cardiologia'],
  ['006','Cirurgia cardiovascular'],['007','Cirurgia da mão'],['008','Cirurgia de cabeça e pescoço'],['009','Cirurgia do aparelho digestivo'],
  ['010','Cirurgia geral'],['011','Cirurgia pediátrica'],['012','Cirurgia plástica'],['013','Cirurgia torácica'],['014','Cirurgia vascular'],
  ['015','Clínica médica'],['016','Coloproctologia'],['017','Dermatologia'],['018','Endocrinologia e metabologia'],['019','Endoscopia'],
  ['020','Gastroenterologia'],['021','Genética médica'],['022','Geriatria'],['023','Ginecologia e obstetrícia'],['024','Hematologia e hemoterapia'],
  ['025','Homeopatia'],['026','Infectologia'],['027','Mastologia'],['028','Medicina de família e comunidade'],['029','Medicina do trabalho'],
  ['030','Medicina esportiva'],['031','Medicina física e reabilitação'],['032','Medicina intensiva'],['033','Medicina nuclear'],
  ['034','Nefrologia'],['035','Neurocirurgia'],['036','Neurologia'],['037','Nutrologia'],['038','Oftalmologia'],['039','Oncologia clínica'],
  ['040','Ortopedia e traumatologia'],['041','Otorrinolaringologia'],['042','Patologia'],['043','Pediatria'],['044','Pneumologia'],
  ['045','Psiquiatria'],['046','Radiologia e diagnóstico por imagem'],['047','Radioterapia'],['048','Reumatologia'],['049','Urologia'],
  ['050','Medicina legal'],['051','Cirurgia oncológica'],['052','Patologia clínica / medicina laboratorial']
].map(([cod,desc])=>({ cod, desc, ativa:true }));
['025','050'].forEach(c=>{ ESPECIALIDADES.find(e=>e.cod===c).ativa = false; });

const espDef = cod => ESPECIALIDADES.find(e=>e.cod===cod) || { cod, desc:'(especialidade não localizada)', ativa:false };
const espNome = cod => { const e = espDef(cod); return e.cod+' - '+e.desc; };
const ESP_ATIVAS = () => ESPECIALIDADES.filter(e=>e.ativa).sort((a,b)=>a.desc.localeCompare(b.desc,'pt-BR'));

/* Especialidades já relacionadas ao procedimento (base simulada) */
const ESP_RELACIONADAS = {
  '40101010':['015','028','043'],
  '41001010':['046','036'],
  '30101012':['017','010','012'],
  '40304361':['052','024'],
  '31009336':['009','010'],
  '70012345':['005','006'],
  '90012345':['014','004']
};
const espRelacionadas = cod => (ESP_RELACIONADAS[cod]||[]).slice();

/* Pré-condição Sprint 3 (HU-B RN03): atributo "Especialidade" retirado da lista de atributos */
(function(){
  const i = ATRIBUTOS.findIndex(a=>a.nome==='Especialidade'); if(i>=0) ATRIBUTOS.splice(i,1);
  Object.values(BASE_SSCF).forEach(c=>{ if(c.atr) delete c.atr['Especialidade']; });
})();

/* Carga por arquivo — parâmetros (parametrizáveis) */
const PARAM_CARGA = { minLinhas:10, tamMaxMB:5 };
const ABAS_CARGA = {
  'Inclusao':  { tipo:'criacao',   rotulo:'Inclusão de procedimento',
    cols:['Tipo do código','Código','Descrição','Valor','Abrangência','Autorização','Local de Autorização','Data de vigência','Código espelho','Justificativa'] },
  'Alteracao': { tipo:'alteracao', rotulo:'Alteração de procedimento',
    cols:['Código','Atributo','Para','Justificativa Geral'] },
  'Exclusao':  { tipo:'exclusao',  rotulo:'Exclusão de procedimento',
    cols:['Código','Data da exclusão','Justificativa'] }
};

const GT = 'Gestão de Tabelas';
const esp = (cod, acao, origem, parecer, extra) => ({ cod, acao, origem, parecer, ...(extra||{}) });

/* Ajustes nos casos existentes */
(function(){
  const d128 = SEED.find(d=>d.numero==='WF-2026-000128');
  d128.especialidades = [esp('046','ASSOCIACAO','ANALISE'), esp('005','ASSOCIACAO','ANALISE'), esp('030','ASSOCIACAO','ANALISE')];
  const fim = d128.historico[d128.historico.length-1];
  fim.esp = d128.especialidades.map(e=>({cod:e.cod, acao:e.acao}));
  const d137 = SEED.find(d=>d.numero==='WF-2026-000137');
  d137.especialidades = [esp('014','ASSOCIACAO','ANALISE'), esp('017','ASSOCIACAO','ANALISE')];
})();

SEED.push(
  {
    numero:'WF-2026-000142', tipo:'Criação de Código', tipoCodigo:'TUSS',
    descricao:'Consulta ambulatorial em medicina do sono com polissonografia domiciliar',
    valor:520.00, abrangencia:'Ambos', autorizacao:'Não', justificativa:'Novo código TUSS publicado pela ANS na atualização do rol.',
    vigencia:'2026-11-01', codigoEspelho:'', codigoCadastrado:'',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-10-26T09:00:00', atualizacao:'2026-10-27T10:10:00',
    status:'ANALISE', responsavel:'Carlos Lima', origem:'Manual', slaHoras:14, especialidades:[],
    anexos:[{nome:'publicacao_rol_ans.pdf', tam:'540 KB', autor:'Ana Ribeiro', em:'26/10/2026 08:58'}],
    historico:[
      {em:'2026-10-26T09:00:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-10-27T10:10:00', quem:'Carlos Lima', area:GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'}
    ]
  },
  {
    numero:'WF-2026-000143', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'40101010',
    descricao:BASE_SSCF['40101010'].descricao,
    justificativa:'Consulta passa a ser realizada também por ginecologistas da rede; ajuste do valor de rede negociado.',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-10-27T14:20:00', atualizacao:'2026-10-28T09:00:00',
    status:'ANALISE', responsavel:'Carlos Lima', origem:'Manual', slaHoras:11,
    atributos:[ { nome:'Valor de Rede', de:'150,00', para:'165,00', decisao:'PENDENTE' } ],
    especialidades:[
      esp('023','ASSOCIACAO','SOLICITACAO','PENDENTE'),
      esp('027','ASSOCIACAO','SOLICITACAO','PENDENTE'),
      esp('043','DESASSOCIACAO','SOLICITACAO','PENDENTE')
    ],
    anexos:[{nome:'credenciamento_ginecologia.pdf', tam:'230 KB', autor:'Ana Ribeiro', em:'27/10/2026 14:18'}],
    historico:[
      {em:'2026-10-27T14:20:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO',
       esp:[{cod:'023',acao:'ASSOCIACAO'},{cod:'027',acao:'ASSOCIACAO'},{cod:'043',acao:'DESASSOCIACAO'}]},
      {em:'2026-10-28T09:00:00', quem:'Carlos Lima', area:GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'}
    ]
  },
  {
    numero:'WF-2026-000144', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'41001010',
    descricao:BASE_SSCF['41001010'].descricao,
    justificativa:'Incluir neurocirurgia e oncologia clínica como especialidades solicitantes do exame.',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-10-28T16:00:00', atualizacao:'2026-10-28T16:00:00',
    status:'AGUARDANDO', responsavel:'—', origem:'Manual', slaHoras:22, atributos:[],
    especialidades:[ esp('035','ASSOCIACAO','SOLICITACAO','PENDENTE'), esp('039','ASSOCIACAO','SOLICITACAO','PENDENTE') ],
    anexos:[],
    historico:[{em:'2026-10-28T16:00:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO',
      esp:[{cod:'035',acao:'ASSOCIACAO'},{cod:'039',acao:'ASSOCIACAO'}]}]
  },
  {
    numero:'WF-2026-000145', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'30101012',
    descricao:BASE_SSCF['30101012'].descricao,
    justificativa:'Revisão das especialidades executoras e do valor de rede do procedimento.',
    solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-10-20T10:00:00', atualizacao:'2026-10-23T15:30:00',
    status:'CONCLUIDA', responsavel:'Renata Alves', origem:'Manual', slaHoras:0, conclusao:'2026-10-23T15:30:00',
    atributos:[
      { nome:'Valor de Rede', de:'210,00', para:'230,00', decisao:'APROVADO', por:'Renata Alves', decEm:'2026-10-23T15:00:00' },
      { nome:'Porte Anestésico', de:'1', para:'2', decisao:'RECUSADO', justRecusa:'Porte mantido conforme CBHPM.', por:'Renata Alves', decEm:'2026-10-23T15:05:00' }
    ],
    especialidades:[
      esp('051','ASSOCIACAO','SOLICITACAO','APROVADO',{por:'Renata Alves', decEm:'2026-10-23T15:10:00'}),
      esp('012','DESASSOCIACAO','SOLICITACAO','RECUSADO',{justRecusa:'Cirurgia plástica permanece executora do procedimento.', por:'Renata Alves', decEm:'2026-10-23T15:12:00'}),
      esp('042','ASSOCIACAO','ANALISE','APROVADO',{por:'Renata Alves', decEm:'2026-10-23T15:15:00'})
    ],
    anexos:[],
    historico:[
      {em:'2026-10-20T10:00:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO',
       esp:[{cod:'051',acao:'ASSOCIACAO'},{cod:'012',acao:'DESASSOCIACAO'}]},
      {em:'2026-10-21T08:30:00', quem:'Renata Alves', area:GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-10-23T15:15:00', quem:'Renata Alves', area:GT, acao:'Especialidade incluída na análise', de:'ANALISE', para:'ANALISE',
       esp:[{cod:'042',acao:'ASSOCIACAO'}]},
      {em:'2026-10-23T15:30:00', quem:'Renata Alves', area:GT, acao:'Alteração concluída', de:'ANALISE', para:'CONCLUIDA',
       nota:'Efetivação no legado realizada manualmente.',
       det:[['Atributos aprovados','Valor de Rede'],['Atributos recusados','Porte Anestésico']],
       esp:[{cod:'051',acao:'ASSOCIACAO',parecer:'APROVADO'},{cod:'012',acao:'DESASSOCIACAO',parecer:'RECUSADO'},{cod:'042',acao:'ASSOCIACAO',parecer:'APROVADO'}]}
    ]
  }
);

/* Demandas oriundas de carga (origem = Carga) */
const CARGA_SEED_ARQ = 'SINT_carga_solicitacoes_27102026.xlsx';
[
  ['146','criacao','TUSS','Sessão de terapia ocupacional em grupo',95.00,'40101010'],
  ['147','criacao','TUSS','Avaliação fonoaudiológica para disfagia',160.00,''],
  ['148','exclusao','THSM','',0,'70012345']
].forEach(([n,t,tc,desc,valor,cod])=>{
  const base = { numero:'WF-2026-000'+n, tipoCodigo:tc, solicitante:'Renata Alves', area:GT, abertura:'2026-10-27T11:05:00', atualizacao:'2026-10-27T11:05:00',
    status:'AGUARDANDO', responsavel:'—', origem:'Carga', arquivoCarga:CARGA_SEED_ARQ, slaHoras:21, anexos:[],
    historico:[{em:'2026-10-27T11:05:00', quem:'Renata Alves', area:GT, acao:'Abertura da demanda por carga de arquivo', de:'—', para:'AGUARDANDO', nota:'Arquivo '+CARGA_SEED_ARQ}] };
  if(t==='criacao') Object.assign(base, { tipo:'Criação de Código', descricao:desc, valor, abrangencia:'Rede', autorizacao:'Não', vigencia:'2026-11-15',
    justificativa:'Carga consolidada de novos procedimentos de reabilitação.', codigoEspelho:'', codigoCadastrado:'', especialidades:[] });
  else Object.assign(base, { tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', codigo:cod, descricao:BASE_SSCF[cod].descricao,
    dataExclusao:'2026-12-01', justificativa:'Código substituído na revisão do rol (carga).' });
  SEED.push(base);
});
SEED.push({
  numero:'WF-2026-000149', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'31009336',
  descricao:BASE_SSCF['31009336'].descricao, justificativa:'Revisão de parâmetros do procedimento (carga).',
  solicitante:'Renata Alves', area:GT, abertura:'2026-10-27T11:05:00', atualizacao:'2026-10-27T11:05:00',
  status:'AGUARDANDO', responsavel:'—', origem:'Carga', arquivoCarga:CARGA_SEED_ARQ, slaHoras:21, anexos:[], especialidades:[],
  atributos:[['Valor de Rede','3.250,00','3.400,00'],['Day Clinic','N','S'],['Idade Inicial','0','12'],['Carência','0','180'],
    ['Bilateralidade','N','S'],['Divulga','N','S'],['Divulga Internet','N','S']].map(([nome,de,para])=>({nome,de,para,decisao:'PENDENTE'})),
  historico:[{em:'2026-10-27T11:05:00', quem:'Renata Alves', area:GT, acao:'Abertura da demanda por carga de arquivo', de:'—', para:'AGUARDANDO', nota:'Arquivo '+CARGA_SEED_ARQ}]
});

const HIST_CARGA_SEED = [
  { id:'CG-0001', arquivo:CARGA_SEED_ARQ, em:'2026-10-27T11:05:00', quem:'Renata Alves', linhas:10, linhasPorTipo:{ criacao:2, alteracao:7, exclusao:1 },
    porTipo:{ criacao:2, alteracao:1, exclusao:1 }, solicitacoes:4, demandas:['WF-2026-000146','WF-2026-000147','WF-2026-000149','WF-2026-000148'],
    p8:'P8-DOC-2026-10-000731', exemplo:'seed' }
];
