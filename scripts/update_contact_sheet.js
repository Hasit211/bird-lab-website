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

const contactRows = [
  ['Key', 'Field Name', 'Value', 'Description / Where It Appears on Website'],
  // Contact Page Header
  ['contact.title', 'Section Main Title', 'Contact Us & Join the Lab', 'Main heading at the top of the Contact page'],
  ['contact.subtitle', 'Section Subtitle', 'Explore open research positions or get in touch with our team for collaborations and inquiries', 'Subtitle text beneath the main Contact heading'],
  
  // Positions Banner & Team Forms
  ['contact.banner.title', 'Positions Banner Title', 'Open Research Positions Available', 'Heading in the prominent top positions announcement box'],
  ['contact.banner.text', 'Positions Banner Description', 'We are actively seeking motivated students and researchers for Undergraduate Internships, Master\'s/Ph.D. Programs, Post-Doctoral Positions, and Project Associates.', 'Announcement description for open positions'],
  ['contact.join.url', 'Application Form URL (Google Form)', 'https://docs.google.com/forms/d/e/1FAIpQLSeQCNLWkViTCIVRWg24MjbWe57Bfe3gP09mpixHttKqII5yUg/viewform', 'Link opened by the "Want to Join" buttons across the Contact page'],
  ['people.alumni.btnText', 'Alumni Button Label', 'Were you Part of the team?', 'Label on buttons linking past members to directory submission form'],
  ['people.alumni.formUrl', 'Alumni Form URL (Google Form)', 'https://docs.google.com/forms/d/e/1FAIpQLSe0nQh5TmEqAlNzNZYDtVTVa4XeJ9Td--G9pyqXz5QLDxSe5A/viewform?usp=dialog', 'Link opened by "Were you Part of the team?" buttons across the People page'],
  ['people.alumni.badgeText', 'Alumni Badge Label', 'Alumni', 'Badge text on the top CTA in the People section'],
  ['people.alumni.bannerText', 'Alumni Section Subtitle', 'Celebrating our previous researchers, student interns, and lab members who contributed to BIRD Lab.', 'Subtitle text in the Alumni section'],
  
  // PI / Contact Info
  ['contact.banner.contactName', 'PI / Professor Name', 'Prof. Bhivraj Suthar', 'Full name of the PI / Professor shown in contact banners, cards, and email modal'],
  ['contact.banner.contactEmail', 'PI / Professor Email', 'bhivraj@iitj.ac.in', 'Primary email address for research inquiries and mail buttons'],
  ['contact.banner.contactTitle', 'PI Designation & Role', 'Principal Investigator & Assistant Professor, BIRD Lab', 'Designation displayed in the email composer popup'],
  
  // Action Hub Cards
  ['contact.hub.title', 'Action Hub Title', 'Connect with BIRD Lab', 'Heading above the action cards on the left side'],
  ['contact.hub.subtitle', 'Action Hub Subtitle', 'Choose how you would like to reach out to us below.', 'Subtitle above the action cards'],
  ['contact.card.join.badge', 'Join Card Badge', 'Applications Open', 'Status badge shown on the Want to Join card'],
  ['contact.card.join.title', 'Join Card Title', 'Want to Join', 'Title on the recruitment card'],
  ['contact.card.join.text', 'Join Card Description', 'Apply for Undergraduate Internships, Master\'s / Ph.D. research, or Post-Doctoral fellowships. Submit your resume, research interests, and qualifications.', 'Description inside the Want to Join card'],
  ['contact.card.join.btn', 'Join Card Button Label', 'Want to Join', 'Text on the button inside the Want to Join card'],
  ['contact.card.mail.badge', 'Mail Card Badge', 'Direct Inquiries', 'Status badge shown on the Direct Mail card'],
  ['contact.card.mail.title', 'Mail Card Title', 'Send a Mail', 'Title on the direct email contact card'],
  ['contact.card.mail.text', 'Mail Card Description', 'Have research questions, collaboration proposals, or academic discussions? Contact Prof. Bhivraj Suthar directly.', 'Description inside the Direct Mail card'],
  ['contact.card.mail.btn', 'Mail Card Button Label', 'Send a Mail', 'Text on the button that opens the email composer modal'],

  // Physical Address & Location
  ['contact.address.building', 'Building & Lab Room', 'W-10 Berm, SAIDE Building', 'Building and lab room on the IIT Jodhpur campus'],
  ['contact.address.street', 'Campus & Street', 'Indian Institute of Technology Jodhpur, NH 65 Nagaur Road, Karwar', 'Campus road and highway address'],
  ['contact.address.city', 'City & PIN Code', 'Jodhpur 342037', 'City and postal code'],
  ['contact.address.state', 'State & District', 'Rajasthan, India', 'State and district'],
  ['contact.address.country', 'Country', 'India', 'Country'],
  ['contact.address.full', 'Full Lab Address', 'W-10 Berm, SAIDE, Indian Institute of Technology Jodhpur, NH 65 Nagaur Road, Karwar 342037, Jodhpur District, Rajasthan, India.', 'Complete formatted address shown on Contact page and Footer'],
  ['contact.mapUrl', 'Google Maps Location Link', 'https://maps.google.com/?q=Indian+Institute+of+Technology+Jodhpur', 'Exact Google Maps URL opened when clicking "View on Map"'],

  // Phone, Hours & Secondary Email
  ['contact.phone', 'Phone Number', "'+91 291 280 1500", 'Official contact phone number displayed on Contact page and Footer'],
  ['contact.officeHours', 'Lab Office Hours', 'Monday - Friday: 9:00 AM - 6:00 PM', 'Visiting/working hours schedule displayed on Contact page'],
  ['contact.email', 'Lab / Secondary Email', 'bhivraj@iitj.ac.in', 'Secondary / general lab email address'],

  // Social Links
  ['social.linkedin', 'LinkedIn Profile URL', 'https://www.linkedin.com/in/bhivraj-suthar-6a56b432/', 'LinkedIn URL for the lab / professor (leave blank to hide)'],
  ['social.youtube', 'YouTube Channel URL', 'https://www.youtube.com/@bhivrajsuthar2234', 'YouTube channel URL for the lab (leave blank to hide)'],

  // Email Modal Dialog
  ['contact.modal.title', 'Email Modal Header', 'Mail Prof. Bhivraj Suthar', 'Heading of the email popup dialog'],
  ['contact.modal.subtitle', 'Email Modal Subtitle', 'Principal Investigator • BIRD Lab, IIT Jodhpur', 'Subtitle inside the email popup dialog']
];

async function updateSheet() {
  try {
    const token = await getAccessToken();
    console.log('Clearing old Contact tab values...');
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contact!A1:Z100:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Writing updated Contact tab values...');
    const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contact!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: 'Contact!A1',
        majorDimension: 'ROWS',
        values: contactRows
      })
    });

    const result = await writeRes.json();
    if (!writeRes.ok) {
      console.error('Write failed:', result);
    } else {
      console.log('Successfully updated Contact tab! Updated rows:', result.updatedRows, 'Updated cells:', result.updatedCells);
    }

    // Format headers and column widths for clean readability
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meta = await metaRes.json();
    const contactSheet = meta.sheets.find(s => s.properties.title === 'Contact');
    const sheetId = contactSheet ? contactSheet.properties.sheetId : null;

    if (sheetId !== null) {
      console.log('Applying formatting (bold headers, auto widths, freeze top row)...');
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            // Freeze top row
            {
              updateSheetProperties: {
                properties: {
                  sheetId,
                  gridProperties: { frozenRowCount: 1 }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            },
            // Bold header row with pleasant background
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 4
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.15, green: 0.22, blue: 0.35 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    horizontalAlignment: 'CENTER'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            // Set reasonable column widths:
            // Col A (Key): 220px, Col B (Field Name): 240px, Col C (Value): 420px, Col D (Description): 450px
            {
              updateDimensionProperties: {
                range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
                properties: { pixelSize: 220 },
                fields: 'pixelSize'
              }
            },
            {
              updateDimensionProperties: {
                range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
                properties: { pixelSize: 240 },
                fields: 'pixelSize'
              }
            },
            {
              updateDimensionProperties: {
                range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
                properties: { pixelSize: 420 },
                fields: 'pixelSize'
              }
            },
            {
              updateDimensionProperties: {
                range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },
                properties: { pixelSize: 460 },
                fields: 'pixelSize'
              }
            }
          ]
        })
      });
      console.log('Formatting applied successfully!');
    }

    // Also check and update the Welcome tab so keys are visible there too
    console.log('Checking Welcome tab for alumni keys...');
    const welcomeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Welcome!A1:C50`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const welcomeData = await welcomeRes.json();
    const existingKeys = new Set((welcomeData.values || []).map(r => r[0]));

    const missingWelcomeRows = [];
    if (!existingKeys.has('people.alumni.btnText')) {
      missingWelcomeRows.push(['people.alumni.btnText', 'Were you Part of the team?', 'Label for past team members submission button']);
    }
    if (!existingKeys.has('people.alumni.formUrl')) {
      missingWelcomeRows.push(['people.alumni.formUrl', 'https://docs.google.com/forms/d/e/1FAIpQLSe0nQh5TmEqAlNzNZYDtVTVa4XeJ9Td--G9pyqXz5QLDxSe5A/viewform?usp=dialog', 'Google Form link for past team members']);
    }

    if (missingWelcomeRows.length > 0) {
      console.log('Appending missing alumni rows to Welcome tab...');
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Welcome!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: missingWelcomeRows
        })
      });
      console.log('Successfully appended alumni rows to Welcome tab!');
    } else {
      console.log('Welcome tab already contains alumni rows.');
    }
  } catch (err) {
    console.error('Error updating sheet:', err);
  }
}

updateSheet();
