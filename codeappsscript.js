// Função que cria o formulário usando o valor informado no HTML (companyName)
function createPsychosocialRiskForm(companyName, expectedResponses, reportEmail) {
  var formTitle = "Avaliação de riscos psicossociais - " + companyName;
  var form = FormApp.create(formTitle);
  
  // Configura a coleta de e-mail e a limitação de resposta por usuário
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  
  // Define a descrição/instruções gerais
  form.setDescription(
    "Instruções:\n" +
    "Este questionário foi elaborado para identificar fatores no ambiente de trabalho que podem afetar seu bem-estar emocional e físico, conhecidos como riscos psicossociais. Esses riscos envolvem situações que podem gerar estresse, ansiedade, falta de apoio, comunicação ineficiente, entre outros, impactando sua saúde e qualidade de vida no trabalho.\n\n" +
    "Como responder:\n" +
    "Leia cada afirmação com atenção: são questões relacionadas a diferentes aspectos do trabalho, como remuneração, ambiente físico, comunicação, demandas, liderança e relações interpessoais.\n\n" +
    "Selecione a opção que melhor reflete sua opinião ou experiência:\n" +
    "😃 Concordo totalmente: Você está 100% de acordo com a afirmação.\n" +
    "🙂 Concordo parcialmente: Você concorda, mas existem algumas ressalvas.\n" +
    "😐 Não concordo nem discordo: Você não se posiciona nem a favor nem contra a afirmação.\n" +
    "😕 Discordo parcialmente: Você discorda em parte da afirmação.\n" +
    "☹️ Discordo totalmente: Você discorda completamente da afirmação.\n\n" +
    "Responda com sinceridade: suas respostas jamais serão identificadas a empresa que você trabalha sem solicitar sua autorização. Esse formulário foi feito pelo psicólogo Vinicius Vilela Limirio (CRP-04/65012), gestor de saúde da MediQuo, que garante e se responsabiliza pelo sigilo da sua identificação.\n\n" +
    "Suas respostas são importantes para identificar áreas que precisam de melhorias e para promover um ambiente de trabalho mais saudável e seguro para todos.\n" +
    "Obrigado por colaborar! ☺️"
  );
  
  // Primeira página: pergunta do nome completo com validação
  var nameItem = form.addTextItem().setTitle("Qual seu nome completo?").setRequired(true);
  var nameValidation = FormApp.createTextValidation()
    .requireTextMatchesPattern("^[^0-9]+(?: [^0-9]+)+$")
    .setHelpText("Nome COMPLETO, por gentileza! Caso tenha colocado seu nome completo e esteja vendo esse erro, é devido a ter números na sua resposta.")
    .build();
  nameItem.setValidation(nameValidation);
  
  // Lista das 30 perguntas, cada uma em uma nova página
  var questions = [
    "Minha remuneração é justa e adequada às atividades que realizo.",
    "O ambiente de trabalho oferece condições adequadas de conforto, com boa temperatura, iluminação, nível de ruído e mobiliário ergonômico.",
    "Tenho autonomia para tomar decisões relacionadas ao meu trabalho.",
    "Recebo apoio adequado do meu gestor quando preciso resolver problemas relacionados ao trabalho.",
    "Os colegas se dão bem.",
    "Os benefícios oferecidos pela empresa são adequados e satisfatórios.",
    "As instalações e equipamentos são modernos, garantindo segurança e baixo risco de acidentes no trabalho.",
    "Minha função e responsabilidades são claras e bem definidas, sem contradições ou ambiguidades.",
    "Meu gestor exerce sua liderança de forma respeitosa, sem utilizar sua posição para impor poder de forma autoritária.",
    "Os colegas se ajudam.",
    "Existem oportunidades justas de crescimento e promoção na empresa.",
    "Os funcionários em geral demonstram satisfação em trabalhar na empresa.",
    "Minha carga de trabalho é adequada, permitindo que eu realize minhas tarefas sem exaustão frequente.",
    "Meu trabalho não é controlado de forma excessiva ou desnecessária pelo meu gestor.",
    "Sinto-me integrado à equipe, sem ser tratado com indiferença ou isolamento no ambiente de trabalho.",
    "Sou reconhecido e recompensado quando faço um bom trabalho.",
    "A comunicação no meu time funciona bem.",
    "As metas estabelecidas pela empresa são realistas e possíveis de serem alcançadas com os recursos disponíveis.",
    "No meu ambiente de trabalho não ocorrem situações de assédio por parte dos gestores.",
    "No ambiente de trabalho não ocorrem situações de humilhação, piadas ofensivas ou comportamentos vexatórios entre colegas.",
    "São oferecidos supervisões e treinamentos periódicos que me ajudam a desenvolver minhas habilidades profissionais.",
    "As informações importantes chegam rápido.",
    "Consigo realizar minhas tarefas sem sentimentos constantes de ansiedade ou tensão.",
    "Existe cooperação e bom relacionamento entre os setores.",
    "O ambiente de trabalho é livre de qualquer forma de violência física, verbal ou psicológica.",
    "Meu desempenho e contribuições são avaliados de forma justa e transparente.",
    "A comunicação entre os diferentes setores da empresa é eficiente, permitindo que eu obtenha as informações necessárias para realizar meu trabalho adequadamente.",
    "Raramente me sinto apreensivo ou com medo ao pensar sobre meu trabalho ou ao estar no ambiente laboral.",
    "Os gestores demonstram interesse genuíno pelo bem-estar dos funcionários.",
    "As diferenças individuais são respeitadas, sem qualquer tipo de discriminação por características pessoais, gênero, raça ou idade."
  ];
  
  var choices = [
    "😃 Concordo totalmente",
    "🙂 Concordo parcialmente",
    "😐 Não concordo nem discordo",
    "😕 Discordo parcialmente",
    "☹️ Discordo totalmente"
  ];
  
  for (var i = 0; i < questions.length; i++) {
    form.addPageBreakItem().setTitle("");
    form.addMultipleChoiceItem()
      .setTitle(questions[i])
      .setChoiceValues(choices)
      .setRequired(true);
  }
  
  // Cria uma pasta para armazenar as respostas e relatórios para esta empresa
  var folder = DriveApp.createFolder("Riscos Psicossociais - " + companyName);
  
  // Cria uma planilha para armazenar as configurações
  var configSheet = SpreadsheetApp.create("Config - " + companyName);
  DriveApp.getFileById(configSheet.getId()).moveTo(folder);
  
  var sheet = configSheet.getActiveSheet();
  sheet.appendRow(['formId', form.getId()]);
  sheet.appendRow(['companyName', companyName]);
  sheet.appendRow(['expectedResponses', expectedResponses]);
  sheet.appendRow(['reportEmail', reportEmail]);
  sheet.appendRow(['formUrl', form.getPublishedUrl()]);
  sheet.appendRow(['folder', folder.getId()]);
  sheet.appendRow(['createdAt', new Date().toISOString()]);
  
  // Conecta o formulário a uma planilha para as respostas
  var responseSheet = SpreadsheetApp.create("Respostas - " + companyName);
  DriveApp.getFileById(responseSheet.getId()).moveTo(folder);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());
  
  // Adiciona a planilha de resposta na configuração
  sheet.appendRow(['responseSheetId', responseSheet.getId()]);
  
  // Salva os IDs importantes como propriedades do script para fácil acesso
  var scriptProperties = PropertiesService.getScriptProperties();
  var companyKey = companyName.replace(/\s+/g, '_').toLowerCase();
  scriptProperties.setProperty(companyKey + '_config', configSheet.getId());
  scriptProperties.setProperty(companyKey + '_responses', responseSheet.getId());
  scriptProperties.setProperty(companyKey + '_form', form.getId());
  scriptProperties.setProperty(companyKey + '_folder', folder.getId());
  
  // Obtém a URL publicada do formulário (link longo)
  var longUrl = form.getPublishedUrl();
  
  // Utiliza a API do TinyURL para encurtar o link
  var apiUrl = "https://api.tinyurl.com/create";
  var payload = {
    url: longUrl,
    domain: "tiny.one"
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "Authorization": "Bearer t3X2VhjUXlxSyuoxEJPkfBL3B4RqRhozql7O1x66vgqTzi5VSOv8nhlnYJGL"
    },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(apiUrl, options);
  var result = JSON.parse(response.getContentText());
  var shortUrl;
  if (result && result.data && result.data.tiny_url) {
    shortUrl = result.data.tiny_url;
  } else {
    // Se ocorrer falha, retorna o link longo
    shortUrl = longUrl;
  }
  
  // Adiciona também a URL curta às configurações
  sheet.appendRow(['shortUrl', shortUrl]);
  
  // Cria um gatilho de tempo para verificar regularmente o número de respostas
  ScriptApp.newTrigger('checkResponseCount')
    .timeBased()
    .everyHours(6)  // Verifica a cada 6 horas
    .create();
  
  return {
    formId: form.getId(),
    formUrl: longUrl,
    shortUrl: shortUrl,
    configId: configSheet.getId(),
    responseSheetId: responseSheet.getId(),
    folderId: folder.getId(),
    companyKey: companyKey
  };
}

// Função para obter informações de configuração de uma empresa
function getCompanyConfig(companyKey) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var configId = scriptProperties.getProperty(companyKey + '_config');
  
  if (!configId) {
    return null;
  }
  
  var configSheet = SpreadsheetApp.openById(configId);
  var data = configSheet.getActiveSheet().getDataRange().getValues();
  
  var config = {};
  for (var i = 0; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }
  
  return config;
}

// Função para obter o status atual das respostas
function getResponseStatus(companyKey) {
  var config = getCompanyConfig(companyKey);
  
  if (!config) {
    return { error: "Empresa não encontrada" };
  }
  
  var responseSheet = SpreadsheetApp.openById(config.responseSheetId);
  var responses = responseSheet.getActiveSheet().getDataRange().getValues();
  
  // A primeira linha é o cabeçalho, então o número real de respostas é (rows - 1)
  var totalResponses = responses.length - 1;
  var expectedResponses = parseInt(config.expectedResponses);
  var canGenerateReport = totalResponses >= expectedResponses;
  
  // Prepara a lista de respondentes (nome e email)
  var respondents = [];
  if (totalResponses > 0) {
    // Assumindo que o nome está na coluna 2 (índice 1) e o email na coluna 3 (índice 2)
    // Ajuste conforme necessário baseado no formato real das respostas
    for (var i = 1; i < responses.length; i++) {
      respondents.push({
        name: responses[i][1],  // Ajuste este índice
        email: responses[i][2]  // Ajuste este índice
      });
    }
  }
  
  return {
    companyName: config.companyName,
    totalResponses: totalResponses,
    expectedResponses: expectedResponses,
    canGenerateReport: canGenerateReport,
    respondents: respondents,
    formUrl: config.shortUrl || config.formUrl,
    progress: Math.round((totalResponses / expectedResponses) * 100)
  };
}

// Função para verificar regularmente o número de respostas e notificar quando estiver completo
function checkResponseCount() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var allProperties = scriptProperties.getProperties();
  
  for (var key in allProperties) {
    if (key.endsWith('_config')) {
      var companyKey = key.replace('_config', '');
      var status = getResponseStatus(companyKey);
      
      // Se atingiu o número esperado de respostas e não notificou ainda
      if (status.canGenerateReport) {
        var config = getCompanyConfig(companyKey);
        
        // Verifica se já notificou (para não enviar emails repetidos)
        if (!config.notifiedComplete) {
          var configSheet = SpreadsheetApp.openById(config.configId);
          configSheet.getActiveSheet().appendRow(['notifiedComplete', 'true']);
          
          // Envia email para o gestor
          MailApp.sendEmail({
            to: config.reportEmail,
            subject: "Avaliação de Riscos Psicossociais - " + config.companyName + " (Completa)",
            body: "Olá,\n\n" +
                  "A avaliação de riscos psicossociais para " + config.companyName + " está completa.\n\n" +
                  "Foram coletadas " + status.totalResponses + " respostas de " + status.expectedResponses + " esperadas.\n\n" +
                  "Você já pode gerar o relatório acessando o painel de controle.\n\n" +
                  "Atenciosamente,\n" +
                  "Sistema de Avaliação de Riscos Psicossociais"
          });
        }
      }
    }
  }
}

// Função para gerar e enviar o relatório
function generateAndSendReport(companyKey) {
  var config = getCompanyConfig(companyKey);
  var status = getResponseStatus(companyKey);
  
  if (!config) {
    return { error: "Empresa não encontrada" };
  }
  
  if (!status.canGenerateReport) {
    return { 
      error: "Número insuficiente de respostas", 
      message: "É necessário ter pelo menos " + config.expectedResponses + " respostas para gerar o relatório."
    };
  }
  
  // Abre a planilha de respostas para análise
  var responseSheet = SpreadsheetApp.openById(config.responseSheetId);
  var responses = responseSheet.getActiveSheet().getDataRange().getValues();
  
  // Prepara o relatório
  var report = generatePsychosocialRiskReport(config.companyName, responses);
  
  // Cria o arquivo PDF na pasta da empresa
  var folder = DriveApp.getFolderById(config.folder);
  var reportName = "Relatório de Riscos Psicossociais - " + config.companyName + ".pdf";
  var blob = report.getAs('application/pdf').setName(reportName);
  var file = folder.createFile(blob);
  
  // Envia o relatório por email
  MailApp.sendEmail({
    to: config.reportEmail,
    subject: "Relatório de Riscos Psicossociais - " + config.companyName,
    body: "Olá,\n\n" +
          "Segue em anexo o relatório de avaliação de riscos psicossociais para " + config.companyName + ".\n\n" +
          "Este relatório foi gerado automaticamente com base nas respostas coletadas dos colaboradores.\n\n" +
          "Atenciosamente,\n" +
          "Sistema de Avaliação de Riscos Psicossociais",
    attachments: [file.getAs(MimeType.PDF)]
  });
  
  // Atualiza a configuração para indicar que o relatório foi gerado
  var configSheet = SpreadsheetApp.openById(config.configId);
  configSheet.getActiveSheet().appendRow(['reportGenerated', new Date().toISOString()]);
  
  return { 
    success: true, 
    message: "Relatório gerado e enviado com sucesso para " + config.reportEmail
  };
}

// Função para gerar o relatório de avaliação de riscos psicossociais
function generatePsychosocialRiskReport(companyName, responses) {
  // Cria um documento para o relatório
  var doc = DocumentApp.create("Relatório de Riscos Psicossociais - " + companyName);
  var body = doc.getBody();
  
  // Adiciona cabeçalho e título
  body.appendParagraph("Relatório de Avaliação de Riscos Psicossociais")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph("Empresa: " + companyName)
      .setHeading(DocumentApp.ParagraphHeading.HEADING2)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph("Data: " + new Date().toLocaleDateString('pt-BR'))
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph("\n");
  
  // Adiciona introdução
  body.appendParagraph("1. Introdução")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  body.appendParagraph("Este relatório apresenta os resultados da avaliação de riscos psicossociais realizada na empresa " + 
                     companyName + ". A avaliação foi conduzida com o objetivo de identificar fatores no ambiente de trabalho " +
                     "que podem afetar o bem-estar emocional e físico dos colaboradores.");
  
  // Adiciona metodologia
  body.appendParagraph("2. Metodologia")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  body.appendParagraph("A avaliação foi realizada por meio de um questionário online contendo 30 afirmações relacionadas " +
                     "a diferentes aspectos do trabalho, como remuneração, ambiente físico, comunicação, demandas, liderança " +
                     "e relações interpessoais. Os colaboradores avaliaram cada afirmação utilizando uma escala de concordância " +
                     "de 5 pontos, variando de \"Concordo totalmente\" a \"Discordo totalmente\".");
  
  body.appendParagraph("Total de participantes: " + (responses.length - 1) + " colaboradores.");
  
  // Calcula as médias para cada questão
  var questionScores = calculateQuestionScores(responses);
  
  // Adiciona resultados gerais
  body.appendParagraph("3. Resultados Gerais")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  // Calcula pontuação geral
  var overallScore = calculateOverallScore(questionScores);
  var overallRiskLevel = getRiskLevel(overallScore);
  
  body.appendParagraph("Pontuação geral: " + overallScore.toFixed(2) + " / 5.00")
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
      .setBold(true);
  
  body.appendParagraph("Nível de risco psicossocial: " + overallRiskLevel)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
      .setBold(true);
  
  // Adiciona resultados por categoria
  body.appendParagraph("4. Resultados por Categoria")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  var categories = [
    {name: "Remuneração e Benefícios", questions: [0, 5, 10, 15]},
    {name: "Ambiente Físico e Segurança", questions: [1, 6, 11]},
    {name: "Autonomia e Clareza de Função", questions: [2, 7, 12, 17]},
    {name: "Liderança e Gestão", questions: [3, 8, 13, 18, 28]},
    {name: "Relações Interpessoais", questions: [4, 9, 14, 19, 23, 24, 29]},
    {name: "Desenvolvimento Profissional", questions: [20, 25]},
    {name: "Comunicação", questions: [16, 21, 26]},
    {name: "Saúde Mental e Bem-estar", questions: [22, 27]}
  ];
  
  var table = body.appendTable();
  var tr = table.appendTableRow();
  tr.appendTableCell("Categoria").setBold(true);
  tr.appendTableCell("Pontuação").setBold(true);
  tr.appendTableCell("Nível de Risco").setBold(true);
  
  for (var i = 0; i < categories.length; i++) {
    var score = calculateCategoryScore(questionScores, categories[i].questions);
    var riskLevel = getRiskLevel(score);
    
    tr = table.appendTableRow();
    tr.appendTableCell(categories[i].name);
    tr.appendTableCell(score.toFixed(2) + " / 5.00");
    tr.appendTableCell(riskLevel);
  }
  
  // Adiciona pontos fortes e áreas de melhoria
  var strengths = getTopQuestions(questionScores, 5, true);
  var weaknesses = getTopQuestions(questionScores, 5, false);
  
  body.appendParagraph("5. Pontos Fortes")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  var list = body.appendListItem(getQuestionText(strengths[0].index) + " (Pontuação: " + strengths[0].score.toFixed(2) + ")");
  for (var i = 1; i < strengths.length; i++) {
    list = body.appendListItem(getQuestionText(strengths[i].index) + " (Pontuação: " + strengths[i].score.toFixed(2) + ")");
  }
  
  body.appendParagraph("6. Áreas de Melhoria")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  list = body.appendListItem(getQuestionText(weaknesses[0].index) + " (Pontuação: " + weaknesses[0].score.toFixed(2) + ")");
  for (var i = 1; i < weaknesses.length; i++) {
    list = body.appendListItem(getQuestionText(weaknesses[i].index) + " (Pontuação: " + weaknesses[i].score.toFixed(2) + ")");
  }
  
  // Adiciona conclusões e recomendações
  body.appendParagraph("7. Conclusões e Recomendações")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  var recommendations = generateRecommendations(questionScores, categories);
  body.appendParagraph(recommendations);
  
  // Adiciona rodapé
  body.appendParagraph("\n\n");
  body.appendParagraph("Relatório elaborado por:\nPsicólogo Vinicius Vilela Limirio (CRP-04/65012)\nGestor de Saúde da MediQuo")
      .setItalic(true)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  // Fecha o documento para edição
  doc.saveAndClose();
  
  return doc;
}

// Função auxiliar para calcular pontuações das questões
function calculateQuestionScores(responses) {
  var scores = [];
  
  // Assumindo que as respostas começam na quarta coluna (índice 3)
  // e que temos 30 questões a partir daí
  for (var q = 0; q < 30; q++) {
    var totalScore = 0;
    var count = 0;
    
    for (var r = 1; r < responses.length; r++) {  // Começa do 1 para pular o cabeçalho
      var response = responses[r][q + 3];  // Ajuste este índice conforme necessário
      
      // Converte a resposta em pontuação (de 1 a 5)
      var score = 0;
      if (response.includes("Concordo totalmente")) {
        score = 5;
      } else if (response.includes("Concordo parcialmente")) {
        score = 4;
      } else if (response.includes("Não concordo nem discordo")) {
        score = 3;
      } else if (response.includes("Discordo parcialmente")) {
        score = 2;
      } else if (response.includes("Discordo totalmente")) {
        score = 1;
      }
      
      if (score > 0) {
        totalScore += score;
        count++;
      }
    }
    
    var averageScore = count > 0 ? totalScore / count : 0;
    scores.push(averageScore);
  }
  
  return scores;
}

// Função auxiliar para calcular pontuação geral
function calculateOverallScore(questionScores) {
  var total = 0;
  for (var i = 0; i < questionScores.length; i++) {
    total += questionScores[i];
  }
  return total / questionScores.length;
}

// Função auxiliar para calcular pontuação de categoria
function calculateCategoryScore(questionScores, questionIndices) {
  var total = 0;
  for (var i = 0; i < questionIndices.length; i++) {
    total += questionScores[questionIndices[i]];
  }
  return total / questionIndices.length;
}

// Função auxiliar para determinar o nível de risco
function getRiskLevel(score) {
  if (score >= 4.5) {
    return "Muito baixo";
  } else if (score >= 3.5) {
    return "Baixo";
  } else if (score >= 2.5) {
    return "Moderado";
  } else if (score >= 1.5) {
    return "Alto";
  } else {
    return "Muito alto";
  }
}

// Função auxiliar para obter as questões com maior/menor pontuação
function getTopQuestions(questionScores, count, highest) {
  var questions = [];
  
  for (var i = 0; i < questionScores.length; i++) {
    questions.push({
      index: i,
      score: questionScores[i]
    });
  }
  
  questions.sort(function(a, b) {
    return highest ? b.score - a.score : a.score - b.score;
  });
  
  return questions.slice(0, count);
}

// Função auxiliar para obter o texto da questão pelo índice
function getQuestionText(index) {
  var questions = [
    "Minha remuneração é justa e adequada às atividades que realizo.",
    "O ambiente de trabalho oferece condições adequadas de conforto, com boa temperatura, iluminação, nível de ruído e mobiliário ergonômico.",
    "Tenho autonomia para tomar decisões relacionadas ao meu trabalho.",
    "Recebo apoio adequado do meu gestor quando preciso resolver problemas relacionados ao trabalho.",
    "Os colegas se dão bem.",
    "Os benefícios oferecidos pela empresa são adequados e satisfatórios.",
    "As instalações e equipamentos são modernos, garantindo segurança e baixo risco de acidentes no trabalho.",
    "Minha função e responsabilidades são claras e bem definidas, sem contradições ou ambiguidades.",
    "Meu gestor exerce sua liderança de forma respeitosa, sem utilizar sua posição para impor poder de forma autoritária.",
    "Os colegas se ajudam.",
    "Existem oportunidades justas de crescimento e promoção na empresa.",
    "Os funcionários em geral demonstram satisfação em trabalhar na empresa.",
    "Minha carga de trabalho é adequada, permitindo que eu realize minhas tarefas sem exaustão frequente.",
    "Meu trabalho não é controlado de forma excessiva ou desnecessária pelo meu gestor.",
    "Sinto-me integrado à equipe, sem ser tratado com indiferença ou isolamento no ambiente de trabalho.",
    "Sou reconhecido e recompensado quando faço um bom trabalho.",
    "A comunicação no meu time funciona bem.",
    "As metas estabelecidas pela empresa são realistas e possíveis de serem alcançadas com os recursos disponíveis.",
    "No meu ambiente de trabalho não ocorrem situações de assédio por parte dos gestores.",
    "No ambiente de trabalho não ocorrem situações de humilhação, piadas ofensivas ou comportamentos vexatórios entre colegas.",
    "São oferecidos supervisões e treinamentos periódicos que me ajudam a desenvolver minhas habilidades profissionais.",
    "As informações importantes chegam rápido.",
    "Consigo realizar minhas tarefas sem sentimentos constantes de ansiedade ou tensão.",
    "Existe cooperação e bom relacionamento entre os setores.",
    "O ambiente de trabalho é livre de qualquer forma de violência física, verbal ou psicológica.",
    "Meu desempenho e contribuições são avaliados de forma justa e transparente.",
    "A comunicação entre os diferentes setores da empresa é eficiente, permitindo que eu obtenha as informações necessárias para realizar meu trabalho adequadamente.",
    "Raramente me sinto apreensivo ou com medo ao pensar sobre meu trabalho ou ao estar no ambiente laboral.",
    "Os gestores demonstram interesse genuíno pelo bem-estar dos funcionários.",
    "As diferenças individuais são respeitadas, sem qualquer tipo de discriminação por características pessoais, gênero, raça ou idade."
  ];
  
  return questions[index];
}

// Função auxiliar para gerar recomendações com base nas pontuações
function generateRecommendations(questionScores, categories) {
  var lowestCategoryIndex = -1;
  var lowestScore = 5.0;
  
  // Identifica a categoria com menor pontuação
  for (var i = 0; i < categories.length; i++) {
    var score = calculateCategoryScore(questionScores, categories[i].questions);
    if (score < lowestScore) {
      lowestScore = score;
      lowestCategoryIndex = i;
    }
  }
  
  var text = "Com base na análise das respostas dos colaboradores, foram identificadas algumas áreas que merecem atenção. ";
  
  // Recomendações gerais baseadas na pontuação geral
  var overallScore = calculateOverallScore(questionScores);
  
  if (overallScore < 2.5) {
    text += "A pontuação geral indica um nível de risco psicossocial alto, o que sugere a necessidade de ações corretivas imediatas. ";
  } else if (overallScore < 3.5) {
    text += "A pontuação geral indica um nível de risco psicossocial moderado, sugerindo a necessidade de ações preventivas. ";
  } else {
    text += "A pontuação geral indica um bom ambiente psicossocial, mas ainda há espaço para melhorias. ";
  }
  
  // Recomendações específicas para a categoria com menor pontuação
  text += "\n\nA categoria '" + categories[lowestCategoryIndex].name + "' apresentou a menor pontuação e requer atenção especial. ";
  
  switch (categories[lowestCategoryIndex].name) {
    case "Remuneração e Benefícios":
      text += "Recomenda-se: \n" +
              "- Avaliar a política de remuneração atual, comparando-a com o mercado;\n" +
              "- Considerar a implementação de um programa de reconhecimento e recompensas por desempenho;\n" +
              "- Revisar o pacote de benefícios oferecido, buscando alternativas que agreguem valor aos colaboradores.";
      break;
      
    case "Ambiente Físico e Segurança":
      text += "Recomenda-se: \n" +
              "- Realizar uma avaliação ergonômica dos postos de trabalho;\n" +
              "- Verificar as condições de iluminação, temperatura e ruído;\n" +
              "- Implementar melhorias nas instalações e equipamentos, priorizando a segurança e o conforto dos colaboradores.";
      break;
      
    case "Autonomia e Clareza de Função":
      text += "Recomenda-se: \n" +
              "- Revisar as descrições de cargo, garantindo clareza nas funções e responsabilidades;\n" +
              "- Implementar um programa de desenvolvimento de lideranças que estimule a delegação e autonomia;\n" +
              "- Estabelecer metas realistas e alcançáveis, com recursos adequados para sua realização.";
      break;
      
    case "Liderança e Gestão":
      text += "Recomenda-se: \n" +
              "- Oferecer treinamentos em liderança e gestão de pessoas para os gestores;\n" +
              "- Implementar avaliações de feedback 360° para identificar pontos de melhoria na gestão;\n" +
              "- Promover encontros regulares entre gestores e equipes para alinhamento de expectativas.";
      break;
      
    case "Relações Interpessoais":
      text += "Recomenda-se: \n" +
              "- Desenvolver atividades de integração e teambuilding;\n" +
              "- Implementar uma política clara contra assédio e discriminação;\n" +
              "- Oferecer treinamentos sobre comunicação não-violenta e gestão de conflitos.";
      break;
      
    case "Desenvolvimento Profissional":
      text += "Recomenda-se: \n" +
              "- Criar um plano de desenvolvimento individual para cada colaborador;\n" +
              "- Implementar programas de mentoria e coaching;\n" +
              "- Oferecer oportunidades de capacitação e atualização profissional.";
      break;
      
    case "Comunicação":
      text += "Recomenda-se: \n" +
              "- Estabelecer canais claros de comunicação interna;\n" +
              "- Realizar reuniões periódicas para compartilhamento de informações entre setores;\n" +
              "- Implementar uma política de transparência nas decisões organizacionais.";
      break;
      
    case "Saúde Mental e Bem-estar":
      text += "Recomenda-se: \n" +
              "- Implementar um programa de qualidade de vida no trabalho;\n" +
              "- Oferecer suporte psicológico para colaboradores que precisem;\n" +
              "- Promover ações de conscientização sobre saúde mental e gerenciamento do estresse.";
      break;
  }
  
  text += "\n\nRecomendações adicionais:\n" +
          "- Repetir esta avaliação anualmente para monitorar o progresso;\n" +
          "- Criar grupos de trabalho para abordar os problemas específicos identificados;\n" +
          "- Desenvolver um plano de ação com prazos e responsáveis para implementação das melhorias sugeridas.\n\n" +
          "A promoção de um ambiente de trabalho psicologicamente saudável não só beneficia a saúde e bem-estar dos " +
          "colaboradores, mas também contribui para a redução do absenteísmo, aumento da produtividade e melhoria " +
          "da qualidade do trabalho.";
  
  return text;
}

// Função doGet para servir a página HTML
function doGet() {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
      .setTitle('Elaborador - Avaliação psicossocial')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, minimum-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setFaviconUrl('https://www.google.com/favicon.ico')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// Função para incluir arquivos HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Funções para comunicação com o frontend via Google Apps Script Web App
function processForm(formData) {
  try {
    var result = createPsychosocialRiskForm(
      formData.companyName, 
      parseInt(formData.expectedResponses), 
      formData.reportEmail
    );
    
    return {
      success: true,
      formUrl: result.shortUrl,
      companyKey: result.companyKey,
      message: "Formulário criado com sucesso para " + formData.companyName
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString(),
      message: "Erro ao criar formulário. Por favor, tente novamente."
    };
  }
}

// Função para obter status das respostas (chamada pelo frontend)
function checkFormStatus(companyKey) {
  try {
    var status = getResponseStatus(companyKey);
    return {
      success: true,
      data: status
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString(),
      message: "Erro ao verificar status. Por favor, tente novamente."
    };
  }
}

// Função para gerar relatório (chamada pelo frontend)
function requestReport(companyKey) {
  try {
    var result = generateAndSendReport(companyKey);
    return result;
  } catch (e) {
    return {
      success: false,
      error: e.toString(),
      message: "Erro ao gerar relatório. Por favor, tente novamente."
    };
  }
}
