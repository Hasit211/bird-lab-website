import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = fs.existsSync('.env') ? '.env' : path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const sa = JSON.parse(envContent);
const SHEET_ID = '1rfeP7ny6xYqEe-5fVLqKpXLHGI2rGeQ8oZK0us6ADtE';

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken() {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error('Token error: ' + JSON.stringify(data));
  return data.access_token;
}

export const MASTER_CONTENT_ROWS = [
  ['Page', 'Key', 'Section / Element Name', 'Value / Text / URL', 'Description / Where It Appears on Website'],
  
  // ==========================================
  // PEOPLE PAGE (TEAM & ALUMNI)
  // ==========================================
  ['People', 'people.title', 'Page Main Heading', 'Our Team', 'Main heading at the top of the People / Team page'],
  ['People', 'people.subtitle', 'Page Subtitle', 'Meet the brilliant minds driving innovation in robotics research', 'Subtitle text beneath the Our Team heading'],
  ['People', 'people.alumni.badgeText', 'Alumni Button Badge', 'ALUMNI', 'Pill badge inside the top Alumni CTA button'],
  ['People', 'people.alumni.btnText', 'Alumni Button Label', 'Were you Part of the team?', 'Label on buttons linking past lab members to the alumni directory form'],
  ['People', 'people.alumni.formUrl', 'Alumni Form URL (Google Form)', 'https://docs.google.com/forms/d/e/1FAIpQLSe0nQh5TmEqAlNzNZYDtVTVa4XeJ9Td--G9pyqXz5QLDxSe5A/viewform?usp=dialog', 'Link opened by all "Were you Part of the team?" buttons across the People page'],
  ['People', 'people.alumni.bannerText', 'Alumni Section Subtitle', 'Celebrating our previous researchers, student interns, and lab members who contributed to BIRD Lab.', 'Subtitle text in the Alumni section above alumni cards'],
  ['People', 'people.join.title', 'Join Us Section Title', 'Join Our Team', 'Heading for the recruitment callout box at bottom of People page'],
  ['People', 'people.join.text', 'Join Us Description', "We're always looking for passionate researchers and students to join our team. Explore opportunities to work on cutting-edge robotics projects and contribute to groundbreaking research.", 'Description inside the Join Us box'],
  ['People', 'people.join.btnPrimary', 'Join Us Primary Button', 'View Open Positions', 'Text on button linking to Contact / Positions page'],
  ['People', 'people.join.btnSecondary', 'Join Us Secondary Button', 'Contact Us', 'Text on button linking to Contact page'],

  // ==========================================
  // HOME / HERO & WELCOME
  // ==========================================
  ['Home', 'hero.title', 'Hero Main Headline', 'Next Gen BIRD LAB', 'Large hero title displayed on the landing page'],
  ['Home', 'hero.subtitle', 'Hero Subtitle', 'Bio-inspired Robotics and Intelligent Systems Design', 'Subtitle directly beneath hero title'],
  ['Home', 'hero.tagline', 'Hero Tagline', 'Advancing the frontiers of bio-inspired robotics, wearable exoskeletons, reconfigurable mechanisms, and AI-driven autonomous systems at IIT Jodhpur.', 'Introductory paragraph below the hero title'],
  ['Home', 'welcome.title', 'Welcome Section Title', 'Welcome to NextGen BIRD Robotics Lab', 'Main heading of the About / Welcome section on the Home page'],
  ['Home', 'welcome.subtitle', 'Welcome Section Subtitle', 'Leading the advancement of bio-inspired robotics through innovative research, nature-inspired design, and cutting-edge technology solutions', 'Subtitle directly beneath the Welcome section title'],
  ['Home', 'about.title', 'About Title (Alias)', 'Welcome to NextGen BIRD Robotics Lab', 'Alternative alias for the Welcome section title'],
  ['Home', 'about.description', 'About Section Description', 'The NextGen BIRD (Bio-inspired Intelligent Robotics and Dynamics) Lab at IIT Jodhpur is dedicated to cutting-edge research in bio-inspired mechanisms, wearable robotic exoskeletons, soft actuators, aerial manipulators, and applied AI in robotics. Our mission is to bridge biological principles and engineering innovations to create adaptive, resilient, and intelligent robotic systems for healthcare, human augmentation, industrial automation, and extreme environments.', 'Comprehensive overview paragraph in the About section'],
  ['Home', 'welcome.mission.title', 'Mission Card Title', 'Our Mission', 'Heading for the mission card'],
  ['Home', 'welcome.mission.text', 'Mission Card Text', 'To pioneer bio-inspired robotics solutions that solve real-world challenges in healthcare, industry, and extreme environments.', 'Body text for the mission card'],
  ['Home', 'welcome.vision.title', 'Vision Card Title', 'Our Vision', 'Heading for the vision card'],
  ['Home', 'welcome.vision.text', 'Vision Card Text', 'To be a global leader in bio-inspired robotics research, fostering innovation and translating scientific discoveries into impactful technologies.', 'Body text for the vision card'],
  ['Home', 'welcome.values.title', 'Core Values Title', 'Core Values', 'Heading for the core values card'],
  ['Home', 'welcome.values.text', 'Core Values Text', 'Excellence in research, interdisciplinary collaboration, ethical engineering, and mentorship of future innovators.', 'Body text for the core values card'],
  ['Home', 'director.name', 'Director / PI Name', 'Dr. Bhivraj Suthar', 'Lab Director and Principal Investigator name'],
  ['Home', 'director.title', 'Director Designation', 'Assistant Professor, Department of Mechanical Engineering & IDRP-Robotics and Mobility Systems, IIT Jodhpur', 'Official designation of the Director'],
  ['Home', 'director.email', 'Director Email', 'bhivraj@iitj.ac.in', 'Direct email address of the Lab Director'],
  ['Home', 'director.message', 'Director Welcome Message', 'Welcome to the NextGen BIRD Lab at IIT Jodhpur. We explore the intersection of biological mechanisms and advanced robotics to build technologies that empower human potential and solve real-world challenges.', 'Welcome message from the Director'],
  ['Home', 'stats.projects', 'Stat: Active Projects', '15+', 'Number of active research projects counter'],
  ['Home', 'stats.publications', 'Stat: Publications', '25+', 'Number of peer-reviewed publications counter'],
  ['Home', 'stats.funding', 'Stat: Research Funding', '₹5 Cr+', 'Secured research funding counter'],
  ['Home', 'stats.collaborations', 'Stat: Collaborations', '10+', 'Number of academic & industry partners counter'],
  ['Home', 'features.title', 'Focus Areas Title', 'Key Research Focus Areas', 'Heading of the research focus section on home page'],
  ['Home', 'features.subtitle', 'Focus Areas Subtitle', 'Advancing robotics through nature-inspired design, intelligent bio-signal control, and adaptive autonomy.', 'Subtitle of the research focus section on home page'],

  // ==========================================
  // RESEARCH PAGE
  // ==========================================
  ['Research', 'research.title', 'Page Main Heading', 'Research Areas', 'Main heading at the top of the Research page'],
  ['Research', 'research.subtitle', 'Page Subtitle', 'Exploring cutting-edge technologies and methodologies to advance the field of robotics', 'Subtitle beneath the Research Areas heading'],

  // ==========================================
  // PUBLICATIONS PAGE
  // ==========================================
  ['Publications', 'publications.badge', 'Section Badge', 'Academic Output', 'Pill badge displayed above the main publications title'],
  ['Publications', 'publications.title', 'Page Main Heading', 'Publications & Research Papers', 'Main heading at the top of the Publications page'],
  ['Publications', 'publications.subtitle', 'Page Subtitle', "All peer-reviewed journal articles, conference proceedings, and patents directly synchronized with Dr. Bhivraj Suthar's Google Scholar profile.", 'Subtitle beneath the Publications heading'],
  ['Publications', 'publications.scholarUrl', 'Google Scholar Profile URL', 'https://scholar.google.com/citations?user=3KZSSEIAAAAJ&hl=en', "Link to Dr. Bhivraj Suthar's official Google Scholar profile"],

  // ==========================================
  // COURSES / LECTURES PAGE
  // ==========================================
  ['Lectures', 'lectures.title', 'Page Main Heading', 'Courses & Curriculum', 'Main heading at the top of the Courses / Lectures page'],
  ['Lectures', 'lectures.subtitle', 'Page Subtitle', 'Explore our comprehensive course offerings in robotics, mechatronics, and related technologies', 'Subtitle beneath the Courses heading'],

  // ==========================================
  // COLLABORATIONS PAGE
  // ==========================================
  ['Collaborations', 'gallery.title', 'Page Main Heading', 'Collaboration', 'Main heading at the top of the Collaborations section'],
  ['Collaborations', 'gallery.subtitle', 'Page Subtitle', 'Explore our research collaborations, academic partners, and industry initiatives', 'Subtitle beneath the Collaboration heading'],

  // ==========================================
  // FACILITIES PAGE
  // ==========================================
  ['Facilities', 'facilities.title', 'Page Main Heading', 'Lab Facilities', 'Main heading at the top of the Lab Facilities page'],
  ['Facilities', 'facilities.subtitle', 'Page Subtitle', 'State-of-the-art equipment and infrastructure for cutting-edge research', 'Subtitle beneath the Facilities heading'],

  // ==========================================
  // EVENTS PAGE
  // ==========================================
  ['Events', 'events.title', 'Page Main Heading', 'Recent Events', 'Main heading at the top of the Events page'],
  ['Events', 'events.subtitle', 'Page Subtitle', 'Stay updated with our latest conferences, workshops, and academic activities', 'Subtitle beneath the Recent Events heading'],

  // ==========================================
  // HEADER & FOOTER
  // ==========================================
  ['Header & Footer', 'header.title', 'Site Header Brand Name', 'NextGen BIRD Lab', 'Brand title displayed in the top navigation bar'],
  ['Header & Footer', 'footer.about', 'Footer Lab Summary', 'Advancing bio-inspired robotics, wearable exoskeletons, reconfigurable mechanisms, and AI-driven autonomous systems at IIT Jodhpur.', 'Short lab description shown in the site footer'],
  ['Header & Footer', 'footer.copyright', 'Footer Copyright Line', 'NextGen BIRD Lab, IIT Jodhpur. All rights reserved.', 'Copyright notice at the bottom of every page']
];

async function syncAllContent() {
  const token = await getAccessToken();

  // 1. Fetch spreadsheet info
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meta = await metaRes.json();
  const sheets = meta.sheets || [];

  let contentSheet = sheets.find(s => s.properties.title.toLowerCase() === 'content');
  
  // If a redundant 'Content' tab exists, remove it so only Welcome holds site content
  if (contentSheet) {
    console.log("Removing redundant 'Content' tab...");
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            deleteSheet: {
              sheetId: contentSheet.properties.sheetId,
            }
          }
        ]
      })
    });
  }

  // Target tab to sync: Welcome holds all site headings, subtitles, and buttons
  const tabsToUpdate = ['Welcome'];

  for (const tabName of tabsToUpdate) {
    console.log(`\n--- Syncing tab: ${tabName} ---`);
    // Clear old values
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}!A1:Z200:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Write updated values
    const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${tabName}!A1`,
        majorDimension: 'ROWS',
        values: MASTER_CONTENT_ROWS,
      }),
    });
    const writeData = await writeRes.json();
    console.log(`Written to ${tabName}:`, writeData.updatedRows, 'rows,', writeData.updatedCells, 'cells.');
  }

  // Refresh metadata to get sheet IDs for formatting
  const updatedMetaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const updatedMeta = await updatedMetaRes.json();

  const requests = [];

  for (const s of updatedMeta.sheets) {
    const title = s.properties.title;
    if (title === 'Welcome') {
      const sheetId = s.properties.sheetId;

      // Freeze top row
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      });

      // Format header row (Row 0): Dark Navy Background, Bold White Text
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.08, green: 0.12, blue: 0.28 },
              textFormat: {
                bold: true,
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 11,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      });

      // Format data rows text wrap and font
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: MASTER_CONTENT_ROWS.length,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                fontSize: 10,
              },
              wrapStrategy: 'WRAP',
              verticalAlignment: 'TOP',
            },
          },
          fields: 'userEnteredFormat(textFormat,wrapStrategy,verticalAlignment)',
        },
      });

      // Set custom column widths
      // Col 0 (Page): 140px
      // Col 1 (Key): 220px
      // Col 2 (Field Name): 220px
      // Col 3 (Value): 380px
      // Col 4 (Description): 380px
      const widths = [140, 220, 220, 380, 380];
      widths.forEach((pixelSize, colIndex) => {
        requests.push({
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: colIndex,
              endIndex: colIndex + 1,
            },
            properties: {
              pixelSize,
            },
            fields: 'pixelSize',
          },
        });
      });
    }
  }

  if (requests.length > 0) {
    console.log('Applying formatting to Content and Welcome tabs...');
    const formatRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
    if (formatRes.ok) {
      console.log('Formatting applied successfully!');
    } else {
      console.error('Format error:', await formatRes.text());
    }
  }

  console.log('\nAll sheets synchronized successfully!');
}

syncAllContent().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
