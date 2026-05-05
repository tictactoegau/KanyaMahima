// Kanya Mahima Contact Form Backend
// Paste this file into Google Apps Script as Code.gs.

const RECIPIENT_EMAIL = 'tictactoe@gmail.com'; // Change this to the email that should receive messages.
const SHEET_NAME = 'Kanya Mahima Contact Messages';

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    // Honeypot spam check. Real users never fill this hidden field.
    if (params.website) {
      return jsonResponse({ ok: true, ignored: true });
    }

    const name = clean(params.name);
    const email = clean(params.email);
    const message = clean(params.message);
    const source = clean(params.source || 'Kanya Mahima Website');

    if (!name || !email || !message) {
      return jsonResponse({ ok: false, error: 'Missing required fields.' });
    }

    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      new Date(),
      name,
      email,
      message,
      source,
      JSON.stringify(params)
    ]);

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: 'New Kanya Mahima website message from ' + name,
      body:
        'New message from the Kanya Mahima website:\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Source: ' + source + '\n\n' +
        'Message:\n' + message
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Kanya Mahima contact form endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Message', 'Source', 'Raw Params']);
  }
  return sheet;
}

function clean(value) {
  return String(value || '').trim().slice(0, 5000);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
