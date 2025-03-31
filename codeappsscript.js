// =============================================================================
// =          SCRIPT PRINCIPAL - GERADOR DE AVALIAÇÃO PSICOSSOCIAL           =
// =============================================================================
// Versão: 2.5 (Refinamento Página 2 - Layout Simplificado e Texto)
// =============================================================================

/**
 * @OnlyCurrentDoc // Necessário para PropertiesService.getScriptProperties()
 */

// -------------------------------------
// --- CONFIGURAÇÃO - IDs dos Templates ---
// -------------------------------------
// !! IDs REAIS DOS SEUS ARQUIVOS MODELO !!
const FORM_TEMPLATE_ID = "1WVvd0VUlkLe7iznvBSvyEP_xyuQD8zLguwi_fxJIMaE"; // OK
const DASHBOARD_TEMPLATE_ID = "15Z7oI5uPIzQ_ukDztDD6CMNTw5wUbueLuooW45Yrhkk"; // OK
const REPORT_TEMPLATE_ID = "1ReWo-vQbadoyjSvm-0vEzeqz7PVoZz04m6U_CzvyU64"; // OK (Planilha)

// --- Outras Configurações ---
// A Chave da API TinyURL foi salva via setupTinyUrlApiKey().
const TINYURL_API_URL = "https://api.tinyurl.com/create";

// --- Constantes de Cálculo ---
const questionColumnStartIndex = 3; // Coluna D na planilha de RESPOSTAS (A=TS, B=Email, C=Nome, D=Q1...)
const categoryMapping = { // Mapeia NOME da categoria para ÍNDICES das perguntas (base 0)
    "RECOMPENSAS E DESENVOLVIMENTO":        [0, 5, 10, 15, 20, 25],
    "AMBIENTE DE TRABALHO E COMUNICAÇÃO":   [1, 6, 11, 16, 21, 26],
    "ORGANIZAÇÃO E DEMANDAS DO TRABALHO": [2, 7, 12, 17, 22, 27],
    "LIDERANÇA E GESTÃO":                   [3, 8, 13, 18, 23, 28],
    "RELAÇÕES INTERPESSOAIS E APOIO SOCIAL":[4, 9, 14, 19, 24, 29]
};
const numberOfQuestionsPerCategory = 6;
const maxScorePerQuestion = 4;
const maxScorePerCategory = numberOfQuestionsPerCategory * maxScorePerQuestion; // 24
const scoreMap = { // Mapeia RESPOSTA TEXTUAL para PONTUAÇÃO (0=Melhor, 4=Pior)
    "😃 Concordo totalmente": 0,
    "🙂 Concordo parcialmente": 1,
    "😐 Não concordo nem discordo": 2,
    "😕 Discordo parcialmente": 3,
    "☹️ Discordo totalmente": 4
};

// =============================================================================
// =    MAPEAMENTO DE ITENS, RISCOS E SUGESTÕES (PÁGINA 2 DO RELATÓRIO)       =
// =============================================================================
// Array contendo detalhes para cada uma das 30 perguntas
const questionsDetails = [
  // Índice 0 (Cat 1)
  { index: 0, text: "Minha remuneração é justa e adequada às atividades que realizo.", risk: "Colaboradores percebem a remuneração como injusta ou inadequada para suas funções.", suggestions: ["Realizar análise de cargos e salários comparativa com o mercado.", "Revisar e garantir a equidade interna da estrutura salarial.", "Comunicar com transparência a política de remuneração e critérios de progressão.", "Avaliar se as descrições de cargo correspondem às responsabilidades atuais."] },
  // Índice 1 (Cat 2)
  { index: 1, text: "O ambiente de trabalho oferece condições adequadas de conforto, com boa temperatura, iluminação, nível de ruído e mobiliário ergonômico.", risk: "Colaboradores sentem que o ambiente físico não oferece conforto adequado (térmico, luminoso, acústico, ergonômico).", suggestions: ["Realizar avaliações ergonômicas e fornecer mobiliário ajustável.", "Monitorar e ajustar temperatura, ventilação e níveis de ruído.", "Verificar e adequar a iluminação para as tarefas, evitando reflexos e sombras.", "Manter canais abertos para feedback sobre o conforto e agir sobre as queixas."] },
  // Índice 2 (Cat 3)
  { index: 2, text: "Tenho autonomia para tomar decisões relacionadas ao meu trabalho.", risk: "Sensação de falta de autonomia ou poder de decisão sobre o próprio trabalho.", suggestions: ["Revisar os níveis de delegação e empoderamento para cada função.", "Definir claramente os limites de autonomia e as responsabilidades associadas.", "Capacitar os colaboradores para que possam exercer a autonomia de forma eficaz.", "Incentivar a participação dos colaboradores na tomada de decisões que afetam seu trabalho."] },
  // Índice 3 (Cat 4)
  { index: 3, text: "Recebo apoio adequado do meu gestor quando preciso resolver problemas relacionados ao trabalho.", risk: "Falta de percepção de apoio adequado por parte do gestor direto.", suggestions: ["Capacitar os gestores em habilidades de escuta ativa, feedback e suporte à equipe.", "Estabelecer rotinas de acompanhamento individual (one-on-ones) focadas em desafios e apoio.", "Incentivar os gestores a estarem disponíveis e acessíveis para suas equipes.", "Definir claramente os canais e processos para solicitar ajuda ou escalonar problemas."] },
   // Índice 4 (Cat 5)
  { index: 4, text: "Os colegas se dão bem.", risk: "Percepção de um clima ruim ou de conflito entre os colegas de trabalho.", suggestions: ["Promover atividades de integração e team building (com cuidado para não forçar).","Oferecer treinamentos em comunicação assertiva e resolução de conflitos.","Mediar conflitos interpessoais de forma construtiva quando necessário.","Estabelecer e reforçar normas de convivência e respeito mútuo."] },
  // Índice 5 (Cat 1)
  { index: 5, text: "Os benefícios oferecidos pela empresa são adequados e satisfatórios.", risk: "Há insatisfação com o pacote de benefícios oferecido.", suggestions: ["Realizar pesquisa de satisfação focada nos benefícios atuais e desejados.", "Analisar a competitividade do pacote em relação ao mercado e setor.", "Considerar a oferta de benefícios flexíveis ou opções que atendam a diferentes perfis.", "Comunicar claramente o valor e as regras de uso dos benefícios existentes."] },
   // Índice 6 (Cat 2)
  { index: 6, text: "As instalações e equipamentos são modernos, garantindo segurança e baixo risco de acidentes no trabalho.", risk: "Percepção de que as instalações ou equipamentos são antigos, inadequados ou inseguros.", suggestions: ["Realizar inspeções de segurança regulares nas instalações e equipamentos.","Implementar um plano de manutenção preventiva e atualização de equipamentos.","Fornecer Equipamentos de Proteção Individual (EPIs) adequados e treinar sobre seu uso.","Investigar todos os incidentes e acidentes para identificar e corrigir causas raízes."] },
   // Índice 7 (Cat 3)
  { index: 7, text: "Minha função e responsabilidades são claras e bem definidas, sem contradições ou ambiguidades.", risk: "Percepção de ambiguidade, falta de clareza ou contradições nas funções e responsabilidades.", suggestions: ["Revisar e atualizar as descrições de cargo, garantindo clareza e precisão.","Realizar reuniões de alinhamento para definir papéis e responsabilidades em projetos e equipes.","Garantir que as expectativas sobre cada função sejam comunicadas de forma explícita.","Criar um organograma claro e acessível."] },
   // Índice 8 (Cat 4)
  { index: 8, text: "Meu gestor exerce sua liderança de forma respeitosa, sem utilizar sua posição para impor poder de forma autoritária.", risk: "Percepção de um estilo de liderança autoritário ou desrespeitoso por parte do gestor.", suggestions: ["Promover treinamentos em liderança humanizada, comunicação não-violenta e gestão participativa.","Definir e comunicar as competências de liderança esperadas na empresa.","Implementar avaliações de desempenho 360º (ou para cima) para feedback sobre a liderança.","Oferecer coaching ou mentoria para gestores que precisam desenvolver um estilo mais colaborativo."] },
   // Índice 9 (Cat 5)
  { index: 9, text: "Os colegas se ajudam.", risk: "Falta de percepção de ajuda mútua e colaboração entre os colegas.", suggestions: ["Incentivar e reconhecer publicamente comportamentos de ajuda e colaboração.","Estruturar projetos ou tarefas que demandem trabalho em equipe.","Criar programas de mentoria ou apadrinhamento entre colegas.","Facilitar espaços para troca de conhecimento e suporte mútuo."] },
   // Índice 10 (Cat 1)
  { index: 10, text: "Existem oportunidades justas de crescimento e promoção na empresa.", risk: "A percepção é de falta de justiça ou clareza nas oportunidades de crescimento e promoção.", suggestions: ["Definir e comunicar claramente os critérios para progressão de carreira e promoções.", "Implementar processos de avaliação de desempenho transparentes e baseados em mérito.", "Investir em planos de desenvolvimento individual (PDIs) alinhados às oportunidades internas.", "Garantir que as oportunidades sejam divulgadas amplamente e acessíveis a todos."] },
  // Índice 11 (Cat 2)
  { index: 11, text: "Os funcionários em geral demonstram satisfação em trabalhar na empresa.", risk: "Baixa percepção de satisfação geral entre os funcionários.", suggestions: ["Realizar pesquisas de clima organizacional aprofundadas para identificar os motivos da insatisfação.", "Analisar os resultados das outras categorias desta avaliação para encontrar correlações.", "Desenvolver planos de ação focados nas áreas mais críticas identificadas.", "Promover uma cultura de feedback e comunicação aberta para entender as preocupações."] },
  // Índice 12 (Cat 3)
  { index: 12, text: "Minha carga de trabalho é adequada, permitindo que eu realize minhas tarefas sem exaustão frequente.", risk: "Percepção de sobrecarga de trabalho, levando à exaustão frequente.", suggestions: ["Analisar a distribuição de tarefas e o volume de trabalho por função/equipe.","Identificar e otimizar processos de trabalho para eliminar gargalos e retrabalho.","Promover o planejamento, a priorização de tarefas e o uso de ferramentas de gestão do tempo.","Discutir abertamente as demandas com as equipes e avaliar a necessidade de recursos adicionais.","Incentivar pausas e o respeito aos limites da jornada de trabalho."] },
   // Índice 13 (Cat 4)
  { index: 13, text: "Meu trabalho não é controlado de forma excessiva ou desnecessária pelo meu gestor.", risk: "Sensação de microgerenciamento ou controle excessivo por parte da liderança.", suggestions: ["Discutir e alinhar níveis adequados de autonomia e acompanhamento para cada função/tarefa.","Capacitar gestores a focar no acompanhamento de resultados e metas, e não apenas no processo.","Promover uma cultura de confiança e responsabilidade mútua.","Incentivar a delegação eficaz de tarefas e decisões."] },
  // Índice 14 (Cat 5)
  { index: 14, text: "Sinto-me integrado à equipe, sem ser tratado com indiferença ou isolamento no ambiente de trabalho.", risk: "Sentimento de isolamento, exclusão ou indiferença por parte da equipe.", suggestions: ["Promover práticas inclusivas na integração de novos membros e no dia a dia.","Incentivar a participação de todos em reuniões e atividades sociais (respeitando preferências individuais).","Observar e intervir em dinâmicas de grupo que possam levar à exclusão (\"panelinhas\").","Garantir que todos tenham oportunidades iguais de contribuir e serem ouvidos."] },
   // Índice 15 (Cat 1)
  { index: 15, text: "Sou reconhecido e recompensado quando faço um bom trabalho.", risk: "Falta de percepção de reconhecimento ou recompensa pelo bom desempenho.", suggestions: ["Implementar programas formais e informais de reconhecimento (elogios, bônus, prêmios, etc.).", "Capacitar gestores para fornecer feedback positivo e reconhecimento frequente.", "Vincular, quando possível, recompensas tangíveis a metas e resultados claros.", "Celebrar conquistas individuais e de equipe."] },
   // Índice 16 (Cat 2)
  { index: 16, text: "A comunicação no meu time funciona bem.", risk: "Percepção de falhas na comunicação dentro da própria equipe.", suggestions: ["Estabelecer rotinas claras de comunicação na equipe (reuniões, relatórios, ferramentas).","Incentivar o feedback aberto e honesto entre os membros da equipe.","Capacitar o líder da equipe em habilidades de comunicação e facilitação.","Utilizar ferramentas colaborativas que facilitem a troca de informações."] },
   // Índice 17 (Cat 3)
  { index: 17, text: "As metas estabelecidas pela empresa são realistas e possíveis de serem alcançadas com os recursos disponíveis.", risk: "As metas são percebidas como irrealistas ou inatingíveis com os recursos atuais.", suggestions: ["Revisar o processo de definição de metas, envolvendo os colaboradores na sua definição (metas SMART).","Garantir que os recursos necessários (tempo, orçamento, ferramentas, pessoal) estejam disponíveis para atingir as metas.","Monitorar o progresso das metas e ajustar os planos conforme necessário.","Comunicar claramente como as metas individuais/setoriais contribuem para os objetivos gerais."] },
  // Índice 18 (Cat 4)
  { index: 18, text: "No meu ambiente de trabalho não ocorrem situações de assédio por parte dos gestores.", risk: "Há percepção da ocorrência de situações que podem ser interpretadas como assédio (moral/sexual) originadas na gestão.", suggestions: ["URGENTE: Reforçar política de tolerância zero e canais de denúncia seguros.","Treinamento obrigatório sobre assédio, com ênfase nas responsabilidades da liderança.","Investigação rigorosa e imparcial de qualquer alegação.","Monitoramento contínuo do comportamento dos gestores e do clima organizacional.","Consequências claras para casos comprovados de assédio."] },
  // Índice 19 (Cat 5)
  { index: 19, text: "No ambiente de trabalho não ocorrem situações de humilhação, piadas ofensivas ou comportamentos vexatórios entre colegas.", risk: "Percepção da ocorrência de humilhações, piadas ofensivas ou comportamentos vexatórios entre colegas.", suggestions: ["Implementar e comunicar uma política clara contra qualquer tipo de desrespeito ou humilhação.","Realizar campanhas de conscientização sobre comunicação respeitosa e os limites do humor no trabalho.","Disponibilizar canais seguros para relatar tais comportamentos.","Aplicar medidas corretivas e educativas quando esses comportamentos ocorrerem."] },
   // Índice 20 (Cat 1)
  { index: 20, text: "São oferecidos supervisões e treinamentos periódicos que me ajudam a desenvolver minhas habilidades profissionais.", risk: "Percepção de que a supervisão ou os treinamentos oferecidos são insuficientes ou inadequados para o desenvolvimento profissional.", suggestions: ["Realizar levantamento de necessidades de treinamento (LNT) junto aos colaboradores.", "Estruturar um programa de treinamentos alinhado às necessidades do negócio e dos funcionários.", "Garantir que a supervisão inclua feedback regular e orientação para o desenvolvimento.", "Oferecer diferentes modalidades de aprendizado (cursos, workshops, mentorias, job rotation)."] },
  // Índice 21 (Cat 2)
  { index: 21, text: "As informações importantes chegam rápido.", risk: "Percepção de lentidão ou demora na chegada de informações relevantes para o trabalho.", suggestions: ["Mapear os fluxos de informação e identificar gargalos.","Definir canais de comunicação oficiais e eficientes para diferentes tipos de informação.","Utilizar tecnologia (intranet, comunicados, grupos) para agilizar a disseminação.","Capacitar gestores sobre a importância da comunicação rápida e transparente."] },
  // Índice 22 (Cat 3)
  { index: 22, text: "Consigo realizar minhas tarefas sem sentimentos constantes de ansiedade ou tensão.", risk: "O trabalho gera sentimentos constantes de ansiedade ou tensão nos colaboradores.", suggestions: ["Investigar as causas raiz da ansiedade/tensão (sobrecarga, falta de clareza, pressão, conflitos, etc.).","Implementar ações focadas nas causas identificadas (ver outras sugestões).","Oferecer programas de apoio ao bem-estar e gerenciamento do estresse.","Promover um ambiente de trabalho psicologicamente seguro onde as preocupações possam ser expressas.","Capacitar líderes para identificar sinais de estresse e oferecer suporte."] },
   // Índice 23 (Cat 4)
  { index: 23, text: "Existe cooperação e bom relacionamento entre os setores.", risk: "Falta de cooperação ou relacionamento ruim entre diferentes setores da empresa.", suggestions: ["Mapear processos interdepartamentais e identificar pontos de atrito ou falha de comunicação.","Promover reuniões, workshops ou projetos conjuntos entre setores para alinhar objetivos e melhorar a colaboração.","Estabelecer metas compartilhadas entre departamentos.","Incentivar a liderança a dar o exemplo na colaboração intersetorial."] },
  // Índice 24 (Cat 5)
  { index: 24, text: "O ambiente de trabalho é livre de qualquer forma de violência física, verbal ou psicológica.", risk: "Percepção da existência de alguma forma de violência (física, verbal ou psicológica) no ambiente de trabalho.", suggestions: ["URGENTE: Política de tolerância zero a qualquer forma de violência, com investigação imediata e rigorosa.","Garantir a segurança física das instalações.","Promover treinamentos sobre prevenção e identificação de violência no local de trabalho.","Oferecer apoio psicológico e jurídico às vítimas.","Criar um ambiente onde reportar violência seja seguro e encorajado."] },
   // Índice 25 (Cat 1)
  { index: 25, text: "Meu desempenho e contribuições são avaliados de forma justa e transparente.", risk: "O processo de avaliação de desempenho é percebido como injusto ou pouco transparente.", suggestions: ["Revisar e comunicar claramente os critérios e o processo de avaliação de desempenho.", "Garantir que as avaliações sejam baseadas em metas e comportamentos observáveis.", "Treinar os avaliadores para reduzir vieses e conduzir avaliações justas.", "Implementar mecanismos de calibração e revisão das avaliações.", "Oferecer espaço para o colaborador dar feedback sobre o processo de avaliação."] },
  // Índice 26 (Cat 2)
  { index: 26, text: "A comunicação entre os diferentes setores da empresa é eficiente...", risk: "Falhas na comunicação e colaboração entre diferentes setores ou departamentos.", suggestions: ["Promover reuniões interdepartamentais regulares para alinhar objetivos e processos.","Criar projetos ou comitês multidisciplinares para resolver problemas comuns.","Implementar sistemas ou plataformas que facilitem o compartilhamento de informações entre áreas.","Incentivar uma cultura de colaboração e visão sistêmica na empresa."] },
  // Índice 27 (Cat 3)
  { index: 27, text: "Raramente me sinto apreensivo ou com medo ao pensar sobre meu trabalho ou ao estar no ambiente laboral.", risk: "Sentimentos frequentes de apreensão ou medo relacionados ao trabalho.", suggestions: ["URGENTE: Investigar as causas desse medo/apreensão (pode indicar assédio, ambiente inseguro, pressão extrema, medo de demissão).","Garantir um ambiente de trabalho seguro física e psicologicamente.","Reforçar políticas contra assédio e violência no trabalho.","Promover uma comunicação transparente sobre mudanças organizacionais ou avaliações.","Disponibilizar canais confidenciais para relatar preocupações ou situações de risco."] },
  // Índice 28 (Cat 4)
  { index: 28, text: "Os gestores demonstram interesse genuíno pelo bem-estar dos funcionários.", risk: "Percepção de que os gestores não se importam genuinamente com o bem-estar da equipe.", suggestions: ["Sensibilizar e capacitar gestores sobre a importância do bem-estar e da saúde mental no trabalho.","Incentivar gestores a praticar a escuta ativa e a perguntar sobre o bem-estar dos colaboradores.","Incluir indicadores de bem-estar da equipe na avaliação de desempenho dos gestores (se aplicável).","Comunicar as ações da empresa voltadas ao bem-estar e o papel do gestor nelas."] },
  // Índice 29 (Cat 5)
  { index: 29, text: "As diferenças individuais são respeitadas, sem qualquer tipo de discriminação por características pessoais, gênero, raça ou idade.", risk: "Percepção de desrespeito às diferenças individuais ou ocorrência de discriminação.", suggestions: ["Implementar e reforçar políticas robustas de diversidade, equidade e inclusão (DE&I).","Realizar treinamentos sobre vieses inconscientes, respeito à diversidade e antidiscriminação.","Garantir que os processos de RH (recrutamento, promoção, avaliação) sejam livres de discriminação.","Criar comitês de DE&I e canais seguros para denúncias de discriminação.","Promover uma cultura que celebre e valorize as diferenças individuais."] }
];
// =============================================================================
// =                         FIM DO MAPEAMENTO                                 =
// =============================================================================


// =============================================================================
// =                           FUNÇÃO doGet (Web App)                          =
// =============================================================================

function doGet() {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
      .setTitle('Elaborador - Avaliação psicossocial')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, minimum-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// =============================================================================
// =      FUNÇÃO PRINCIPAL - CHAMADA PELO HTML PARA CRIAR RECURSOS           =
// =============================================================================

function createAndSetupResources(companyName, targetRespondents, managerEmail) {
  // --- Validação Inicial ---
  if (!companyName || !targetRespondents || !managerEmail || !validateEmail(managerEmail) || parseInt(targetRespondents) < 1) {
       throw new Error("Dados inválidos fornecidos. Verifique nome da empresa, número de respostas (>0) e e-mail do gestor.");
  }
  targetRespondents = parseInt(targetRespondents);

  // --- Validação dos IDs dos Templates ---
   if (!FORM_TEMPLATE_ID || FORM_TEMPLATE_ID.includes("ID_DO_SEU") ||
      !DASHBOARD_TEMPLATE_ID || DASHBOARD_TEMPLATE_ID.includes("ID_DA_SUA") ||
      !REPORT_TEMPLATE_ID || REPORT_TEMPLATE_ID.includes("ID_DA_SUA")) {
       throw new Error("IDs dos arquivos Modelo (Formulário, Dashboard, Relatório) não foram configurados corretamente no script Code.gs. Verifique as constantes no início do arquivo.");
   }

  try {
    // --- 1. Copiar Formulário Modelo ---
    let formTemplateFile;
    try {
        formTemplateFile = DriveApp.getFileById(FORM_TEMPLATE_ID);
    } catch (e) {
        throw new Error(`Falha ao acessar o Formulário Modelo (ID: ${FORM_TEMPLATE_ID}). Verifique o ID e se o arquivo existe. Erro: ${e.message}`);
    }
    const formFileName = `Formulário Psicossocial - ${companyName}`;
    const copiedFormFile = formTemplateFile.makeCopy(formFileName);
    const formId = copiedFormFile.getId();
    const copiedForm = FormApp.openById(formId);
    const formUrl = copiedForm.getPublishedUrl(); // URL Longa Original
    Logger.log(`Formulário copiado: ${formUrl} (ID: ${formId})`);

    // --- 2. Criar Planilha de Respostas (Privada) ---
    const responseSheetName = `Respostas (PRIVADO) - ${companyName} - ${Utilities.getUuid()}`;
    const responseSheet = SpreadsheetApp.create(responseSheetName);
    const responseSheetId = responseSheet.getId();
    Logger.log(`Planilha de Respostas (privada) criada: ID ${responseSheetId}`);

    // --- 3. Vincular Cópia do Form à Planilha de Respostas ---
    copiedForm.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheetId);
    Logger.log(`Formulário ${formId} vinculado à Planilha de Respostas ${responseSheetId}`);

    // --- 4. Copiar Dashboard Modelo ---
     let dashboardTemplateFile;
     try {
        dashboardTemplateFile = DriveApp.getFileById(DASHBOARD_TEMPLATE_ID);
     } catch (e) {
        throw new Error(`Falha ao acessar a Planilha Modelo do Dashboard (ID: ${DASHBOARD_TEMPLATE_ID}). Verifique o ID e se o arquivo existe. Erro: ${e.message}`);
     }
    const dashboardFileName = `Dashboard Psicossocial - ${companyName}`;
    const copiedDashboardFile = dashboardTemplateFile.makeCopy(dashboardFileName);
    const dashboardId = copiedDashboardFile.getId();
    const dashboardUrl = copiedDashboardFile.getUrl(); // URL Longa Original
    Logger.log(`Dashboard copiado: ${dashboardUrl} (ID: ${dashboardId})`);

    // --- 5. Compartilhar Dashboard com Gestor (APENAS VISUALIZADOR) ---
    try {
       copiedDashboardFile.addViewer(managerEmail);
       Logger.log(`Dashboard ${dashboardId} compartilhado com ${managerEmail} como VISUALIZADOR.`);
    } catch (e) { /* ... log de aviso ... */ Logger.log(`AVISO: Falha ao compartilhar dashboard com ${managerEmail}. Erro: ${e}`);}

    // --- 6. Encurtar AMBAS as URLs ---
    const shortFormUrl = shortenUrl(formUrl); // Encurta URL do Formulário
    const shortDashboardUrl = shortenUrl(dashboardUrl); // Encurta URL do Dashboard
    Logger.log(`URLs encurtadas: Form=${shortFormUrl}, Dashboard=${shortDashboardUrl}`);

    // --- 7. Atualizar Configuração NÃO SENSÍVEL no Dashboard Copiado ---
    const dashboardSheet = SpreadsheetApp.openById(dashboardId);
    const configSheet = dashboardSheet.getSheetByName("Configuração");
    if (configSheet) {
        updateConfigValue(configSheet, "ManagerEmail", managerEmail);
        updateConfigValue(configSheet, "TargetRespondents", targetRespondents);
        updateConfigValue(configSheet, "FormId", formId);
        updateConfigValue(configSheet, "CompanyName", companyName);
        updateConfigValue(configSheet, "FormUrl", shortFormUrl); // Salva URL CURTA aqui
        updateConfigValue(configSheet, "DataCriacao", new Date());
        updateConfigValue(configSheet, "StatusRelatorio", "Aguardando Respostas");
         Logger.log("Configuração NÃO SENSÍVEL do Dashboard atualizada.");
        // Atualiza status inicial na aba visível
        try {
            const visibleSheet = dashboardSheet.getSheets().find(s => !s.isSheetHidden());
            if(visibleSheet) { visibleSheet.getRange("A1").setValue(`Status: 0 de ${targetRespondents} respostas recebidas.`); } // AJUSTE A CÉLULA AQUI
        } catch(e) { Logger.log("Falha ao atualizar status inicial na aba visível."); }
    } else { /* ... log de aviso ... */ Logger.log("AVISO: Aba 'Configuração' não encontrada no template do dashboard."); }

    // --- 8. Salvar Dados Operacionais e Sensíveis nas Propriedades do Script ---
    const scriptProps = PropertiesService.getScriptProperties();
    const baseKey = formId;
    scriptProps.setProperty(baseKey + '_responseSheetId', responseSheetId);
    scriptProps.setProperty(baseKey + '_dashboardId', dashboardId);
    scriptProps.setProperty(baseKey + '_managerEmail', managerEmail);
    scriptProps.setProperty(baseKey + '_targetRespondents', targetRespondents.toString());
    scriptProps.setProperty(baseKey + '_companyName', companyName);
    scriptProps.setProperty(baseKey + '_reportGenerated', 'false');
    Logger.log(`Dados operacionais para form ${formId} salvos nas Propriedades do Script.`);

    // --- 9. Instalar o Gatilho onFormSubmit na CÓPIA do Formulário ---
    const triggers = ScriptApp.getUserTriggers(copiedForm);
    triggers.forEach(trigger => { /* ... remove triggers antigos ... */
       if (trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
           trigger.getHandlerFunction() === 'processSubmissionTrigger') {
         Logger.log(`Deletando gatilho ${trigger.getUniqueId()} existente para ${formId}.`);
         ScriptApp.deleteTrigger(trigger);
       }
    });
    ScriptApp.newTrigger('processSubmissionTrigger')
        .forForm(copiedForm)
        .onFormSubmit()
        .create();
    Logger.log(`Gatilho 'processSubmissionTrigger' instalado para o formulário ${formId}`);

    // --- 10. Enviar E-mail Inicial com URLs CURTAS ---
    sendInitialEmailToManager(managerEmail, companyName, shortFormUrl, shortDashboardUrl);

    // --- 11. Retornar URLs CURTAS para o HTML ---
    return {
        formUrl: shortFormUrl, // Encurtada
        sheetUrl: shortDashboardUrl // Encurtada
     };

  } catch (error) { /* ... tratamento de erro ... */
     Logger.log(`ERRO FATAL em createAndSetupResources para ${companyName} / ${managerEmail}: ${error.message}\nStack: ${error.stack}`);
     let friendlyMessage = `Falha na criação dos recursos: ${error.message}`;
     // ... (mensagens amigáveis opcionais) ...
     throw new Error(friendlyMessage);
   }
}

// =============================================================================
// =         FUNÇÃO DO GATILHO - PROCESSA SUBMISSÃO DE FORMULÁRIO            =
// =============================================================================
/**
 * Função acionada automaticamente pelo gatilho onFormSubmit.
 * Verifica a contagem de respostas e gera/envia o relatório se a meta for atingida.
 * @param {Object} e O objeto de evento do gatilho onFormSubmit.
 */
function processSubmissionTrigger(e) {
  const form = e.source; // O formulário que disparou o gatilho
  const formId = form.getId();

  // Trava para evitar execuções concorrentes do mesmo gatilho
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { // Tenta obter bloqueio por 30s
      Logger.log(`Não foi possível obter bloqueio para ${formId}. Outra execução pode estar em andamento.`);
      return; // Sai se não conseguir o bloqueio
  }
   Logger.log(`Bloqueio obtido para Form ID: ${formId}`);

  try {
    Logger.log(`Gatilho onFormSubmit disparado para Form ID: ${formId}`);

    // --- Recuperar Configurações das Propriedades do Script ---
    const scriptProps = PropertiesService.getScriptProperties();
    const baseKey = formId;

    const responseSheetId = scriptProps.getProperty(baseKey + '_responseSheetId');
    const dashboardId = scriptProps.getProperty(baseKey + '_dashboardId');
    const managerEmail = scriptProps.getProperty(baseKey + '_managerEmail');
    const targetStr = scriptProps.getProperty(baseKey + '_targetRespondents');
    const companyName = scriptProps.getProperty(baseKey + '_companyName');
    let reportGeneratedFlag = scriptProps.getProperty(baseKey + '_reportGenerated');

    // --- Validação Crítica das Propriedades ---
    if (!responseSheetId || !dashboardId || !managerEmail || !targetStr) {
      Logger.log(`ERRO CRÍTICO: Não foi possível recuperar configurações essenciais para o formId ${formId} das Propriedades. Abortando trigger.`);
      return; // Não pode continuar
    }
    const targetRespondents = parseInt(targetStr);

    Logger.log(`Trigger: Config recuperada das Props para ${formId}: Target=${targetRespondents}, Email=${managerEmail}, ResponseSheetId=${responseSheetId}, DashboardId=${dashboardId}, Company=${companyName}, ReportGenerated=${reportGeneratedFlag}`);

    // --- Verificar se o relatório JÁ foi gerado ou está em processamento ---
    if (reportGeneratedFlag === 'true') {
      Logger.log(`Relatório para ${formId} JÁ FOI GERADO anteriormente. Trigger ignorado.`);
      return;
    }
    if (reportGeneratedFlag === 'processing') {
         Logger.log(`Relatório para ${formId} JÁ ESTÁ EM PROCESSAMENTO por outra execução do trigger. Ignorando este disparo.`);
         return;
    }

    // --- Contar Respostas Atuais ---
    let currentResponses = 0;
    let responseSheet; // Define fora do try/catch
    let data = []; // Define fora do try/catch, inicializa como vazio
    try {
        responseSheet = SpreadsheetApp.openById(responseSheetId).getSheets()[0];
        currentResponses = responseSheet.getLastRow() - 1;
        if (currentResponses < 0) currentResponses = 0;
        Logger.log(`Trigger: Contagem de respostas para ${formId}: ${currentResponses} de ${targetRespondents}`);
        // Lê os dados aqui para usar depois, APENAS se houver respostas
        if (currentResponses > 0) {
             // Tenta pegar dados até a última coluna possível (ex: coluna 33 para 30 perguntas + TS + Email + Nome)
             const lastDataColumn = questionColumnStartIndex + 30; // Índice da última coluna de dados + 1
             data = responseSheet.getRange(2, 1, currentResponses, lastDataColumn).getValues();
             Logger.log(`Lidos ${data.length} registros com ${lastDataColumn} colunas da planilha ${responseSheetId}`);
        }
    } catch (err) {
        Logger.log(`ERRO ao acessar planilha de respostas ${responseSheetId} para contagem ou leitura de dados: ${err}. Tentando novamente mais tarde.`);
        return; // Não pode continuar sem acesso à planilha ou dados
    }

    // --- Atualizar Status no Dashboard ---
    updateDashboardStatus(dashboardId, `Aguardando Respostas (${currentResponses}/${targetRespondents})`);

    // --- Verificar se Atingiu o Alvo ---
    if (currentResponses >= targetRespondents) {
      Logger.log(`META ATINGIDA para ${formId}! Iniciando geração do relatório.`);

      // Marcar que a geração COMEÇOU
      scriptProps.setProperty(baseKey + '_reportGenerated', 'processing');
      updateDashboardStatus(dashboardId, `Processando Relatório (${currentResponses}/${targetRespondents})...`);

      // --- Calcular Resultados (Categorias e Itens) ---
      let results; // Resultados das Categorias
      let itemAverages; // Resultados por Item
      let page2Content = ""; // Conteúdo Página 2
      try {
          if(data.length === 0) {
              throw new Error("Contagem de respostas indica meta atingida, mas não foi possível ler os dados.");
          }
          results = calculateResults(data);          // Calcula médias das categorias e geral
          if(Object.keys(results).length === 0) {
              throw new Error("Função calculateResults retornou objeto vazio.");
          }
          itemAverages = calculateItemAverages(data); // Calcula médias dos itens
           if(Object.keys(itemAverages).length === 0 && currentResponses > 0) { // Só é erro se havia respostas
              throw new Error("Função calculateItemAverages retornou objeto vazio, mesmo com respostas presentes.");
          }
          page2Content = generatePage2Content(itemAverages); // Gera conteúdo da pág 2
          Logger.log(`Resultados e conteúdo da página 2 calculados para ${formId}.`);
      } catch (err) {
           Logger.log(`ERRO no cálculo dos resultados para ${formId}: ${err}`);
           scriptProps.setProperty(baseKey + '_reportGenerated', 'error_calculation');
           updateDashboardStatus(dashboardId, `ERRO no cálculo dos resultados.`);
           return; // Para execução
      }

      // --- Gerar PDF a partir do Template ---
      let pdfBlob;
      try {
          // Passa o conteúdo da página 2 para a função de geração
          pdfBlob = generatePdfReportFromTemplate(companyName, currentResponses, results, page2Content); // Passa page2Content
          if (!pdfBlob || !pdfBlob.getBytes || pdfBlob.getBytes().length === 0) { // Verifica se o PDF não está vazio
               throw new Error("Função generatePdfReportFromTemplate não retornou um Blob PDF válido ou retornou um PDF vazio.");
          }
          Logger.log(`PDF gerado com sucesso para ${formId}: ${pdfBlob.getName()}, Tamanho: ${pdfBlob.getBytes().length} bytes`);
      } catch(err) {
           Logger.log(`ERRO na geração do PDF para ${formId}: ${err}`);
           scriptProps.setProperty(baseKey + '_reportGenerated', 'error_pdf');
           updateDashboardStatus(dashboardId, `ERRO na geração do PDF.`);
           return; // Para execução
      }

      // --- Enviar E-mail ---
      try {
          sendReportEmail(managerEmail, companyName, currentResponses, pdfBlob); // Envia email com anexo
          Logger.log(`E-mail com relatório enviado para ${managerEmail} (Form ${formId}).`);
          // MARCAR COMO GERADO COM SUCESSO
          scriptProps.setProperty(baseKey + '_reportGenerated', 'true');
          updateDashboardStatus(dashboardId, `Relatório Gerado e Enviado em ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm")}`);
          // --- Limpeza Opcional ---
      } catch (err) {
          Logger.log(`ERRO no envio do e-mail para ${formId} após gerar PDF: ${err}`);
          scriptProps.setProperty(baseKey + '_reportGenerated', 'error_email'); // Marca erro de envio
          updateDashboardStatus(dashboardId, `PDF gerado, mas ERRO no envio do e-mail.`);
          // Não retorna, PDF foi gerado mas envio falhou.
      }

    } else {
      Logger.log(`Meta ainda não atingida para ${formId} (${currentResponses}/${targetRespondents}).`);
      // Apenas termina a execução normal do gatilho
    }

  } catch (error) {
    // Captura erros gerais não tratados dentro do fluxo principal do gatilho
    Logger.log(`ERRO GERAL NO GATILHO processSubmissionTrigger (Form ID: ${form ? form.getId() : 'N/A'}): ${error.message}\nStack: ${error.stack}`);
    // Tentar notificar o admin/dev
     try {
       const scriptProps = PropertiesService.getScriptProperties();
       const baseKey = form ? form.getId() : 'UNKNOWN_FORM';
       const dashboardId = scriptProps.getProperty(baseKey + '_dashboardId');
       if(dashboardId) {
           updateDashboardStatus(dashboardId, `ERRO GERAL NO GATILHO. Verifique os Logs.`);
       }
     } catch (e) {} // Ignora erro ao tentar notificar no dashboard
  } finally {
    // Libera o bloqueio, não importa o que aconteça
    lock.releaseLock();
     Logger.log(`Bloqueio liberado para Form ID: ${formId}`);
  }
}


// =============================================================================
// =                          FUNÇÕES AUXILIARES                             =
// =============================================================================

/**
 * Valida um endereço de e-mail (formato básico).
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

//--------------------------------------

/**
 * Atualiza ou adiciona um par chave-valor na aba de configuração especificada.
 */
function updateConfigValue(sheet, key, value) {
  if (!sheet || !key) return;
  try {
      const data = sheet.getRange("A1:A" + Math.max(sheet.getLastRow(), 1)).getValues();
      let found = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(value);
          found = true;
          // Logger.log(`Config Dashboard atualizada: ${key} = ${value}`);
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, value]);
         // Logger.log(`Config Dashboard adicionada: ${key} = ${value}`);
      }
  } catch (e) { Logger.log(`Erro ao tentar atualizar config "${key}" no dashboard ${sheet.getParent().getName()}: ${e}`); }
}

//--------------------------------------

/**
 * Calcula os resultados agregados por categoria E o escore geral.
 * @param {Array[]} data Array 2D com os dados das respostas (sem o cabeçalho).
 * @return {Object} Objeto com os resultados calculados por categoria e o escore geral.
 */
function calculateResults(data) {
  const categoryScoresSum = {};
  const categoryValidResponseCount = {};

  for (const category in categoryMapping) {
      categoryScoresSum[category] = 0;
      categoryValidResponseCount[category] = 0;
  }
  const numRespondents = data.length;
  if (numRespondents === 0) {
      Logger.log("calculateResults: Sem dados para calcular.");
      return {};
  }

  // Log da estrutura da primeira linha de dados
  if(data[0]) { Logger.log(`calculateResults: Amostra 1a linha dados (colunas: ${data[0].length}): ${JSON.stringify(data[0]).substring(0, 300)}`); }

  data.forEach((row, respondentIndex) => {
      for (const category in categoryMapping) {
          categoryMapping[category].forEach(qIndex => {
              const columnIndex = questionColumnStartIndex + qIndex; // Coluna 0-based
              if (columnIndex < row.length) { // Verifica se a coluna existe
                  const answer = row[columnIndex];
                  if (answer !== null && answer !== undefined && scoreMap.hasOwnProperty(answer)) {
                      categoryScoresSum[category] += scoreMap[answer];
                      categoryValidResponseCount[category]++;
                  } else {
                       // Log apenas se a resposta não for vazia e não estiver no mapa
                       if(answer !== "" && answer !== null && answer !== undefined) {
                           Logger.log(`calculateResults: Resposta inválida ou não mapeada na L:${respondentIndex + 2}, C:${columnIndex + 1} (Q:${qIndex+1}) -> '${answer}'`);
                       }
                  }
              } else {
                   Logger.log(`calculateResults: Aviso - Coluna ${columnIndex + 1} (Q:${qIndex+1}) não encontrada na linha ${respondentIndex + 2}`);
              }
          });
      }
  });
   Logger.log("calculateResults: Somas por categoria:", categoryScoresSum);
   Logger.log("calculateResults: Contagem de respostas válidas por categoria:", categoryValidResponseCount);

  const results = {};
  let overallScoreSum = 0;
  let categoryCountForOverall = 0;

  for (const category in categoryScoresSum) {
      let score0100 = 'N/A';
      let riskLevel = 'N/A';
      // O número total de respostas válidas possíveis para a categoria é numRespondents * numberOfQuestionsPerCategory
      const totalPossibleValidResponsesInCategory = numRespondents * numberOfQuestionsPerCategory;

      if (categoryValidResponseCount[category] > 0 && totalPossibleValidResponsesInCategory > 0) {
           // Média bruta (0-4) por RESPOSTA VÁLIDA na categoria
          const averageRawScorePerValidResponse = categoryScoresSum[category] / categoryValidResponseCount[category];
          // Converte para 0-100 -> (Média por Resposta / Score Máximo por Resposta) * 100
          score0100 = (averageRawScorePerValidResponse / maxScorePerQuestion) * 100;
          riskLevel = getRiskLevel(score0100);

          overallScoreSum += score0100;
          categoryCountForOverall++;
          results[category] = { score100: score0100.toFixed(1), level: riskLevel };
          Logger.log(`Cat [${category}]: Soma=${categoryScoresSum[category]}, N_Resp=${categoryValidResponseCount[category]}, MediaBruta=${averageRawScorePerValidResponse.toFixed(2)}, Score0-100=${results[category].score100}`);
      } else {
           results[category] = { score100: 'N/A', level: 'N/A' };
           Logger.log(`Aviso: Nenhuma resposta válida encontrada para a categoria "${category}".`);
      }
  }

   if (categoryCountForOverall > 0) {
      const averageOverallScore = overallScoreSum / categoryCountForOverall;
      const overallRiskLevel = getRiskLevel(averageOverallScore);
      results["ESCORE GERAL DE RISCOS PSICOSSOCIAIS"] = { score100: averageOverallScore.toFixed(1), level: overallRiskLevel };
       Logger.log("Resultado Escore Geral:", results["ESCORE GERAL DE RISCOS PSICOSSOCIAIS"]);
  } else {
      results["ESCORE GERAL DE RISCOS PSICOSSOCIAIS"] = { score100: 'N/A', level: 'N/A' };
      Logger.log("Aviso: Não foi possível calcular o Escore Geral.");
  }

  Logger.log("Resultados calculados por categoria (Final):", results);
  return results;
}

//--------------------------------------

/**
 * Calcula a média bruta (0-4) para cada item do questionário.
 */
function calculateItemAverages(data) {
    if (!data || data.length === 0) { Logger.log("calculateItemAverages: Não há dados."); return {}; }
    const numQuestions = 30;
    const itemAverages = {};
    const itemScoresSum = Array(numQuestions).fill(0);
    const itemValidResponsesCount = Array(numQuestions).fill(0);

    data.forEach(row => {
        for (let qIndex = 0; qIndex < numQuestions; qIndex++) {
            const columnIndex = questionColumnStartIndex + qIndex;
            if (columnIndex < row.length) {
                const answer = row[columnIndex];
                if (answer !== null && answer !== undefined && scoreMap.hasOwnProperty(answer)) {
                    itemScoresSum[qIndex] += scoreMap[answer];
                    itemValidResponsesCount[qIndex]++;
                }
            }
        }
    });

    for (let qIndex = 0; qIndex < numQuestions; qIndex++) {
        if (itemValidResponsesCount[qIndex] > 0) {
            itemAverages[qIndex] = itemScoresSum[qIndex] / itemValidResponsesCount[qIndex];
        } else {
            itemAverages[qIndex] = null;
        }
    }
    Logger.log("Médias por item (0-4) calculadas:", itemAverages);
    return itemAverages;
}

//--------------------------------------

/**
 * Gera o conteúdo textual para a segunda página do relatório.
 * @param {Object} itemAverages Objeto com as médias de cada item (chave = índice 0-29, valor = média 0-4 ou null).
 * @return {string} O conteúdo formatado para a página 2 (texto simples com \n).
 */
function generatePage2Content(itemAverages) {
    const riskThreshold = 2.0;
    let content = "";
    let foundProblematicItems = false;

    // Título e Introdução
    content += "Riscos Psicossociais Identificados e Sugestões de Manejo\n\n";
    content += "Abaixo são listados os riscos psicossociais identificados na sua empresa (itens com média > 2.0 em escala de 0-4, onde 4 representa maior discordância/risco) e sugestões de soluções para os mesmos, indicando áreas que merecem atenção prioritária para a promoção de um ambiente de trabalho psicossocialmente mais seguro e saudável.\n\n";
    content += "---\n\n"; // Separador

    // Itera pelo mapeamento `questionsDetails`
    for (let i = 0; i < questionsDetails.length; i++) {
        const itemData = questionsDetails[i];
        const avgScore = (itemAverages && typeof itemAverages[itemData.index] === 'number') ? itemAverages[itemData.index] : null;

        if (avgScore !== null && avgScore > riskThreshold) {
            foundProblematicItems = true;
            // Adiciona Risco Identificado (SEM a média agora)
            content += `Risco Identificado (Ref. Item ${itemData.index + 1}):\n`;
            content += `${itemData.risk}\n\n`;
            // Adiciona Sugestões (Título limpo)
            content += "Sugestões:\n";
            if (Array.isArray(itemData.suggestions)) {
                itemData.suggestions.forEach(suggestion => { content += `- ${suggestion}\n`; });
            } else { content += "- Nenhuma sugestão específica disponível.\n"; }
            content += "\n---\n\n"; // Separador
        }
    }

    if (!foundProblematicItems) {
        content += "Nenhum item específico apresentou média de risco elevada (acima de 2.0) nesta avaliação.\n\nRecomenda-se continuar monitorando os indicadores gerais e manter as boas práticas identificadas na análise das categorias.\n";
    }

    Logger.log(`Conteúdo da Página 2 gerado (${foundProblematicItems ? 'com' : 'sem'} itens problemáticos).`);
    return content.trim();
}


//--------------------------------------

/**
 * Determina o nível de risco textual com base no score 0-100.
 */
function getRiskLevel(score) {
  score = Math.max(0, Math.min(100, parseFloat(score) || 0));
  if (score <= 20) return "Baixíssimo";
  if (score <= 40) return "Baixo";
  if (score <= 60) return "Médio";
  if (score <= 80) return "Alto";
  return "Altíssimo";
}

//--------------------------------------

/**
 * Gera o relatório em PDF copiando um template de PLANILHA, escrevendo valores
 * numéricos para os gráficos e substituindo placeholders de texto.
 * Inclui configuração de PDF (A4, Paisagem, Ajustar à Largura, Margens Estreitas).
 */
function generatePdfReportFromTemplate(companyName, responseCount, results, page2Content) {
    // Validação do ID do Template
    if (!REPORT_TEMPLATE_ID || REPORT_TEMPLATE_ID.includes("ID_DA_SUA")) { throw new Error("ID do Template de Relatório (Planilha) não configurado."); }
    let templateFile;
    try {
        templateFile = DriveApp.getFileById(REPORT_TEMPLATE_ID);
        if (templateFile.getMimeType() !== MimeType.GOOGLE_SHEETS) { throw new Error(`O template (ID: ${REPORT_TEMPLATE_ID}) não é uma Planilha Google.`); }
    } catch (e) { throw new Error(`Não foi possível encontrar ou validar o Template de Relatório (ID: ${REPORT_TEMPLATE_ID}). ${e.message}`); }

    // Copiar e Nomear
    const reportFileName = `Relatório Psicossocial - ${companyName || "Empresa"} - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")}`;
    const copiedReportFile = templateFile.makeCopy(reportFileName);
    const copiedReportId = copiedReportFile.getId();
    Utilities.sleep(2000); // Delay após cópia
    Logger.log(`Template de Relatório (Planilha) copiado para ID: ${copiedReportId}`);

    let ss; // Define fora para usar no finally do try principal
    try {
        ss = SpreadsheetApp.openById(copiedReportId);
        SpreadsheetApp.flush();

        // --- 1. Escrever VALORES NUMÉRICOS para os Gráficos ---
        const sheetGraficos = ss.getSheets()[0]; // Assume gráficos na primeira aba - AJUSTE SE NECESSÁRIO
        if(!sheetGraficos) throw new Error("Não foi possível encontrar a aba principal no template de relatório.");

        // !! AJUSTE AS CÉLULAS DE DESTINO ('C5', 'C15', ...) PARA CORRESPONDER AO SEU TEMPLATE !!
        const scoreCellMapping = {
            "RECOMPENSAS E DESENVOLVIMENTO": "C5",
            "AMBIENTE DE TRABALHO E COMUNICAÇÃO": "C15",
            "ORGANIZAÇÃO E DEMANDAS DO TRABALHO": "C25",
            "LIDERANÇA E GESTÃO": "C35",
            "RELAÇÕES INTERPESSOAIS E APOIO SOCIAL": "C45",
            "ESCORE GERAL DE RISCOS PSICOSSOCIAIS": "I5"
        };

        for (const key in scoreCellMapping) {
            if (results.hasOwnProperty(key)) {
                const cellRef = scoreCellMapping[key];
                const score = results[key]?.score100;
                if (score !== null && score !== undefined && score !== 'N/A') {
                    try { sheetGraficos.getRange(cellRef).setValue(parseFloat(score)); }
                    catch (cellErr) { Logger.log(`Erro ao escrever score ${score} na célula ${cellRef} para ${key}: ${cellErr}`); }
                } else {
                    try { sheetGraficos.getRange(cellRef).setValue(0); } // Ou clearContent()
                    catch (cellErr) { Logger.log(`Erro ao limpar/zerar célula ${cellRef} para ${key} (N/A): ${cellErr}`); }
                }
            } else { Logger.log(`Chave de resultado "${key}" não encontrada no objeto results.`); }
        }
        Logger.log(`Valores numéricos dos scores escritos nas células de destino.`);

        // --- 2. Substituir Placeholders de TEXTO ---
        ss.getSheets().forEach(sheet => {
             const replaceInSheet = (placeholder, value) => {
                 if(value !== null && value !== undefined){
                    try{ sheet.createTextFinder(placeholder).replaceAllWith(value.toString()); }
                    catch (replaceErr) { Logger.log(`Erro ao tentar substituir placeholder "${placeholder}" na aba "${sheet.getName()}": ${replaceErr}`); }
                 }
             };
             // Gerais
             replaceInSheet('{{COMPANY_NAME}}', companyName || '(Empresa não informada)');
             replaceInSheet('{{RESPONSE_COUNT}}', responseCount.toString());
             replaceInSheet('{{GENERATION_DATE}}', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"));
             // Níveis Textuais (se houver placeholders para eles)
             for (const key in results) {
                 const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                 const resultData = results[key] || { level: 'N/A' };
                 replaceInSheet(`{{${safeKey}_LEVEL}}`, resultData.level);
             }
             // Página 2
             replaceInSheet('{{PONTOS_DE_ATENCAO}}', page2Content || 'Nenhum ponto de atenção específico identificado (média <= 2.0).');
        });

        SpreadsheetApp.flush(); // Aplica substituições
        Logger.log(`Placeholders de texto substituídos.`);
        Utilities.sleep(5000); // Delay maior APÓS o flush final (5 segundos) antes da exportação

        // --- 3. Geração do PDF com Configurações Específicas ---
        const spreadsheetId = copiedReportId;
        const exportUrlBase = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export`;
        const params = {
            format: 'pdf', size: 'A4', portrait: 'false', scale: '2',
            top_margin: '0.75', bottom_margin: '0.75', left_margin: '0.25', right_margin: '0.25',
            gridlines: 'false', sheetnames: 'false', printtitle: 'false', exportformulas: 'false'
            // gid: 'GID_PAGINA1,GID_PAGINA2' // << AJUSTE AQUI se quiser exportar abas específicas
        };
        const urlParams = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
        const exportUrl = `${exportUrlBase}?${urlParams}`;
        Logger.log(`URL de exportação: ${exportUrl}`);

        let pdfBlob;
        try {
            const response = UrlFetchApp.fetch(exportUrl, {
                headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
                muteHttpExceptions: true,
                validateHttpsCertificates: false,
                deadline: 120 // 2 minutos de prazo
            });
            const responseCode = response.getResponseCode();
            Logger.log(`Exportação PDF - Status Code: ${responseCode}`);
            if (responseCode !== 200) {
                throw new Error(`Falha ao exportar PDF (${responseCode}): ${response.getContentText().substring(0, 500)}`);
            }
            pdfBlob = response.getBlob();
            if (!pdfBlob || pdfBlob.getBytes().length < 100) {
                 throw new Error(`PDF gerado parece vazio ou inválido (Tamanho: ${pdfBlob ? pdfBlob.getBytes().length : 0} bytes)`);
            }
             pdfBlob.setName(reportFileName + ".pdf");
             Logger.log(`PDF Blob obtido: ${pdfBlob.getName()}, Tamanho: ${pdfBlob.getBytes().length}`);
        } catch (fetchErr) {
             Logger.log(`ERRO CRÍTICO durante fetch/validação do PDF: ${fetchErr}`);
             throw fetchErr;
        }

        // --- Limpeza ---
        copiedReportFile.setTrashed(true);
        Logger.log(`Arquivo intermediário ${copiedReportId} movido para lixeira.`);

        return pdfBlob; // Retorna o Blob PDF

    } catch(err) {
        Logger.log(`ERRO GERAL em generatePdfReportFromTemplate para ${copiedReportId}: ${err}`);
        // Tenta excluir a cópia em caso de erro geral
        try { DriveApp.getFileById(copiedReportId).setTrashed(true); } catch (e) { Logger.log(`Erro ao excluir ${copiedReportId} após falha GERAL: ${e}`); }
        throw new Error(`Erro ao gerar PDF da planilha ${REPORT_TEMPLATE_ID}: ${err.message}`);
    }
}


//--------------------------------------

/**
 * Envia o e-mail com o relatório PDF em anexo.
 */
function sendReportEmail(managerEmail, companyName, responseCount, pdfBlob) {
   //...(Função inalterada)...
   const subject = `Relatório de Riscos Psicossociais - ${companyName || "Empresa"}`;
    const body = `Olá,\n\nO relatório de avaliação de riscos psicossociais para a empresa ${companyName || "(não definida)"} foi gerado automaticamente, com base em ${responseCount} respostas.\n\nO arquivo PDF segue em anexo.\n\nAtenciosamente,\nSistema de Avaliação Psicossocial`;
    MailApp.sendEmail({
      to: managerEmail,
      subject: subject,
      body: body,
      attachments: [pdfBlob],
      name: "Sistema de Avaliação Psicossocial"
    });
    Logger.log(`E-mail com relatório enviado para ${managerEmail}`);
}

//--------------------------------------

/**
 * Atualiza uma célula de status no dashboard do gestor.
 */
function updateDashboardStatus(dashboardId, statusMessage) {
   //...(Função inalterada, verificar célula)...
   // !! AJUSTE A CÉLULA (Ex: "A1") CONFORME O LAYOUT DO SEU DASHBOARD !!
   try {
       const dashboard = SpreadsheetApp.openById(dashboardId);
       const sheet = dashboard.getSheets().find(s => !s.isSheetHidden()); // Primeira aba visível
       if(sheet) {
           sheet.getRange("A1").setValue(statusMessage); // <<<<<<< AJUSTAR CÉLULA AQUI
            // Logger.log(`Status atualizado no Dashboard ${dashboardId}: ${statusMessage}`); // Log Opcional
       } else { Logger.log(`Nenhuma aba visível encontrada no Dashboard ${dashboardId} para atualizar status.`); }
   } catch (err) { Logger.log(`Falha não crítica ao tentar atualizar status "${statusMessage}" no dashboard ${dashboardId}: ${err}`); }
}

//--------------------------------------

/**
 * Encurta uma URL usando a API do TinyURL.
 */
function shortenUrl(longUrl) {
   //...(Função inalterada)...
  const apiKeyBearer = PropertiesService.getScriptProperties().getProperty('TINYURL_API_KEY_BEARER');
  if (!apiKeyBearer) { Logger.log("Chave TinyURL não configurada. Usando URL longa."); return longUrl; }
  let shortUrl = longUrl;
  const payload = { url: longUrl, domain: "tiny.one" };
  const options = { method: "post", contentType: "application/json", headers: { "Authorization": apiKeyBearer }, payload: JSON.stringify(payload), muteHttpExceptions: true };
  try {
    const response = UrlFetchApp.fetch(TINYURL_API_URL, options);
    const responseCode = response.getResponseCode();
    const resultText = response.getContentText();
    if (responseCode >= 200 && responseCode < 300) {
        const result = JSON.parse(resultText);
        if (result && result.data && result.data.tiny_url) { shortUrl = result.data.tiny_url; Logger.log(`URL encurtada: ${longUrl} -> ${shortUrl}`); }
        else { Logger.log(`TinyURL OK (${responseCode}), mas sem URL: ${resultText}. Usando URL longa.`); }
    } else { Logger.log(`Falha TinyURL (${responseCode}): ${resultText}. Usando URL longa.`); }
  } catch (e) { Logger.log(`Erro API TinyURL: ${e}. Usando URL longa.`); }
  return shortUrl;
}

//--------------------------------------

/**
 * Envia o e-mail inicial para o gestor com os links de acesso.
 */
function sendInitialEmailToManager(managerEmail, companyName, formLink, dashboardLink) {
    // ...(Função inalterada)...
    const subject = `✅ Sistema de Avaliação Psicossocial Configurado - ${companyName}`;
    const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.5;">
        <p>Olá!</p>
        <p>O sistema de avaliação de riscos psicossociais para a empresa "<strong>${companyName}</strong>" foi configurado com sucesso.</p>
        <p><strong>Links importantes:</strong></p>
        <ol style="padding-left: 25px;">
            <li style="margin-bottom: 15px;"><strong>Link do Formulário (Para Colaboradores):</strong><br><a href="${formLink}" target="_blank" style="color: #1a73e8; text-decoration: none;">${formLink}</a><br><em style="font-size: 0.9em; color: #5f6368;">Compartilhe este link com os colaboradores...</em></li>
            <li style="margin-bottom: 15px;"><strong>Link do seu Dashboard (Acesso do Gestor):</strong><br><a href="${dashboardLink}" target="_blank" style="color: #1a73e8; text-decoration: none;">${dashboardLink}</a><br><em style="font-size: 0.9em; color: #5f6368;">Use este link para consultar o status (acesso de <strong>Visualizador</strong>). O relatório será enviado para ${managerEmail} quando a meta for atingida.</em></li>
        </ol>
        <p>Guarde este e-mail para referência futura.</p>
        <p>Atenciosamente,<br><strong>Sistema de Avaliação Psicossocial</strong></p>
    </div>`;
  try {
      MailApp.sendEmail({ to: managerEmail, subject: subject, htmlBody: htmlBody, name: "Sistema Psicossocial" });
      Logger.log(`E-mail inicial enviado para ${managerEmail}`);
  } catch (e) { Logger.log(`ERRO ao enviar e-mail inicial para ${managerEmail}: ${e}`); }
}

// =============================================================================
// =                     FUNÇÃO OPCIONAL DE SETUP DA API KEY                 =
// =============================================================================
/*
function setupTinyUrlApiKey() {
  // ... (Função opcional para salvar a chave) ...
}
*/

// =============================================================================
// =                                 FIM DO SCRIPT                             =
// =============================================================================
