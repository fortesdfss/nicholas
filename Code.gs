function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = {};

  try {
    const sheets = ['SESSOES', 'SERIES', 'BEM_ESTAR'];
    const keys   = ['sessoes', 'series', 'bem_estar'];

    sheets.forEach((name, idx) => {
      const ws = ss.getSheetByName(name);
      if (!ws) { out[keys[idx]] = []; return; }
      const all = ws.getDataRange().getValues();
      out['debug_' + name + '_rows'] = all.length;
      out['debug_' + name + '_col0'] = all.slice(0,6).map(r => String(r[0]).trim());

      if (all.length < 2) { out[keys[idx]] = []; return; }

      // Procura linha com "data" nas primeiras 10 linhas
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(10, all.length); i++) {
        const first = String(all[i][0]).trim().toLowerCase();
        if (first === 'data') { headerRowIdx = i; break; }
      }

      if (headerRowIdx === -1) {
        out['debug_' + name + '_error'] = 'Cabeçalho "data" não encontrado nas primeiras 10 linhas';
        out[keys[idx]] = [];
        return;
      }

      out['debug_' + name + '_headerRow'] = headerRowIdx;

      const headers = all[headerRowIdx].map(h =>
        String(h).trim().toLowerCase()
          .replace(/%/g, 'pct_')
          .replace(/\n/g, '_')
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
      );

      out['debug_' + name + '_headers'] = headers.slice(0, 5);

      const dataRows = all.slice(headerRowIdx + 1)
        .filter(row => row[0] !== '' && row[0] !== null && row[0] !== undefined);

      out['debug_' + name + '_dataCount'] = dataRows.length;

      out[keys[idx]] = dataRows.map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          let v = row[i];
          if (v instanceof Date) {
            v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
          obj[h] = (v === '' || v === null || v === undefined) ? null : v;
        });
        return obj;
      });
    });

    out.status  = 'ok';
    out.updated = new Date().toISOString();

  } catch (err) {
    out.status = 'error';
    out.error  = err.toString();
    out.stack  = err.stack;
  }

  const json = JSON.stringify(out);
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
