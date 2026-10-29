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
  { id:'alteracao',  nome:'Alteração de Atributos',      desc:'Alterar descrição, valor ou vigência de código existente.', ativo:false },
  { id:'exclusao',   nome:'Exclusão de Código',          desc:'Solicitar a exclusão de código da tabela.', ativo:false },
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
