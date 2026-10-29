/* Protótipo navegável — dados de demonstração (sem backend) */

const USERS = {
  solicitante: { nome:'Ana Ribeiro', matricula:'C0384512', email:'ana.ribeiro@empresa.com.br', area:'Rede Credenciada - SP', perfil:'Solicitante', ini:'AR' },
  analista:    { nome:'Carlos Lima', matricula:'C0119873', email:'carlos.lima@empresa.com.br', area:'Gestão de Tabelas', perfil:'Analista de Gestão de Tabelas', ini:'CL' },
  analista2:   { nome:'Renata Alves', matricula:'C0204417', email:'renata.alves@empresa.com.br', area:'Gestão de Tabelas', perfil:'Analista de Gestão de Tabelas', ini:'RA' },
  gestor:      { nome:'Marta Souza', matricula:'C0092210', email:'marta.souza@empresa.com.br', area:'Gestão de Tabelas', perfil:'Gestor de Gestão de Tabelas', ini:'MS' },
  consulta:    { nome:'Auditoria Interna', matricula:'C0771002', email:'auditoria@empresa.com.br', area:'Inspetoria', perfil:'Consulta/Relatório', ini:'AI' }
};

const STATUS = {
  RASCUNHO:   { label:'Rascunho', cls:'b-rascunho' },
  AGUARDANDO: { label:'Aguardando Análise', cls:'b-aguardando' },
  ANALISE:    { label:'Em Análise', cls:'b-analise' },
  RESPOSTA:   { label:'Aguardando Resposta do Solicitante', cls:'b-resposta' },
  REVISAO:    { label:'Em Revisão pelo Solicitante', cls:'b-revisao' },
  CONCLUIDA:  { label:'Demanda Concluída', cls:'b-concluida' },
  REJEITADA:  { label:'Demanda Rejeitada', cls:'b-rejeitada' }
};

const TIPOS_SOLICITACAO = [
  { id:'criacao',    nome:'Criação de Código TUSS/THSM', desc:'Solicitar a inclusão de um novo código na tabela.', ativo:true },
  { id:'alteracao',  nome:'Alteração de Atributos',      desc:'Alterar um ou mais atributos de um código TUSS/THSM existente (De/Para por atributo).', ativo:true },
  { id:'exclusao',   nome:'Exclusão de Código TUSS/THSM', desc:'Solicitar a exclusão de um código existente, com justificativa e data da exclusão.', ativo:true },
  { id:'pacote',     nome:'Procedimentos Padronizados / Pacotes', desc:'Montagem de pacotes e procedimentos padronizados.', ativo:false },
  { id:'ans',        nome:'Tratamento de Arquivo ANS',    desc:'Carga e comparação automática pelo Robô.', ativo:false },
  { id:'normas',     nome:'Análise de Normas e Procedimentos', desc:'Encaminhamento para análise técnica de N&P.', ativo:false }
];

const SEED = [
  {
    numero:'WF-2026-000141', tipo:'Criação de Código', tipoCodigo:'TUSS',
    descricao:'Ressonância magnética de crânio com espectroscopia',
    valor:1480.50, justificativa:'Procedimento passou a ser exigido em contrato coletivo a partir de 01/09.',
    vigencia:'2026-09-01', codigoEspelho:'', codigoCadastrado:'',
    solicitante:'Ana Ribeiro', area:'Rede Credenciada - SP', abertura:'2026-08-24T09:12:00',
    atualizacao:'2026-08-24T09:12:00', status:'AGUARDANDO', responsavel:'—', origem:'Manual',
    slaHoras:22,
    anexos:[{nome:'parecer_tecnico.pdf', tam:'412 KB', autor:'Ana Ribeiro', em:'24/08/2026 09:11'}],
    historico:[
      {em:'2026-08-24T09:12:00', quem:'Ana Ribeiro', area:'Rede Credenciada - SP', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'}
    ]
  },
  {
    numero:'WF-2026-000139', tipo:'Criação de Código', tipoCodigo:'THSM',
    descricao:'Kit de cateter balão farmacológico periférico',
    valor:8720.00, justificativa:'Novo material homologado pela área médica; sem código correspondente na THSM.',
    vigencia:'2026-08-15', codigoEspelho:'THSM-441220', codigoCadastrado:'',
    solicitante:'Ana Ribeiro', area:'Rede Credenciada - SP', abertura:'2026-08-21T14:40:00',
    atualizacao:'2026-08-25T11:02:00', status:'ANALISE', responsavel:'Carlos Lima', origem:'Manual',
    slaHoras:9,
    anexos:[
      {nome:'nota_fiscal_referencia.pdf', tam:'220 KB', autor:'Ana Ribeiro', em:'21/08/2026 14:39'},
      {nome:'homologacao_medica.docx', tam:'88 KB', autor:'Ana Ribeiro', em:'21/08/2026 14:40'}
    ],
    historico:[
      {em:'2026-08-21T14:40:00', quem:'Ana Ribeiro', area:'Rede Credenciada - SP', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-25T11:02:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'}
    ]
  },
  {
    numero:'WF-2026-000137', tipo:'Criação de Código', tipoCodigo:'TUSS',
    descricao:'Terapia por pressão negativa em ferida complexa',
    valor:640.00, justificativa:'Procedimento incorporado ao protocolo de feridas da rede hospitalar.',
    vigencia:'2026-09-15', codigoEspelho:'', codigoCadastrado:'',
    solicitante:'Ana Ribeiro', area:'Rede Credenciada - SP', abertura:'2026-08-20T10:15:00',
    atualizacao:'2026-08-24T15:30:00', status:'ANALISE', responsavel:'Renata Alves', origem:'Manual',
    slaHoras:12,
    anexos:[{nome:'protocolo_feridas.pdf', tam:'305 KB', autor:'Ana Ribeiro', em:'20/08/2026 10:14'}],
    historico:[
      {em:'2026-08-20T10:15:00', quem:'Ana Ribeiro', area:'Rede Credenciada - SP', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-24T15:30:00', quem:'Renata Alves', area:'Gestão de Tabelas', acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'}
    ]
  },
  {
    numero:'WF-2026-000132', tipo:'Criação de Código', tipoCodigo:'TUSS',
    descricao:'Consulta de acompanhamento em nutrologia',
    valor:180.00, justificativa:'Demanda da rede para atendimento ambulatorial em programa de obesidade.',
    vigencia:'2026-07-01', codigoEspelho:'', codigoCadastrado:'',
    solicitante:'Ana Ribeiro', area:'Rede Credenciada - SP', abertura:'2026-08-18T10:05:00',
    atualizacao:'2026-08-22T16:20:00', status:'RESPOSTA', responsavel:'Ana Ribeiro', origem:'Manual',
    slaHoras:-6,
    devolutiva:{
      texto:'Favor detalhar a diferença em relação ao código 10101039 (consulta em consultório) e anexar a tabela de valores acordada com a rede. O valor informado está acima do referencial praticado.',
      quem:'Carlos Lima', area:'Gestão de Tabelas', em:'2026-08-22T16:20:00'
    },
    anexos:[{nome:'programa_obesidade.pdf', tam:'1,2 MB', autor:'Ana Ribeiro', em:'18/08/2026 10:04'}],
    historico:[
      {em:'2026-08-18T10:05:00', quem:'Ana Ribeiro', area:'Rede Credenciada - SP', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-20T08:30:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-22T16:20:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Retorno ao solicitante', de:'ANALISE', para:'RESPOSTA',
       nota:'Favor detalhar a diferença em relação ao código 10101039 e anexar a tabela de valores acordada com a rede.'}
    ]
  },
  {
    numero:'WF-2026-000128', tipo:'Criação de Código', tipoCodigo:'TUSS',
    descricao:'Teste ergométrico com protocolo de Bruce modificado',
    valor:340.00, justificativa:'Padronização solicitada pela auditoria médica.',
    vigencia:'2026-06-01', codigoEspelho:'TUSS-201010', codigoCadastrado:'TUSS-4.01.03.35-9',
    solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-08-10T08:15:00',
    atualizacao:'2026-08-14T17:45:00', status:'CONCLUIDA', responsavel:'Carlos Lima', origem:'Manual',
    slaHoras:0, conclusao:'2026-08-14T17:45:00',
    anexos:[],
    historico:[
      {em:'2026-08-10T08:15:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-11T09:00:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-12T10:20:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Retorno ao solicitante', de:'ANALISE', para:'RESPOSTA', nota:'Informar se há sobreposição com o código já vigente.'},
      {em:'2026-08-13T11:00:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Reenvio após ajustes', de:'REVISAO', para:'AGUARDANDO', nota:'Não há sobreposição; o protocolo modificado exige registro distinto.',
       diffs:[{campo:'Valor', de:'R$ 300,00', para:'R$ 340,00'}]},
      {em:'2026-08-14T17:45:00', quem:'Carlos Lima', area:'Gestão de Tabelas', acao:'Cadastro concluído', de:'ANALISE', para:'CONCLUIDA', nota:'Código TUSS-4.01.03.35-9 cadastrado na tabela vigente.'}
    ]
  },
  {
    numero:'WF-2026-000119', tipo:'Criação de Código', tipoCodigo:'THSM',
    descricao:'Órtese de punho sob medida em termoplástico',
    valor:0, justificativa:'Solicitação da rede de reabilitação.',
    vigencia:'2026-05-01', codigoEspelho:'', codigoCadastrado:'',
    solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-08-04T13:00:00',
    atualizacao:'2026-08-07T09:30:00', status:'REJEITADA', responsavel:'Marta Souza', origem:'Manual',
    slaHoras:0, conclusao:'2026-08-07T09:30:00',
    anexos:[],
    historico:[
      {em:'2026-08-04T13:00:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-05T08:10:00', quem:'Marta Souza', area:'Gestão de Tabelas', acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-07T09:30:00', quem:'Marta Souza', area:'Gestão de Tabelas', acao:'Cadastro rejeitado', de:'ANALISE', para:'REJEITADA',
       nota:'Item já contemplado pelo código THSM-701150 vigente. Sem necessidade de novo código.'}
    ]
  }
];

const NOTIFICACOES_SEED = [
  { evento:'Retorno', para:'Ana Ribeiro', demanda:'WF-2026-000132', em:'22/08/2026 16:20', texto:'Ajustes solicitados pela Gestão de Tabelas.' },
  { evento:'Entrada na fila', para:'Gestão de Tabelas', demanda:'WF-2026-000141', em:'24/08/2026 09:12', texto:'Nova demanda TUSS aguardando análise.' },
  { evento:'Conclusão', para:'Bruno Teixeira', demanda:'WF-2026-000128', em:'14/08/2026 17:45', texto:'Cadastro realizado. Código TUSS-4.01.03.35-9.' }
];

/* =========================================================
   v2 — Alteração de Atributos e Exclusão de Código
   ========================================================= */

/* Matriz de Regras de Atributos (hipótese de trabalho — a matriz oficial ainda será definida) */
const SN = { t:'simnao' };
const TX = n => ({ t:'texto', max:n });
const NU = n => ({ t:'numero', max:n });
const MO = { t:'moeda' };
const DM = (...o) => ({ t:'dominio', opcoes:o });
const ATRIBUTOS = [
  ['Código',NU(99999999)],['Tabela',TX(20)],['Descrição Resumida',TX(60)],
  ['Descrição Completa',TX(250)],['Classe',TX(20)],['Quantidade CH',NU(99999)],
  ['Grupo Procedimento Gerencial',TX(40)],['AUX',NU(9)],['Classif. Gerencial',TX(40)],
  ['Sub Classif. de Terapia',TX(40)],['Porte Anestésico',NU(8)],['SIP',TX(20)],
  ['Incidência de Raio X',NU(99)],['Área de Filme',NU(9999)],['Requer Complemento',SN],
  ['Autorização',SN],['Local de Autorização',DM('Central','Sala de Hospitais')],['Carência',NU(999)],
  ['Divulga',SN],['Incide Imposto',SN],['Bilateralidade',SN],
  ['Divulga Internet',SN],['WEB SEGURADO',SN],['WEB PRÉ-LEI',SN],
  ['WEB L.E.C.E',SN],['Grupo',NU(999)],['Descrição Grupo',TX(60)],
  ['Subgrupo',NU(999)],['Descrição Subgrupo',TX(60)],['AMB',NU(99999999)],
  ['P S',SN],['INT',SN],['PF',SN],
  ['Sexo',DM('Ambos','Masculino','Feminino')],['Idade Inicial',NU(130)],['Idade Final',NU(130)],
  ['Material',SN],['ROL',SN],['Instrumentador',SN],
  ['QTDE MÁX 1',NU(999)],['TEMPO 1',NU(999)],['QTDE MÁX 2',NU(999)],
  ['TEMPO 2',NU(999)],['ADIC. URGENC',SN],['INDC. PROC. PADRONIZ.',SN],
  ['Day Clinic',SN],['DUT',SN],['Tipo',TX(20)],
  ['Medicamento Associado',SN],['Rede+',SN],['Procedimento Copay',SN],
  ['Tabela Copay',TX(20)],['Novo Modelo Coparticipação',SN],['Reembolso Específico',SN],
  ['Reembolso Nacional Plus',SN],['Reembolso Premium',SN],['Valor de Rede',MO],
  ['Valor de Reembolso',MO],['Especialidade',TX(60)],['Cobertura',TX(40)],
  ['PAC',SN],['Técnica de Vídeo',SN],['Procedimento uma única vez',SN],
  ['Cobertura Pré-Lei',SN]
].map(([nome,r])=>({ nome, ...r }));

/* Base corporativa simulada (SSCF) — códigos existentes e valores atuais dos atributos */
const BASE_SSCF = {
  '40101010': { tipo:'TUSS', descricao:'Consulta em consultório (no horário normal ou preestabelecido)',
    atr:{ 'Valor de Rede':'150,00', 'Valor de Reembolso':'120,00', 'Autorização':'Não', 'Especialidade':'Clínica médica', 'Sexo':'Ambos' } },
  '41001010': { tipo:'TUSS', descricao:'Tomografia computadorizada de crânio',
    atr:{ 'Valor de Rede':'420,00', 'Autorização':'Sim', 'Local de Autorização':'Central', 'Day Clinic':'Não' } },
  '30101012': { tipo:'TUSS', descricao:'Biópsia de pele, tumores superficiais, tecido celular subcutâneo, linfonodo superficial',
    atr:{ 'Valor de Rede':'210,00', 'Porte Anestésico':'1', 'Autorização':'Não' } },
  '40304361': { tipo:'TUSS', descricao:'Hemograma com contagem de plaquetas ou frações (eritrograma, leucograma, plaquetas)',
    atr:{ 'Valor de Rede':'18,50' } },
  '31009336': { tipo:'TUSS', descricao:'Colecistectomia com colangiografia por videolaparoscopia',
    atr:{ 'Valor de Rede':'3.250,00', 'Autorização':'Sim', 'Local de Autorização':'Sala de Hospitais' } },
  '70012345': { tipo:'THSM', descricao:'Stent coronariano farmacológico com sistema de entrega',
    atr:{ 'Valor de Rede':'7.890,00', 'Material':'Sim' } },
  '90012345': { tipo:'THSM', descricao:'Fio guia hidrofílico 0,035 para procedimentos endovasculares',
    atr:{ 'Valor de Rede':'640,00', 'Material':'Sim', 'Área de Filme':null } }
};

const DIAS = { GT:'Gestão de Tabelas', REDE:'Rede Credenciada - SP' };

SEED.push(
  {
    numero:'WF-2026-000140', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'40101010',
    descricao:BASE_SSCF['40101010'].descricao,
    justificativa:'Reajuste acordado com a rede credenciada e inclusão da exigência de autorização prévia para a especialidade.',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-08-25T08:40:00', atualizacao:'2026-08-25T08:40:00',
    status:'AGUARDANDO', responsavel:'—', origem:'Manual', slaHoras:20,
    atributos:[
      { nome:'Valor de Rede', de:'150,00', para:'180,00', decisao:'PENDENTE' },
      { nome:'Autorização', de:'Não', para:'Sim', decisao:'PENDENTE' },
      { nome:'Local de Autorização', de:'—', para:'Central', decisao:'PENDENTE', auto:true }
    ],
    anexos:[{nome:'aditivo_contratual_rede.pdf', tam:'318 KB', autor:'Ana Ribeiro', em:'25/08/2026 08:38'}],
    historico:[{em:'2026-08-25T08:40:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'}]
  },
  {
    numero:'WF-2026-000138', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'30101012',
    descricao:BASE_SSCF['30101012'].descricao,
    justificativa:'Atualização de valores conforme nova negociação e correção do porte anestésico informado na tabela.',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-08-21T09:30:00', atualizacao:'2026-08-26T10:05:00',
    status:'ANALISE', responsavel:'Carlos Lima', origem:'Manual', slaHoras:10,
    atributos:[
      { nome:'Valor de Rede', de:'210,00', para:'245,00', decisao:'APROVADO', por:'Carlos Lima', decEm:'2026-08-26T09:50:00' },
      { nome:'Porte Anestésico', de:'1', para:'3', decisao:'RECUSADO', justRecusa:'Porte 3 não é compatível com o procedimento; manter porte 1 conforme CBHPM.', por:'Carlos Lima', decEm:'2026-08-26T10:05:00' },
      { nome:'Descrição Resumida', de:'Biópsia de pele/tumores superf.', para:'Biópsia de pele e linfonodo superficial', decisao:'PENDENTE' }
    ],
    anexos:[{nome:'tabela_negociada.xlsx', tam:'64 KB', autor:'Ana Ribeiro', em:'21/08/2026 09:28'}],
    historico:[
      {em:'2026-08-21T09:30:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-25T14:10:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-26T09:50:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Decisão do atributo: Aprovado', de:'ANALISE', para:'ANALISE',
       det:[['Código','30101012'],['Atributo','Valor de Rede'],['De','210,00'],['Para','245,00'],['Resultado','Aprovado']]},
      {em:'2026-08-26T10:05:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Decisão do atributo: Recusado', de:'ANALISE', para:'ANALISE',
       det:[['Código','30101012'],['Atributo','Porte Anestésico'],['De','1'],['Para','3'],['Resultado','Recusado'],['Justificativa','Porte 3 não é compatível com o procedimento; manter porte 1 conforme CBHPM.']]}
    ]
  },
  {
    numero:'WF-2026-000136', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'TUSS', codigo:'41001010',
    descricao:BASE_SSCF['41001010'].descricao,
    justificativa:'Reajuste de valor e inclusão do atendimento em Day Clinic para agilizar a rede.',
    solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-08-19T11:00:00', atualizacao:'2026-08-24T17:15:00',
    status:'RESPOSTA', responsavel:'Ana Ribeiro', origem:'Manual', slaHoras:30,
    devolutiva:{ texto:'O valor de rede foi aprovado e o Local de Autorização recusado. Para o Day Clinic, favor anexar o parecer da área médica que justifica a inclusão.', quem:'Renata Alves', area:DIAS.GT, em:'2026-08-24T17:15:00' },
    atributos:[
      { nome:'Valor de Rede', de:'420,00', para:'465,00', decisao:'APROVADO', por:'Renata Alves', decEm:'2026-08-24T16:40:00' },
      { nome:'Local de Autorização', de:'Central', para:'Sala de Hospitais', decisao:'RECUSADO', justRecusa:'A tomografia eletiva permanece com autorização centralizada.', por:'Renata Alves', decEm:'2026-08-24T16:55:00' },
      { nome:'Day Clinic', de:'Não', para:'Sim', decisao:'PENDENTE' }
    ],
    anexos:[{nome:'proposta_rede.msg', tam:'92 KB', autor:'Ana Ribeiro', em:'19/08/2026 10:58'}],
    historico:[
      {em:'2026-08-19T11:00:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-22T09:00:00', quem:'Renata Alves', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-24T16:40:00', quem:'Renata Alves', area:DIAS.GT, acao:'Decisão do atributo: Aprovado', de:'ANALISE', para:'ANALISE',
       det:[['Código','41001010'],['Atributo','Valor de Rede'],['De','420,00'],['Para','465,00'],['Resultado','Aprovado']]},
      {em:'2026-08-24T16:55:00', quem:'Renata Alves', area:DIAS.GT, acao:'Decisão do atributo: Recusado', de:'ANALISE', para:'ANALISE',
       det:[['Código','41001010'],['Atributo','Local de Autorização'],['De','Central'],['Para','Sala de Hospitais'],['Resultado','Recusado'],['Justificativa','A tomografia eletiva permanece com autorização centralizada.']]},
      {em:'2026-08-24T17:15:00', quem:'Renata Alves', area:DIAS.GT, acao:'Retorno ao solicitante', de:'ANALISE', para:'RESPOSTA',
       nota:'O valor de rede foi aprovado e o Local de Autorização recusado. Para o Day Clinic, favor anexar o parecer da área médica que justifica a inclusão.'}
    ]
  },
  {
    numero:'WF-2026-000126', tipo:'Alteração de Atributos', tipoSol:'alteracao', tipoCodigo:'THSM', codigo:'70012345',
    descricao:BASE_SSCF['70012345'].descricao,
    justificativa:'Atualização de valor após nova cotação do fornecedor homologado.',
    solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-08-06T10:00:00', atualizacao:'2026-08-12T15:20:00',
    status:'CONCLUIDA', responsavel:'Carlos Lima', origem:'Manual', slaHoras:0, conclusao:'2026-08-12T15:20:00',
    atributos:[
      { nome:'Valor de Rede', de:'7.890,00', para:'7.450,00', decisao:'APROVADO', por:'Carlos Lima', decEm:'2026-08-12T15:00:00' },
      { nome:'Material', de:'Sim', para:'Não', decisao:'RECUSADO', justRecusa:'Item permanece classificado como material.', por:'Carlos Lima', decEm:'2026-08-12T15:05:00' }
    ],
    anexos:[{nome:'cotacao_fornecedor.pdf', tam:'150 KB', autor:'Bruno Teixeira', em:'06/08/2026 09:58'}],
    historico:[
      {em:'2026-08-06T10:00:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-07T08:30:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-12T15:00:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Decisão do atributo: Aprovado', de:'ANALISE', para:'ANALISE',
       det:[['Código','70012345'],['Atributo','Valor de Rede'],['De','7.890,00'],['Para','7.450,00'],['Resultado','Aprovado']]},
      {em:'2026-08-12T15:05:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Decisão do atributo: Recusado', de:'ANALISE', para:'ANALISE',
       det:[['Código','70012345'],['Atributo','Material'],['De','Sim'],['Para','Não'],['Resultado','Recusado'],['Justificativa','Item permanece classificado como material.']]},
      {em:'2026-08-12T15:20:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Alteração concluída', de:'ANALISE', para:'CONCLUIDA',
       nota:'Valor de rede atualizado no SSCF. Atributo Material mantido.', det:[['Atributos aprovados','Valor de Rede'],['Atributos recusados','Material']]}
    ]
  },
  {
    numero:'WF-2026-000135', tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', tipoCodigo:'TUSS', codigo:'40304361',
    descricao:BASE_SSCF['40304361'].descricao,
    justificativa:'Código substituído por novo código TUSS na atualização do rol; manter dois códigos gera faturamento duplicado.',
    dataExclusao:'2026-10-01', solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-08-24T15:05:00', atualizacao:'2026-08-24T15:05:00',
    status:'AGUARDANDO', responsavel:'—', origem:'Manual', slaHoras:23,
    anexos:[{nome:'comunicado_ans.pdf', tam:'210 KB', autor:'Ana Ribeiro', em:'24/08/2026 15:03'}],
    historico:[{em:'2026-08-24T15:05:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'}]
  },
  {
    numero:'WF-2026-000134', tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', tipoCodigo:'THSM', codigo:'90012345',
    descricao:BASE_SSCF['90012345'].descricao,
    justificativa:'Material descontinuado pelo fabricante; não há mais fornecimento na rede.',
    dataExclusao:'2026-08-01', solicitante:'Ana Ribeiro', area:DIAS.REDE, abertura:'2026-08-22T13:20:00', atualizacao:'2026-08-25T09:45:00',
    status:'ANALISE', responsavel:'Renata Alves', origem:'Manual', slaHoras:14,
    anexos:[{nome:'carta_descontinuidade.docx', tam:'45 KB', autor:'Ana Ribeiro', em:'22/08/2026 13:18'}],
    historico:[
      {em:'2026-08-22T13:20:00', quem:'Ana Ribeiro', area:DIAS.REDE, acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-25T09:45:00', quem:'Renata Alves', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'}
    ]
  },
  {
    numero:'WF-2026-000131', tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', tipoCodigo:'TUSS', codigo:'31009336',
    descricao:BASE_SSCF['31009336'].descricao,
    justificativa:'Procedimento seria absorvido por pacote cirúrgico.',
    dataExclusao:'2026-08-15', solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-08-12T09:00:00', atualizacao:'2026-08-14T11:30:00',
    status:'REJEITADA', responsavel:'Marta Souza', origem:'Manual', slaHoras:0, conclusao:'2026-08-14T11:30:00',
    anexos:[],
    historico:[
      {em:'2026-08-12T09:00:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-13T08:00:00', quem:'Marta Souza', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-14T11:30:00', quem:'Marta Souza', area:DIAS.GT, acao:'Exclusão rejeitada', de:'ANALISE', para:'REJEITADA',
       nota:'O pacote cirúrgico ainda não foi aprovado; o código continua necessário para faturamento avulso.'}
    ]
  },
  {
    numero:'WF-2026-000124', tipo:'Exclusão de Código TUSS/THSM', tipoSol:'exclusao', tipoCodigo:'TUSS', codigo:'10101063',
    descricao:'Consulta em pronto-socorro em horário especial (código descontinuado)',
    justificativa:'Código descontinuado pela ANS na revisão do rol.',
    dataExclusao:'2026-08-01', dataEfetiva:'2026-08-05', solicitante:'Bruno Teixeira', area:'Auditoria Médica', abertura:'2026-08-01T10:10:00', atualizacao:'2026-08-05T16:00:00',
    status:'CONCLUIDA', responsavel:'Carlos Lima', origem:'Manual', slaHoras:0, conclusao:'2026-08-05T16:00:00',
    anexos:[{nome:'evidencia_exclusao_sscf.png', tam:'180 KB', autor:'Carlos Lima', em:'05/08/2026 15:58'}],
    historico:[
      {em:'2026-08-01T10:10:00', quem:'Bruno Teixeira', area:'Auditoria Médica', acao:'Abertura da demanda', de:'—', para:'AGUARDANDO'},
      {em:'2026-08-02T09:00:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Demanda atribuída ao analista', de:'AGUARDANDO', para:'ANALISE'},
      {em:'2026-08-05T16:00:00', quem:'Carlos Lima', area:DIAS.GT, acao:'Exclusão concluída', de:'ANALISE', para:'CONCLUIDA',
       nota:'Código inativado no SSCF.', det:[['Código','10101063'],['Data solicitada','01/08/2026'],['Data efetiva','05/08/2026']]}
    ]
  }
);
