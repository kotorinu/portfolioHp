const CONFIG = {
  spreadsheetId: "1jwqfoQ17ljrjNfwjAgOhtfKv422o5CvH74Mttvvx2lI",
  sheetName: "お問い合わせ",
  notificationEmail: "kotokoto.gaisya@gmail.com",
  headers: ["受付日時", "お名前", "メールアドレス", "ご相談内容", "メッセージ", "送信元ページ"]
};

function setup() {
  const sheet = getContactSheet_();
  Logger.log(sheet.getParent().getUrl());
}

function doGet() {
  const sheet = getContactSheet_();
  return json_({
    ok: true,
    spreadsheetUrl: sheet.getParent().getUrl()
  });
}

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const sheet = getContactSheet_();
    const row = [
      new Date(),
      clean_(params.name),
      clean_(params.email),
      clean_(params.topic),
      clean_(params.message),
      clean_(params.sourcePage)
    ];

    sheet.appendRow(row);
    notify_(row);

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error) });
  }
}

function getContactSheet_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);

  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(CONFIG.sheetName);
  }

  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, CONFIG.headers.length);
  const current = headerRange.getValues()[0];
  const hasHeaders = CONFIG.headers.every((header, index) => current[index] === header);

  if (!hasHeaders) {
    headerRange.setValues([CONFIG.headers]);
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function notify_(row) {
  const subject = "Tonari AI お問い合わせ: " + (row[3] || "新規相談");
  const body = [
    "Tonari AIのフォームからお問い合わせがありました。",
    "",
    "受付日時: " + row[0],
    "お名前: " + row[1],
    "メールアドレス: " + row[2],
    "ご相談内容: " + row[3],
    "",
    "メッセージ:",
    row[4],
    "",
    "送信元ページ: " + row[5]
  ].join("\n");

  MailApp.sendEmail(CONFIG.notificationEmail, subject, body, {
    replyTo: row[2] || CONFIG.notificationEmail,
    name: "Tonari AI フォーム"
  });
}

function clean_(value) {
  return String(value || "").trim();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
