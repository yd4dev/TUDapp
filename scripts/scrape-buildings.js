const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

const URLS = [
  'https://www.tu-darmstadt.de/universitaet/campus/gebaeudeadressen_2/index.de.jsp',
  'https://www.tu-darmstadt.de/universitaet/campus/stadtmitte_3/index.de.jsp',
  'https://www.tu-darmstadt.de/universitaet/campus/botanischer_garten_1/index.de.jsp',
  'https://www.tu-darmstadt.de/universitaet/campus/lichtwiese_2/index.de.jsp',
  'https://www.tu-darmstadt.de/universitaet/campus/hochschulstadion/index.de.jsp',
  'https://www.tu-darmstadt.de/universitaet/campus/windkanal_flugplatz/index.de.jsp'
];

async function downloadAllHtml() {
  const htmls = [];
  for (const url of URLS) {
    console.log('Downloading', url);
    const res = await axios.get(url);
    htmls.push({ url, html: res.data });
  }
  return htmls;
}

// Parse the main address table (first URL)
function parseBuildingsTable(html) {
  const $ = cheerio.load(html);
  const buildings = [];
  $('table').each((_, table) => {
    $(table).find('tr').each((_, tr) => {
      const cells = $(tr).find('td');
      if (cells.length === 4) {
        const geb = $(cells[0]).text().replace(/\s+/g, ' ').trim();
        if (!geb) return;
        buildings.push({
          Gebäude: geb,
          Name: $(cells[1]).text().replace(/\s+/g, ' ').trim(),
          Adresse: $(cells[2]).text().replace(/\s+/g, ' ').trim(),
          PLZ_Ort: $(cells[3]).text().replace(/\s+/g, ' ').trim()
        });
      }
    });
  });
  return buildings;
}

// Parse department info from the other pages
function parseDepartments(html, buildingTable) {
  const $ = cheerio.load(html);
  const map = new Map();

  $('section.toggle-section').each((_, section) => {
    // Find building code in h3 or h2
    let code = null;
    $(section).find('h3, h2').each((_, h) => {
      const m = $(h).text().match(/([A-Z]\d+\|\d+)/);
      if (m) code = m[1];
    });
    if (!code) return;

    // Collect all department candidates in order as they appear in the HTML, including links
    const departments = [];
    // Use .contents() to get all nodes (including text, <a>, <strong>, etc.) in order
    $(section).find('p').each((_, el) => {
      const html = $(el).html() || '';
      const parts = html.split(/<br\s*\/?>/i);
      let address = null;
      if (buildingTable && Array.isArray(buildingTable)) {
        const b = buildingTable.find(b => b.Gebäude === code);
        if (b) address = b.Adresse;
      }
      for (let i = 0; i < parts.length; ++i) {
        const part = parts[i];
        // If part contains an <a>, group the entire part under the link
        if (part.includes('<a ')) {
          const $part = cheerio.load('<div>' + part + '</div>');
          const a = $part('a');
          if (a.length) {
            const name = $part('div').text().replace(/\s+/g, ' ').trim();
            const link = a.attr('href');
            if (name && !departments.some(d => d.name === name)) {
              departments.push({ name, link: link || null });
            }
            continue;
          }
        }
        // Otherwise, walk children as before
        const $part = cheerio.load('<div>' + part + '</div>');
        $part('div').contents().each((_, node) => {
          if (node.type === 'tag' && node.name === 'a') {
            const name = $part(node).text().replace(/\s+/g, ' ').trim();
            const link = $part(node).attr('href');
            if (name && !departments.some(d => d.name === name)) {
              departments.push({ name, link: link || null });
            }
          } else if (node.type === 'tag' && node.name === 'strong') {
            const txt = $part(node).text().replace(/\s+/g, ' ').trim();
            if (txt && !departments.some(d => d.name === txt)) {
              departments.push({ name: txt, link: null });
            }
          } else if (node.type === 'text') {
            const txt = $part(node).text().replace(/\s+/g, ' ').trim();
            if (
              txt &&
              !departments.some(d => d.name === txt) &&
              txt.length > 1 &&
              (!address || txt !== address)
            ) {
              departments.push({ name: txt, link: null });
            }
          }
        });
      }
    });
    // Add 'in Sanierung' if present and not already in list
    if ($(section).text().includes('in Sanierung') && !departments.some(d => d.name === 'in Sanierung')) {
      departments.push({ name: 'in Sanierung', link: null });
    }
    if (departments.length) map.set(code, departments);
  });

  return map;
}

function mergeDepartmentsIntoBuildings(buildings, deptMaps) {
  for (const building of buildings) {
    for (const deptMap of deptMaps) {
      if (deptMap.has(building.Gebäude)) {
        building.Departments = deptMap.get(building.Gebäude);
      }
    }
  }
  return buildings;
}

(async () => {
  const htmls = await downloadAllHtml();
  // First page: address table
  const tableBuildings = parseBuildingsTable(htmls[0].html);

  // All other pages: department info
  const deptMaps = [];
  for (let i = 1; i < htmls.length; ++i) {
    deptMaps.push(parseDepartments(htmls[i].html, tableBuildings));
  }

  // Merge department info into buildings
  const merged = mergeDepartmentsIntoBuildings(tableBuildings, deptMaps);

  fs.writeFileSync('./assets/buildings.json', JSON.stringify(merged, null, 2));
  console.log(`✅ Downloaded, parsed, and saved ${merged.length} buildings to ./assets/buildings.json`);
})();