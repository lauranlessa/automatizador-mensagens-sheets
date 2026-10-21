const NOME_DA_ABA = 'Respostas'; // troque pelo nome exato da aba de respostas

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mensagens')
    .addItem('Buscar cliente ou curso', 'buscarMensagem')
    .addToUi();
}

function buscarMensagem() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt('Buscar', 'Digite parte do nome do cliente ou do curso:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const termo = resp.getResponseText().trim().toLowerCase();
  if (!termo) return;

  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_DA_ABA);
  const dados = aba.getDataRange().getValues();
  const cab = dados[0].map(String);
  const col = (t) => cab.findIndex(h => h.toLowerCase().includes(t));

  const cCodigo  = cab[0] === '' ? 0 : col('código');
  const cCliente = col('empresa ou instituto');
  const cCurso   = col('nome do curso');
  const cDoc     = col('documento de identifica');
  const cDiploma = col('diploma de gradua');
  const cCert    = col('certificado de titula');
  const cSite    = col('página de vendas');
  const v = (l, c) => (c >= 0 && l[c] !== '') ? l[c] : 'não enviado';

  const achados = dados.slice(1).filter(l =>
    String(l[cCliente]).toLowerCase().includes(termo) ||
    String(l[cCurso]).toLowerCase().includes(termo));

  if (!achados.length) { ui.alert('Nenhum cliente ou curso encontrado.'); return; }

  const texto = achados.map(l =>
    'Cliente e Código: ' + (cCodigo >= 0 ? l[cCodigo] + ' ' : '') + v(l, cCliente) + '\n' +
    'Documento: ' + v(l, cDoc) + '\n' +
    'Diploma Graduação: ' + v(l, cDiploma) + '\n' +
    'Certificado Pós: ' + v(l, cCert) + '\n' +
    'Site: ' + v(l, cSite)
  ).join('\n\n---\n\n');

  const html = HtmlService.createHtmlOutput(
    '<textarea id="t" style="width:100%;height:300px;font-family:sans-serif">' +
    texto.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</textarea>' +
    '<button onclick="document.getElementById(\'t\').select();document.execCommand(\'copy\');this.innerText=\'Copiado!\'">Copiar</button>'
  ).setWidth(600).setHeight(380);
  ui.showModalDialog(html, 'Mensagem pronta');
}
