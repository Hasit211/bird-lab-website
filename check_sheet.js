const SHEET_ID = '1rfeP7ny6xYqEe-5fVLqKpXLHGI2rGeQ8oZK0us6ADtE';

fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=People&_t=${Date.now()}`)
  .then((r) => r.text())
  .then((text) => {
    const rows = text.split('\n');
    const header = rows[0];
    console.log('HEADERS:', header.split(',').slice(0, 5).join(' | '));
    console.log('\nAll people rows (Name + Photo columns):');
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      const parts = [];
      let cur = '', inQ = false;
      for (const c of rows[i]) {
        if (c === '"') { inQ = !inQ; continue; }
        if (c === ',' && !inQ) { parts.push(cur); cur = ''; continue; }
        cur += c;
      }
      parts.push(cur);
      const title = parts[0], name = parts[1], photo = parts[2];
      console.log(`  [${title}] ${name} | Photo: "${photo}"`);
    }
  })
  .catch((err) => console.error('Error fetching sheet:', err));
