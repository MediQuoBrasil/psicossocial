// Configurações
const SPREADSHEET_ID = '1nH2ZW4JFBgA7-J0-f3zl5Ef3m6_2de2olZwHD5dKYes'; // Substitua pelo ID da sua planilha principal
const FORM_ID = '1WVvd0VUlkLe7iznvBSvyEP_xyuQD8zLguwi_fxJIMaE'; // Substitua pelo ID do seu formulário
const TEMPLATE_ID = '1Ggwv2-G-gZ6jnXSCBkobOFQjvrIL2INhQxdQMB6rnjc'; // Substitua pelo ID do seu modelo de relatório em Docs

// Função para criar a interface do usuário
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Sistema de Avaliação Psicossocial')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Função para criar dashboard do gestor
function criarDashboardGestor(emailGestor, totalRespostasEsperadas) {
  // Criar uma nova planilha para o dashboard
  const dashboardSS = SpreadsheetApp.create(`Dashboard Psicossocial - ${emailGestor}`);
  const dashboardId = dashboardSS.getId();
  
  // Configurar abas da planilha
  const configSheet = dashboardSS.getActiveSheet().setName('Configurações');
  dashboardSS.insertSheet('Respostas');
  dashboardSS.insertSheet('Relatórios');
  
  // Configurar aba de configurações
  configSheet.appendRow(['E-mail do Gestor', emailGestor]);
  configSheet.appendRow(['Total de Respostas Esperadas', totalRespostasEsperadas]);
  configSheet.appendRow(['E-mail para Relatório', '']);
  configSheet.appendRow(['Data de Criação', new Date()]);
  
  // Configurar aba de respostas
  const respostasSheet = dashboardSS.getSheetByName('Respostas');
  respostasSheet.appendRow(['Nome', 'E-mail', 'Data de Resposta', 'Status']);
  
  // Configurar aba de relatórios
  const relatoriosSheet = dashboardSS.getSheetByName('Relatórios');
  relatoriosSheet.appendRow(['Data', 'Arquivo', 'Enviado para']);
  
  // Criar trigger para atualizar o dashboard quando houver novas respostas
  ScriptApp.newTrigger('atualizarDashboard')
    .timeBased()
    .everyHours(1)
    .create();
  
  // Adicionar menu personalizado
  adicionarMenuPersonalizado(dashboardId);
  
  // Compartilhar a planilha com o gestor
  DriveApp.getFileById(dashboardId).addEditor(emailGestor);
  
  return {
    dashboardId: dashboardId,
    dashboardUrl: dashboardSS.getUrl()
  };
}

// Função para adicionar menu personalizado ao dashboard
function adicionarMenuPersonalizado(dashboardId) {
  const ui = SpreadsheetApp.openById(dashboardId).getUi();
  ui.createMenu('Psicossocial')
    .addItem('Atualizar Respostas', 'atualizarDashboard')
    .addItem('Gerar Relatório', 'verificarEGerarRelatorio')
    .addToUi();
}

// Função para atualizar o dashboard com novas respostas
function atualizarDashboard() {
  // Obter todas as planilhas de dashboard (para atualização em lote)
  const dashboardFiles = DriveApp.searchFiles('title contains "Dashboard Psicossocial"');
  
  while (dashboardFiles.hasNext()) {
    const dashboardFile = dashboardFiles.next();
    const dashboardSS = SpreadsheetApp.openById(dashboardFile.getId());
    
    // Obter configurações
    const configSheet = dashboardSS.getSheetByName('Configurações');
    const configData = configSheet.getDataRange().getValues();
    let emailGestor, totalRespostasEsperadas;
    
    for (let i = 0; i < configData.length; i++) {
      if (configData[i][0] === 'E-mail do Gestor') emailGestor = configData[i][1];
      if (configData[i][0] === 'Total de Respostas Esperadas') totalRespostasEsperadas = configData[i][1];
    }
    
    // Obter respostas atuais
    const mainSS = SpreadsheetApp.openById(SPREADSHEET_ID);
    const respostasOriginais = mainSS.getSheetByName('Respostas').getDataRange().getValues();
    
    // Atualizar aba de respostas no dashboard
    const respostasSheet = dashboardSS.getSheetByName('Respostas');
    respostasSheet.clear();
    respostasSheet.appendRow(['Nome', 'E-mail', 'Data de Resposta', 'Status']);
    
    let contadorRespostas = 0;
    
    // Filtrar respostas apenas para o gestor específico
    for (let i = 1; i < respostasOriginais.length; i++) {
      const linha = respostasOriginais[i];
      if (linha[2] === emailGestor) { // Assumindo que a coluna 3 contém o e-mail do gestor associado
        respostasSheet.appendRow([
          linha[0], // Nome
          linha[1], // E-mail
          new Date(linha[3]), // Data
          'Completo' // Status
        ]);
        contadorRespostas++;
      }
    }
    
    // Atualizar o status na planilha de configurações
    const statusCell = configSheet.getRange('B5');
    if (!statusCell.getValue()) {
      configSheet.appendRow(['Respostas Atuais', contadorRespostas]);
    } else {
      statusCell.setValue(contadorRespostas);
    }
    
    // Se atingiu o número total, habilitar a geração de relatório
    if (contadorRespostas >= totalRespostasEsperadas) {
      const statusCell = configSheet.getRange('B6');
      if (!statusCell.getValue()) {
        configSheet.appendRow(['Status do Relatório', 'Pronto para gerar']);
        
        // Notificar o gestor que o relatório pode ser gerado
        enviarEmailNotificacao(emailGestor, dashboardSS.getUrl());
      }
    }
  }
}

// Função para enviar e-mail de notificação quando o relatório estiver pronto para gerar
function enviarEmailNotificacao(emailGestor, dashboardUrl) {
  const assunto = 'Relatório Psicossocial - Pronto para Gerar';
  const corpo = `
    Olá,
    
    Todas as respostas necessárias para o seu relatório de avaliação psicossocial foram coletadas.
    
    Você pode gerar o relatório agora acessando seu dashboard:
    ${dashboardUrl}
    
    Para gerar o relatório, abra o dashboard e use o menu "Psicossocial" > "Gerar Relatório".
    
    Atenciosamente,
    Sistema de Avaliação Psicossocial
  `;
  
  MailApp.sendEmail(emailGestor, assunto, corpo);
}

// Função para criar e enviar form para respondentes
function criarEEnviarForm(emailGestor, emailsRespondentes, totalRespostasEsperadas) {
  // Obter o formulário
  const form = FormApp.openById(FORM_ID);
  
  // Criar um novo destino de respostas (planilha)
  const responseSheet = SpreadsheetApp.create(`Respostas - ${emailGestor}`);
  const responseSheetId = responseSheet.getId();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheetId);
  
  // Criar dashboard para o gestor
  const dashboard = criarDashboardGestor(emailGestor, totalRespostasEsperadas);
  
  // Atualizar metadados na planilha principal
  const mainSS = SpreadsheetApp.openById(SPREADSHEET_ID);
  const metadataSheet = mainSS.getSheetByName('Metadados') || mainSS.insertSheet('Metadados');
  metadataSheet.appendRow([
    new Date(),
    emailGestor,
    totalRespostasEsperadas,
    responseSheetId,
    dashboard.dashboardId
  ]);
  
  // Compartilhar a planilha de respostas com o gestor
  DriveApp.getFileById(responseSheetId).addEditor(emailGestor);
  
  // Enviar e-mail para o gestor com os links
  enviarEmailGestor(emailGestor, form.getPublishedUrl(), dashboard.dashboardUrl);
  
  // Enviar e-mails para os respondentes
  enviarEmailsRespondentes(emailsRespondentes, form.getPublishedUrl(), emailGestor);
  
  return {
    formUrl: form.getPublishedUrl(),
    dashboardUrl: dashboard.dashboardUrl
  };
}

// Função para enviar e-mail ao gestor
function enviarEmailGestor(emailGestor, formUrl, dashboardUrl) {
  const assunto = 'Sistema de Avaliação Psicossocial - Acesso do Gestor';
  const corpo = `
    Olá,
    
    Seu sistema de avaliação psicossocial foi configurado com sucesso.
    
    Aqui estão seus links de acesso:
    
    - Link do formulário para compartilhar com os colaboradores: ${formUrl}
    - Link do seu dashboard de gestor: ${dashboardUrl}
    
    No dashboard, você poderá:
    - Acompanhar as respostas recebidas
    - Gerar o relatório quando todas as respostas forem coletadas
    - Configurar o e-mail para onde o relatório será enviado
    
    Importante: O relatório só poderá ser gerado quando todas as respostas esperadas forem coletadas.
    
    Atenciosamente,
    Sistema de Avaliação Psicossocial
  `;
  
  MailApp.sendEmail(emailGestor, assunto, corpo);
}

// Função para enviar e-mails aos respondentes
function enviarEmailsRespondentes(emailsRespondentes, formUrl, emailGestor) {
  const assunto = 'Convite para Avaliação Psicossocial';
  const corpo = `
    Olá,
    
    Você foi convidado(a) a participar de uma avaliação psicossocial.
    
    Por favor, acesse o link abaixo para responder ao questionário:
    ${formUrl}
    
    Suas respostas são importantes e serão tratadas com confidencialidade.
    
    Atenciosamente,
    Sistema de Avaliação Psicossocial
  `;
  
  emailsRespondentes.forEach(email => {
    MailApp.sendEmail(email, assunto, corpo);
  });
}

// Função para verificar se pode gerar relatório e então gerá-lo
function verificarEGerarRelatorio() {
  const dashboardSS = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = dashboardSS.getSheetByName('Configurações');
  const configData = configSheet.getDataRange().getValues();
  
  let emailGestor, totalRespostasEsperadas, emailRelatorio, respostasAtuais;
  
  for (let i = 0; i < configData.length; i++) {
    if (configData[i][0] === 'E-mail do Gestor') emailGestor = configData[i][1];
    if (configData[i][0] === 'Total de Respostas Esperadas') totalRespostasEsperadas = configData[i][1];
    if (configData[i][0] === 'E-mail para Relatório') emailRelatorio = configData[i][1];
    if (configData[i][0] === 'Respostas Atuais') respostasAtuais = configData[i][1];
  }
  
  // Verificar se há e-mail para envio do relatório
  if (!emailRelatorio) {
    SpreadsheetApp.getUi().alert('Por favor, informe o e-mail para envio do relatório na aba de Configurações.');
    return;
  }
  
  // Verificar se atingiu o número mínimo de respostas
  if (respostasAtuais < totalRespostasEsperadas) {
    SpreadsheetApp.getUi().alert(`Ainda não é possível gerar o relatório. Aguardando mais respostas (${respostasAtuais}/${totalRespostasEsperadas}).`);
    return;
  }
  
  // Gerar e enviar o relatório
  gerarEEnviarRelatorio(emailRelatorio, dashboardSS.getId());
}

// Função para gerar e enviar o relatório
function gerarEEnviarRelatorio(emailDestino, dashboardId) {
  const dashboardSS = SpreadsheetApp.openById(dashboardId);
  const respostasSheet = dashboardSS.getSheetByName('Respostas');
  const respostasData = respostasSheet.getDataRange().getValues();
  
  // Obter todas as respostas para análise
  const mainSS = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allRespostasSheet = mainSS.getSheetByName('Respostas');
  const allRespostasData = allRespostasSheet.getDataRange().getValues();
  
  // Filtrar apenas as respostas relevantes para este gestor
  const configSheet = dashboardSS.getSheetByName('Configurações');
  const configData = configSheet.getDataRange().getValues();
  let emailGestor;
  
  for (let i = 0; i < configData.length; i++) {
    if (configData[i][0] === 'E-mail do Gestor') emailGestor = configData[i][1];
  }
  
  // Calcular médias e preparar dados para o relatório
  const resultados = calcularResultadosQuestionario(allRespostasData, emailGestor);
  
  // Gerar o documento do relatório baseado no template
  const relatorioPdf = criarRelatorio(resultados, emailGestor);
  
  // Enviar o relatório por e-mail
  enviarRelatorioPorEmail(emailDestino, relatorioPdf);
  
  // Registrar na aba de relatórios
  const relatoriosSheet = dashboardSS.getSheetByName('Relatórios');
  relatoriosSheet.appendRow([
    new Date(),
    relatorioPdf.getUrl(),
    emailDestino
  ]);
  
  // Atualizar status
  for (let i = 0; i < configData.length; i++) {
    if (configData[i][0] === 'Status do Relatório') {
      configSheet.getRange(i+1, 2).setValue('Gerado e enviado em ' + new Date());
      break;
    }
  }
  
  SpreadsheetApp.getUi().alert('Relatório gerado e enviado com sucesso para ' + emailDestino);
}

// Função para calcular os resultados do questionário
function calcularResultadosQuestionario(respostasData, emailGestor) {
  // Filtrar respostas relevantes para este gestor
  const respostasFiltradas = respostasData.filter(row => row[2] === emailGestor);
  
  // Assumindo que as respostas das perguntas começam na coluna 4 e vão até a 33 (30 perguntas)
  const resultados = {
    mediaGeral: 0,
    categorias: {
      demandas: { media: 0, perguntas: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      controle: { media: 0, perguntas: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
      apoioSocial: { media: 0, perguntas: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] }
    },
    totalRespondentes: respostasFiltradas.length
  };
  
  // Calcular médias por categoria
  const calcularMedia = (categoria) => {
    let soma = 0;
    let contador = 0;
    
    for (let i = 1; i < respostasFiltradas.length; i++) { // Começar de 1 para pular o cabeçalho
      for (let j = 0; j < categoria.perguntas.length; j++) {
        const coluna = categoria.perguntas[j] + 4; // +4 porque as respostas começam na coluna 4
        const valor = parseInt(respostasFiltradas[i][coluna]);
        if (!isNaN(valor)) {
          soma += valor;
          contador++;
        }
      }
    }
    
    return contador > 0 ? soma / contador : 0;
  };
  
  resultados.categorias.demandas.media = calcularMedia(resultados.categorias.demandas);
  resultados.categorias.controle.media = calcularMedia(resultados.categorias.controle);
  resultados.categorias.apoioSocial.media = calcularMedia(resultados.categorias.apoioSocial);
  
  // Calcular média geral
  resultados.mediaGeral = (
    resultados.categorias.demandas.media + 
    resultados.categorias.controle.media + 
    resultados.categorias.apoioSocial.media
  ) / 3;
  
  return resultados;
}

// Função para criar o relatório baseado no template
function criarRelatorio(resultados, emailGestor) {
  // Obter o template
  const template = DocumentApp.openById(TEMPLATE_ID);
  
  // Criar uma cópia do template
  const novoPdfDoc = DriveApp.getFileById(TEMPLATE_ID).makeCopy(`Relatório Psicossocial - ${emailGestor} - ${new Date().toISOString().slice(0,10)}`);
  const doc = DocumentApp.openById(novoPdfDoc.getId());
  const corpo = doc.getBody();
  
  // Substituir placeholders no template
  corpo.replaceText('{{DATA}}', new Date().toLocaleDateString());
  corpo.replaceText('{{EMPRESA}}', emailGestor.split('@')[1]);
  corpo.replaceText('{{TOTAL_RESPONDENTES}}', resultados.totalRespondentes.toString());
  corpo.replaceText('{{MEDIA_GERAL}}', resultados.mediaGeral.toFixed(2));
  corpo.replaceText('{{MEDIA_DEMANDAS}}', resultados.categorias.demandas.media.toFixed(2));
  corpo.replaceText('{{MEDIA_CONTROLE}}', resultados.categorias.controle.media.toFixed(2));
  corpo.replaceText('{{MEDIA_APOIO}}', resultados.categorias.apoioSocial.media.toFixed(2));
  
  // Adicionar recomendações baseadas nos resultados
  let recomendacoes = '';
  
  if (resultados.mediaGeral < 2) {
    recomendacoes = 'Os resultados indicam um ambiente de trabalho com alto risco psicossocial. Recomenda-se intervenção imediata.';
  } else if (resultados.mediaGeral < 3) {
    recomendacoes = 'Os resultados indicam um ambiente de trabalho com risco psicossocial moderado. Recomenda-se atenção e implementação de melhorias.';
  } else if (resultados.mediaGeral < 4) {
    recomendacoes = 'Os resultados indicam um ambiente de trabalho com baixo risco psicossocial. Recomenda-se monitoramento contínuo.';
  } else {
    recomendacoes = 'Os resultados indicam um ambiente de trabalho saudável do ponto de vista psicossocial. Recomenda-se manter as boas práticas.';
  }
  
  corpo.replaceText('{{RECOMENDACOES}}', recomendacoes);
  
  // Salvar as alterações
  doc.saveAndClose();
  
  // Converter para PDF
  const pdfBlob = DriveApp.getFileById(novoPdfDoc.getId()).getAs('application/pdf');
  const pdfFile = DriveApp.createFile(pdfBlob).setName(`Relatório Psicossocial - ${emailGestor} - ${new Date().toISOString().slice(0,10)}.pdf`);
  
  // Excluir o documento temporário
  DriveApp.getFileById(novoPdfDoc.getId()).setTrashed(true);
  
  return pdfFile;
}

// Função para enviar o relatório por e-mail
function enviarRelatorioPorEmail(emailDestino, relatorioPdf) {
  const assunto = 'Relatório de Avaliação Psicossocial';
  const corpo = `
    Olá,
    
    Segue em anexo o relatório de avaliação psicossocial solicitado.
    
    Este relatório foi gerado automaticamente com base nas respostas coletadas.
    
    Atenciosamente,
    Sistema de Avaliação Psicossocial
  `;
  
  MailApp.sendEmail({
    to: emailDestino,
    subject: assunto,
    body: corpo,
    attachments: [relatorioPdf]
  });
}

// Função chamada pelo frontend para iniciar o processo
function iniciarProcesso(emailGestor, totalRespostasEsperadas, emailsRespondentes) {
  return criarEEnviarForm(emailGestor, emailsRespondentes, totalRespostasEsperadas);
}
