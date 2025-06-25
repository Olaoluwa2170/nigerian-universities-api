const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// URLs to scrape and the corresponding university type
const PAGES_TO_SCRAPE = {
  'https://www.nuc.edu.ng/nigerian-univerisities/federal-univeristies/': 'Federal',
  'https://www.nuc.edu.ng/nigerian-univerisities/state-univerisity/': 'State',
  'https://www.nuc.edu.ng/nigerian-univerisities/private-univeristies/': 'Private'
};

let universities = [];

/**
 * Build a naive abbreviation for a university name.
 * e.g. "University of Lagos" → "UNILAG" (approximation: takes first 6 significant letters).
 */
function makeAbbreviation(name) {
  const skip = new Set(['of', 'the', 'and', 'for']);
  const letters = name
    .replace(/[(),.]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !skip.has(word.toLowerCase()))
    .map(word => word[0])
    .join('');
  return letters.toUpperCase().slice(0, 6);
}

/**
 * Attempt to extract city and state from the university name.
 * This only works reliably for names of the form `Name, City` or `Name, City, State`.
 */
function parseLocation(name) {
  const parts = name.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    return {
      city: parts[1],
      state: parts[2].replace(/ State$/i, '').trim()
    };
  }
  if (parts.length === 2) {
    const loc = parts[1].replace(/ State$/i, '').trim();
    return { city: loc, state: loc };
  }
  return { city: '', state: '' };
}

async function scrapePage(url, type) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  $('tbody tr').each((_, el) => {
    const tds = $(el).find('td');
    if (tds.length < 5) return; // Skip malformed rows

    const rawName = $(tds[1]).text().trim().replace(/\s+/g, ' ');
    const viceChancellor = $(tds[2]).text().trim().replace(/\s+/g, ' ');
    const website = $(tds[3]).find('a').attr('href') || '';
    const year = $(tds[4]).text().trim();

    const { city, state } = parseLocation(rawName);
    const abbreviation = makeAbbreviation(rawName);

    universities.push({
      name: rawName,
      state,
      city,
      abbreviation,
      vice_chancellor: viceChancellor,
      year_of_establishment: year,
      website,
      university_type: type
    });
  });
}

async function scrapeUniversities() {
  universities = []; // Reset in case of refresh
  const tasks = [];
  for (const [url, type] of Object.entries(PAGES_TO_SCRAPE)) {
    tasks.push(
      scrapePage(url, type).catch(err => {
        console.error(`Failed to scrape ${url}:`, err.message);
      })
    );
  }
  await Promise.all(tasks);
  console.log(`Scraped ${universities.length} universities`);
}

// Trigger a scrape on startup
scrapeUniversities();

/* ---------------------------------- Routes --------------------------------- */

app.get('/api/universities', (req, res) => {
  let result = [...universities];

  const { state, city, type, search } = req.query;
  if (state) {
    result = result.filter(u => u.state.toLowerCase() === state.toLowerCase());
  }
  if (city) {
    result = result.filter(u => u.city.toLowerCase() === city.toLowerCase());
  }
  if (type) {
    result = result.filter(u => u.university_type.toLowerCase() === type.toLowerCase());
  }
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      u =>
        u.name.toLowerCase().includes(term) ||
        u.abbreviation.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, data: { universities: result } });
});

// Universities in a particular city
app.get('/api/universities/city/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const result = universities.filter(u => u.city.toLowerCase() === city);
  res.json({ success: true, data: { universities: result } });
});

// Universities in a particular state
app.get('/api/universities/state/:state', (req, res) => {
  const state = req.params.state.toLowerCase();
  const result = universities.filter(u => u.state.toLowerCase() === state);
  res.json({ success: true, data: { universities: result } });
});

// All private universities
app.get('/api/universities/private', (req, res) => {
  const result = universities.filter(u => u.university_type === 'Private');
  res.json({ success: true, data: { universities: result } });
});

// Private universities in a particular state
app.get('/api/universities/private/state/:state', (req, res) => {
  const state = req.params.state.toLowerCase();
  const result = universities.filter(
    u => u.university_type === 'Private' && u.state.toLowerCase() === state
  );
  res.json({ success: true, data: { universities: result } });
});

// Get university details by name or abbreviation
app.get('/api/universities/:identifier', (req, res) => {
  const identifier = req.params.identifier.toLowerCase();
  const uni = universities.find(
    u => u.name.toLowerCase() === identifier || u.abbreviation.toLowerCase() === identifier
  );
  if (!uni) {
    return res.status(404).json({ success: false, message: 'University not found' });
  }
  res.json({ success: true, data: { university: uni } });
});

/* --------------------------------- Server ---------------------------------- */

app.listen(PORT, () => console.log(`Nigerian Universities API running on port ${PORT}`)); 