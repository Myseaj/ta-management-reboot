/**
 * Google Apps Script – Bewerbung mit Lebenslauf-Upload
 * 
 * SETUP-ANLEITUNG:
 * 1. Gehe zu https://script.google.com und erstelle ein neues Projekt
 * 2. Kopiere diesen Code in die Code.gs Datei
 * 3. Ersetze GOOGLE_CHAT_WEBHOOK_URL mit eurem Webhook
 * 4. Ersetze DRIVE_FOLDER_ID mit der ID des Google Drive Ordners für Lebensläufe
 *    (Die Ordner-ID findest du in der URL: https://drive.google.com/drive/folders/DIESE_ID_HIER)
 * 5. Klicke auf "Bereitstellen" → "Neue Bereitstellung"
 * 6. Typ: "Web-App"
 * 7. Ausführen als: "Ich" (dein Google-Konto)
 * 8. Zugriff: "Jeder"
 * 9. Die generierte URL in jobAd/index.html bei APPS_SCRIPT_URL eintragen
 */

const GOOGLE_CHAT_WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAQAQtXMCik/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=nmBuW9WfUvjXFBWof_fXSGtQHupE3q5fwK1hUA1wl9A";
const DRIVE_FOLDER_ID = "HIER_ORDNER_ID_EINFUEGEN"; // Google Drive Ordner-ID

function doPost(e) {
  let driveFileUrl = "";
  let data = {};

  try {
    data = JSON.parse(e.postData.contents);
  } catch (parseErr) {
    console.error("JSON Parse Fehler:", parseErr);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 1. Datei in Google Drive speichern (falls vorhanden)
  try {
    if (data.fileBase64 && data.fileName) {
      const fileBlob = Utilities.newBlob(
        Utilities.base64Decode(data.fileBase64),
        data.fileMimeType || "application/pdf",
        data.fileName
      );
      
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const timestamp = Utilities.formatDate(new Date(), "Europe/Berlin", "yyyy-MM-dd_HH-mm");
      const safeName = (data.name || "Unbekannt").replace(/[^a-zA-ZäöüÄÖÜß\s\-]/g, "");
      const finalFileName = `${safeName}_${timestamp}_${data.fileName}`;
      
      const file = folder.createFile(fileBlob.setName(finalFileName));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveFileUrl = file.getUrl();
      console.log("Datei hochgeladen:", driveFileUrl);
    }
  } catch (driveErr) {
    console.error("Drive Upload Fehler:", driveErr);
  }

  // 2. Google Chat Webhook senden
  try {
    const messageParts = [
      "📩 *Neue Bewerbung über Stellenanzeige*",
      "",
      `📋 *Stelle:* ${data.jobTitle || "Unbekannt"}`,
      `📍 *Standort:* ${data.jobLocation || "-"}`,
      "",
      `👤 *Name:* ${data.name || "-"}`,
      `✉️ *E-Mail:* ${data.email || "-"}`,
    ];
    
    if (data.phone) messageParts.push(`📞 *Telefon:* ${data.phone}`);
    if (data.salary) messageParts.push(`💰 *Gehaltswunsch:* ${data.salary}`);
    if (data.comment) messageParts.push(`💬 *Kommentar:* ${data.comment}`);
    if (driveFileUrl) messageParts.push("", `📎 *Lebenslauf:* ${driveFileUrl}`);
    
    messageParts.push("", `🔗 ${data.url || ""}`);
    
    const text = messageParts.join("\n");
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ text }),
      muteHttpExceptions: true,
    };
    
    const response = UrlFetchApp.fetch(GOOGLE_CHAT_WEBHOOK_URL, options);
    console.log("Webhook Response:", response.getResponseCode(), response.getContentText());
  } catch (webhookErr) {
    console.error("Webhook Fehler:", webhookErr.message || webhookErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, fileUrl: driveFileUrl }))
    .setMimeType(ContentService.MimeType.JSON);
}

// CORS-Preflight für Browser-Requests
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Testfunktion – direkt in GAS ausführen zum Testen
function testDoPost() {
  // Kleines Test-PDF (minimaler PDF-Header als Base64)
  const miniPdfBase64 = Utilities.base64Encode(
    "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
  );

  const testPayload = {
    postData: {
      contents: JSON.stringify({
        name: "Max Mustermann",
        email: "max@beispiel.de",
        phone: "+49 170 1234567",
        salary: "65.000 €",
        comment: "Testbewerbung – bitte ignorieren.",
        jobTitle: "Bauleiter (m/w/d)",
        jobLocation: "München",
        url: "https://www.ta-management.de/jobAd/123",
        fileName: "Lebenslauf_Test.pdf",
        fileMimeType: "application/pdf",
        fileBase64: miniPdfBase64,
      })
    }
  };

  const result = doPost(testPayload);
  console.log("Ergebnis:", result.getContent());
}
