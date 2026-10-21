/**
 * VIP Tikuv — Google Sheets sync companion.
 *
 * Deploy: Extensions > Apps Script in a Google Sheet, paste this file,
 * then Deploy > New deployment > Web app (execute as you, access: Anyone),
 * copy the /exec URL into the app's Sozlamalar tab.
 *
 * Mirrors two Firestore collections into two sheet tabs, keyed by the
 * Firestore document ID stored in hidden column A. Every write from the
 * app re-reads the whole sheet and rewrites it — simple, not fast, but
 * never gets out of sync. doGet(?action=export) lets the app pull the
 * sheet back (e.g. to catch rows a human typed in by hand).
 */

var SHEET_DEFS = {
  machines: {
    name: "Mashinalar",
    cols: ["ID","Brend","Turi","Model","Seriya","Holati","Kimdan olindi","Uning raqami",
           "Sotib olingan sana","Sotib olingan narx","Kimga sotildi","Xaridor raqami",
           "Sotilgan sana","Sotilgan narx","Izoh"]
  },
  parts: {
    name: "Ehtiyot_qismlar",
    cols: ["ID","Nomi","Kategoriya","SKU","Miqdor","Tannarx","Sotish narxi","Ta'minotchi","Izoh"]
  }
};

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var action = body.action, kind = body.kind, id = body.id, data = body.data;
  if (!SHEET_DEFS[kind]) return ContentService.createTextOutput("ignored");

  if (action === "bulkUpsert" && Array.isArray(body.records)) {
    body.records.forEach(function(r){ upsertRow(kind, r.id, r.data); });
  } else if (action === "delete") {
    deleteRow(kind, id);
  } else {
    upsertRow(kind, id, data);
  }
  return ContentService.createTextOutput("ok");
}

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || "export";
  if (action !== "export") return ContentService.createTextOutput("unknown action");
  var out = {};
  Object.keys(SHEET_DEFS).forEach(function(kind){
    out[kind] = readAll(kind);
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(kind) {
  var def = SHEET_DEFS[kind];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.appendRow(def.cols);
    sheet.getRange(1,1,1,def.cols.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.hideColumns(1); // hide ID column
  }
  return sheet;
}

function readAll(kind) {
  var sheet = getOrCreateSheet_(kind);
  var def = SHEET_DEFS[kind];
  var values = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var id = row[0];
    if (!id) continue; // skip rows a human typed with no ID yet
    var rec = {};
    def.cols.forEach(function(colName, idx){ rec[colName] = row[idx]; });
    records.push({ id: id, fields: rec, sheetRow: i+1 });
  }
  return records;
}

function rowFromData_(kind, id, data) {
  data = data || {};
  if (kind === "machines") {
    return [id, data.brand||"", data.type||"", data.model||"", data.serial||"",
            data.status||"", data.source||"", data.sourcePhone||"",
            data.buyDate||"", data.buyPrice!=null?data.buyPrice:"",
            data.buyer||"", data.buyerPhone||"",
            data.sellDate||"", data.sellPrice!=null?data.sellPrice:"", data.note||""];
  }
  return [id, data.name||"", data.category||"", data.sku||"", data.qty!=null?data.qty:"",
          data.buyPrice!=null?data.buyPrice:"", data.askPrice!=null?data.askPrice:"",
          data.supplier||"", data.note||""];
}

function upsertRow(kind, id, data) {
  var sheet = getOrCreateSheet_(kind);
  var values = sheet.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) { rowIdx = i+1; break; }
  }
  var newRow = rowFromData_(kind, id, data);
  if (rowIdx === -1) {
    sheet.appendRow(newRow);
  } else {
    sheet.getRange(rowIdx, 1, 1, newRow.length).setValues([newRow]);
  }
}

function deleteRow(kind, id) {
  var sheet = getOrCreateSheet_(kind);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) { sheet.deleteRow(i+1); break; }
  }
}
